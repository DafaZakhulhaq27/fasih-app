import { z } from 'zod';

import { roundBand } from './band.ts';

// The feedback contract from docs/plan.md ("Schema feedback"). The same schema is used for every
// provider, so eval results can be compared across models. Every field is required; length and
// count limits are applied in code (feedback-guard.ts) because providers support JSON Schema
// constraints unevenly.

export const feedbackTasks = [
  'writing_task1',
  'writing_task2',
  'speaking_part1',
  'speaking_part2',
  'speaking_part3',
  'lesson',
] as const;

export const criteria = [
  'task',
  'coherence',
  'lexical',
  'grammar',
  'fluency',
  'pronunciation',
] as const;

export const correctionCategories = [
  'grammar',
  'word_choice',
  'collocation',
  'cohesion',
  'register',
  'fluency',
  'pronunciation',
] as const;

export const severities = ['error', 'unnatural'] as const;

function lowerTrim(value: unknown): unknown {
  return typeof value === 'string' ? value.trim().toLowerCase() : value;
}

function numberFromString(value: unknown): unknown {
  if (typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Number(value))) {
    return Number(value);
  }
  return value;
}

/**
 * strict: the shape the model is asked to produce (exported as JSON Schema).
 * lenient: what we accept back. Enum values may differ in case or spacing and bands may arrive
 * as numeric strings; anything else that does not match is rejected.
 */
function buildFeedbackSchema(mode: 'strict' | 'lenient') {
  const lenient = mode === 'lenient';
  const choice = <const T extends readonly [string, ...string[]]>(values: T) =>
    lenient ? z.preprocess(lowerTrim, z.enum(values)) : z.enum(values);
  const band = lenient
    ? z.preprocess(numberFromString, z.number().min(0).max(9))
    : z.number().min(0).max(9).describe('0-9, in steps of 0.5');
  const label = lenient ? z.preprocess(lowerTrim, z.string()) : z.string();

  return z.object({
    task: choice(feedbackTasks),
    criteria: z.array(
      z.object({
        criterion: choice(criteria),
        band,
        evidence: z.array(z.string()).describe('Exact quotes from the answer'),
        reason: z.string().describe('Refers to that band level, at most 2 sentences'),
        next_step: z.string().describe('The one change most likely to raise this by half a band'),
      }),
    ),
    corrections: z.array(
      z.object({
        original: z.string().describe('An exact span copied from the answer'),
        corrected: z.string(),
        category: choice(correctionCategories),
        subcategory: label.describe('For example article, preposition, tense'),
        severity: choice(severities),
        explanation: z.string().describe('At most 2 sentences'),
      }),
    ),
    improved: z.string().describe('A band 7-8 version that keeps the writer’s own ideas'),
    strengths: z.array(z.string()).describe('At most 2, specific'),
    overall: z.string().describe('1-2 sentences'),
  });
}

/** The schema the model must follow. */
export const feedbackSchema = buildFeedbackSchema('strict');

const lenientFeedbackSchema = buildFeedbackSchema('lenient');

export type Feedback = z.output<typeof feedbackSchema>;
export type FeedbackTask = Feedback['task'];
export type Criterion = Feedback['criteria'][number]['criterion'];
export type FeedbackCriterion = Feedback['criteria'][number];
export type Correction = Feedback['corrections'][number];

/** JSON Schema for structured output requests. */
export const feedbackJsonSchema = z.toJSONSchema(feedbackSchema);

export type ParseFeedbackResult = { ok: true; feedback: Feedback } | { ok: false; error: string };

/** Validates raw model output and normalizes it: lowercase enums, bands rounded to 0.5. */
export function parseFeedback(raw: unknown): ParseFeedbackResult {
  const result = lenientFeedbackSchema.safeParse(raw);
  if (!result.success) {
    return { ok: false, error: z.prettifyError(result.error) };
  }
  const feedback: Feedback = {
    ...result.data,
    criteria: result.data.criteria.map((item) => ({ ...item, band: roundBand(item.band) })),
  };
  return { ok: true, feedback };
}
