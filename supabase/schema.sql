create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  full_name text,
  avatar_url text,
  city text,
  role text check (role in ('client', 'stylist')),
  style_tags text[],
  favorite_stores text[],
  created_at timestamp default now()
);

create table if not exists stylists (
  id uuid primary key references users(id),
  bio text,
  specialty_tags text[],
  price_group numeric,
  price_private numeric,
  rating numeric default 0,
  review_count int default 0,
  available boolean default true
);

create table if not exists sessions (
  id uuid primary key default uuid_generate_v4(),
  stylist_id uuid references stylists(id),
  host_id uuid references users(id),
  session_type text check (session_type in ('group', 'private', 'buddy')),
  date date,
  time text,
  group_size int,
  stores text[],
  status text check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
  total_price numeric,
  created_at timestamp default now()
);

create table if not exists session_members (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid references sessions(id),
  email text not null,
  status text default 'invited' check (status in ('invited', 'accepted', 'declined')),
  created_at timestamp default now()
);

create table if not exists buddy_matches (
  id uuid primary key default uuid_generate_v4(),
  user_a uuid references users(id),
  user_b uuid references users(id),
  match_score int,
  status text default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamp default now()
);

create table if not exists waitlist (
  id uuid default gen_random_uuid() primary key,
  email text not null,
  name text,
  city text,
  experience text,
  years_experience text,
  portfolio text,
  type text check (type in ('client', 'stylist')) not null,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz default now()
);

create table if not exists stylist_applications (
  id uuid default gen_random_uuid() primary key,
  email text not null,
  full_name text not null,
  city text not null,
  years_experience text not null,
  specialties text[] not null default '{}',
  portfolio text,
  photo_url text,
  bio text not null,
  availability text not null,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  admin_notified_at timestamptz,
  created_at timestamptz default now()
);

alter table waitlist alter column id set default gen_random_uuid();
alter table waitlist add column if not exists name text;
alter table waitlist add column if not exists city text;
alter table waitlist add column if not exists experience text;
alter table waitlist add column if not exists years_experience text;
alter table waitlist add column if not exists portfolio text;
alter table waitlist add column if not exists intent_type text;
alter table waitlist add column if not exists session_type text;
alter table waitlist add column if not exists type text;
alter table waitlist add column if not exists status text default 'pending';
alter table waitlist alter column created_at type timestamptz using created_at at time zone 'UTC';
alter table waitlist alter column created_at set default now();
update waitlist set type = 'client' where type is null;
update waitlist set status = 'pending' where status is null;
alter table waitlist alter column type set not null;
alter table waitlist drop constraint if exists waitlist_email_key;
alter table waitlist drop constraint if exists waitlist_email_type_key;
alter table waitlist add constraint waitlist_email_type_key unique (email, type);
alter table waitlist drop constraint if exists waitlist_type_check;
alter table waitlist add constraint waitlist_type_check check (type in ('client', 'stylist'));
alter table waitlist drop constraint if exists waitlist_status_check;
alter table waitlist add constraint waitlist_status_check check (status in ('pending', 'approved', 'rejected'));
alter table waitlist drop constraint if exists waitlist_intent_type_check;
alter table waitlist add constraint waitlist_intent_type_check
check (intent_type is null or intent_type in ('everyday', 'event', 'wardrobe'));
alter table waitlist drop constraint if exists waitlist_session_type_check;
alter table waitlist add constraint waitlist_session_type_check
check (session_type is null or session_type in ('solo', 'group', 'buddy'));

