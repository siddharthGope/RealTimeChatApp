-- Run this once in Supabase Dashboard > SQL Editor.
-- It creates one shared authenticated chat room and enables realtime inserts.
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  content text not null check (char_length(content) between 1 and 2000),
  user_id uuid references auth.users(id) on delete set null,
  sender_name text not null check (char_length(sender_name) between 1 and 80),
  is_ai boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

create policy "authenticated users can read messages"
on public.messages for select to authenticated using (true);

create policy "authenticated users can send their messages"
on public.messages for insert to authenticated
with check (user_id = auth.uid() and is_ai = false);

-- The client only inserts human messages. AI replies are deliberately written
-- through this policy for the first local-only prototype. Tighten this before production.
create policy "authenticated users can insert local AI replies"
on public.messages for insert to authenticated
with check (is_ai = true and user_id is null and sender_name = 'SimpleChat AI');

alter publication supabase_realtime add table public.messages;
