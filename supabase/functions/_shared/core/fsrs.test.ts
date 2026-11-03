import { describe, expect, it } from 'vitest';

import {
  applyRating,
  formatInterval,
  newCardState,
  parseCardState,
  previewRatings,
  reviewRatings,
} from './fsrs.ts';

const start = new Date('2027-01-11T08:00:00.000Z');

describe('FSRS wrapper', () => {
  it('creates a new card that is due straight away', () => {
    const { due, fsrs } = newCardState(start);
    expect(due).toBe(start.toISOString());
    expect(fsrs).toMatchObject({ reps: 0, lapses: 0, state: 0, last_review: null });
  });

  it('round-trips the stored state through JSON', () => {
    const { fsrs } = newCardState(start);
    expect(parseCardState(JSON.parse(JSON.stringify(fsrs)))).toEqual(fsrs);
    expect(parseCardState({ ...fsrs, due: 'tomorrow' })).toBeNull();
    expect(parseCardState(null)).toBeNull();
  });

  it('schedules harder ratings sooner than easier ones', () => {
    const { fsrs } = newCardState(start);
    const dues = reviewRatings.map((rating) => Date.parse(applyRating(fsrs, rating, start).due));
    expect(dues).toEqual([...dues].sort((a, b) => a - b));
    expect(dues[0]).toBeLessThan(dues[3]!);
  });

  it('records the review and moves the card on', () => {
    const { fsrs } = newCardState(start);
    const result = applyRating(fsrs, 3, start);
    expect(result.log).toMatchObject({ rating: 3, review: start.toISOString() });
    expect(result.fsrs.reps).toBe(1);
    expect(result.fsrs.last_review).toBe(start.toISOString());
    expect(Date.parse(result.due)).toBeGreaterThan(start.getTime());
  });

  it('pushes a card further out after each successful review', () => {
    let state = newCardState(start).fsrs;
    let now = start;
    const gaps: number[] = [];
    for (let i = 0; i < 4; i++) {
      const result = applyRating(state, 3, now);
      const due = new Date(result.due);
      gaps.push(due.getTime() - now.getTime());
      state = result.fsrs;
      now = due;
    }
    expect(gaps).toEqual([...gaps].sort((a, b) => a - b));
  });

  it('previews the same due dates the ratings produce', () => {
    const { fsrs } = newCardState(start);
    const preview = previewRatings(fsrs, start);
    for (const rating of reviewRatings) {
      expect(preview[rating].due).toBe(applyRating(fsrs, rating, start).due);
    }
    expect(preview[1].interval).toMatch(/min$/);
  });
});

describe('formatInterval', () => {
  const at = (ms: number): Date => new Date(start.getTime() + ms);
  it.each([
    [0, '1 min'],
    [8 * 60_000, '8 min'],
    [3 * 3_600_000, '3 h'],
    [86_400_000, '1 day'],
    [6 * 86_400_000, '6 days'],
    [95 * 86_400_000, '3 mo'],
    [730 * 86_400_000, '2 yr'],
  ])('formats %d ms as %s', (ms, expected) => {
    expect(formatInterval(start, at(ms))).toBe(expected);
  });
});
