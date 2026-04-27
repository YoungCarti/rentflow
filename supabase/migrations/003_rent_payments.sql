create table if not exists public.rent_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  unit_id uuid not null references public.units(id) on delete restrict,
  month_start date not null,
  amount numeric(12, 2) not null check (amount >= 0),
  due_date date not null,
  status text not null default 'Pending' check (status in ('Paid', 'Pending', 'Overdue')),
  payment_method text check (payment_method in ('Bank Transfer', 'Cash', 'Online')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, month_start)
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  rent_record_id uuid not null references public.rent_records(id) on delete cascade,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  unit_id uuid not null references public.units(id) on delete restrict,
  amount numeric(12, 2) not null check (amount > 0),
  paid_on date not null default current_date,
  method text not null check (method in ('Bank Transfer', 'Cash', 'Online')),
  approval_status text not null default 'Pending' check (approval_status in ('Approved', 'Pending', 'Rejected')),
  proof_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists rent_records_tenant_month_idx
on public.rent_records(tenant_id, month_start);

create index if not exists rent_records_user_id_idx on public.rent_records(user_id);
create index if not exists rent_records_month_start_idx on public.rent_records(month_start);
create index if not exists rent_records_status_idx on public.rent_records(status);

create index if not exists payments_user_id_idx on public.payments(user_id);
create index if not exists payments_rent_record_id_idx on public.payments(rent_record_id);
create index if not exists payments_approval_status_idx on public.payments(approval_status);

create unique index if not exists payments_one_approved_per_rent_record_idx
on public.payments(rent_record_id)
where approval_status = 'Approved';

drop trigger if exists set_rent_records_updated_at on public.rent_records;
create trigger set_rent_records_updated_at
before update on public.rent_records
for each row
execute function public.set_updated_at();

drop trigger if exists set_payments_updated_at on public.payments;
create trigger set_payments_updated_at
before update on public.payments
for each row
execute function public.set_updated_at();

create or replace function public.sync_rent_record_from_payment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.approval_status = 'Approved' then
    update public.rent_records
    set status = 'Paid',
        payment_method = new.method
    where id = new.rent_record_id
      and user_id = new.user_id;
  elsif new.approval_status = 'Pending' then
    update public.rent_records
    set status = 'Pending',
        payment_method = null
    where id = new.rent_record_id
      and user_id = new.user_id
      and status <> 'Paid';
  elsif new.approval_status = 'Rejected' then
    update public.rent_records
    set status = case when due_date < current_date then 'Overdue' else 'Pending' end,
        payment_method = null
    where id = new.rent_record_id
      and user_id = new.user_id
      and not exists (
        select 1
        from public.payments
        where payments.rent_record_id = new.rent_record_id
          and payments.approval_status = 'Approved'
          and payments.id <> new.id
      );
  end if;

  return new;
end;
$$;

drop trigger if exists sync_rent_record_from_payment on public.payments;
create trigger sync_rent_record_from_payment
after insert or update on public.payments
for each row
execute function public.sync_rent_record_from_payment();

alter table public.rent_records enable row level security;
alter table public.payments enable row level security;

drop policy if exists "Users can view their rent records" on public.rent_records;
create policy "Users can view their rent records"
on public.rent_records
for select
using (auth.uid() = user_id);

drop policy if exists "Users can create rent records for their tenants" on public.rent_records;
create policy "Users can create rent records for their tenants"
on public.rent_records
for insert
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.tenants
    where tenants.id = rent_records.tenant_id
      and tenants.property_id = rent_records.property_id
      and tenants.unit_id = rent_records.unit_id
      and tenants.user_id = auth.uid()
  )
);

drop policy if exists "Users can update their rent records" on public.rent_records;
create policy "Users can update their rent records"
on public.rent_records
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their rent records" on public.rent_records;
create policy "Users can delete their rent records"
on public.rent_records
for delete
using (auth.uid() = user_id);

drop policy if exists "Users can view their payments" on public.payments;
create policy "Users can view their payments"
on public.payments
for select
using (auth.uid() = user_id);

drop policy if exists "Users can create payments for their rent records" on public.payments;
create policy "Users can create payments for their rent records"
on public.payments
for insert
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.rent_records
    where rent_records.id = payments.rent_record_id
      and rent_records.tenant_id = payments.tenant_id
      and rent_records.property_id = payments.property_id
      and rent_records.unit_id = payments.unit_id
      and rent_records.user_id = auth.uid()
  )
);

drop policy if exists "Users can update their payments" on public.payments;
create policy "Users can update their payments"
on public.payments
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their payments" on public.payments;
create policy "Users can delete their payments"
on public.payments
for delete
using (auth.uid() = user_id);
