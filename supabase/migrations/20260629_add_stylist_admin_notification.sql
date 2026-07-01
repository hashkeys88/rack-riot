alter table public.stylist_applications
add column if not exists admin_notified_at timestamptz;
