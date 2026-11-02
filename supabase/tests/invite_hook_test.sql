-- The "Before User Created" hook lets only invited emails sign up.
begin;
select plan(7);

insert into public.allowed_emails (email) values ('invited@example.test');

select is(
  private.before_user_created('{"user": {"email": "invited@example.test"}}'),
  '{}'::jsonb,
  'An invited email may sign up'
);

select is(
  private.before_user_created('{"user": {"email": "  Invited@Example.TEST "}}'),
  '{}'::jsonb,
  'The invite check ignores case and surrounding spaces'
);

select is(
  private.before_user_created('{"user": {"email": "stranger@example.test"}}') -> 'error' ->> 'http_code',
  '403',
  'An email without an invite is rejected with 403'
);

select is(
  private.before_user_created('{"user": {"phone": "+620000000000"}}') -> 'error' ->> 'http_code',
  '403',
  'A sign-up without an email is rejected'
);

select ok(
  has_function_privilege('supabase_auth_admin', 'private.before_user_created(jsonb)', 'execute'),
  'Supabase Auth can call the hook'
);

select ok(
  not has_function_privilege('authenticated', 'private.before_user_created(jsonb)', 'execute')
    and not has_function_privilege('anon', 'private.before_user_created(jsonb)', 'execute'),
  'App users cannot call the hook'
);

-- The hook runs as supabase_auth_admin, which must see the invite list despite RLS.
-- The postgres role cannot switch to it, so check the grant and the policy instead.
select ok(
  has_table_privilege('supabase_auth_admin', 'public.allowed_emails', 'select')
    and exists (
      select 1 from pg_policies
      where schemaname = 'public'
        and tablename = 'allowed_emails'
        and cmd = 'SELECT'
        and 'supabase_auth_admin' = any (roles)
    ),
  'Supabase Auth can read the invite list'
);

select * from finish();
rollback;
