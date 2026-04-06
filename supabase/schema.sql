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

create table if not exists stylist_applications (
  id uuid primary key default uuid_generate_v4(),
  full_name text not null,
  city text,
  instagram_handle text,
  years_experience text,
  specialty_tags text[],
  session_types text[],
  rate_expectation text,
  bio text,
  status text default 'pending',
  created_at timestamp default now()
);

create table if not exists waitlist (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  name text,
  city text,
  experience text,
  type text check (type in ('client', 'stylist')) not null,
  created_at timestamptz default now()
);

alter table waitlist alter column id set default gen_random_uuid();
alter table waitlist add column if not exists name text;
alter table waitlist add column if not exists city text;
alter table waitlist add column if not exists experience text;
alter table waitlist add column if not exists type text;
alter table waitlist alter column created_at type timestamptz using created_at at time zone 'UTC';
alter table waitlist alter column created_at set default now();
update waitlist set type = 'client' where type is null;
alter table waitlist alter column type set not null;
alter table waitlist drop constraint if exists waitlist_type_check;
alter table waitlist add constraint waitlist_type_check check (type in ('client', 'stylist'));

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
alter table stylist_applications add column if not exists email text;

alter table sessions enable row level security;
alter table buddy_matches enable row level security;
