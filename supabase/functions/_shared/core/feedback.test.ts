import { describe, expect, it } from 'vitest';

import { feedbackJsonSchema, parseFeedback } from './feedback.ts';
import { sampleModelOutput } from './fixtures.ts';

type Mutable = Record<string, unknown> & {
  criteria: Record<string, unknown>[];
  corrections: Record<string, unknown>[];
};

function output(): Mutable {
  return sampleModelOutput() as Mutable;
}

describe('parseFeedback', () => {
  it('accepts a well-formed response', () => {
    const result = parseFeedback(output());
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.feedback.criteria).toHaveLength(4);
      expect(result.feedback.corrections[0]?.original).toBe('coding teach children');
    }
  });

  it('rounds bands to half bands in code', () => {
    const raw = output();
    raw.criteria[0] = { ...raw.criteria[0], band: 6.7 };
    raw.criteria[1] = { ...raw.criteria[1], band: 6.75 };
    const result = parseFeedback(raw);
    expect(result.ok && result.feedback.criteria.map((c) => c.band)).toEqual([6.5, 7, 6, 5.5]);
  });

  it('normalizes enum case and spacing, and numeric band strings', () => {
    const raw = output();
    raw.task = ' Writing_Task2 ';
    raw.criteria[0] = { ...raw.criteria[0], criterion: 'TASK', band: '6.5' };
    raw.corrections[0] = {
      ...raw.corrections[0],
      category: 'Grammar',
      severity: 'ERROR',
      subcategory: ' Subject-Verb Agreement ',
    };
    const result = parseFeedback(raw);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.feedback.task).toBe('writing_task2');
      expect(result.feedback.criteria[0]).toMatchObject({ criterion: 'task', band: 6.5 });
      expect(result.feedback.corrections[0]).toMatchObject({
        category: 'grammar',
        severity: 'error',
        subcategory: 'subject-verb agreement',
      });
    }
  });

  it('drops keys the schema does not define', () => {
    const result = parseFeedback({ ...output(), confidence: 0.9 });
    expect(result.ok && 'confidence' in result.feedback).toBe(false);
  });

  it.each([
    ['a missing field', (raw: Mutable) => delete raw.improved, 'improved'],
    [
      'a band above 9',
      (raw: Mutable) => (raw.criteria[0] = { ...raw.criteria[0], band: 9.5 }),
      'band',
    ],
    [
      'a band that is not a number',
      (raw: Mutable) => (raw.criteria[0] = { ...raw.criteria[0], band: 'high' }),
      'band',
    ],
    [
      'an unknown category',
      (raw: Mutable) => (raw.corrections[0] = { ...raw.corrections[0], category: 'spelling' }),
      'category',
    ],
    ['an unknown task', (raw: Mutable) => (raw.task = 'essay'), 'task'],
  ])('rejects %s and names the field', (_label, mutate, field) => {
    const raw = output();
    mutate(raw);
    const result = parseFeedback(raw);
    expect(result.ok).toBe(false);
    expect(!result.ok && result.error).toContain(field);
  });

  it('rejects output that is not an object', () => {
    expect(parseFeedback('not json').ok).toBe(false);
    expect(parseFeedback(null).ok).toBe(false);
  });
});

describe('feedbackJsonSchema', () => {
  it('requires every top-level field', () => {
    expect(feedbackJsonSchema).toMatchObject({ type: 'object' });
    expect(feedbackJsonSchema.required).toEqual(
      expect.arrayContaining([
        'task',
        'criteria',
        'corrections',
        'improved',
        'strengths',
        'overall',
      ]),
    );
  });

  it('lists the allowed enum values', () => {
    expect(JSON.stringify(feedbackJsonSchema)).toContain('"word_choice"');
    expect(JSON.stringify(feedbackJsonSchema)).toContain('"unnatural"');
  });
});
