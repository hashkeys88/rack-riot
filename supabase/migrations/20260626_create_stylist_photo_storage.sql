insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'stylist-application-photos',
  'stylist-application-photos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public can upload stylist application photos" on storage.objects;
drop policy if exists "public can read stylist application photos" on storage.objects;

create policy "public can upload stylist application photos"
on storage.objects
for insert
to anon, authenticated
with check (bucket_id = 'stylist-application-photos');

create policy "public can read stylist application photos"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'stylist-application-photos');
