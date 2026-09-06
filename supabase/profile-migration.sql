-- Run this after supabase/schema.sql in Supabase Dashboard > SQL Editor.
-- Stores each user's public chat name and avatar, and creates avatar storage.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 80),
  avatar_url text,
  updated_at timestamptz not null default now()
);

-- Supports projects that already have an older profiles table.
alter table public.profiles add column if not exists display_name text not null default '';
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists updated_at timestamptz not null default now();
alter table public.profiles enable row level security;
alter table public.messages add column if not exists avatar_url text;

drop policy if exists "authenticated users can read profiles" on public.profiles;
create policy "authenticated users can read profiles"
on public.profiles for select to authenticated using (true);

drop policy if exists "users can create their own profile" on public.profiles;
create policy "users can create their own profile"
on public.profiles for insert to authenticated with check (id = auth.uid());

drop policy if exists "users can update their own profile" on public.profiles;
create policy "users can update their own profile"
on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

drop policy if exists "public avatar images are readable" on storage.objects;
create policy "public avatar images are readable"
on storage.objects for select using (bucket_id = 'avatars');

drop policy if exists "users can upload their own avatars" on storage.objects;
create policy "users can upload their own avatars"
on storage.objects for insert to authenticated
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "users can update their own avatars" on storage.objects;
create policy "users can update their own avatars"
on storage.objects for update to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
