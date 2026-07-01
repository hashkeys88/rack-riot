alter table public.stylist_applications
add column if not exists auth_user_id uuid references auth.users(id) on delete set null;

alter table public.stylist_applications
add column if not exists approved_at timestamptz;

alter table public.stylists
add column if not exists availability text;

drop policy if exists "admins can read stylist applications" on public.stylist_applications;
drop policy if exists "admins can update stylist applications" on public.stylist_applications;

create policy "admins can read stylist applications"
on public.stylist_applications
for select
to authenticated
using (
  exists (
    select 1
    from public.users
    where users.id = auth.uid()
      and users.role = 'admin'
  )
);

create policy "admins can update stylist applications"
on public.stylist_applications
for update
to authenticated
using (
  exists (
    select 1
    from public.users
    where users.id = auth.uid()
      and users.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.users
    where users.id = auth.uid()
      and users.role = 'admin'
  )
);
