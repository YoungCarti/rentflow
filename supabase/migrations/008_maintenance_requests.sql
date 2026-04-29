create table if not exists public.maintenance_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  unit_id uuid references public.units(id) on delete set null,
  tenant_id uuid references public.tenants(id) on delete set null,
  title text not null,
  description text not null default '',
  category text not null check (category in ('Plumbing', 'Electrical', 'Cleaning', 'Repairs', 'Other')),
  priority text not null default 'Medium' check (priority in ('Low', 'Medium', 'High', 'Urgent')),
  status text not null default 'Open' check (status in ('Open', 'In Progress', 'Resolved')),
  reported_by text not null default 'Landlord' check (reported_by in ('Landlord', 'Tenant')),
  reported_on date not null default current_date,
  resolved_on date,
  estimated_cost numeric(12, 2) not null default 0 check (estimated_cost >= 0),
  actual_cost numeric(12, 2) not null default 0 check (actual_cost >= 0),
  vendor_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint maintenance_resolved_on_check check (
    status <> 'Resolved' or resolved_on is not null
  )
);

create index if not exists maintenance_requests_user_id_idx
on public.maintenance_requests(user_id);

create index if not exists maintenance_requests_property_id_idx
on public.maintenance_requests(property_id);

create index if not exists maintenance_requests_status_idx
on public.maintenance_requests(status);

drop trigger if exists set_maintenance_requests_updated_at on public.maintenance_requests;
create trigger set_maintenance_requests_updated_at
before update on public.maintenance_requests
for each row
execute function public.set_updated_at();

alter table public.maintenance_requests enable row level security;

drop policy if exists "Users can view their maintenance requests" on public.maintenance_requests;
create policy "Users can view their maintenance requests"
on public.maintenance_requests
for select
using (auth.uid() = user_id);

drop policy if exists "Users can create maintenance requests for their properties" on public.maintenance_requests;
create policy "Users can create maintenance requests for their properties"
on public.maintenance_requests
for insert
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.properties
    where properties.id = maintenance_requests.property_id
      and properties.user_id = auth.uid()
  )
  and (
    maintenance_requests.unit_id is null
    or exists (
      select 1
      from public.units
      where units.id = maintenance_requests.unit_id
        and units.property_id = maintenance_requests.property_id
        and units.user_id = auth.uid()
    )
  )
  and (
    maintenance_requests.tenant_id is null
    or exists (
      select 1
      from public.tenants
      where tenants.id = maintenance_requests.tenant_id
        and tenants.property_id = maintenance_requests.property_id
        and tenants.user_id = auth.uid()
    )
  )
);

drop policy if exists "Users can update their maintenance requests" on public.maintenance_requests;
create policy "Users can update their maintenance requests"
on public.maintenance_requests
for update
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.properties
    where properties.id = maintenance_requests.property_id
      and properties.user_id = auth.uid()
  )
);

drop policy if exists "Users can delete their maintenance requests" on public.maintenance_requests;
create policy "Users can delete their maintenance requests"
on public.maintenance_requests
for delete
using (auth.uid() = user_id);

create or replace function public.create_public_maintenance_request(
  link_id text,
  request_title text,
  request_description text,
  request_category text,
  request_priority text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  tenant_row record;
  request_id uuid;
begin
  select
    tenants.id as tenant_id,
    tenants.user_id,
    tenants.property_id,
    tenants.unit_id,
    tenants.lease_start,
    tenants.lease_end
  into tenant_row
  from public.tenants
  where tenants.payment_link_id = link_id
  limit 1;

  if not found then
    return null;
  end if;

  if current_date < tenant_row.lease_start
    or current_date > tenant_row.lease_end then
    return null;
  end if;

  insert into public.maintenance_requests (
    user_id,
    property_id,
    unit_id,
    tenant_id,
    title,
    description,
    category,
    priority,
    status,
    reported_by,
    reported_on
  )
  values (
    tenant_row.user_id,
    tenant_row.property_id,
    tenant_row.unit_id,
    tenant_row.tenant_id,
    request_title,
    coalesce(request_description, ''),
    request_category,
    request_priority,
    'Open',
    'Tenant',
    current_date
  )
  returning id into request_id;

  return request_id;
end;
$$;

grant execute on function public.create_public_maintenance_request(text, text, text, text, text)
to anon, authenticated;
