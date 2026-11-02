-- Fase 0 step 2: profiles, the invite list and exam plans, with RLS.
-- Every foreign key to a user cascades on delete so deleting an account removes all of its rows.

-- Helpers live in a schema the Data API does not expose.
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Profiles ------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (char_length(display_name) <= 100),
  role text not null default 'user' check (role in ('user', 'admin')),
  -- Off by default: answers only go to the AI provider after the user turns this on.
  ai_enabled boolean not null default false,
  default_check text not null default 'manual' check (default_check in ('ai', 'manual')),
  active_language text not null default 'en',
  learning_languages text[] not null default array['en'],
  explain_lang text not null default 'en',
  daily_budget_usd numeric(8, 4) check (daily_budget_usd >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_active_language_is_learned check (active_language = any (learning_languages))
);

comment on column public.profiles.daily_budget_usd is
  'Per-user override of the daily AI budget in USD; null means the server default.';

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function private.set_updated_at();

-- Runs as the table owner so RLS policies can check the caller's role without recursing.
create function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

revoke all on function private.is_admin() from public;
grant execute on function private.is_admin() to authenticated;

-- Creates the profile row when Supabase Auth creates a user.
create function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    left(coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'), 100)
  );
  return new;
end;
$$;

revoke all on function private.handle_new_user() from public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

alter table public.profiles enable row level security;

-- Users may change their settings, never their role or budget.
revoke all on table public.profiles from anon, authenticated;
grant select on table public.profiles to authenticated;
grant update (
  display_name,
  ai_enabled,
  default_check,
  active_language,
  learning_languages,
  explain_lang
) on table public.profiles to authenticated;

create policy "Users read their own profile"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()));

create policy "Users update their own profile"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Invite list ---------------------------------------------------------------
-- Read by the "Before User Created" auth hook (Fase 0 step 3). Only admins manage it.

create table public.allowed_emails (
  email text primary key check (email = lower(btrim(email)) and email like '%_@_%'),
  invited_by uuid default auth.uid() references auth.users (id) on delete cascade,
  invited_at timestamptz not null default now()
);

alter table public.allowed_emails enable row level security;

revoke all on table public.allowed_emails from anon, authenticated;
grant select, insert, delete on table public.allowed_emails to authenticated;

create policy "Admins read the invite list"
  on public.allowed_emails for select to authenticated
  using ((select private.is_admin()));

create policy "Admins add invites"
  on public.allowed_emails for insert to authenticated
  with check ((select private.is_admin()) and invited_by = (select auth.uid()));

create policy "Admins remove invites"
  on public.allowed_emails for delete to authenticated
  using ((select private.is_admin()));

-- Exam plans ----------------------------------------------------------------

create table public.exam_plans (
  -- Generated on the client so offline writes can be retried with upsert.
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  target_language text not null default 'en',
  exam text not null default 'ielts' check (exam in ('ielts')),
  -- Null until the module is chosen (decision due at the week 4 checkpoint).
  module text check (module in ('academic', 'general_training')),
  target_band numeric(2, 1) check (target_band between 0 and 9 and target_band * 2 = trunc(target_band * 2)),
  -- Many universities also require a minimum band in every section.
  min_section_band numeric(2, 1) check (
    min_section_band between 0 and 9 and min_section_band * 2 = trunc(min_section_band * 2)
  ),
  start_date date,
  final_mock_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint exam_plans_dates_in_order check (final_mock_date >= start_date)
);

create index exam_plans_user_id_idx on public.exam_plans (user_id);

create trigger exam_plans_set_updated_at
  before update on public.exam_plans
  for each row execute function private.set_updated_at();

alter table public.exam_plans enable row level security;

revoke all on table public.exam_plans from anon, authenticated;
grant select, insert, update, delete on table public.exam_plans to authenticated;

create policy "Users read their own exam plans"
  on public.exam_plans for select to authenticated
  using (user_id = (select auth.uid()));

create policy "Users add their own exam plans"
  on public.exam_plans for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "Users update their own exam plans"
  on public.exam_plans for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Users delete their own exam plans"
  on public.exam_plans for delete to authenticated
  using (user_id = (select auth.uid()));
