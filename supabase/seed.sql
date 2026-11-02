-- Local development seed. No personal data: example.test is reserved for testing (RFC 2606).
insert into public.allowed_emails (email)
values ('dev@example.test')
on conflict (email) do nothing;
