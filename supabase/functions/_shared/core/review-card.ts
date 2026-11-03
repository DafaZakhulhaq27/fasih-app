import type { LanguagePack } from './language-pack.ts';

// Review cards from corrections (docs/plan.md "Review"). A cloze card shows the corrected sentence
// with the changed words blanked out; the learner types them back.

/** Marks the gap in a cloze card's front. */
export const CLOZE_GAP = '____';

export type ClozeCard = {
  cardType: 'cloze';
  /** The corrected sentence with CLOZE_GAP where the answer goes. */
  front: string;
  /** The words that fill the gap. */
  back: string;
  context: {
    /** The sentence as the learner first wrote it. */
    originalSentence: string;
    original: string;
    corrected: string;
  };
};

function tokens(text: string): string[] {
  return text.trim().split(/\s+/).filter(Boolean);
}

/** The sentence of `text` that contains `span`, or the span itself when it crosses sentences. */
function sentenceContaining(pack: LanguagePack, text: string, span: string): string {
  for (const paragraph of text.split(/\r?\n/)) {
    for (const sentence of pack.sentences(paragraph)) {
      if (sentence.includes(span)) {
        return sentence;
      }
    }
  }
  return span;
}

/**
 * Builds a cloze card from a correction of `original` (a span of `text`) into `corrected`.
 * Words both versions share at the start and end stay visible; the changed words in between
 * become the gap. A pure deletion ("should to teach" -> "should teach") blanks the whole
 * corrected span, since an empty gap cannot be typed.
 */
export function buildCorrectionCard(
  pack: LanguagePack,
  text: string,
  original: string,
  corrected: string,
): ClozeCard {
  const before = tokens(original);
  const after = tokens(corrected);

  let prefix = 0;
  while (prefix < before.length && prefix < after.length && before[prefix] === after[prefix]) {
    prefix++;
  }
  let suffix = 0;
  while (
    suffix < before.length - prefix &&
    suffix < after.length - prefix &&
    before[before.length - 1 - suffix] === after[after.length - 1 - suffix]
  ) {
    suffix++;
  }

  const changed = after.slice(prefix, after.length - suffix);
  const answer = changed.length > 0 ? changed : after;
  const gapped =
    changed.length > 0
      ? [...after.slice(0, prefix), CLOZE_GAP, ...after.slice(after.length - suffix)].join(' ')
      : CLOZE_GAP;

  const originalSentence = sentenceContaining(pack, text, original);
  return {
    cardType: 'cloze',
    front: originalSentence.replace(original, gapped),
    back: answer.join(' '),
    context: { originalSentence, original, corrected },
  };
}

function normalizeAnswer(value: string): string {
  return value
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[.,;:!?]+$/, '');
}

/** True when the typed answer matches, ignoring case, spacing, curly quotes and end punctuation. */
export function checkClozeAnswer(typed: string, expected: string): boolean {
  return normalizeAnswer(typed) !== '' && normalizeAnswer(typed) === normalizeAnswer(expected);
}
