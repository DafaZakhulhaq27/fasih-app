-- Practice data: users own their attempts, bands and self-marked mistakes; AI results are server-only.
begin;
select plan(26);

insert into auth.users (id, email, aud, role)
values
  ('aaaaaaaa-0000-4000-8000-00000000000a', 'user-a@example.test', 'authenticated', 'authenticated'),
  ('bbbbbbbb-0000-4000-8000-00000000000b', 'user-b@example.test', 'authenticated', 'authenticated');

insert into public.prompts (id, task, essay_type, topic, content, time_limit_s, min_words)
values ('99999999-0000-4000-8000-000000000009', 'writing_task2', 'opinion', 'Test', '{"question": "Q?"}', 2400, 250);

-- B's session and attempt, created as the table owner.
insert into public.practice_sessions (id, user_id, mode)
values ('b5555555-0000-4000-8000-000000000005', 'bbbbbbbb-0000-4000-8000-00000000000b', 'writing');
insert into public.attempts (id, session_id, user_id)
values ('b6666666-0000-4000-8000-000000000006', 'b5555555-0000-4000-8000-000000000005', 'bbbbbbbb-0000-4000-8000-00000000000b');

select is(
  (select count(*)::int from public.mistake_categories where target_language = 'en'),
  7,
  'English mistake categories are seeded'
);

select throws_ok(
  $$ insert into public.prompts (task, essay_type, topic, content) values ('speaking_part1', 'opinion', 'X', '{}') $$,
  '23514', null,
  'Essay types belong to Writing Task 2 only'
);

-- Signed in as A ------------------------------------------------------------
set local role authenticated;
set local "request.jwt.claims" to '{"sub": "aaaaaaaa-0000-4000-8000-00000000000a", "role": "authenticated"}';

select ok((select count(*) from public.prompts) >= 1, 'A reads the question bank');

select throws_ok(
  $$ insert into public.prompts (task, topic, content) values ('writing_task2', 'X', '{}') $$,
  '42501', null,
  'A non-admin cannot add questions'
);

select lives_ok(
  $$ insert into public.practice_sessions (id, mode, prompt_id) values ('a5555555-0000-4000-8000-000000000005', 'writing', '99999999-0000-4000-8000-000000000009') $$,
  'A starts a writing session'
);

select lives_ok(
  $$ insert into public.attempts (id, session_id) values ('a6666666-0000-4000-8000-000000000006', 'a5555555-0000-4000-8000-000000000005') $$,
  'A starts an attempt, which defaults to draft'
);

select lives_ok(
  $$ update public.attempts set raw_text = 'My essay.', word_count = 2, status = 'pending' where id = 'a6666666-0000-4000-8000-000000000006' $$,
  'A saves the essay'
);

select throws_ok(
  $$ update public.attempts set wpm = 140 where id = 'a6666666-0000-4000-8000-000000000006' $$,
  '42501', null,
  'A cannot write speaking metrics, which come from the server'
);

select throws_ok(
  $$ insert into public.attempts (session_id) values ('b5555555-0000-4000-8000-000000000005') $$,
  '42501', null,
  'A cannot add an attempt to B''s session'
);

select is_empty(
  $$ select id from public.attempts where id = 'b6666666-0000-4000-8000-000000000006' $$,
  'A cannot read B''s attempt'
);

select lives_ok(
  $$ insert into public.band_scores (source, skill, criterion, band, attempt_id) values ('self', 'writing', 'grammar', 6.5, 'a6666666-0000-4000-8000-000000000006') $$,
  'A records their own band for a criterion'
);

select throws_ok(
  $$ insert into public.band_scores (source, skill, criterion, band, attempt_id) values ('self', 'writing', 'grammar', 7, 'a6666666-0000-4000-8000-000000000006') $$,
  '23505', null,
  'One self band per criterion per attempt'
);

select throws_ok(
  $$ insert into public.band_scores (source, skill, band, is_estimate, attempt_id) values ('attempt', 'writing', 9, true, 'a6666666-0000-4000-8000-000000000006') $$,
  '42501', null,
  'A cannot write an AI estimate'
);

