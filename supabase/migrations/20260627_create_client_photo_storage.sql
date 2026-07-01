insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'client-profile-photos',
  'client-profile-photos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public can upload client profile photos" on storage.objects;
drop policy if exists "public can read client profile photos" on storage.objects;

create policy "public can upload client profile photos"
on storage.objects
for insert
to anon, authenticated
with check (bucket_id = 'client-profile-photos');

create policy "public can read client profile photos"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'client-profile-photos');
