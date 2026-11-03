-- Review cards and their history (docs/plan.md "Review", "Menyimpan progres").
-- FSRS runs in the app with ts-fsrs; the database stores its state as jsonb and the due date as an
-- indexed column. A rating is written only through record_review, which updates the card and adds
-- the log row in one transaction, checks the card version (two devices) and ignores a log id it has
-- already seen (a rating sent twice is recorded once).

create table public.review_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  target_language text not null default 'en',
  mistake_id uuid references public.mistakes (id) on delete cascade,
  lesson_id uuid references public.lessons (id) on delete cascade,
  card_type text not null check (card_type in ('cloze', 'choice', 'reorder', 'dictation')),
  front text not null check (char_length(front) between 1 and 2000),
  back text not null check (char_length(back) between 1 and 2000),
  -- What the card was made from, e.g. the sentence as first written.
  context jsonb not null default '{}'::jsonb check (jsonb_typeof(context) = 'object'),
  due timestamptz not null,
  fsrs jsonb not null check (jsonb_typeof(fsrs) = 'object'),
  version integer not null default 1 check (version >= 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint review_cards_has_source check (mistake_id is not null or lesson_id is not null)
);

create index review_cards_due_idx on public.review_cards (user_id, target_language, due);
create index review_cards_mistake_id_idx on public.review_cards (mistake_id);
create index review_cards_lesson_id_idx on public.review_cards (lesson_id);
create unique index review_cards_one_per_mistake_key
  on public.review_cards (mistake_id, card_type)
  where mistake_id is not null;

create trigger review_cards_set_updated_at
  before update on public.review_cards
  for each row execute function private.set_updated_at();

create table public.review_logs (
  -- Generated on the client, so a retried rating is recognised.
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  card_id uuid not null references public.review_cards (id) on delete cascade,
  rating smallint not null check (rating between 1 and 4),
  reviewed_at timestamptz not null,
  fsrs_log jsonb not null check (jsonb_typeof(fsrs_log) = 'object'),
  created_at timestamptz not null default now()
);

create index review_logs_card_id_idx on public.review_logs (card_id);
create index review_logs_user_reviewed_idx on public.review_logs (user_id, reviewed_at);

alter table public.review_cards enable row level security;
alter table public.review_logs enable row level security;

revoke all on table public.review_cards, public.review_logs from anon, authenticated;
grant select on table public.review_cards, public.review_logs to authenticated;
-- The app creates cards for its own self-marked or lesson mistakes; AI cards come from the server.
-- New cards always start at version 1; after that only record_review changes them.
grant insert (
  id, target_language, mistake_id, lesson_id, card_type, front, back, context, due, fsrs
) on table public.review_cards to authenticated;

create policy "Users read their own cards"
  on public.review_cards for select to authenticated
  using (user_id = (select auth.uid()));

create policy "Users add cards for their own mistakes"
  on public.review_cards for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and (
      mistake_id is null
      or exists (
        select 1 from public.mistakes m
        where m.id = mistake_id
          and m.user_id = (select auth.uid())
          and m.source in ('self', 'lesson')
      )
    )
  );

create policy "Users read their own review history"
  on public.review_logs for select to authenticated
  using (user_id = (select auth.uid()));

-- Records one rating. Returns {"status": "recorded" | "duplicate" | "conflict", "version": n}.
-- conflict: the card changed on another device since it was loaded; reload it and rate again.
create function public.record_review(
  p_log_id uuid,
  p_card_id uuid,
  p_expected_version integer,
  p_rating smallint,
  p_reviewed_at timestamptz,
  p_due timestamptz,
  p_fsrs jsonb,
  p_fsrs_log jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_version integer;
begin
  if v_user is null then
    raise exception 'Not signed in' using errcode = '42501';
  end if;
  if p_rating is null or p_rating not between 1 and 4 then
    raise exception 'Rating must be 1 to 4' using errcode = '22023';
  end if;
  if jsonb_typeof(p_fsrs) is distinct from 'object' or jsonb_typeof(p_fsrs_log) is distinct from 'object' then
    raise exception 'FSRS state and log must be JSON objects' using errcode = '22023';
  end if;

  if exists (select 1 from public.review_logs where id = p_log_id) then
    if not exists (select 1 from public.review_logs where id = p_log_id and user_id = v_user) then
      raise exception 'Unknown review' using errcode = '42501';
    end if;
    select version into v_version from public.review_cards where id = p_card_id and user_id = v_user;
    return jsonb_build_object('status', 'duplicate', 'version', v_version);
  end if;

  update public.review_cards
  set due = p_due, fsrs = p_fsrs, version = version + 1
  where id = p_card_id and user_id = v_user and version = p_expected_version
  returning version into v_version;

  if not found then
    select version into v_version from public.review_cards where id = p_card_id and user_id = v_user;
    if v_version is null then
      raise exception 'Card not found' using errcode = 'P0002';
    end if;
    return jsonb_build_object('status', 'conflict', 'version', v_version);
  end if;

  insert into public.review_logs (id, user_id, card_id, rating, reviewed_at, fsrs_log)
  values (p_log_id, v_user, p_card_id, p_rating, p_reviewed_at, p_fsrs_log);

  return jsonb_build_object('status', 'recorded', 'version', v_version);
end;
$$;

revoke all on function public.record_review(uuid, uuid, integer, smallint, timestamptz, timestamptz, jsonb, jsonb)
  from public, anon;
grant execute on function public.record_review(uuid, uuid, integer, smallint, timestamptz, timestamptz, jsonb, jsonb)
  to authenticated;
