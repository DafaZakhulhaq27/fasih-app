import { describe, expect, it } from 'vitest';

import { sampleAnswer } from './fixtures.ts';
import { getLanguagePack } from './language-pack.ts';
import { buildCorrectionCard, checkClozeAnswer, CLOZE_GAP } from './review-card.ts';

const en = getLanguagePack('en');

describe('buildCorrectionCard', () => {
  it('blanks only the changed word and keeps the sentence around it', () => {
    const card = buildCorrectionCard(
      en,
      sampleAnswer,
      'coding teach children',
      'coding teaches children',
    );
    expect(card.back).toBe('teaches');
    expect(card.front).toBe(
      `In my opinion, coding ${CLOZE_GAP} children to think logically, so schools should to add it.`,
    );
    expect(card.context.originalSentence).toBe(
      'In my opinion, coding teach children to think logically, so schools should to add it.',
    );
  });

  it('blanks a replaced phrase', () => {
    const text = 'Almost every job is related with technology.';
    const card = buildCorrectionCard(en, text, 'related with', 'related to');
    expect(card).toMatchObject({
      front: `Almost every job is related ${CLOZE_GAP} technology.`,
      back: 'to',
    });
  });

  it('blanks the whole corrected span for a pure deletion', () => {
    const card = buildCorrectionCard(en, sampleAnswer, 'should to add', 'should add');
    expect(card.back).toBe('should add');
    expect(card.front).toContain(`so schools ${CLOZE_GAP} it.`);
  });

  it('handles an insertion', () => {
    const text = 'In modern world, jobs change fast.';
    const card = buildCorrectionCard(en, text, 'In modern world', 'In the modern world');
    expect(card).toMatchObject({
      front: `In ${CLOZE_GAP} modern world, jobs change fast.`,
      back: 'the',
    });
  });

  it('falls back to the span when it crosses sentences', () => {
    const card = buildCorrectionCard(en, 'One. Two three.', 'One. Two', 'One, two');
    expect(card.context.originalSentence).toBe('One. Two');
    expect(card.front).toBe(CLOZE_GAP);
    expect(card.back).toBe('One, two');
  });
});

describe('checkClozeAnswer', () => {
  it.each([
    ['teaches', 'teaches', true],
    ['  Teaches ', 'teaches', true],
    ['teaches.', 'teaches', true],
    ['don’t', "don't", true],
    ['related  to', 'related to', true],
    ['teach', 'teaches', false],
    ['', '', false],
  ])('%j against %j is %s', (typed, expected, result) => {
    expect(checkClozeAnswer(typed, expected)).toBe(result);
  });
});
