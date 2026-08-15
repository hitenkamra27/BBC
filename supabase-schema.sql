-- Run this once in your Supabase project's SQL Editor
-- (Dashboard → SQL Editor → New query → paste this → Run)

-- One table holds everything the app needs to share across devices:
-- the "shop-catalog" row (categories + products + site content),
-- "shop-users" (customer accounts), "shop-orders", and "shop-admin"
-- (admin password + store open/closed). Same shape the app already used
-- in localStorage — just synced to Postgres now instead of one browser.
create table if not exists kv_store (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table kv_store enable row level security;

-- Prototype-level policy: the public "anon" key can read and write.
-- This matches the app's current security level — the admin password and
-- customer passwords are checked entirely in the browser, not by a trusted
-- server — so this isn't a new weakness, but it does mean anyone who
-- inspects your site's network requests could edit the shared data directly
-- through the Supabase API. That's fine for a small store getting started.
-- If you outgrow that, the real fix is a small backend/serverless function
-- that holds a secret service-role key and enforces checks server-side —
-- the same thing already recommended for Cashfree and Resend in this repo.
drop policy if exists "Public read" on kv_store;
create policy "Public read" on kv_store for select using (true);

drop policy if exists "Public insert" on kv_store;
create policy "Public insert" on kv_store for insert with check (true);

drop policy if exists "Public update" on kv_store;
create policy "Public update" on kv_store for update using (true);

-- Enables the "live sync" feature — changes made on one device appear on
-- others without a page refresh.
alter publication supabase_realtime add table kv_store;

-- Storage bucket for banner/poster images (Admin → Website content →
-- Banners). Public bucket so poster images can be shown directly with a
-- plain URL — no different in practice from the public anon-key access
-- already granted to kv_store above.
insert into storage.buckets (id, name, public)
values ('banners', 'banners', true)
on conflict (id) do nothing;

drop policy if exists "Public banner read" on storage.objects;
create policy "Public banner read" on storage.objects
  for select using (bucket_id = 'banners');

drop policy if exists "Public banner upload" on storage.objects;
create policy "Public banner upload" on storage.objects
  for insert with check (bucket_id = 'banners');

drop policy if exists "Public banner update" on storage.objects;
create policy "Public banner update" on storage.objects
  for update using (bucket_id = 'banners');

drop policy if exists "Public banner delete" on storage.objects;
create policy "Public banner delete" on storage.objects
  for delete using (bucket_id = 'banners');

