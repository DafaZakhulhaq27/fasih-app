-- Progress views apply the callers' RLS and compute errors per 100 words in SQL.
begin;
select plan(5);

insert into auth.users (id, email, aud, role)
values
  ('aaaaaaaa-0000-4000-8000-00000000000a', 'user-a@example.test', 'authenticated', 'authenticated'),
  ('bbbbbbbb-0000-4000-8000-00000000000b', 'user-b@example.test', 'authenticated', 'authenticated');

insert into public.practice_sessions (id, user_id, mode)
values ('a5555555-0000-4000-8000-000000000005', 'aaaaaaaa-0000-4000-8000-00000000000a', 'writing');

insert into public.attempts (id, session_id, user_id, status, word_count)
values
  ('a6666666-0000-4000-8000-000000000006', 'a5555555-0000-4000-8000-000000000005', 'aaaaaaaa-0000-4000-8000-00000000000a', 'done', 250),
  ('a6666666-0000-4000-8000-000000000007', 'a5555555-0000-4000-8000-000000000005', 'aaaaaaaa-0000-4000-8000-00000000000a', 'draft', 40);

insert into public.band_scores (user_id, source, skill, band, attempt_id)
values ('aaaaaaaa-0000-4000-8000-00000000000a', 'self', 'writing', 6.5, 'a6666666-0000-4000-8000-000000000006');

insert into public.mistakes (user_id, attempt_id, source, category_id, original_span, corrected_span, status)
select 'aaaaaaaa-0000-4000-8000-00000000000a', 'a6666666-0000-4000-8000-000000000006', 'self', c.id, v.original, 'fixed', v.status
from public.mistake_categories c,
  (values ('one', 'active'), ('two', 'active'), ('three', 'active'), ('wrong mark', 'dismissed')) as v (original, status)
where c.slug = 'grammar';

select results_eq(
  $$ select attempt_id::text, self_band, mistake_count, errors_per_100 from public.writing_attempt_stats where user_id = 'aaaaaaaa-0000-4000-8000-00000000000a' $$,
  $$ values ('a6666666-0000-4000-8000-000000000006', 6.5::numeric(2, 1), 3, 1.2) $$,
  'Checked attempts get their self band and errors per 100 words; drafts and dismissed marks are left out'
);

-- Signed in as A ------------------------------------------------------------
set local role authenticated;
set local "request.jwt.claims" to '{"sub": "aaaaaaaa-0000-4000-8000-00000000000a", "role": "authenticated"}';

select is(
  (select count(*)::int from public.writing_attempt_stats),
  1,
  'A sees their own stats'
);

-- Signed in as B ----------------------------------------------------------------
set local "request.jwt.claims" to '{"sub": "bbbbbbbb-0000-4000-8000-00000000000b", "role": "authenticated"}';

select is_empty($$ select attempt_id from public.writing_attempt_stats $$, 'B cannot see A''s stats through the view');

-- Signed out --------------------------------------------------------------------
set local role anon;

select throws_ok($$ select * from public.writing_attempt_stats $$, '42501', null, 'Signed-out users cannot read the view');

reset role;

select is_empty(
  $$
    select c.relname
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind = 'v'
      and not coalesce(c.reloptions::text[] && array['security_invoker=true', 'security_invoker=on'], false)
  $$,
  'Every view in public runs with the caller''s privileges (security_invoker)'
);

select * from finish();
rollback;
