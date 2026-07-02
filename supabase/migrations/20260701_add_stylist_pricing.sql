alter table public.stylists
  add column if not exists hourly_rate_cents integer,
  add column if not exists minimum_session_minutes integer not null default 60,
  add column if not exists group_rate_cents integer,
  add column if not exists contact_for_pricing boolean not null default false;

alter table public.stylists
  drop constraint if exists stylists_hourly_rate_cents_check,
  drop constraint if exists stylists_minimum_session_minutes_check,
  drop constraint if exists stylists_group_rate_cents_check;

alter table public.stylists
  add constraint stylists_hourly_rate_cents_check check (hourly_rate_cents is null or hourly_rate_cents > 0),
  add constraint stylists_minimum_session_minutes_check check (minimum_session_minutes in (60, 90, 120, 180)),
  add constraint stylists_group_rate_cents_check check (group_rate_cents is null or group_rate_cents > 0);
