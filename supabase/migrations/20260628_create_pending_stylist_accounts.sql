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

create or replace function public.protect_stylist_approval_status()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  if new.status is distinct from old.status
    and auth.uid() is not null
    and not exists (
      select 1
      from public.users
      where users.id = auth.uid()
        and users.role = 'admin'
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
