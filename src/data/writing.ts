import { newCardState } from '@core/fsrs.ts';
import { getLanguagePack } from '@core/language-pack.ts';
import { buildCorrectionCard } from '@core/review-card.ts';
import type { SelfReview } from '@core/self-review.ts';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import * as Crypto from 'expo-crypto';
import { z } from 'zod';

import type { Tables } from '@/lib/database.types';
import { supabase } from '@/lib/supabase';

const en = getLanguagePack('en');

// Writing Task 2 reads and writes. IDs are generated here and written with
// "on conflict do nothing", so a retried write never creates a duplicate (CLAUDE.md rule 7).
// TODO(fase-1): route writes through the expo-sqlite offline queue.

const writingPromptContentSchema = z.object({ question: z.string().min(1) });

export type WritingPrompt = {
  id: string;
  topic: string;
  essayType: string | null;
  question: string;
  timeLimitS: number;
  minWords: number;
};

type PromptRow = Pick<
  Tables<'prompts'>,
  'id' | 'topic' | 'essay_type' | 'content' | 'time_limit_s' | 'min_words'
>;

function toWritingPrompt(row: PromptRow): WritingPrompt | null {
  const content = writingPromptContentSchema.safeParse(row.content);
  if (!content.success) {
    console.warn(`Prompt ${row.id} has invalid content`, content.error);
    return null;
  }
  return {
    id: row.id,
    topic: row.topic,
    essayType: row.essay_type,
    question: content.data.question,
    timeLimitS: row.time_limit_s ?? 40 * 60,
    minWords: row.min_words ?? 250,
  };
}

export const writingKeys = {
  prompts: ['writing', 'prompts'] as const,
  attempt: (id: string) => ['writing', 'attempt', id] as const,
  recent: ['writing', 'recent'] as const,
  categories: ['mistake-categories', 'en'] as const,
};

export function useWritingPrompts(): UseQueryResult<WritingPrompt[]> {
  return useQuery({
    queryKey: writingKeys.prompts,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prompts')
        .select('id, topic, essay_type, content, time_limit_s, min_words')
        .eq('task', 'writing_task2')
        .eq('target_language', 'en')
        .order('topic');
      if (error) {
        throw error;
      }
      return data.map(toWritingPrompt).filter((prompt) => prompt !== null);
    },
  });
}

export type WritingAttempt = {
  id: string;
  status: Tables<'attempts'>['status'];
  rawText: string;
  timeSpentS: number;
  selfReview: unknown;
  createdAt: string;
  prompt: WritingPrompt;
};

export function useWritingAttempt(attemptId: string): UseQueryResult<WritingAttempt> {
  return useQuery({
    queryKey: writingKeys.attempt(attemptId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attempts')
        .select(
          'id, status, raw_text, time_spent_s, self_review, created_at, practice_sessions!inner(prompts!inner(id, topic, essay_type, content, time_limit_s, min_words))',
        )
        .eq('id', attemptId)
        .single();
      if (error) {
        throw error;
      }
      const prompt = toWritingPrompt(data.practice_sessions.prompts);
      if (!prompt) {
        throw new Error('This question could not be loaded.');
      }
      return {
        id: data.id,
        status: data.status,
        rawText: data.raw_text ?? '',
        timeSpentS: data.time_spent_s ?? 0,
        selfReview: data.self_review,
        createdAt: data.created_at,
        prompt,
      };
    },
  });
}

export type RecentWritingAttempt = {
  id: string;
  status: Tables<'attempts'>['status'];
  topic: string;
  wordCount: number | null;
  createdAt: string;
  selfBand: number | null;
};

export function useRecentWritingAttempts(): UseQueryResult<RecentWritingAttempt[]> {
  return useQuery({
    queryKey: writingKeys.recent,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attempts')
        .select(
          'id, status, word_count, created_at, practice_sessions!inner(mode, prompts(topic)), band_scores(band, criterion, source)',
        )
        .eq('practice_sessions.mode', 'writing')
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) {
        throw error;
      }
      return data.map((row) => ({
        id: row.id,
        status: row.status,
        topic: row.practice_sessions.prompts?.topic ?? 'Writing',
        wordCount: row.word_count,
        createdAt: row.created_at,
        selfBand:
          row.band_scores.find((score) => score.source === 'self' && score.criterion === null)
            ?.band ?? null,
      }));
    },
  });
}

