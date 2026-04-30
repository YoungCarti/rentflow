with ranked_active_payments as (
  select
    id,
    row_number() over (
      partition by rent_record_id
      order by
        case approval_status when 'Approved' then 0 else 1 end,
        created_at desc,
        id desc
    ) as active_rank
  from public.payments
  where approval_status in ('Pending', 'Approved')
)
update public.payments
set approval_status = 'Rejected',
    updated_at = now()
where id in (
  select id
  from ranked_active_payments
  where active_rank > 1
);

with remaining_active_payments as (
  select distinct on (rent_record_id)
    rent_record_id,
    approval_status,
    method
  from public.payments
  where approval_status in ('Pending', 'Approved')
  order by
    rent_record_id,
    case approval_status when 'Approved' then 0 else 1 end,
    created_at desc,
    id desc
)
update public.rent_records
set status = case
      when remaining_active_payments.approval_status = 'Approved' then 'Paid'
      else 'Pending'
    end,
    payment_method = case
      when remaining_active_payments.approval_status = 'Approved' then remaining_active_payments.method
      else null
    end
from remaining_active_payments
where rent_records.id = remaining_active_payments.rent_record_id;

drop index if exists public.payments_one_approved_per_rent_record_idx;

create unique index if not exists payments_one_active_per_rent_record_idx
on public.payments(rent_record_id)
where approval_status in ('Pending', 'Approved');

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
  active_payment_status text;
begin
  select *
  into rent_record_row
  from public.rent_records
  where id = public.ensure_public_current_rent_record(link_id)
  limit 1;

  if not found then
    return;
  end if;

  select payments.approval_status
  into active_payment_status
  from public.payments
  where payments.rent_record_id = rent_record_row.id
    and payments.approval_status in ('Pending', 'Approved')
  order by
    case payments.approval_status when 'Approved' then 0 else 1 end,
    payments.created_at desc
  limit 1;

  if active_payment_status is null then
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

    active_payment_status := 'Approved';
  end if;

  if active_payment_status = 'Approved' then
    update public.rent_records
    set status = 'Paid',
        payment_method = 'Online'
    where id = rent_record_row.id;

    update public.tenants
    set rent_status = 'Paid'
    where id = rent_record_row.tenant_id;
  end if;

  return query
  select *
  from public.get_public_rent_payment(link_id);
end;
$$;