alter table stylist_applications alter column id set default gen_random_uuid();
alter table stylist_applications add column if not exists full_name text;
alter table stylist_applications add column if not exists city text;
alter table stylist_applications add column if not exists years_experience text;
alter table stylist_applications add column if not exists specialties text[] default '{}';
alter table stylist_applications add column if not exists portfolio text;
alter table stylist_applications add column if not exists photo_url text;
alter table stylist_applications add column if not exists bio text;
alter table stylist_applications add column if not exists availability text;
alter table stylist_applications add column if not exists status text default 'pending';
alter table stylist_applications add column if not exists auth_user_id uuid references auth.users(id) on delete set null;
alter table stylist_applications add column if not exists approved_at timestamptz;
alter table stylist_applications add column if not exists admin_notified_at timestamptz;
alter table stylist_applications alter column created_at type timestamptz using created_at at time zone 'UTC';
alter table stylist_applications alter column created_at set default now();
update stylist_applications set status = 'pending' where status is null;
alter table stylist_applications alter column email set not null;
alter table stylist_applications alter column full_name set not null;
alter table stylist_applications alter column city set not null;
alter table stylist_applications alter column years_experience set not null;
alter table stylist_applications alter column specialties set not null;
alter table stylist_applications alter column bio set not null;
alter table stylist_applications alter column availability set not null;
alter table stylist_applications drop constraint if exists stylist_applications_email_key;
alter table stylist_applications add constraint stylist_applications_email_key unique (email);
alter table stylist_applications drop constraint if exists stylist_applications_status_check;
alter table stylist_applications add constraint stylist_applications_status_check check (status in ('pending', 'approved', 'rejected'));

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  account_role text := coalesce(nullif(new.raw_user_meta_data ->> 'role', ''), 'client');
  specialty_values text[] := array(
    select jsonb_array_elements_text(
      coalesce(new.raw_user_meta_data -> 'specialties', '[]'::jsonb)
    )
  );
begin
  if new.email_confirmed_at is null then
    return new;
  end if;

  insert into public.users (id, email, full_name, avatar_url, city, role, style_tags)
  values (
    new.id,
    new.email,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'avatar_url', ''),
    nullif(new.raw_user_meta_data ->> 'city', ''),
    account_role,
    specialty_values
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.users.full_name),
    avatar_url = coalesce(excluded.avatar_url, public.users.avatar_url),
    city = coalesce(excluded.city, public.users.city),
    role = excluded.role,
    style_tags = excluded.style_tags;

  if account_role = 'stylist' then
    insert into public.stylists (
      id,
      bio,
      specialty_tags,
      instagram_handle,
      years_experience,
      availability,
      status,
      available
    )
    values (
      new.id,
      nullif(new.raw_user_meta_data ->> 'bio', ''),
      specialty_values,
      nullif(new.raw_user_meta_data ->> 'portfolio', ''),
      nullif(new.raw_user_meta_data ->> 'years_experience', ''),
      nullif(new.raw_user_meta_data ->> 'availability', ''),
      'pending',
      false
    )
    on conflict (id) do update
    set
      bio = excluded.bio,
      specialty_tags = excluded.specialty_tags,
      instagram_handle = excluded.instagram_handle,
      years_experience = excluded.years_experience,
      availability = excluded.availability,
      status = 'pending',
      available = false;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert or update of email_confirmed_at on auth.users
for each row execute function public.handle_new_auth_user();

create or replace function public.protect_stylist_approval_status()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  if new.status is distinct from old.status
    and auth.uid() is not null
    and not exists (
      select 1 from public.users
      where users.id = auth.uid() and users.role = 'admin'
    )
  then
    raise exception 'Only administrators can change stylist approval status';
  end if;

  return new;
end;
$$;

drop trigger if exists protect_stylist_approval_status on public.stylists;

create trigger protect_stylist_approval_status
before update on public.stylists
for each row execute function public.protect_stylist_approval_status();

alter table users add column if not exists role text;
alter table users add column if not exists neighborhood text;
alter table users add column if not exists day_job jsonb;
alter table users drop constraint if exists users_role_check;
alter table users add constraint users_role_check check (role in ('client', 'stylist', 'admin'));

