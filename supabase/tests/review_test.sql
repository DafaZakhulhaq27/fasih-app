-- Review cards: users own their cards, ratings go through record_review only, and that function is
-- idempotent and checks the card version.
begin;
select plan(19);

insert into auth.users (id, email, aud, role)
values
  ('aaaaaaaa-0000-4000-8000-00000000000a', 'user-a@example.test', 'authenticated', 'authenticated'),
  ('bbbbbbbb-0000-4000-8000-00000000000b', 'user-b@example.test', 'authenticated', 'authenticated');

insert into public.mistakes (id, user_id, source, category_id, original_span, corrected_span)
select v.id, v.user_id, 'self', c.id, 'coding teach', 'coding teaches'
from public.mistake_categories c,
  (values
    ('a1111111-0000-4000-8000-000000000001'::uuid, 'aaaaaaaa-0000-4000-8000-00000000000a'::uuid),
    ('b1111111-0000-4000-8000-000000000001'::uuid, 'bbbbbbbb-0000-4000-8000-00000000000b'::uuid)
  ) as v (id, user_id)
where c.slug = 'grammar';

-- Signed in as A ------------------------------------------------------------
set local role authenticated;
set local "request.jwt.claims" to '{"sub": "aaaaaaaa-0000-4000-8000-00000000000a", "role": "authenticated"}';

select lives_ok(
  $$
    insert into public.review_cards (id, mistake_id, card_type, front, back, due, fsrs)
    values ('ca000000-0000-4000-8000-000000000001', 'a1111111-0000-4000-8000-000000000001', 'cloze',
            'Coding ____ children.', 'teaches', now(), '{"reps": 0}')
  $$,
  'A makes a card from their own mistake'
);

select is(
  (select version from public.review_cards where id = 'ca000000-0000-4000-8000-000000000001'),
  1,
  'A new card starts at version 1'
);

select throws_ok(
  $$
    insert into public.review_cards (mistake_id, card_type, front, back, due, fsrs)
    values ('a1111111-0000-4000-8000-000000000001', 'cloze', 'x ____', 'y', now(), '{}')
  $$,
  '23505', null,
  'One cloze card per mistake'
);

select throws_ok(
  $$
    insert into public.review_cards (mistake_id, card_type, front, back, due, fsrs)
    values ('b1111111-0000-4000-8000-000000000001', 'cloze', 'x ____', 'y', now(), '{}')
  $$,
  '42501', null,
  'A cannot make a card from B''s mistake'
);

select throws_ok(
  $$ update public.review_cards set due = now() + interval '1 year' $$,
  '42501', null,
  'Cards change only through record_review'
);

select throws_ok(
  $$ insert into public.review_logs (id, user_id, card_id, rating, reviewed_at, fsrs_log) values (gen_random_uuid(), 'aaaaaaaa-0000-4000-8000-00000000000a', 'ca000000-0000-4000-8000-000000000001', 3, now(), '{}') $$,
  '42501', null,
  'Review history is written only by record_review'
);

select is(
  public.record_review('10000000-0000-4000-8000-000000000001', 'ca000000-0000-4000-8000-000000000001', 1, 3::smallint, now(), now() + interval '2 days', '{"reps": 1}', '{"rating": 3}'),
  '{"status": "recorded", "version": 2}'::jsonb,
  'A rating is recorded and bumps the version'
);

select is(
  public.record_review('10000000-0000-4000-8000-000000000001', 'ca000000-0000-4000-8000-000000000001', 1, 3::smallint, now(), now() + interval '2 days', '{"reps": 1}', '{"rating": 3}'),
  '{"status": "duplicate", "version": 2}'::jsonb,
  'The same rating sent twice is recorded once'
);

select is(
  (select count(*)::int from public.review_logs where card_id = 'ca000000-0000-4000-8000-000000000001'),
  1,
  'There is one log row for the rating'
);

select is(
  public.record_review('10000000-0000-4000-8000-000000000002', 'ca000000-0000-4000-8000-000000000001', 1, 1::smallint, now(), now(), '{"reps": 2}', '{"rating": 1}'),
  '{"status": "conflict", "version": 2}'::jsonb,
  'A rating based on an old version is refused as a conflict'
);

select ok(
  (select fsrs = '{"reps": 1}' and due > now() + interval '1 day' from public.review_cards where id = 'ca000000-0000-4000-8000-000000000001'),
  'The conflicting rating changed nothing'
);

select throws_ok(
  $$ select public.record_review(gen_random_uuid(), 'ca000000-0000-4000-8000-000000000001', 2, 5::smallint, now(), now(), '{}', '{}') $$,
  '22023', null,
  'Ratings are 1 to 4'
);

select throws_ok(
  $$ select public.record_review(gen_random_uuid(), 'ca000000-0000-4000-8000-000000000001', 2, 3::smallint, now(), now(), '[]', '{}') $$,
  '22023', null,
  'The FSRS state must be a JSON object'
);

-- Signed in as B --------------------------------------------------------------
set local "request.jwt.claims" to '{"sub": "bbbbbbbb-0000-4000-8000-00000000000b", "role": "authenticated"}';

select is_empty($$ select id from public.review_cards $$, 'B cannot read A''s cards');
select is_empty($$ select id from public.review_logs $$, 'B cannot read A''s review history');

select throws_ok(
  $$ select public.record_review(gen_random_uuid(), 'ca000000-0000-4000-8000-000000000001', 2, 3::smallint, now(), now(), '{}', '{}') $$,
  'P0002', null,
  'B cannot rate A''s card'
);

select throws_ok(
  $$ select public.record_review('10000000-0000-4000-8000-000000000001', 'ca000000-0000-4000-8000-000000000001', 2, 3::smallint, now(), now(), '{}', '{}') $$,
  '42501', null,
  'B cannot reuse A''s review id'
);

-- Signed out --------------------------------------------------------------------
set local role anon;

select throws_ok(
  $$ select public.record_review(gen_random_uuid(), gen_random_uuid(), 1, 3::smallint, now(), now(), '{}', '{}') $$,
  '42501', null,
  'Signed-out users cannot record reviews'
);

-- Deleting the mistake removes its card and history ----------------------------
reset role;
delete from public.mistakes where id = 'a1111111-0000-4000-8000-000000000001';

select is_empty(
  $$
    select 1 from public.review_cards where id = 'ca000000-0000-4000-8000-000000000001'
    union all select 1 from public.review_logs where card_id = 'ca000000-0000-4000-8000-000000000001'
  $$,
  'Deleting a mistake removes its card and review history'
);

select * from finish();
rollback;
