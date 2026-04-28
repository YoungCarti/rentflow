create or replace function public.regenerate_tenant_payment_link(target_tenant_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  new_link_id text;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if not exists (
    select 1
    from public.tenants
    where tenants.id = target_tenant_id
      and tenants.user_id = auth.uid()
  ) then
    raise exception 'Tenant not found';
  end if;

  loop
    new_link_id := public.generate_payment_link_id();
    exit when not exists (
      select 1
      from public.tenants
      where tenants.payment_link_id = new_link_id
    );
  end loop;

  update public.tenants
  set payment_link_id = new_link_id
  where tenants.id = target_tenant_id
    and tenants.user_id = auth.uid();

  return new_link_id;
end;
$$;

grant execute on function public.regenerate_tenant_payment_link(uuid) to authenticated;
