alter table public.waitlist
add column if not exists intent_type text;

alter table public.waitlist
add column if not exists session_type text;

alter table public.waitlist
drop constraint if exists waitlist_intent_type_check;

alter table public.waitlist
add constraint waitlist_intent_type_check
check (
  intent_type is null
  or intent_type in ('everyday', 'event', 'wardrobe')
);

alter table public.waitlist
drop constraint if exists waitlist_session_type_check;

alter table public.waitlist
add constraint waitlist_session_type_check
check (
  session_type is null
  or session_type in ('solo', 'group', 'buddy')
);

notify pgrst, 'reload schema';
