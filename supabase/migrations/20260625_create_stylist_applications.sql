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
  created_at timestamptz default now()
);

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

alter table stylist_applications enable row level security;

drop policy if exists "public can insert stylist applications" on stylist_applications;

create policy "public can insert stylist applications"
on stylist_applications
for insert
to anon, authenticated
with check (true);
