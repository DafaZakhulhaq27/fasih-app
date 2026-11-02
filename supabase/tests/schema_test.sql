-- Schema-wide guards for the rules in CLAUDE.md. They cover tables added by later migrations too.
begin;
select plan(4);

select is_empty(
  $$
    select c.relname
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind in ('r', 'p') and not c.relrowsecurity
  $$,
  'Every table in public has row level security enabled'
);

select is_empty(
  $$
    select con.conrelid::regclass::text
    from pg_constraint con
    join pg_class c on c.oid = con.conrelid
    join pg_namespace n on n.oid = c.relnamespace
    where con.contype = 'f'
      and con.confrelid = 'auth.users'::regclass
      and n.nspname = 'public'
      and con.confdeltype <> 'c'
  $$,
  'Every foreign key to auth.users cascades on delete'
);

-- has_*_privilege also sees column-level grants, which information_schema.role_table_grants does not.
select is_empty(
  $$
    select c.relname
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind in ('r', 'p', 'v', 'm')
      and (
        has_table_privilege('anon', c.oid, 'SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER')
        or has_any_column_privilege('anon', c.oid, 'SELECT, INSERT, UPDATE, REFERENCES')
      )
  $$,
  'Signed-out users have no privileges on public tables or their columns'
);

select is_empty(
  $$
    select p.proname
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname in ('public', 'private')
      and p.prosecdef
      and not coalesce(array_to_string(p.proconfig, ',') like '%search_path=%', false)
  $$,
  'Security definer functions pin their search_path'
);

select * from finish();
rollback;
