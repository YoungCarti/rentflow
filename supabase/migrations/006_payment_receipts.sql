create or replace function public.get_public_rent_receipt(link_id text)
returns table (
  payment_id uuid,
  payment_link_id text,
  tenant_name text,
  property_name text,
  unit_number text,
  amount numeric,
  paid_on date,
  method text,
  month_start date,
  due_date date
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_rent_record_id uuid;
begin
  current_rent_record_id := public.ensure_public_current_rent_record(link_id);

  if current_rent_record_id is null then
    return;
  end if;

  return query
  select
    payments.id,
    tenants.payment_link_id,
    tenants.name,
    properties.name,
    units.unit_number,
    payments.amount,
    payments.paid_on,
    payments.method,
    rent_records.month_start,
    rent_records.due_date
  from public.payments
  join public.rent_records on rent_records.id = payments.rent_record_id
  join public.tenants on tenants.id = payments.tenant_id
  join public.properties on properties.id = payments.property_id
  join public.units on units.id = payments.unit_id
  where payments.rent_record_id = current_rent_record_id
    and payments.approval_status = 'Approved'
    and tenants.payment_link_id = link_id
  order by payments.created_at desc
  limit 1;
end;
$$;

grant execute on function public.get_public_rent_receipt(text) to anon, authenticated;
