-- Derived numbers for Progress are computed in SQL views, not stored (docs/plan.md "Menyimpan
-- progres"), so they can never drift out of sync. security_invoker makes each view run with the
-- caller's privileges, so the RLS policies of the underlying tables still apply.

-- One row per checked Writing attempt: the self band and errors per 100 words.
create view public.writing_attempt_stats
with (security_invoker = true)
as
select
  a.id as attempt_id,
  a.user_id,
  a.created_at,
  a.word_count,
  overall.band as self_band,
  coalesce(marked.mistake_count, 0) as mistake_count,
  case
    when a.word_count > 0 then round(coalesce(marked.mistake_count, 0) * 100.0 / a.word_count, 1)
  end as errors_per_100
from public.attempts a
join public.practice_sessions s on s.id = a.session_id
left join public.band_scores overall
  on overall.attempt_id = a.id and overall.source = 'self' and overall.criterion is null
left join lateral (
  select count(*)::integer as mistake_count
  from public.mistakes m
  where m.attempt_id = a.id and m.status = 'active'
) marked on true
where s.mode = 'writing' and a.status = 'done';

revoke all on public.writing_attempt_stats from anon, authenticated;
grant select on public.writing_attempt_stats to authenticated;
