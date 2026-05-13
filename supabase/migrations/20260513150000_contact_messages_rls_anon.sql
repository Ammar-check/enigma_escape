-- Allow the public website (anon role) to write contact messages and the admin
-- panel (anon role) to read them when the site is deployed as a static export
-- and the Next.js /api/contact route is not available.
--
-- If you prefer admin-only reads, replace the SELECT policy below with one
-- that checks an admin claim or move admin reads behind a server function.

alter table if exists public.contact_messages enable row level security;

-- Public contact form inserts (anonymous visitors)
drop policy if exists "anon insert contact messages" on public.contact_messages;
create policy "anon insert contact messages"
  on public.contact_messages
  for insert
  to anon, authenticated
  with check (true);

-- Admin panel reads (anon supabase client used by the static admin pages)
drop policy if exists "anon read contact messages" on public.contact_messages;
create policy "anon read contact messages"
  on public.contact_messages
  for select
  to anon, authenticated
  using (true);
