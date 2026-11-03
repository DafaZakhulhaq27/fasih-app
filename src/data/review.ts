import { applyRating, parseCardState, type ReviewRating, type StoredCard } from '@core/fsrs.ts';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { z } from 'zod';

import { supabase } from '@/lib/supabase';

// Review reads and the rating write. FSRS runs here; record_review stores the result atomically,
// checks the card version and ignores a log id it has already seen (CLAUDE.md rule 7).

const cardContextSchema = z.object({
  originalSentence: z.string(),
  original: z.string(),
  corrected: z.string(),
  source: z.string().optional(),
});

export type CardContext = z.infer<typeof cardContextSchema>;

export type DueCard = {
  id: string;
  cardType: string;
  front: string;
  back: string;
  context: CardContext | null;
  version: number;
  state: StoredCard;
  createdAt: string;
};

export const reviewKeys = {
  due: ['review', 'due'] as const,
  dueCount: ['review', 'due-count'] as const,
};

const MAX_CARDS_PER_SESSION = 100;

export function useDueCount(): UseQueryResult<number> {
  return useQuery({
    queryKey: reviewKeys.dueCount,
    queryFn: async () => {
      const { count, error } = await supabase
        .from('review_cards')
        .select('id', { count: 'exact', head: true })
        .eq('target_language', 'en')
        .lte('due', new Date().toISOString());
      if (error) {
        throw error;
      }
      return count ?? 0;
    },
  });
}

/** Cards due now, oldest first. Not refetched during a session, so the queue stays put. */
export function useDueCards(): UseQueryResult<DueCard[]> {
  return useQuery({
    queryKey: reviewKeys.due,
    staleTime: 0,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('review_cards')
        .select('id, card_type, front, back, context, version, fsrs, created_at')
        .eq('target_language', 'en')
        .lte('due', new Date().toISOString())
        .order('due')
        .limit(MAX_CARDS_PER_SESSION);
      if (error) {
        throw error;
      }
      return data.flatMap((row) => {
        const state = parseCardState(row.fsrs);
        if (!state) {
          console.warn(`Review card ${row.id} has an unreadable FSRS state; skipping it.`);
          return [];
        }
        const context = cardContextSchema.safeParse(row.context);
        return [
          {
            id: row.id,
            cardType: row.card_type,
            front: row.front,
            back: row.back,
            context: context.success ? context.data : null,
            version: row.version,
            state,
            createdAt: row.created_at,
          },
        ];
      });
    },
  });
}

const recordResultSchema = z.object({
  status: z.enum(['recorded', 'duplicate', 'conflict']),
  version: z.number().int().nullable(),
});

export type RecordResult = z.infer<typeof recordResultSchema>;

/** Schedules the card for `rating` and records it. `logId` must stay the same across retries. */
export async function recordReview(
  card: DueCard,
  rating: ReviewRating,
  logId: string,
  now: Date,
): Promise<RecordResult> {
  const next = applyRating(card.state, rating, now);
  const { data, error } = await supabase.rpc('record_review', {
    p_log_id: logId,
    p_card_id: card.id,
    p_expected_version: card.version,
    p_rating: rating,
    p_reviewed_at: now.toISOString(),
    p_due: next.due,
    p_fsrs: next.fsrs,
    p_fsrs_log: next.log,
  });
  if (error) {
    throw error;
  }
  return recordResultSchema.parse(data);
}
