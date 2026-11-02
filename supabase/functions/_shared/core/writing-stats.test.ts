import { describe, expect, it } from 'vitest';

import { sampleAnswer } from './fixtures.ts';
import { getLanguagePack } from './language-pack.ts';
import { ratePer100, writingStats } from './writing-stats.ts';

const en = getLanguagePack('en');

const essay = [
  'Some people think coding is very important for children. Others disagree.',
  '',
  'Moreover, coding is very important because it trains logical thinking.',
  'Moreover, many jobs now use software.',
  'On the other hand, screen time worries parents. However, schools can limit it.',
  'In conclusion, coding deserves a place in primary schools.',
].join('\n');

describe('writingStats', () => {
  it('counts words, paragraphs and sentence lengths', () => {
    const stats = writingStats(en, essay);
    expect(stats.units).toBe(49);
    expect(stats.paragraphs).toBe(5);
    expect(stats.sentenceLength).toEqual({ min: 2, max: 10 });
  });

  it('finds linking phrases that open more than one paragraph', () => {
    expect(writingStats(en, essay).repeatedOpeners).toEqual([
      { phrase: 'Moreover', paragraphs: 2 },
    ]);
  });

  it('matches the longest linking phrase and needs a word boundary', () => {
    const text = 'On the other hand, A.\nOn the other hand, B.\nAlsop wrote this.\nAlsop agreed.';
    expect(writingStats(en, text).repeatedOpeners).toEqual([
      { phrase: 'On the other hand', paragraphs: 2 },
    ]);
  });

  it('finds repeated two-word phrases without function words', () => {
    expect(writingStats(en, essay).repeatedPhrases).toEqual([
      { phrase: 'very important', count: 2 },
    ]);
  });

  it('keeps at most three repeated phrases, most frequent first', () => {
    const text =
      'Red car. Blue sky. Green tree. Red car, blue sky; green tree. Red car. Old house. Old house.';
    expect(writingStats(en, text).repeatedPhrases).toEqual([
      { phrase: 'red car', count: 3 },
      { phrase: 'blue sky', count: 2 },
      { phrase: 'green tree', count: 2 },
    ]);
  });

  it('does not join words across sentences or commas', () => {
    expect(writingStats(en, 'Fast cars. Cars race, fast cars. Cars race.').repeatedPhrases).toEqual(
      [
        { phrase: 'cars race', count: 2 },
        { phrase: 'fast cars', count: 2 },
      ],
    );
  });

  it('handles the sample answer and an empty text', () => {
    expect(writingStats(en, sampleAnswer)).toMatchObject({ units: 38, paragraphs: 3 });
    expect(writingStats(en, '')).toEqual({
      units: 0,
      paragraphs: 0,
      sentenceLength: null,
      repeatedOpeners: [],
      repeatedPhrases: [],
    });
  });
});

describe('ratePer100', () => {
  it('scales to 100 units and rounds to one decimal', () => {
    expect(ratePer100(3, 274)).toBe(1.1);
    expect(ratePer100(5, 250)).toBe(2);
    expect(ratePer100(0, 120)).toBe(0);
  });

  it('returns null without units', () => {
    expect(ratePer100(2, 0)).toBeNull();
  });
});
