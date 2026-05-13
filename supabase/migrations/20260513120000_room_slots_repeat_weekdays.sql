-- Optional: which weekdays a slot appears on (JS getDay: 0=Sun … 6=Sat). NULL = all days.
alter table public.room_slots
  add column if not exists repeat_weekdays smallint[];

comment on column public.room_slots.repeat_weekdays is 'If set, slot only applies on these weekdays (0=Sun..6=Sat). NULL = every day.';
