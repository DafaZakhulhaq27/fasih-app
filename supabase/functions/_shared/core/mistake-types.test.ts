import { describe, expect, it } from 'vitest';

import { groupMistakesByType, mistakeTypeLabel, type MistakeRow } from './mistake-types.ts';

describe('mistakeTypeLabel', () => {
  it.each([
    ['grammar', 'article', 'Articles (a, the)'],
    ['grammar', 'verb form', 'Verb forms and tense'],
    ['collocation', null, 'Collocations'],
    ['collocation', 'adjective + noun', 'Collocations'],
    ['grammar', 'tense', 'Other grammar'],
    ['register', null, 'Register and tone'],
    ['unknown', null, 'Other'],
  ])('labels %s / %s as %s', (category, subcategory, label) => {
    expect(mistakeTypeLabel(category, subcategory)).toBe(label);
  });
});

describe('groupMistakesByType', () => {
  const row = (
    category: string,
    subcategory: string | null,
    original: string,
    createdAt: string,
  ): MistakeRow => ({ category, subcategory, original, corrected: `${original}!`, createdAt });

  it('counts by type, most frequent first, with the latest example', () => {
    const groups = groupMistakesByType([
      row('grammar', 'article', 'a', '2027-01-01T00:00:00Z'),
      row('collocation', null, 'c1', '2027-01-02T00:00:00Z'),
      row('grammar', 'article', 'b', '2027-01-03T00:00:00Z'),
      row('grammar', 'preposition', 'p', '2027-01-04T00:00:00Z'),
      row('grammar', 'article', 'old', '2026-12-01T00:00:00Z'),
    ]);
    expect(groups).toEqual([
      { label: 'Articles (a, the)', count: 3, latest: { original: 'b', corrected: 'b!' } },
      { label: 'Collocations', count: 1, latest: { original: 'c1', corrected: 'c1!' } },
      { label: 'Prepositions', count: 1, latest: { original: 'p', corrected: 'p!' } },
    ]);
  });

  it('returns nothing for no mistakes', () => {
    expect(groupMistakesByType([])).toEqual([]);
  });
});
