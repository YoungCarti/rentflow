with normalized_units as (
  select
    id,
    btrim(unit_number) as normalized_unit_number,
    row_number() over (
      partition by property_id, lower(btrim(unit_number))
      order by created_at, id
    ) as duplicate_rank
  from public.units
)
update public.units
set unit_number = case
      when normalized_units.duplicate_rank = 1 then normalized_units.normalized_unit_number
      else concat(normalized_units.normalized_unit_number, '-', left(units.id::text, 8))
    end
from normalized_units
where units.id = normalized_units.id
  and (
    units.unit_number <> normalized_units.normalized_unit_number
    or normalized_units.duplicate_rank > 1
  );

create unique index if not exists units_property_unit_number_unique_idx
on public.units(property_id, lower(btrim(unit_number)));
