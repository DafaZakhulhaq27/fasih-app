-- Fase 0 step 8 (tables): the 12-week syllabus as data, its lessons, and each user's progress.
-- Content is readable by every signed-in user and written by admins only (CLAUDE.md rule 2).

-- Units ---------------------------------------------------------------------

create table public.curriculum_units (
  id uuid primary key default gen_random_uuid(),
  target_language text not null default 'en',
  exam text not null default 'ielts' check (exam in ('ielts')),
  week smallint not null check (week >= 1),
  topic text not null check (char_length(topic) between 1 and 100),
  -- Null means the unit serves both modules; from week 5 a week may have one unit per module.
  module text check (module in ('academic', 'general_training')),
  -- Question types, target patterns and topic vocabulary for the week.
  focus jsonb not null default '{}'::jsonb check (jsonb_typeof(focus) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index curriculum_units_week_module_key
  on public.curriculum_units (target_language, exam, week, coalesce(module, ''));

create trigger curriculum_units_set_updated_at
  before update on public.curriculum_units
  for each row execute function private.set_updated_at();

-- Lessons -------------------------------------------------------------------

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.curriculum_units (id) on delete cascade,
  -- 1-5 are Monday to Friday, 6 is the Saturday checkpoint or mock.
  position smallint not null check (position between 1 and 6),
  skill text not null check (skill in ('listening', 'reading', 'writing', 'speaking', 'language')),
  kind text not null default 'lesson' check (kind in ('lesson', 'checkpoint', 'mock')),
  -- Input, notice, practice and produce steps. Only content checked by hand is stored.
  content jsonb not null check (jsonb_typeof(content) = 'object'),
  content_version integer not null default 1 check (content_version >= 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (unit_id, position)
);

create trigger lessons_set_updated_at
  before update on public.lessons
  for each row execute function private.set_updated_at();

-- Content access: signed-in users read, admins write.
alter table public.curriculum_units enable row level security;
alter table public.lessons enable row level security;

revoke all on table public.curriculum_units, public.lessons from anon, authenticated;
grant select, insert, update, delete on table public.curriculum_units, public.lessons to authenticated;

create policy "Signed-in users read units"
  on public.curriculum_units for select to authenticated
  using (true);

create policy "Admins add units"
  on public.curriculum_units for insert to authenticated
  with check ((select private.is_admin()));

create policy "Admins change units"
  on public.curriculum_units for update to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

create policy "Admins remove units"
  on public.curriculum_units for delete to authenticated
  using ((select private.is_admin()));

create policy "Signed-in users read lessons"
  on public.lessons for select to authenticated
  using (true);

create policy "Admins add lessons"
  on public.lessons for insert to authenticated
  with check ((select private.is_admin()));

create policy "Admins change lessons"
  on public.lessons for update to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

create policy "Admins remove lessons"
  on public.lessons for delete to authenticated
  using ((select private.is_admin()));

-- Progress ------------------------------------------------------------------

create table public.lesson_progress (
  -- Generated on the client; one row per user and lesson, written with upsert.
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  status text not null default 'started' check (status in ('started', 'completed')),
  -- Practice accuracy in percent, computed by the app.
  score numeric(5, 2) check (score between 0 and 100),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, lesson_id),
  constraint lesson_progress_completed_has_time check ((status = 'completed') = (completed_at is not null))
);

create index lesson_progress_lesson_id_idx on public.lesson_progress (lesson_id);

create trigger lesson_progress_set_updated_at
  before update on public.lesson_progress
  for each row execute function private.set_updated_at();

alter table public.lesson_progress enable row level security;

revoke all on table public.lesson_progress from anon, authenticated;
grant select, insert, update on table public.lesson_progress to authenticated;

create policy "Users read their own progress"
  on public.lesson_progress for select to authenticated
  using (user_id = (select auth.uid()));

create policy "Users add their own progress"
  on public.lesson_progress for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "Users update their own progress"
  on public.lesson_progress for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
