import { describe, expect, it } from 'vitest';

import { selfReviewOverall, selfReviewSchema } from './self-review.ts';

const writing = ['task', 'coherence', 'lexical', 'grammar'] as const;

describe('selfReviewSchema', () => {
  it('accepts ticked items and half bands', () => {
    const review = { version: 1, checked: ['task-position'], bands: { task: 7, grammar: 6.5 } };
    expect(selfReviewSchema.parse(review)).toEqual(review);
  });

  it('rejects quarter bands, unknown criteria and other versions', () => {
    expect(
      selfReviewSchema.safeParse({ version: 1, checked: [], bands: { task: 6.25 } }).success,
    ).toBe(false);
    expect(
      selfReviewSchema.safeParse({ version: 1, checked: [], bands: { tone: 6 } }).success,
    ).toBe(false);
    expect(selfReviewSchema.safeParse({ version: 2, checked: [], bands: {} }).success).toBe(false);
  });
});

describe('selfReviewOverall', () => {
  it('rounds the average like the real test', () => {
    // 7 + 6.5 + 6 + 6.5 = 26 -> 6.5
    expect(
      selfReviewOverall({ bands: { task: 7, coherence: 6.5, lexical: 6, grammar: 6.5 } }, writing),
    ).toBe(6.5);
    // 7 + 6.5 + 6.5 + 7 = 27 -> 6.75 -> 7
    expect(
      selfReviewOverall({ bands: { task: 7, coherence: 6.5, lexical: 6.5, grammar: 7 } }, writing),
    ).toBe(7);
  });

  it('waits until every criterion has a band', () => {
    expect(selfReviewOverall({ bands: { task: 7, coherence: 6.5 } }, writing)).toBeNull();
  });
});
