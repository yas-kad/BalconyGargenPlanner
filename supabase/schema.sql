-- Balcony Garden Planner schema. Run in the Supabase SQL editor; it is safe
-- to run again.
--
-- Chats are not stored. A saved plan keeps the short summary, plant list
-- and image paths. Analytics events and hashed-IP request counts stay
-- insert-only for the anon key.

-- Remove tables from the earlier version that saved plans.
drop function if exists public.get_plan(uuid);
drop function if exists public.count_recent_plans(text, timestamptz);
drop table if exists public.plan_emails;
alter table if exists public.events drop column if exists plan_id;

create table if not exists public.events (
  id bigint generated always as identity primary key,
  name text not null check (char_length(name) <= 64),
  session_id text check (char_length(session_id) <= 64),
  properties jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists events_name_created_at_idx
  on public.events (name, created_at desc);

create table if not exists public.chat_requests (
  id bigint generated always as identity primary key,
  -- HMAC of the requester's IP; the raw IP is never stored.
  ip_hash text not null check (char_length(ip_hash) <= 128),
  -- 'plan' is the first reply of a chat, 'message' a follow-up answer.
  kind text not null check (kind in ('plan', 'message')),
  created_at timestamptz not null default now()
);

create index if not exists chat_requests_ip_hash_created_at_idx
  on public.chat_requests (ip_hash, created_at desc);

alter table public.events enable row level security;
alter table public.chat_requests enable row level security;

drop policy if exists "anon can insert events" on public.events;
create policy "anon can insert events" on public.events
  for insert to anon with check (true);

drop policy if exists "anon can insert chat requests" on public.chat_requests;
create policy "anon can insert chat requests" on public.chat_requests
  for insert to anon with check (true);

create or replace function public.count_recent_chat_requests(p_ip_hash text, p_since timestamptz)
returns table (plans integer, messages integer)
language sql
stable
security definer
set search_path = ''
as $$
  select
    count(*) filter (where r.kind = 'plan')::integer,
    count(*) filter (where r.kind = 'message')::integer
  from public.chat_requests r
  where r.ip_hash = p_ip_hash and r.created_at >= p_since;
$$;

revoke execute on function public.count_recent_chat_requests(text, timestamptz) from public;
grant execute on function public.count_recent_chat_requests(text, timestamptz) to anon, authenticated;

-- Accounts and saved plans. Signed-in users can read and insert their own
-- rows. They cannot update a profile.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  created_at timestamptz not null default now()
);

alter table public.profiles drop column if exists is_premium;

create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  answers jsonb not null,
  summary text not null default '',
  plants jsonb not null default '[]'::jsonb,
  scene_path text,
  created_at timestamptz not null default now()
);

alter table public.plans drop column if exists shopping;

create index if not exists plans_user_id_created_at_idx
  on public.plans (user_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.plans enable row level security;

drop policy if exists "read own profile" on public.profiles;
create policy "read own profile" on public.profiles
  for select to authenticated using (id = (select auth.uid()));

drop policy if exists "insert own profile" on public.profiles;
create policy "insert own profile" on public.profiles
  for insert to authenticated with check (id = (select auth.uid()));

drop policy if exists "read own plans" on public.plans;
create policy "read own plans" on public.plans
  for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists "insert own plans" on public.plans;
create policy "insert own plans" on public.plans
  for insert to authenticated with check (user_id = (select auth.uid()));

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

insert into storage.buckets (id, name, public)
values ('plan-images', 'plan-images', true)
on conflict (id) do update set public = true;

drop policy if exists "public read plan images" on storage.objects;
create policy "public read plan images" on storage.objects
  for select to public
  using (bucket_id = 'plan-images');

drop policy if exists "users upload own plan images" on storage.objects;
create policy "users upload own plan images" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'plan-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
