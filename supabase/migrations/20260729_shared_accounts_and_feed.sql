-- Run once in the Supabase SQL editor before deploying the client changes.
-- It replaces browser-only identity with authenticated, row-owned records.

alter table public.users enable row level security;
alter table public.published_pranks enable row level security;

drop policy if exists "Public profiles are readable" on public.users;
create policy "Public profiles are readable" on public.users for select using (true);
drop policy if exists "Users manage their profile" on public.users;
create policy "Users manage their profile" on public.users for all
  using (auth.uid()::text = id) with check (auth.uid()::text = id);

drop policy if exists "Published pranks are readable" on public.published_pranks;
create policy "Published pranks are readable" on public.published_pranks for select using (true);
drop policy if exists "Authors create pranks" on public.published_pranks;
create policy "Authors create pranks" on public.published_pranks for insert
  with check (auth.uid()::text = author_id);
drop policy if exists "Authors update their pranks" on public.published_pranks;
create policy "Authors update their pranks" on public.published_pranks for update
  using (auth.uid()::text = author_id) with check (auth.uid()::text = author_id);

-- The app sends these optional fields for user-built simulations.
alter table public.published_pranks add column if not exists tags text[] default '{}';
alter table public.published_pranks add column if not exists custom_image_url text;
alter table public.published_pranks add column if not exists custom_audio_url text;
