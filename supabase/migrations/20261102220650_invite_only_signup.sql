-- Fase 0 step 3: sign-up is invite-only.
-- Supabase Auth calls this "Before User Created" hook for every new user, whatever the provider.
-- It runs as supabase_auth_admin, so that role gets exactly the access it needs and nothing more.

create function private.before_user_created(event jsonb)
returns jsonb
language plpgsql
stable
set search_path = ''
as $$
declare
  signup_email text := lower(btrim(event -> 'user' ->> 'email'));
begin
  if signup_email is not null
    and exists (select 1 from public.allowed_emails where email = signup_email)
  then
    return '{}'::jsonb;
  end if;

  return jsonb_build_object(
    'error', jsonb_build_object(
      'http_code', 403,
      'message', 'Fasih is invite-only for now. Sign in with the Google account your invite was sent to.'
    )
  );
end;
$$;

revoke all on function private.before_user_created(jsonb) from public, anon, authenticated;
grant usage on schema private to supabase_auth_admin;
grant execute on function private.before_user_created(jsonb) to supabase_auth_admin;

grant usage on schema public to supabase_auth_admin;
grant select on table public.allowed_emails to supabase_auth_admin;

create policy "Auth reads the invite list"
  on public.allowed_emails for select to supabase_auth_admin
  using (true);
