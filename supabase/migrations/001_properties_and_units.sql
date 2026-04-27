create extension if not exists pgcrypto;

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  location text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.units (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  unit_number text not null,
  rent numeric(12, 2) not null check (rent >= 0),
  status text not null default 'Vacant' check (status in ('Occupied', 'Vacant', 'Maintenance')),
  tenant_name text,
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists properties_user_id_idx on public.properties(user_id);
create index if not exists units_user_id_idx on public.units(user_id);
create index if not exists units_property_id_idx on public.units(property_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_properties_updated_at on public.properties;
create trigger set_properties_updated_at
before update on public.properties
for each row
execute function public.set_updated_at();

drop trigger if exists set_units_updated_at on public.units;
create trigger set_units_updated_at
before update on public.units
for each row
execute function public.set_updated_at();

alter table public.properties enable row level security;
alter table public.units enable row level security;

drop policy if exists "Users can view their properties" on public.properties;
create policy "Users can view their properties"
on public.properties
for select
using (auth.uid() = user_id);

drop policy if exists "Users can create their properties" on public.properties;
create policy "Users can create their properties"
on public.properties
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their properties" on public.properties;
create policy "Users can update their properties"
on public.properties
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their properties" on public.properties;
create policy "Users can delete their properties"
on public.properties
for delete
using (auth.uid() = user_id);

drop policy if exists "Users can view their units" on public.units;
create policy "Users can view their units"
on public.units
for select
using (auth.uid() = user_id);

drop policy if exists "Users can create units for their properties" on public.units;
create policy "Users can create units for their properties"
on public.units
for insert
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.properties
    where properties.id = units.property_id
      and properties.user_id = auth.uid()
  )
);

drop policy if exists "Users can update their units" on public.units;
create policy "Users can update their units"
on public.units
for update
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.properties
    where properties.id = units.property_id
      and properties.user_id = auth.uid()
  )
);

drop policy if exists "Users can delete their units" on public.units;
create policy "Users can delete their units"
on public.units
for delete
using (auth.uid() = user_id);
