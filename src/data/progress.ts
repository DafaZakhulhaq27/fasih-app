import type { MistakeRow } from '@core/mistake-types.ts';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';

// Progress reads. Derived numbers (errors per 100 words, self bands per essay) come from the
// writing_attempt_stats view; nothing here is computed by a model.

/** docs/plan.md: "7.0 sementara" until the owner sets a target in an exam plan. */
export const DEFAULT_TARGET_BAND = 7;

export const progressKeys = {
  writingStats: ['progress', 'writing-stats'] as const,
  mistakes: ['progress', 'mistakes'] as const,
  target: ['progress', 'target'] as const,
};

export type WritingStat = {
  attemptId: string;
  createdAt: string;
  wordCount: number | null;
  selfBand: number | null;
  mistakeCount: number;
  errorsPer100: number | null;
};

/** Checked Writing attempts, oldest first. */
export function useWritingStats(): UseQueryResult<WritingStat[]> {
  return useQuery({
    queryKey: progressKeys.writingStats,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('writing_attempt_stats')
        .select('attempt_id, created_at, word_count, self_band, mistake_count, errors_per_100')
        .order('created_at');
      if (error) {
        throw error;
      }
      return data.map((row) => ({
        attemptId: row.attempt_id,
        createdAt: row.created_at,
        wordCount: row.word_count,
        selfBand: row.self_band,
        mistakeCount: row.mistake_count ?? 0,
        errorsPer100: row.errors_per_100,
      }));
    },
  });
}

export type MistakeListItem = MistakeRow & { id: string; source: string };

const MAX_MISTAKES = 500;

/** Active mistakes, newest first. */
export function useMistakes(): UseQueryResult<MistakeListItem[]> {
  return useQuery({
    queryKey: progressKeys.mistakes,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mistakes')
        .select(
          'id, source, subcategory, original_span, corrected_span, created_at, mistake_categories!inner(slug)',
        )
        .eq('status', 'active')
        .eq('target_language', 'en')
        .order('created_at', { ascending: false })
        .limit(MAX_MISTAKES);
      if (error) {
        throw error;
      }
      return data.map((row) => ({
        id: row.id,
        source: row.source,
        category: row.mistake_categories.slug,
        subcategory: row.subcategory,
        original: row.original_span,
        corrected: row.corrected_span,
        createdAt: row.created_at,
      }));
    },
  });
}

/** The target band from the latest exam plan, or the default. */
export function useTargetBand(): UseQueryResult<number> {
  return useQuery({
    queryKey: progressKeys.target,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exam_plans')
        .select('target_band')
        .not('target_band', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1);
      if (error) {
        throw error;
      }
      return data[0]?.target_band ?? DEFAULT_TARGET_BAND;
    },
  });
}
