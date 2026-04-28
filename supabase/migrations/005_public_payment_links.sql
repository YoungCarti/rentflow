create or replace function public.generate_payment_link_id()
returns text
language sql
volatile
as $$
  select encode(gen_random_bytes(16), 'hex');
$$;

alter table public.tenants
add column if not exists payment_link_id text;

update public.tenants
set payment_link_id = public.generate_payment_link_id()
where payment_link_id is null;

alter table public.tenants
alter column payment_link_id set default public.generate_payment_link_id();

alter table public.tenants
alter column payment_link_id set not null;

create unique index if not exists tenants_payment_link_id_unique
on public.tenants(payment_link_id);

create or replace function public.sync_tenant_rent_status_from_record()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.month_start = date_trunc('month', current_date)::date then
    update public.tenants
    set rent_status = new.status
    where id = new.tenant_id
      and user_id = new.user_id;
  end if;

  return new;
end;
$$;

drop trigger if exists sync_tenant_rent_status_from_record on public.rent_records;
create trigger sync_tenant_rent_status_from_record
after insert or update of status on public.rent_records
for each row
execute function public.sync_tenant_rent_status_from_record();

create or replace function public.ensure_public_current_rent_record(link_id text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  tenant_row record;
  current_month date := date_trunc('month', current_date)::date;
  due_day integer;
  last_day integer;
  computed_due_date date;
  rent_record_id uuid;
begin
  select
    tenants.id as tenant_id,
    tenants.user_id,
    tenants.property_id,
    tenants.unit_id,
    tenants.lease_start,
    tenants.lease_end,
    units.rent
  into tenant_row
  from public.tenants
  join public.units on units.id = tenants.unit_id
  where tenants.payment_link_id = link_id
  limit 1;

  if not found then
    return null;
  end if;

  if current_date < tenant_row.lease_start
    or current_date > tenant_row.lease_end then
    return null;
  end if;

  due_day := extract(day from tenant_row.lease_start)::integer;
  last_day := extract(day from (current_month + interval '1 month - 1 day'))::integer;
  computed_due_date := make_date(
    extract(year from current_month)::integer,
    extract(month from current_month)::integer,
    least(due_day, last_day)
  );

  insert into public.rent_records (
    user_id,
    tenant_id,
    property_id,
    unit_id,
    month_start,
    amount,
    due_date,
    status
  )
  values (
    tenant_row.user_id,
    tenant_row.tenant_id,
    tenant_row.property_id,
    tenant_row.unit_id,
    current_month,
    tenant_row.rent,
    computed_due_date,
    case when computed_due_date < current_date then 'Overdue' else 'Pending' end
  )
  on conflict (tenant_id, month_start) do nothing;

  update public.rent_records
  set status = 'Overdue'
  where tenant_id = tenant_row.tenant_id
    and month_start = current_month
    and status = 'Pending'
    and due_date < current_date;

  select id
  into rent_record_id
  from public.rent_records
  where tenant_id = tenant_row.tenant_id
    and month_start = current_month
  limit 1;

  return rent_record_id;
end;
$$;

revoke all on function public.ensure_public_current_rent_record(text) from public;
revoke all on function public.ensure_public_current_rent_record(text) from anon;
revoke all on function public.ensure_public_current_rent_record(text) from authenticated;

create or replace function public.get_public_rent_payment(link_id text)
returns table (
  payment_link_id text,
  tenant_name text,
  property_name text,
  unit_number text,
  amount numeric,
  due_date date,
  status text,
  paid_on date,
  month_start date
)
language plpgsql
security definer
set search_path = public
as $$
declare
  rent_record_id uuid;
begin
  rent_record_id := public.ensure_public_current_rent_record(link_id);

  if rent_record_id is null then
    return;
  end if;

  return query
  select
    tenants.payment_link_id,
    tenants.name,
    properties.name,
    units.unit_number,
    rent_records.amount,
    rent_records.due_date,
    rent_records.status,
    (
      select payments.paid_on
      from public.payments
      where payments.rent_record_id = rent_records.id
        and payments.approval_status = 'Approved'
      order by payments.created_at desc
      limit 1
    ) as paid_on,
    rent_records.month_start
  from public.rent_records
  join public.tenants on tenants.id = rent_records.tenant_id
  join public.properties on properties.id = rent_records.property_id
  join public.units on units.id = rent_records.unit_id
  where rent_records.id = rent_record_id
    and tenants.payment_link_id = link_id;
end;
$$;

create or replace function public.mark_public_rent_paid(link_id text)
returns table (
  payment_link_id text,
  tenant_name text,
  property_name text,
  unit_number text,
  amount numeric,
  due_date date,
  status text,
  paid_on date,
  month_start date
)
language plpgsql
security definer
set search_path = public
as $$
declare
  rent_record_row record;
begin
  select *
  into rent_record_row
  from public.rent_records
  where id = public.ensure_public_current_rent_record(link_id)
  limit 1;

  if not found then
    return;
  end if;

  if not exists (
    select 1
    from public.payments
    where payments.rent_record_id = rent_record_row.id
      and payments.approval_status = 'Approved'
  ) then
    insert into public.payments (
      user_id,
      rent_record_id,
      tenant_id,
      property_id,
      unit_id,
      amount,
      paid_on,
      method,
      approval_status
    )
    values (
      rent_record_row.user_id,
      rent_record_row.id,
      rent_record_row.tenant_id,
      rent_record_row.property_id,
      rent_record_row.unit_id,
      rent_record_row.amount,
      current_date,
      'Online',
      'Approved'
    );
  end if;

  update public.rent_records
  set status = 'Paid',
      payment_method = 'Online'
  where id = rent_record_row.id;

  update public.tenants
  set rent_status = 'Paid'
  where id = rent_record_row.tenant_id;

  return query
  select *
  from public.get_public_rent_payment(link_id);
end;
$$;

grant execute on function public.get_public_rent_payment(text) to anon, authenticated;
grant execute on function public.mark_public_rent_paid(text) to anon, authenticated;
