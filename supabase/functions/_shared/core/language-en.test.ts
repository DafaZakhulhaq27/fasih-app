import { describe, expect, it } from 'vitest';

import { countUnits, getLanguagePack } from './language-pack.ts';

const en = getLanguagePack('en');

describe('English word count', () => {
  it.each([
    ['', 0],
    ['   \n  ', 0],
    ['Coding teaches children.', 3],
    ["Don't worry, it's fine.", 4],
    ['A well-known, 18-year-old programme.', 4],
    ['Scores rose by 3.5 points in 2024.', 7],
    ['Cities, e.g. Jakarta, grow fast.', 5],
    ['Some people — not all — agree.', 5],
    ['Use “quotes” and (brackets) & symbols - too.', 6],
    ['A café in Montréal.', 4],
    ['Line one\nline two\n\nline three', 6],
    ['Curly apostrophes don’t split words.', 5],
  ])('counts %j as %d words', (text, expected) => {
    expect(countUnits(en, text)).toBe(expected);
  });
});

describe('English sentences', () => {
  it('splits on . ! and ?', () => {
    expect(en.sentences('One idea. Another one! Is it? Yes.')).toEqual([
      'One idea.',
      'Another one!',
      'Is it?',
      'Yes.',
    ]);
  });

  it('does not split after common abbreviations or inside numbers', () => {
    expect(en.sentences('Big cities, e.g. Jakarta, cost 2.5 times more. Mr. Lee agrees.')).toEqual([
      'Big cities, e.g. Jakarta, cost 2.5 times more.',
      'Mr. Lee agrees.',
    ]);
  });

  it('keeps a final sentence without punctuation and drops punctuation-only pieces', () => {
    expect(en.sentences('First point. Second point without a stop')).toEqual([
      'First point.',
      'Second point without a stop',
    ]);
    expect(en.sentences('... !')).toEqual([]);
  });
});

describe('English pack', () => {
  it('describes how English is measured', () => {
    expect(en).toMatchObject({ code: 'en', direction: 'ltr', countUnit: 'word' });
    expect(en.fillerWords).toContain('um');
  });
});
