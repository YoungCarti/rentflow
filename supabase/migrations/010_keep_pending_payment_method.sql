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
        payment_method = new.method
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

with latest_pending_payments as (
  select distinct on (rent_record_id)
    rent_record_id,
    user_id,
    method
  from public.payments
  where approval_status = 'Pending'
  order by rent_record_id, created_at desc, id desc
)
update public.rent_records
set status = 'Pending',
    payment_method = latest_pending_payments.method
from latest_pending_payments
where rent_records.id = latest_pending_payments.rent_record_id
  and rent_records.user_id = latest_pending_payments.user_id
  and rent_records.status <> 'Paid';
