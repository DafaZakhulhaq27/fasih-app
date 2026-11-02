import type { LanguagePack } from './language-pack.ts';

// Signals for the Writing self-check (docs/design/screens/07-writeself.png), counted in code so the
// manual path needs no AI. They are hints for the writer, not a band.

export type WritingStats = {
  units: number;
  paragraphs: number;
  /** Shortest and longest sentence in units, or null for an empty text. */
  sentenceLength: { min: number; max: number } | null;
  /** Linking phrases that open two or more paragraphs, most used first. */
  repeatedOpeners: { phrase: string; paragraphs: number }[];
  /** Two-word phrases without function words that appear two or more times, most used first. */
  repeatedPhrases: { phrase: string; count: number }[];
};

const MAX_REPEATED_PHRASES = 3;

function paragraphsOf(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line !== '');
}

function opener(pack: LanguagePack, paragraph: string): string | null {
  const lower = paragraph.toLowerCase();
  // Longest first, so "on the other hand" wins over "on the".
  const phrases = [...pack.linkingPhrases].sort((a, b) => b.length - a.length);
  for (const phrase of phrases) {
    const next = lower.charAt(phrase.length);
    if (lower.startsWith(phrase) && (next === '' || !/[a-z0-9]/.test(next))) {
      return phrase;
    }
  }
  return null;
}

function capitalize(phrase: string): string {
  return phrase.charAt(0).toUpperCase() + phrase.slice(1);
}

function byCountThenText<T extends { phrase: string }>(count: (item: T) => number) {
  return (a: T, b: T): number => count(b) - count(a) || a.phrase.localeCompare(b.phrase);
}

export function writingStats(pack: LanguagePack, text: string): WritingStats {
  const paragraphs = paragraphsOf(text);

  const lengths = paragraphs
    .flatMap((paragraph) => pack.sentences(paragraph))
    .map((sentence) => pack.units(sentence).length);

  const openerCounts = new Map<string, number>();
  for (const paragraph of paragraphs) {
    const phrase = opener(pack, paragraph);
    if (phrase) {
      openerCounts.set(phrase, (openerCounts.get(phrase) ?? 0) + 1);
    }
  }

  // A phrase never spans a sentence end or a clause break such as a comma.
  const chunks = paragraphs
    .flatMap((paragraph) => pack.sentences(paragraph))
    .flatMap((sentence) => sentence.split(/[,;:()"“”—–]/));
  const phraseCounts = new Map<string, number>();
  for (const chunk of chunks) {
    const words = pack.units(chunk).map((word) => word.toLowerCase().replace(/’/g, "'"));
    for (let i = 0; i + 1 < words.length; i++) {
      const first = words[i];
      const second = words[i + 1];
      if (!pack.stopwords.has(first) && !pack.stopwords.has(second)) {
        const phrase = `${first} ${second}`;
        phraseCounts.set(phrase, (phraseCounts.get(phrase) ?? 0) + 1);
      }
    }
  }

  return {
    units: pack.units(text).length,
    paragraphs: paragraphs.length,
    sentenceLength:
      lengths.length === 0 ? null : { min: Math.min(...lengths), max: Math.max(...lengths) },
    repeatedOpeners: [...openerCounts]
      .filter(([, count]) => count >= 2)
      .map(([phrase, count]) => ({ phrase: capitalize(phrase), paragraphs: count }))
      .sort(byCountThenText((item) => item.paragraphs)),
    repeatedPhrases: [...phraseCounts]
      .filter(([, count]) => count >= 2)
      .map(([phrase, count]) => ({ phrase, count }))
      .sort(byCountThenText((item) => item.count))
      .slice(0, MAX_REPEATED_PHRASES),
  };
}

/** Errors per 100 units (words for English), to one decimal, or null when there is no text. */
export function ratePer100(count: number, units: number): number | null {
  if (units <= 0) {
    return null;
  }
  return Math.round((count / units) * 1000) / 10;
}
