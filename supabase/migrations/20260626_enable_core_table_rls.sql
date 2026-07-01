alter table users enable row level security;
alter table stylists enable row level security;
alter table sessions enable row level security;
alter table session_members enable row level security;

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
