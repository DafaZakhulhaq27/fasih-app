-- Row level security: user A must not read or write user B's rows, and users cannot raise their own privileges.
begin;
select plan(29);

-- Two users. The auth trigger creates their profiles.
insert into auth.users (id, email, raw_user_meta_data, aud, role)
values
  ('aaaaaaaa-0000-4000-8000-00000000000a', 'user-a@example.test', '{"full_name": "User A"}', 'authenticated', 'authenticated'),
  ('bbbbbbbb-0000-4000-8000-00000000000b', 'user-b@example.test', '{}', 'authenticated', 'authenticated');

select results_eq(
  $$ select display_name, role, ai_enabled, default_check from public.profiles where id = 'aaaaaaaa-0000-4000-8000-00000000000a' $$,
  $$ values ('User A'::text, 'user'::text, false, 'manual'::text) $$,
  'A new user gets a profile with safe defaults'
);

select ok(
  exists (select 1 from public.profiles where id = 'bbbbbbbb-0000-4000-8000-00000000000b' and display_name is null),
  'A profile is created even without a name in the metadata'
);

-- Signed in as A ------------------------------------------------------------
set local role authenticated;
set local "request.jwt.claims" to '{"sub": "aaaaaaaa-0000-4000-8000-00000000000a", "role": "authenticated"}';

select results_eq(
  $$ select id from public.profiles $$,
  $$ values ('aaaaaaaa-0000-4000-8000-00000000000a'::uuid) $$,
  'A reads only their own profile'
);

select lives_ok(
  $$ update public.profiles set display_name = 'User A2', ai_enabled = true where id = 'aaaaaaaa-0000-4000-8000-00000000000a' $$,
  'A updates their own settings'
);

select lives_ok(
  $$ update public.profiles set display_name = 'changed by A' where id = 'bbbbbbbb-0000-4000-8000-00000000000b' $$,
  'An update of B''s profile by A runs but matches no rows'
);

select throws_ok(
  $$ update public.profiles set role = 'admin' where id = 'aaaaaaaa-0000-4000-8000-00000000000a' $$,
  '42501', null,
  'A cannot make themselves admin'
);

select throws_ok(
  $$ update public.profiles set daily_budget_usd = 100 where id = 'aaaaaaaa-0000-4000-8000-00000000000a' $$,
  '42501', null,
  'A cannot raise their own AI budget'
);

select throws_ok(
  $$ insert into public.profiles (id) values (gen_random_uuid()) $$,
  '42501', null,
  'A cannot insert profiles'
);

select throws_ok(
  $$ delete from public.profiles where id = 'aaaaaaaa-0000-4000-8000-00000000000a' $$,
  '42501', null,
  'A cannot delete profiles'
);

select is_empty(
  $$ select email from public.allowed_emails $$,
  'A non-admin cannot read the invite list'
);

select throws_ok(
  $$ insert into public.allowed_emails (email) values ('someone@example.test') $$,
  '42501', null,
  'A non-admin cannot invite'
);

select lives_ok(
  $$ delete from public.allowed_emails where email = 'dev@example.test' $$,
  'A delete of an invite by a non-admin runs but matches no rows'
);

select lives_ok(
  $$ insert into public.exam_plans (id, target_band) values ('cccccccc-0000-4000-8000-00000000000c', 7.0) $$,
  'A adds their own exam plan'
);

select throws_ok(
  $$ insert into public.exam_plans (target_band) values (6.7) $$,
  '23514', null,
  'A target band must be a multiple of 0.5'
);

-- Signed in as B ------------------------------------------------------------
set local "request.jwt.claims" to '{"sub": "bbbbbbbb-0000-4000-8000-00000000000b", "role": "authenticated"}';

select is_empty(
  $$ select id from public.exam_plans $$,
  'B cannot read A''s exam plan'
);

select lives_ok(
  $$ update public.exam_plans set target_band = 5.0 where id = 'cccccccc-0000-4000-8000-00000000000c' $$,
  'An update of A''s plan by B runs but matches no rows'
);

select lives_ok(
  $$ delete from public.exam_plans where id = 'cccccccc-0000-4000-8000-00000000000c' $$,
  'A delete of A''s plan by B runs but matches no rows'
);

select throws_ok(
  $$ insert into public.exam_plans (user_id) values ('aaaaaaaa-0000-4000-8000-00000000000a') $$,
  '42501', null,
  'B cannot add a plan for A'
);

select lives_ok(
  $$ insert into public.exam_plans (id) values ('dddddddd-0000-4000-8000-00000000000d') $$,
  'B adds their own exam plan'
);

select throws_ok(
  $$ update public.exam_plans set user_id = 'aaaaaaaa-0000-4000-8000-00000000000a' where id = 'dddddddd-0000-4000-8000-00000000000d' $$,
  '42501', null,
  'B cannot hand their plan over to A'
);

-- Signed out ----------------------------------------------------------------
set local role anon;

select throws_ok(
  $$ select * from public.profiles $$,
  '42501', null,
  'Signed-out users cannot read profiles'
);

-- Back to the table owner to check what actually changed --------------------
reset role;

select is(
  (select display_name from public.profiles where id = 'bbbbbbbb-0000-4000-8000-00000000000b'),
  null,
  'B''s profile was not changed by A'
);

select is(
  (select target_band from public.exam_plans where id = 'cccccccc-0000-4000-8000-00000000000c'),
  7.0,
  'A''s plan was neither changed nor deleted by B'
);

select ok(
  exists (select 1 from public.allowed_emails where email = 'dev@example.test'),
  'The seeded invite survived the non-admin delete'
);

-- A as admin ----------------------------------------------------------------
update public.profiles set role = 'admin' where id = 'aaaaaaaa-0000-4000-8000-00000000000a';

set local role authenticated;
set local "request.jwt.claims" to '{"sub": "aaaaaaaa-0000-4000-8000-00000000000a", "role": "authenticated"}';

select lives_ok(
  $$ insert into public.allowed_emails (email) values ('friend@example.test') $$,
  'An admin can invite'
);

select ok(
  (select count(*) from public.allowed_emails where email = 'friend@example.test') = 1,
  'An admin can read the invite list'
);

select throws_ok(
  $$ insert into public.allowed_emails (email, invited_by) values ('other@example.test', 'bbbbbbbb-0000-4000-8000-00000000000b') $$,
  '42501', null,
  'An admin cannot invite in someone else''s name'
);

select results_eq(
  $$ delete from public.allowed_emails where email = 'friend@example.test' returning email $$,
  $$ values ('friend@example.test'::text) $$,
  'An admin can remove an invite'
);

-- Deleting an account -------------------------------------------------------
reset role;
delete from auth.users where id = 'aaaaaaaa-0000-4000-8000-00000000000a';

select is_empty(
  $$
    select 1 from public.profiles where id = 'aaaaaaaa-0000-4000-8000-00000000000a'
    union all
    select 1 from public.exam_plans where user_id = 'aaaaaaaa-0000-4000-8000-00000000000a'
    union all
    select 1 from public.allowed_emails where invited_by = 'aaaaaaaa-0000-4000-8000-00000000000a'
  $$,
  'Deleting a user removes their profile, plans and invites'
);

select * from finish();
rollback;
