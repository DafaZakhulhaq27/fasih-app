-- Practice data: the question bank, sessions, attempts, AI feedback, band scores and the Mistake Bank.
-- Write rules (CLAUDE.md rule 2, docs/plan.md "Menyimpan progres"):
--   - the app writes only its own rows;
--   - AI results (feedback, mistakes with source 'ai', band estimates) are written by Edge Functions
--     with the service role, never by the app;
--   - content (prompts, mistake categories) is read by signed-in users and written by admins.

-- Question bank -------------------------------------------------------------

create table public.prompts (
  id uuid primary key default gen_random_uuid(),
  target_language text not null default 'en',
  task text not null check (task in (
    'writing_task1_academic', 'writing_task1_gt', 'writing_task2',
    'speaking_part1', 'speaking_part2', 'speaking_part3', 'free_writing', 'free_speaking'
  )),
  essay_type text check (essay_type in (
    'opinion', 'discussion', 'problem_solution', 'advantages_disadvantages', 'two_part'
  )),
  topic text not null check (char_length(topic) between 1 and 100),
  -- Question text, cue card points, chart data, and band 7-8 sample answers once checked by hand.
  content jsonb not null check (jsonb_typeof(content) = 'object'),
  time_limit_s integer check (time_limit_s > 0),
  min_words integer check (min_words > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint prompts_essay_type_only_for_task2 check (essay_type is null or task = 'writing_task2')
);

create index prompts_language_task_idx on public.prompts (target_language, task);

create trigger prompts_set_updated_at
  before update on public.prompts
  for each row execute function private.set_updated_at();

-- Mistake categories (per language, so a new language adds rows instead of changing an enum).

create table public.mistake_categories (
  id uuid primary key default gen_random_uuid(),
  target_language text not null default 'en',
  slug text not null check (slug ~ '^[a-z_]+$'),
  label text not null,
  criterion text not null check (criterion in (
    'task', 'coherence', 'lexical', 'grammar', 'fluency', 'pronunciation'
  )),
  sort_order smallint not null default 0,
  unique (target_language, slug)
);

-- The same categories the feedback schema uses (supabase/functions/_shared/core/feedback.ts).
insert into public.mistake_categories (target_language, slug, label, criterion, sort_order)
values
  ('en', 'grammar', 'Grammar', 'grammar', 1),
  ('en', 'word_choice', 'Word choice', 'lexical', 2),
  ('en', 'collocation', 'Collocation', 'lexical', 3),
  ('en', 'cohesion', 'Linking and cohesion', 'coherence', 4),
  ('en', 'register', 'Register and tone', 'lexical', 5),
  ('en', 'fluency', 'Fluency', 'fluency', 6),
  ('en', 'pronunciation', 'Pronunciation', 'pronunciation', 7);

alter table public.prompts enable row level security;
alter table public.mistake_categories enable row level security;

revoke all on table public.prompts, public.mistake_categories from anon, authenticated;
grant select, insert, update, delete on table public.prompts, public.mistake_categories to authenticated;

create policy "Signed-in users read prompts"
  on public.prompts for select to authenticated using (true);
create policy "Admins add prompts"
  on public.prompts for insert to authenticated with check ((select private.is_admin()));
create policy "Admins change prompts"
  on public.prompts for update to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Admins remove prompts"
  on public.prompts for delete to authenticated using ((select private.is_admin()));

create policy "Signed-in users read mistake categories"
  on public.mistake_categories for select to authenticated using (true);
create policy "Admins add mistake categories"
  on public.mistake_categories for insert to authenticated with check ((select private.is_admin()));
create policy "Admins change mistake categories"
  on public.mistake_categories for update to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Admins remove mistake categories"
  on public.mistake_categories for delete to authenticated using ((select private.is_admin()));

-- Sessions and attempts -----------------------------------------------------
-- IDs are generated on the client and written with upsert, so offline retries are safe.

create table public.practice_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  target_language text not null default 'en',
  mode text not null check (mode in (
    'diagnostic', 'lesson', 'writing', 'speaking', 'conversation', 'mock', 'free'
  )),
  prompt_id uuid references public.prompts (id),
  lesson_id uuid references public.lessons (id),
  created_at timestamptz not null default now()
);

create index practice_sessions_user_id_idx on public.practice_sessions (user_id, created_at desc);
create index practice_sessions_prompt_id_idx on public.practice_sessions (prompt_id);
create index practice_sessions_lesson_id_idx on public.practice_sessions (lesson_id);