export function useMistakeCategories(): UseQueryResult<Map<string, string>> {
  return useQuery({
    queryKey: writingKeys.categories,
    staleTime: Infinity,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mistake_categories')
        .select('id, slug')
        .eq('target_language', 'en');
      if (error) {
        throw error;
      }
      return new Map(data.map((category) => [category.slug, category.id]));
    },
  });
}

/** Creates the session and a draft attempt; returns the attempt id. */
export async function startWritingAttempt(promptId: string): Promise<string> {
  const sessionId = Crypto.randomUUID();
  const attemptId = Crypto.randomUUID();
  const session = await supabase
    .from('practice_sessions')
    .upsert(
      { id: sessionId, mode: 'writing', prompt_id: promptId },
      { onConflict: 'id', ignoreDuplicates: true },
    );
  if (session.error) {
    throw session.error;
  }
  const attempt = await supabase
    .from('attempts')
    .upsert(
      { id: attemptId, session_id: sessionId, status: 'draft', check_mode: 'manual' },
      { onConflict: 'id', ignoreDuplicates: true },
    );
  if (attempt.error) {
    throw attempt.error;
  }
  return attemptId;
}

type EssayDraft = { rawText: string; wordCount: number; timeSpentS: number };

export async function saveEssay(
  attemptId: string,
  draft: EssayDraft,
  status: 'draft' | 'pending' = 'draft',
): Promise<void> {
  const { error } = await supabase
    .from('attempts')
    .update({
      raw_text: draft.rawText,
      word_count: draft.wordCount,
      time_spent_s: draft.timeSpentS,
      status,
    })
    .eq('id', attemptId);
  if (error) {
    throw error;
  }
}

export type MarkedMistake = {
  id: string;
  /** Id of the review card made from this mistake, reused on retry. */
  cardId: string;
  original: string;
  corrected: string;
  categoryId: string;
  subcategory: string | null;
};

export type SelfCheckSave = {
  attemptId: string;
  /** The essay, so each review card can show the sentence the mistake came from. */
  essay: string;
  review: SelfReview;
  /** One row per criterion plus the overall band (criterion null); ids are reused on retry. */
  bands: { id: string; criterion: string | null; band: number }[];
  mistakes: MarkedMistake[];
};

export async function saveSelfCheck(save: SelfCheckSave): Promise<void> {
  const attempt = await supabase
    .from('attempts')
    .update({ self_review: save.review, status: 'done', check_mode: 'manual' })
    .eq('id', save.attemptId);
  if (attempt.error) {
    throw attempt.error;
  }
  const bands = await supabase.from('band_scores').upsert(
    save.bands.map((row) => ({
      id: row.id,
      source: 'self',
      skill: 'writing',
      criterion: row.criterion,
      band: row.band,
      attempt_id: save.attemptId,
    })),
    { onConflict: 'id', ignoreDuplicates: true },
  );
  if (bands.error) {
    throw bands.error;
  }
  if (save.mistakes.length > 0) {
    const mistakes = await supabase.from('mistakes').upsert(
      save.mistakes.map((mistake) => ({
        id: mistake.id,
        attempt_id: save.attemptId,
        source: 'self',
        category_id: mistake.categoryId,
        subcategory: mistake.subcategory,
        original_span: mistake.original,
        corrected_span: mistake.corrected,
      })),
      { onConflict: 'id', ignoreDuplicates: true },
    );
    if (mistakes.error) {
      throw mistakes.error;
    }
    // Every recorded mistake becomes at least one review card (docs/plan.md acceptance criteria).
    const now = new Date();
    const cards = await supabase.from('review_cards').upsert(
      save.mistakes.map((mistake) => {
        const card = buildCorrectionCard(en, save.essay, mistake.original, mistake.corrected);
        const schedule = newCardState(now);
        return {
          id: mistake.cardId,
          mistake_id: mistake.id,
          card_type: card.cardType,
          front: card.front,
          back: card.back,
          context: { ...card.context, source: 'writing_task2' },
          due: schedule.due,
          fsrs: schedule.fsrs,
        };
      }),
      { onConflict: 'id', ignoreDuplicates: true },
    );
    if (cards.error) {
      throw cards.error;
    }
  }
}
