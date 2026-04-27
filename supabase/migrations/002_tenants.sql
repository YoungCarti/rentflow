create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  unit_id uuid not null references public.units(id) on delete restrict,
  name text not null,
  email text not null,
  phone text not null,
  lease_start date not null,
  lease_end date not null,
  rent_status text not null default 'Pending' check (rent_status in ('Paid', 'Pending', 'Overdue')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tenants_lease_dates_check check (lease_end >= lease_start)
);

create unique index if not exists tenants_unit_id_unique on public.tenants(unit_id);
create index if not exists tenants_user_id_idx on public.tenants(user_id);
create index if not exists tenants_property_id_idx on public.tenants(property_id);

drop trigger if exists set_tenants_updated_at on public.tenants;
create trigger set_tenants_updated_at
before update on public.tenants
for each row
execute function public.set_updated_at();

create or replace function public.sync_unit_occupancy_from_tenant()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.units
    set status = 'Occupied',
        tenant_name = new.name
    where id = new.unit_id
      and property_id = new.property_id
      and user_id = new.user_id;

    return new;
  end if;

  if tg_op = 'UPDATE' then
    if old.unit_id <> new.unit_id then
      update public.units
      set status = 'Vacant',
          tenant_name = null
      where id = old.unit_id
        and user_id = old.user_id;
    end if;

    update public.units
    set status = 'Occupied',
        tenant_name = new.name
    where id = new.unit_id
      and property_id = new.property_id
      and user_id = new.user_id;

    return new;
  end if;

  if tg_op = 'DELETE' then
    update public.units
    set status = 'Vacant',
        tenant_name = null
    where id = old.unit_id
      and user_id = old.user_id;

    return old;
  end if;

  return null;
end;
$$;

drop trigger if exists sync_unit_occupancy_from_tenant on public.tenants;
create trigger sync_unit_occupancy_from_tenant
after insert or update or delete on public.tenants
for each row
execute function public.sync_unit_occupancy_from_tenant();

alter table public.tenants enable row level security;

drop policy if exists "Users can view their tenants" on public.tenants;
create policy "Users can view their tenants"
on public.tenants
for select
using (auth.uid() = user_id);

drop policy if exists "Users can create tenants for their properties" on public.tenants;
create policy "Users can create tenants for their properties"
on public.tenants
for insert
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.properties
    where properties.id = tenants.property_id
      and properties.user_id = auth.uid()
  )
  and exists (
    select 1
    from public.units
    where units.id = tenants.unit_id
      and units.property_id = tenants.property_id
      and units.user_id = auth.uid()
  )
);

drop policy if exists "Users can update their tenants" on public.tenants;
create policy "Users can update their tenants"
on public.tenants
for update
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.properties
    where properties.id = tenants.property_id
      and properties.user_id = auth.uid()
  )
  and exists (
    select 1
    from public.units
    where units.id = tenants.unit_id
      and units.property_id = tenants.property_id
      and units.user_id = auth.uid()
  )
);

drop policy if exists "Users can delete their tenants" on public.tenants;
create policy "Users can delete their tenants"
on public.tenants
for delete
using (auth.uid() = user_id);
