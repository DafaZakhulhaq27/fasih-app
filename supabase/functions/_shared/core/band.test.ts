import { describe, expect, it } from 'vitest';

import { averageBand, roundBand } from './band.ts';

describe('roundBand', () => {
  it.each([
    [6, 6],
    [6.125, 6],
    [6.25, 6.5],
    [6.375, 6.5],
    [6.5, 6.5],
    [6.625, 6.5],
    [6.75, 7],
    [6.875, 7],
    [6.7, 6.5],
    [6.74, 6.5],
  ])('rounds %d to %d', (value, expected) => {
    expect(roundBand(value)).toBe(expected);
  });

  it('clamps to the 0-9 scale', () => {
    expect(roundBand(-1)).toBe(0);
    expect(roundBand(9.4)).toBe(9);
  });

  it('rejects values that are not numbers', () => {
    expect(() => roundBand(Number.NaN)).toThrow(RangeError);
  });
});

describe('averageBand', () => {
  it('averages and rounds like the overall band', () => {
    // 6.5 + 6.5 + 5.5 + 7.5 = 26 -> 6.5
    expect(averageBand([6.5, 6.5, 5.5, 7.5])).toBe(6.5);
    // 6 + 6.5 + 6.5 + 6 = 25 -> 6.25 -> 6.5
    expect(averageBand([6, 6.5, 6.5, 6])).toBe(6.5);
    // 7 + 7.5 + 7 + 7.5 = 29 -> 7.25 -> 7.5; 6.5 + 7 + 7 + 7.5 = 28 -> 7
    expect(averageBand([7, 7.5, 7, 7.5])).toBe(7.5);
    expect(averageBand([6.5, 7, 7, 7.5])).toBe(7);
  });

  it('returns null without bands', () => {
    expect(averageBand([])).toBeNull();
  });
});