alter table stylists add column if not exists status text default 'pending' check (status in ('pending', 'approved', 'rejected'));
alter table stylists add column if not exists instagram_handle text;
alter table stylists add column if not exists years_experience text;
alter table stylists add column if not exists session_types text[];
alter table stylists add column if not exists rate_expectation text;
alter table stylists add column if not exists neighborhood text;
alter table stylists add column if not exists availability text;
alter table stylists add column if not exists hourly_rate_cents integer check (hourly_rate_cents is null or hourly_rate_cents > 0);
alter table stylists add column if not exists minimum_session_minutes integer not null default 60 check (minimum_session_minutes in (60, 90, 120, 180));
alter table stylists add column if not exists group_rate_cents integer check (group_rate_cents is null or group_rate_cents > 0);
alter table stylists add column if not exists contact_for_pricing boolean not null default false;

alter table sessions enable row level security;
alter table users enable row level security;
alter table stylists enable row level security;
alter table session_members enable row level security;
alter table buddy_matches enable row level security;
alter table waitlist enable row level security;
alter table stylist_applications enable row level security;

drop policy if exists "public can insert waitlist" on waitlist;
drop policy if exists "public can insert stylist applications" on stylist_applications;
drop policy if exists "admins can read stylist applications" on stylist_applications;
drop policy if exists "admins can update stylist applications" on stylist_applications;
drop policy if exists "users can insert own profile" on users;
drop policy if exists "users can read own profile" on users;
drop policy if exists "users can read stylist profiles" on users;
drop policy if exists "users can update own profile" on users;
drop policy if exists "stylists are readable" on stylists;
drop policy if exists "stylists can insert own row" on stylists;
drop policy if exists "stylists can update own row" on stylists;
drop policy if exists "users can read own sessions" on sessions;
drop policy if exists "users can create own sessions" on sessions;
drop policy if exists "users can update own sessions" on sessions;
drop policy if exists "users can read own session members" on session_members;
drop policy if exists "session hosts can insert members" on session_members;
drop policy if exists "invited members can update own invite" on session_members;

create policy "public can insert waitlist"
on waitlist
for insert
to anon, authenticated
with check (true);

create policy "public can insert stylist applications"
on stylist_applications
for insert
to anon, authenticated
with check (true);

create policy "admins can read stylist applications"
on stylist_applications
for select
to authenticated
using (
  exists (
    select 1 from users
    where users.id = auth.uid() and users.role = 'admin'
  )
);

create policy "admins can update stylist applications"
on stylist_applications
for update
to authenticated
using (
  exists (
    select 1 from users
    where users.id = auth.uid() and users.role = 'admin'
  )
)
with check (
  exists (
    select 1 from users
    where users.id = auth.uid() and users.role = 'admin'
  )
);

create policy "users can insert own profile"
on users
for insert
to authenticated
with check (id = auth.uid());

create policy "users can read own profile"
on users
for select
to authenticated
using (id = auth.uid());

create policy "users can read stylist profiles"
on users
for select
to authenticated
using (role = 'stylist');

create policy "users can update own profile"
on users
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "stylists are readable"
on stylists
for select
to authenticated
using (status = 'approved' or id = auth.uid());

create policy "stylists can insert own row"
on stylists
for insert
to authenticated
with check (id = auth.uid());

create policy "stylists can update own row"
on stylists
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "users can read own sessions"
on sessions
for select
to authenticated
using (host_id = auth.uid() or stylist_id = auth.uid());

create policy "users can create own sessions"
on sessions
for insert
to authenticated
with check (host_id = auth.uid());

create policy "users can update own sessions"
on sessions
for update
to authenticated
using (host_id = auth.uid() or stylist_id = auth.uid())
with check (host_id = auth.uid() or stylist_id = auth.uid());

create policy "users can read own session members"
on session_members
for select
to authenticated
using (
  email = auth.jwt()->>'email'
  or exists (
    select 1
    from sessions
    where sessions.id = session_members.session_id
      and (sessions.host_id = auth.uid() or sessions.stylist_id = auth.uid())
  )
);

create policy "session hosts can insert members"
on session_members
for insert
to authenticated
with check (
  exists (
    select 1
    from sessions
    where sessions.id = session_members.session_id
      and sessions.host_id = auth.uid()
  )
);

create policy "invited members can update own invite"
on session_members
for update
to authenticated
using (email = auth.jwt()->>'email')
with check (email = auth.jwt()->>'email');