create table public.attempts (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.practice_sessions (id) on delete cascade,
  -- Copied from the session so RLS and per-user queries need no join.
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  -- draft: still being written; pending: submitted and waiting for a check (kept when AI is down);
  -- done: checked; failed: the AI check failed and can be retried.
  status text not null default 'draft' check (status in ('draft', 'pending', 'done', 'failed')),
  check_mode text not null default 'manual' check (check_mode in ('manual', 'ai', 'both')),
  -- Self-check: ticked checklist items and the writer's own band per criterion.
  self_review jsonb check (self_review is null or jsonb_typeof(self_review) = 'object'),
  raw_text text,
  word_count integer check (word_count >= 0),
  time_spent_s integer check (time_spent_s >= 0),
  audio_path text,
  duration_ms integer check (duration_ms >= 0),
  -- Speaking metrics, computed by Edge Functions from the transcript.
  transcript text,
  wpm numeric(5, 1) check (wpm >= 0),
  filler_count integer check (filler_count >= 0),
  long_pause_count integer check (long_pause_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index attempts_session_id_idx on public.attempts (session_id);
create index attempts_user_id_idx on public.attempts (user_id, created_at desc);

create trigger attempts_set_updated_at
  before update on public.attempts
  for each row execute function private.set_updated_at();

alter table public.practice_sessions enable row level security;
alter table public.attempts enable row level security;

revoke all on table public.practice_sessions, public.attempts from anon, authenticated;
grant select, insert on table public.practice_sessions to authenticated;
grant select on table public.attempts to authenticated;
-- The app never writes the speaking metrics; those come from the transcript on the server.
grant insert (
  id, session_id, user_id, status, check_mode, self_review, raw_text, word_count, time_spent_s,
  audio_path, duration_ms
) on table public.attempts to authenticated;
grant update (
  status, check_mode, self_review, raw_text, word_count, time_spent_s, audio_path, duration_ms
) on table public.attempts to authenticated;

create policy "Users read their own sessions"
  on public.practice_sessions for select to authenticated
  using (user_id = (select auth.uid()));
create policy "Users add their own sessions"
  on public.practice_sessions for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "Users read their own attempts"
  on public.attempts for select to authenticated
  using (user_id = (select auth.uid()));
create policy "Users add attempts to their own sessions"
  on public.attempts for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.practice_sessions s
      where s.id = session_id and s.user_id = (select auth.uid())
    )
  );
create policy "Users update their own attempts"
  on public.attempts for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- AI feedback (written by Edge Functions only) ------------------------------------

create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null unique references public.attempts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  model text not null,
  prompt_version text not null,
  -- The full guarded response, so old answers can be re-run against new prompts in the eval.
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  improved text,
  created_at timestamptz not null default now()
);

create index feedback_user_id_idx on public.feedback (user_id);

alter table public.feedback enable row level security;
revoke all on table public.feedback from anon, authenticated;
grant select on table public.feedback to authenticated;

create policy "Users read feedback on their own attempts"
  on public.feedback for select to authenticated
  using (user_id = (select auth.uid()));

-- Band scores -------------------------------------------------------------

create table public.band_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  -- attempt: AI estimate for an attempt; self: the writer's own band; checkpoint and mock: test results.
  source text not null check (source in ('attempt', 'self', 'checkpoint', 'mock')),
  skill text not null check (skill in ('listening', 'reading', 'writing', 'speaking')),
  -- Null means the band for the whole skill.
  criterion text check (criterion in (
    'task', 'coherence', 'lexical', 'grammar', 'fluency', 'pronunciation'
  )),
  band numeric(2, 1) not null check (band between 0 and 9 and band * 2 = trunc(band * 2)),
  -- Listening and Reading raw scores out of 40.
  raw_score smallint check (raw_score between 0 and 40),
  -- True only for AI estimates, which charts label "estimate" and never mix with the rest.
  is_estimate boolean not null default false,
  attempt_id uuid references public.attempts (id) on delete cascade,
  recorded_at timestamptz not null default now(),
  constraint band_scores_estimates_come_from_attempts check (is_estimate = (source = 'attempt'))
);

create index band_scores_user_skill_idx on public.band_scores (user_id, skill, recorded_at);
create index band_scores_attempt_id_idx on public.band_scores (attempt_id);
create unique index band_scores_one_per_attempt_key
  on public.band_scores (attempt_id, source, coalesce(criterion, ''))
  where attempt_id is not null;

alter table public.band_scores enable row level security;
revoke all on table public.band_scores from anon, authenticated;
grant select, insert on table public.band_scores to authenticated;

create policy "Users read their own bands"
  on public.band_scores for select to authenticated
  using (user_id = (select auth.uid()));
-- The app records self-checks and test results, never AI estimates.
create policy "Users record their own non-AI bands"
  on public.band_scores for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and source in ('self', 'checkpoint', 'mock')
    and is_estimate = false
    and (
      attempt_id is null
      or exists (
        select 1 from public.attempts a
        where a.id = attempt_id and a.user_id = (select auth.uid())
      )
    )
  );

-- Mistake Bank ------------------------------------------------------------

create table public.mistakes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  attempt_id uuid references public.attempts (id) on delete cascade,
  target_language text not null default 'en',
  -- ai: from AI feedback (server only); self: marked by the writer; lesson: missed in a lesson.
  source text not null check (source in ('ai', 'self', 'lesson')),
  category_id uuid not null references public.mistake_categories (id),
  subcategory text check (char_length(subcategory) <= 60),
  original_span text not null check (char_length(original_span) between 1 and 500),
  corrected_span text not null check (char_length(corrected_span) <= 500),
  severity text not null default 'error' check (severity in ('error', 'unnatural')),
  -- dismissed: the writer marked it wrong ("this correction is wrong"), which feeds the eval set.
  status text not null default 'active' check (status in ('active', 'dismissed')),
  created_at timestamptz not null default now()
);

create index mistakes_user_trend_idx
  on public.mistakes (user_id, target_language, category_id, created_at);
create index mistakes_attempt_id_idx on public.mistakes (attempt_id);
create index mistakes_category_id_idx on public.mistakes (category_id);

alter table public.mistakes enable row level security;
revoke all on table public.mistakes from anon, authenticated;
grant select, insert on table public.mistakes to authenticated;
grant update (status) on table public.mistakes to authenticated;

create policy "Users read their own mistakes"
  on public.mistakes for select to authenticated
  using (user_id = (select auth.uid()));
create policy "Users record their own mistakes"
  on public.mistakes for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and source in ('self', 'lesson')
    and (
      attempt_id is null
      or exists (
        select 1 from public.attempts a
        where a.id = attempt_id and a.user_id = (select auth.uid())
      )
    )
  );
create policy "Users dismiss their own mistakes"
  on public.mistakes for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
