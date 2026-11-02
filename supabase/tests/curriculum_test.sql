-- Curriculum content is read-only for users and admin-only for writes; progress stays private.
begin;
select plan(21);

insert into auth.users (id, email, aud, role)
values
  ('aaaaaaaa-0000-4000-8000-00000000000a', 'user-a@example.test', 'authenticated', 'authenticated'),
  ('bbbbbbbb-0000-4000-8000-00000000000b', 'user-b@example.test', 'authenticated', 'authenticated'),
  ('cccccccc-0000-4000-8000-00000000000c', 'admin@example.test', 'authenticated', 'authenticated');
update public.profiles set role = 'admin' where id = 'cccccccc-0000-4000-8000-00000000000c';

insert into public.curriculum_units (id, week, topic, focus)
values ('11111111-0000-4000-8000-000000000001', 1, 'Education', '{"writing": "Task 2 opinion"}');
insert into public.lessons (id, unit_id, position, skill, content)
values ('22222222-0000-4000-8000-000000000002', '11111111-0000-4000-8000-000000000001', 1, 'listening', '{"steps": []}');

-- Constraints -----------------------------------------------------------------
select throws_ok(
  $$ insert into public.curriculum_units (week, topic) values (1, 'Another week 1') $$,
  '23505', null,
  'A week has one shared unit per language and exam'
);

select lives_ok(
  $$ insert into public.curriculum_units (week, topic, module) values (1, 'Education (Academic)', 'academic') $$,
  'A module-specific unit can sit next to the shared one'
);

select throws_ok(
  $$ insert into public.lessons (unit_id, position, skill, content) values ('11111111-0000-4000-8000-000000000001', 1, 'reading', '{}') $$,
  '23505', null,
  'A unit has one lesson per position'
);

select throws_ok(
  $$ insert into public.lessons (unit_id, position, skill, content) values ('11111111-0000-4000-8000-000000000001', 7, 'reading', '{}') $$,
  '23514', null,
  'Positions run from 1 to 6'
);

select throws_ok(
  $$ insert into public.lessons (unit_id, position, skill, content) values ('11111111-0000-4000-8000-000000000001', 2, 'reading', '[]') $$,
  '23514', null,
  'Lesson content must be a JSON object'
);

-- Signed in as A (not an admin) --------------------------------------------------
set local role authenticated;
set local "request.jwt.claims" to '{"sub": "aaaaaaaa-0000-4000-8000-00000000000a", "role": "authenticated"}';

select ok((select count(*) from public.curriculum_units) >= 1, 'A signed-in user reads units');
select ok((select count(*) from public.lessons) = 1, 'A signed-in user reads lessons');

select throws_ok(
  $$ insert into public.curriculum_units (week, topic) values (2, 'Technology') $$,
  '42501', null,
  'A non-admin cannot add units'
);

select throws_ok(
  $$ insert into public.lessons (unit_id, position, skill, content) values ('11111111-0000-4000-8000-000000000001', 2, 'reading', '{}') $$,
  '42501', null,
  'A non-admin cannot add lessons'
);

select lives_ok(
  $$ update public.lessons set content = '{"changed": true}' where id = '22222222-0000-4000-8000-000000000002' $$,
  'A non-admin lesson update runs but matches no rows'
);

select lives_ok(
  $$ delete from public.curriculum_units where id = '11111111-0000-4000-8000-000000000001' $$,
  'A non-admin unit delete runs but matches no rows'
);

select lives_ok(
  $$ insert into public.lesson_progress (id, lesson_id) values ('33333333-0000-4000-8000-000000000003', '22222222-0000-4000-8000-000000000002') $$,
  'A starts a lesson'
);

select lives_ok(
  $$ update public.lesson_progress set status = 'completed', score = 80, completed_at = now() where id = '33333333-0000-4000-8000-000000000003' $$,
  'A completes it with a score'
);

select throws_ok(
  $$ insert into public.lesson_progress (lesson_id) values ('22222222-0000-4000-8000-000000000002') $$,
  '23505', null,
  'A has one progress row per lesson'
);

select throws_ok(
  $$ update public.lesson_progress set status = 'completed', completed_at = null where id = '33333333-0000-4000-8000-000000000003' $$,
  '23514', null,
  'A completed lesson needs a completion time'
);

-- Signed in as B ----------------------------------------------------------------
set local "request.jwt.claims" to '{"sub": "bbbbbbbb-0000-4000-8000-00000000000b", "role": "authenticated"}';

select is_empty($$ select id from public.lesson_progress $$, 'B cannot read A''s progress');

select throws_ok(
  $$ insert into public.lesson_progress (user_id, lesson_id) values ('aaaaaaaa-0000-4000-8000-00000000000a', '22222222-0000-4000-8000-000000000002') $$,
  '42501', null,
  'B cannot write progress for A'
);

-- Signed in as the admin ----------------------------------------------------------
set local "request.jwt.claims" to '{"sub": "cccccccc-0000-4000-8000-00000000000c", "role": "authenticated"}';

select lives_ok(
  $$ insert into public.curriculum_units (week, topic) values (2, 'Technology') $$,
  'An admin adds units'
);

-- Signed out --------------------------------------------------------------------
set local role anon;

select throws_ok($$ select * from public.lessons $$, '42501', null, 'Signed-out users cannot read lessons');

-- Back to the table owner -------------------------------------------------------
reset role;

select is(
  (select content from public.lessons where id = '22222222-0000-4000-8000-000000000002'),
  '{"steps": []}'::jsonb,
  'The non-admin update and delete changed nothing'
);

delete from public.lessons where id = '22222222-0000-4000-8000-000000000002';
select is_empty(
  $$ select 1 from public.lesson_progress where lesson_id = '22222222-0000-4000-8000-000000000002' $$,
  'Removing a lesson removes its progress rows'
);

select * from finish();
rollback;
