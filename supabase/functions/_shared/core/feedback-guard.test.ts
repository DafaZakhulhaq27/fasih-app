import { describe, expect, it } from 'vitest';

import { type Feedback, parseFeedback } from './feedback.ts';
import { guardFeedback, MAX_CORRECTIONS } from './feedback-guard.ts';
import { sampleAnswer, sampleModelOutput } from './fixtures.ts';

function sampleFeedback(): Feedback {
  const result = parseFeedback(sampleModelOutput());
  if (!result.ok) {
    throw new Error(result.error);
  }
  return result.feedback;
}

describe('guardFeedback', () => {
  it('keeps feedback that quotes the answer exactly', () => {
    const { feedback, dropped, missingCriteria } = guardFeedback(sampleFeedback(), sampleAnswer);
    expect(dropped).toEqual([]);
    expect(missingCriteria).toEqual([]);
    expect(feedback.corrections).toHaveLength(2);
    expect(feedback.criteria.every((c) => c.reliable)).toBe(true);
  });

  it('drops corrections whose original is not in the answer', () => {
    const input = sampleFeedback();
    input.corrections.push({
      ...input.corrections[0]!,
      original: 'children learns fast',
      corrected: 'children learn fast',
    });
    const { feedback, dropped } = guardFeedback(input, sampleAnswer);
    expect(feedback.corrections.map((c) => c.original)).not.toContain('children learns fast');
    expect(dropped).toContainEqual({
      field: 'corrections',
      reason: 'not_in_answer',
      value: 'children learns fast',
    });
  });

  it('drops empty and unchanged corrections', () => {
    const input = sampleFeedback();
    input.corrections.push(
      { ...input.corrections[0]!, original: '  ', corrected: 'x' },
      { ...input.corrections[0]!, original: 'think logically', corrected: 'think logically' },
    );
    const { dropped } = guardFeedback(input, sampleAnswer);
    expect(dropped.map((d) => d.reason)).toEqual(['empty', 'unchanged']);
  });

  it(`keeps at most ${MAX_CORRECTIONS} corrections, in the model's order`, () => {
    const input = sampleFeedback();
    const quotes = [
      'Many people',
      'believe that',
      'primary schools',
      'In my opinion',
      'some parents',
      'too much time',
    ];
    input.corrections = quotes.map((original) => ({
      ...input.corrections[0]!,
      original,
      corrected: `${original}!`,
    }));
    const { feedback, dropped } = guardFeedback(input, sampleAnswer);
    expect(feedback.corrections.map((c) => c.original)).toEqual(quotes.slice(0, MAX_CORRECTIONS));
    expect(dropped).toEqual([
      { field: 'corrections', reason: 'over_limit', value: 'too much time' },
    ]);
  });

  it('marks a criterion unreliable when none of its evidence is in the answer', () => {
    const input = sampleFeedback();
    input.criteria[2] = { ...input.criteria[2]!, evidence: ['an invented quote', ''] };
    const { feedback, dropped } = guardFeedback(input, sampleAnswer);
    expect(feedback.criteria[2]).toMatchObject({
      criterion: 'lexical',
      evidence: [],
      reliable: false,
    });
    expect(dropped.map((d) => d.reason)).toEqual(['not_in_answer', 'empty']);
  });

  it('accepts evidence wrapped in quotation marks but not altered text', () => {
    const input = sampleFeedback();
    input.criteria[2] = {
      ...input.criteria[2]!,
      evidence: ['“think logically”', ' "spend too much time" ', '"think logicaly"'],
    };
    const { feedback, dropped } = guardFeedback(input, sampleAnswer);
    expect(feedback.criteria[2]?.evidence).toEqual(['think logically', 'spend too much time']);
    expect(dropped).toEqual([
      { field: 'evidence', reason: 'not_in_answer', value: '"think logicaly"' },
    ]);
  });

  it('keeps a criterion reliable when at least one quote is valid', () => {
    const input = sampleFeedback();
    input.criteria[2] = {
      ...input.criteria[2]!,
      evidence: ['think logically', 'not in the answer'],
    };
    const { feedback } = guardFeedback(input, sampleAnswer);
    expect(feedback.criteria[2]).toMatchObject({ evidence: ['think logically'], reliable: true });
  });

  it('drops criteria that do not belong to the task and reports missing ones', () => {
    const input = sampleFeedback();
    input.criteria = [
      input.criteria[0]!,
      { ...input.criteria[0]!, band: 9 },
      { ...input.criteria[1]!, criterion: 'fluency' },
    ];
    const { feedback, dropped, missingCriteria } = guardFeedback(input, sampleAnswer);
    expect(feedback.criteria.map((c) => c.criterion)).toEqual(['task']);
    expect(feedback.criteria[0]?.band).toBe(6);
    expect(dropped.map((d) => d.reason)).toEqual(['duplicate_criterion', 'unexpected_criterion']);
    expect(missingCriteria).toEqual(['coherence', 'lexical', 'grammar']);
  });

  it('accepts any criteria for lesson tasks', () => {
    const input = { ...sampleFeedback(), task: 'lesson' as const };
    input.criteria = [{ ...input.criteria[0]!, criterion: 'fluency' }];
    const { dropped, missingCriteria } = guardFeedback(input, sampleAnswer);
    expect(dropped).toEqual([]);
    expect(missingCriteria).toEqual([]);
  });

  it('keeps at most two strengths', () => {
    const input = { ...sampleFeedback(), strengths: ['one', 'two', 'three'] };
    const { feedback, dropped } = guardFeedback(input, sampleAnswer);
    expect(feedback.strengths).toEqual(['one', 'two']);
    expect(dropped).toEqual([{ field: 'strengths', reason: 'over_limit', value: 'three' }]);
  });

  it('ignores Windows line endings when matching quotes', () => {
    const input = sampleFeedback();
    input.corrections = [
      {
        ...input.corrections[0]!,
        original: 'primary schools.\nIn my opinion',
        corrected: 'primary schools. In my view',
      },
    ];
    const { feedback } = guardFeedback(input, sampleAnswer.replace(/\n/g, '\r\n'));
    expect(feedback.corrections).toHaveLength(1);
  });
});
