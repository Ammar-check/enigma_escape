-- Run in Supabase SQL editor or via CLI. Optional fields for admin booking preferences.
alter table public.bookings
  add column if not exists room_times_played integer,
  add column if not exists favorite_room text;

comment on column public.bookings.room_times_played is 'How many times the customer has played escape rooms (1–10), admin-entered.';
comment on column public.bookings.favorite_room is 'Favorite room name from catalog, admin-entered.';