select throws_ok(
  $$ insert into public.band_scores (source, skill, band, attempt_id) values ('self', 'writing', 7, 'b6666666-0000-4000-8000-000000000006') $$,
  '42501', null,
  'A cannot attach a band to B''s attempt'
);

select throws_ok(
  $$ insert into public.band_scores (source, skill, band) values ('mock', 'reading', 6.25) $$,
  '23514', null,
  'Bands are whole or half bands'
);

select lives_ok(
  $$
    insert into public.mistakes (attempt_id, source, category_id, subcategory, original_span, corrected_span)
    select 'a6666666-0000-4000-8000-000000000006', 'self', id, 'article', 'a informations', 'information'
    from public.mistake_categories where slug = 'grammar'
  $$,
  'A marks their own mistake'
);

select throws_ok(
  $$
    insert into public.mistakes (attempt_id, source, category_id, original_span, corrected_span)
    select 'a6666666-0000-4000-8000-000000000006', 'ai', id, 'x', 'y'
    from public.mistake_categories where slug = 'grammar'
  $$,
  '42501', null,
  'A cannot write AI mistakes'
);

select lives_ok(
  $$ update public.mistakes set status = 'dismissed' where source = 'self' $$,
  'A dismisses their own mistake'
);

select throws_ok(
  $$ update public.mistakes set corrected_span = 'changed' $$,
  '42501', null,
  'A cannot rewrite a recorded mistake'
);

select throws_ok(
  $$ insert into public.feedback (attempt_id, user_id, model, prompt_version, payload) values ('a6666666-0000-4000-8000-000000000006', 'aaaaaaaa-0000-4000-8000-00000000000a', 'x', 'v1', '{}') $$,
  '42501', null,
  'A cannot write AI feedback'
);

-- The server (table owner here) writes feedback and an estimate for A's attempt.
reset role;
insert into public.feedback (attempt_id, user_id, model, prompt_version, payload)
values ('a6666666-0000-4000-8000-000000000006', 'aaaaaaaa-0000-4000-8000-00000000000a', 'test-model', 'feedback.v1', '{"overall": "ok"}');

select throws_ok(
  $$ insert into public.band_scores (user_id, source, skill, band, is_estimate) values ('aaaaaaaa-0000-4000-8000-00000000000a', 'self', 'writing', 7, true) $$,
  '23514', null,
  'Only AI attempt bands are estimates'
);

set local role authenticated;
set local "request.jwt.claims" to '{"sub": "aaaaaaaa-0000-4000-8000-00000000000a", "role": "authenticated"}';

select is(
  (select prompt_version from public.feedback where attempt_id = 'a6666666-0000-4000-8000-000000000006'),
  'feedback.v1',
  'A reads feedback on their own attempt'
);

-- Signed in as B --------------------------------------------------------------
set local "request.jwt.claims" to '{"sub": "bbbbbbbb-0000-4000-8000-00000000000b", "role": "authenticated"}';

select is_empty($$ select id from public.feedback $$, 'B cannot read A''s feedback');
select is_empty($$ select id from public.band_scores $$, 'B cannot read A''s bands');
select is_empty($$ select id from public.mistakes $$, 'B cannot read A''s mistakes');

-- Deleting an account -------------------------------------------------------
reset role;
delete from auth.users where id = 'aaaaaaaa-0000-4000-8000-00000000000a';

select is_empty(
  $$
    select 1 from public.practice_sessions where user_id = 'aaaaaaaa-0000-4000-8000-00000000000a'
    union all select 1 from public.attempts where user_id = 'aaaaaaaa-0000-4000-8000-00000000000a'
    union all select 1 from public.feedback where user_id = 'aaaaaaaa-0000-4000-8000-00000000000a'
    union all select 1 from public.band_scores where user_id = 'aaaaaaaa-0000-4000-8000-00000000000a'
    union all select 1 from public.mistakes where user_id = 'aaaaaaaa-0000-4000-8000-00000000000a'
  $$,
  'Deleting a user removes their practice data'
);

select * from finish();
rollback;
