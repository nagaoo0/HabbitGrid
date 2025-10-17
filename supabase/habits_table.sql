-- Create habits table with proper types, defaults, constraints, and RLS
-- Run this in Supabase SQL editor

-- Enable gen_random_uuid()
create extension if not exists pgcrypto;

create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text,
  category text,
  completions jsonb not null default '[]'::jsonb,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Useful indexes
create index if not exists idx_habits_user_id on public.habits(user_id);
create index if not exists idx_habits_user_sort on public.habits(user_id, sort_order);

-- Automatically update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_habits_set_updated_at on public.habits;
create trigger trg_habits_set_updated_at
before update on public.habits
for each row execute function public.set_updated_at();

-- Row Level Security
alter table public.habits enable row level security;

-- Policies: each user can only access their own rows
drop policy if exists habits_select on public.habits;
create policy habits_select on public.habits
for select using (auth.uid() = user_id);

drop policy if exists habits_insert on public.habits;
create policy habits_insert on public.habits
for insert with check (auth.uid() = user_id);

drop policy if exists habits_update on public.habits;
create policy habits_update on public.habits
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists habits_delete on public.habits;
create policy habits_delete on public.habits
for delete using (auth.uid() = user_id);
