create or replace function public.protect_account_role()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  if new.role is distinct from old.role
    and auth.uid() is not null
    and not exists (
      select 1
      from public.users
      where users.id = auth.uid()
        and users.role = 'admin'
    )
  then
    raise exception 'Only administrators can change account roles';
  end if;

  return new;
end;
$$;

drop trigger if exists protect_account_role on public.users;

create trigger protect_account_role
before update on public.users
for each row execute function public.protect_account_role();

drop policy if exists "public can insert stylist users" on public.users;

drop policy if exists "users can read own buddy matches" on public.buddy_matches;
drop policy if exists "users can create buddy requests" on public.buddy_matches;
drop policy if exists "recipients can update buddy requests" on public.buddy_matches;
drop policy if exists "users can read matched profiles" on public.users;

create policy "users can read own buddy matches"
on public.buddy_matches
for select
to authenticated
using (user_a = auth.uid() or user_b = auth.uid());

create policy "users can create buddy requests"
on public.buddy_matches
for insert
to authenticated
with check (user_a = auth.uid() and user_b <> auth.uid());

create policy "recipients can update buddy requests"
on public.buddy_matches
for update
to authenticated
using (user_b = auth.uid())
with check (user_b = auth.uid());

create policy "users can read matched profiles"
on public.users
for select
to authenticated
using (
  exists (
    select 1
    from public.buddy_matches
    where (
      buddy_matches.user_a = auth.uid()
      and buddy_matches.user_b = users.id
    ) or (
      buddy_matches.user_b = auth.uid()
      and buddy_matches.user_a = users.id
    )
  )
);
