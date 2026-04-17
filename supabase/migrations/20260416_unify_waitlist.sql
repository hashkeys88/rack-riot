create extension if not exists pgcrypto;

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

alter table waitlist alter column id set default gen_random_uuid();
alter table waitlist add column if not exists name text;
alter table waitlist add column if not exists city text;
alter table waitlist add column if not exists experience text;
alter table waitlist add column if not exists years_experience text;
alter table waitlist add column if not exists portfolio text;
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
alter table waitlist add constraint waitlist_type_check
check (type in ('client', 'stylist'));

alter table waitlist drop constraint if exists waitlist_status_check;
alter table waitlist add constraint waitlist_status_check
check (status in ('pending', 'approved', 'rejected'));

alter table waitlist enable row level security;

drop policy if exists "public can insert waitlist" on waitlist;

create policy "public can insert waitlist"
on waitlist
for insert
to anon, authenticated
with check (true);
