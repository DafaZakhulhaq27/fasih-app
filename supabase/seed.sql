-- Local development seed. No personal data: example.test is reserved for testing (RFC 2606).
insert into public.allowed_emails (email)
values ('dev@example.test')
on conflict (email) do nothing;

-- Writing Task 2 questions written for this repo (not taken from any test book), for local practice.
-- Band 7-8 sample answers are left out until they have been checked by hand.
insert into public.prompts (id, task, essay_type, topic, content, time_limit_s, min_words)
values
  (
    'a1b2c3d4-0000-4000-8000-000000000001',
    'writing_task2', 'opinion', 'Education',
    '{"question": "Some schools now ban mobile phones for the whole school day. To what extent do you agree or disagree with this policy?"}',
    2400, 250
  ),
  (
    'a1b2c3d4-0000-4000-8000-000000000002',
    'writing_task2', 'discussion', 'Education',
    '{"question": "Some people think every child should learn to write computer code at primary school. Others believe that time is better spent on reading and arithmetic. Discuss both views and give your own opinion."}',
    2400, 250
  ),
  (
    'a1b2c3d4-0000-4000-8000-000000000003',
    'writing_task2', 'advantages_disadvantages', 'Technology',
    '{"question": "More and more office workers now spend part of the week working from home. Do the advantages of this outweigh the disadvantages?"}',
    2400, 250
  )
on conflict (id) do nothing;
