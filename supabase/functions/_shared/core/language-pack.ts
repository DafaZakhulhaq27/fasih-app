import { en } from './language-en.ts';

// Per-language rules (docs/plan.md "Siap multi-bahasa sejak awal"). Adding a language means adding a
// pack and its eval set, not changing the app flow. Only English exists for now.

export type LanguageCode = 'en';

export type LanguagePack = {
  code: LanguageCode;
  direction: 'ltr' | 'rtl';
  /** What word counts, WPM and errors per 100 are measured in. */
  countUnit: 'word' | 'character';
  /** Splits text into countable units (words for English). */
  units(text: string): string[];
  /** Splits one paragraph into sentences. */
  sentences(paragraph: string): string[];
  /** Hesitation sounds counted as fillers in speaking transcripts. */
  fillerWords: readonly string[];
  /** Linking words and phrases, lowercase, checked at the start of paragraphs. */
  linkingPhrases: readonly string[];
  /** Function words ignored when looking for repeated phrases. */
  stopwords: ReadonlySet<string>;
};

const packs: Record<LanguageCode, LanguagePack> = { en };

export function getLanguagePack(code: LanguageCode): LanguagePack {
  return packs[code];
}

/** Units in the text, as the word counter on the writing screen shows them. */
export function countUnits(pack: LanguagePack, text: string): number {
  return pack.units(text).length;
}
