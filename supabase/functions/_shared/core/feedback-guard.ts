import type { Criterion, Feedback, FeedbackCriterion, FeedbackTask } from './feedback.ts';

// Hallucination guard (CLAUDE.md rule 6, docs/plan.md "Schema feedback"). It never trusts the
// model's quotes: a correction whose `original` is not in the answer verbatim is dropped, and a
// criterion band without one verbatim evidence quote is marked unreliable, which keeps it out of
// progress charts. Callers must log `dropped`.

export const MAX_CORRECTIONS = 5;
export const MAX_STRENGTHS = 2;

/** The criteria each task is scored on; null means any criterion is accepted. */
export const criteriaForTask: Record<FeedbackTask, readonly Criterion[] | null> = {
  writing_task1: ['task', 'coherence', 'lexical', 'grammar'],
  writing_task2: ['task', 'coherence', 'lexical', 'grammar'],
  speaking_part1: ['fluency', 'lexical', 'grammar', 'pronunciation'],
  speaking_part2: ['fluency', 'lexical', 'grammar', 'pronunciation'],
  speaking_part3: ['fluency', 'lexical', 'grammar', 'pronunciation'],
  lesson: null,
};

export type DropReason =
  | 'empty'
  | 'not_in_answer'
  | 'unchanged'
  | 'over_limit'
  | 'unexpected_criterion'
  | 'duplicate_criterion';

export type Dropped = {
  field: 'corrections' | 'evidence' | 'criteria' | 'strengths';
  reason: DropReason;
  value: string;
};

export type CheckedCriterion = FeedbackCriterion & {
  /** False when no evidence quote was found in the answer. */
  reliable: boolean;
};

export type CheckedFeedback = Omit<Feedback, 'criteria'> & { criteria: CheckedCriterion[] };

export type GuardResult = {
  feedback: CheckedFeedback;
  dropped: Dropped[];
  /** Criteria the task needs that the model did not score. */
  missingCriteria: Criterion[];
};

// Line endings differ by platform; that is not a change to the text.
function normalizeLineEndings(text: string): string {
  return text.replace(/\r\n?/g, '\n');
}

// Models often wrap evidence in quotation marks; the quoted text itself must still match exactly.
function unwrapQuote(quote: string): string {
  return quote.trim().replace(/^["“”'‘’]+|["“”'‘’]+$/g, '');
}

export function guardFeedback(feedback: Feedback, answer: string): GuardResult {
  const text = normalizeLineEndings(answer);
  const inAnswer = (quote: string): boolean => text.includes(normalizeLineEndings(quote));
  const dropped: Dropped[] = [];

  const expected = criteriaForTask[feedback.task];
  const seen = new Set<Criterion>();
  const checkedCriteria: CheckedCriterion[] = [];
  for (const item of feedback.criteria) {
    if (expected && !expected.includes(item.criterion)) {
      dropped.push({ field: 'criteria', reason: 'unexpected_criterion', value: item.criterion });
      continue;
    }
    if (seen.has(item.criterion)) {
      dropped.push({ field: 'criteria', reason: 'duplicate_criterion', value: item.criterion });
      continue;
    }
    seen.add(item.criterion);

    const evidence: string[] = [];
    for (const raw of item.evidence) {
      const quote = unwrapQuote(raw);
      if (quote === '') {
        dropped.push({ field: 'evidence', reason: 'empty', value: raw });
      } else if (!inAnswer(quote)) {
        dropped.push({ field: 'evidence', reason: 'not_in_answer', value: raw });
      } else {
        evidence.push(quote);
      }
    }
    checkedCriteria.push({ ...item, evidence, reliable: evidence.length > 0 });
  }

  const corrections: Feedback['corrections'] = [];
  for (const correction of feedback.corrections) {
    if (correction.original.trim() === '') {
      dropped.push({ field: 'corrections', reason: 'empty', value: correction.original });
    } else if (!inAnswer(correction.original)) {
      dropped.push({ field: 'corrections', reason: 'not_in_answer', value: correction.original });
    } else if (correction.original.trim() === correction.corrected.trim()) {
      dropped.push({ field: 'corrections', reason: 'unchanged', value: correction.original });
    } else if (corrections.length >= MAX_CORRECTIONS) {
      dropped.push({ field: 'corrections', reason: 'over_limit', value: correction.original });
    } else {
      corrections.push(correction);
    }
  }

  const strengths = feedback.strengths.slice(0, MAX_STRENGTHS);
  for (const strength of feedback.strengths.slice(MAX_STRENGTHS)) {
    dropped.push({ field: 'strengths', reason: 'over_limit', value: strength });
  }

  const missingCriteria = (expected ?? []).filter((criterion) => !seen.has(criterion));

  return {
    feedback: { ...feedback, criteria: checkedCriteria, corrections, strengths },
    dropped,
    missingCriteria,
  };
}
