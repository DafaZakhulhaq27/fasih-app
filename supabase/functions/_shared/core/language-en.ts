import type { LanguagePack } from './language-pack.ts';

// Letters and digits, written as explicit ranges instead of \p{L} so the regex behaves the same in
// Hermes, Deno and Node. Latin-1 letters cover accented names such as "café".
const LETTER = 'A-Za-z0-9À-ÖØ-öø-ÿ';

// A word is a run of letters or digits, optionally joined by an apostrophe, a hyphen or a dot:
// "don't", "well-known", "3.5" and "e.g" each count once. Dashes and lone symbols do not count.
const WORD = new RegExp(`[${LETTER}]+(?:['’.\\-][${LETTER}]+)*`, 'g');

// A sentence ends at . ! or ? followed by whitespace or the end of the text.
const SENTENCE_END = /[.!?]+(?=\s|$)/g;

// Tokens ending in a dot that do not end a sentence.
const ABBREVIATIONS = new Set([
  'e.g.',
  'i.e.',
  'etc.',
  'vs.',
  'mr.',
  'mrs.',
  'ms.',
  'dr.',
  'approx.',
]);

function words(text: string): string[] {
  return text.match(WORD) ?? [];
}

function sentences(paragraph: string): string[] {
  const result: string[] = [];
  let start = 0;
  for (const match of paragraph.matchAll(SENTENCE_END)) {
    const end = match.index + match[0].length;
    const lastToken = paragraph.slice(start, end).trim().split(/\s+/).pop()?.toLowerCase() ?? '';
    if (ABBREVIATIONS.has(lastToken)) {
      continue;
    }
    result.push(paragraph.slice(start, end).trim());
    start = end;
  }
  const rest = paragraph.slice(start).trim();
  if (rest !== '') {
    result.push(rest);
  }
  return result.filter((sentence) => words(sentence).length > 0);
}

export const en: LanguagePack = {
  code: 'en',
  direction: 'ltr',
  countUnit: 'word',
  units: words,
  sentences,
  // Hesitation sounds only. Discourse markers such as "like" or "you know" are also real words, so
  // they are left to the speaking feedback rather than counted here.
  fillerWords: ['um', 'umm', 'uh', 'uhm', 'er', 'erm', 'ah', 'hmm'],
  linkingPhrases: [
    'additionally',
    'also',
    'as a result',
    'besides',
    'consequently',
    'finally',
    'firstly',
    'for example',
    'for instance',
    'furthermore',
    'hence',
    'however',
    'in addition',
    'in conclusion',
    'in contrast',
    'in summary',
    'meanwhile',
    'moreover',
    'nevertheless',
    'on the one hand',
    'on the other hand',
    'overall',
    'secondly',
    'similarly',
    'therefore',
    'thirdly',
    'thus',
    'to conclude',
    'to sum up',
  ],
  stopwords: new Set([
    'a',
    'an',
    'and',
    'are',
    'as',
    'at',
    'be',
    'but',
    'by',
    'can',
    'for',
    'from',
    'has',
    'have',
    'he',
    'her',
    'his',
    'i',
    'if',
    'in',
    'is',
    'it',
    'its',
    'my',
    'not',
    'of',
    'on',
    'or',
    'our',
    'she',
    'so',
    'that',
    'the',
    'their',
    'them',
    'there',
    'these',
    'they',
    'this',
    'those',
    'to',
    'was',
    'we',
    'were',
    'which',
    'who',
    'will',
    'with',
    'would',
    'you',
    'your',
  ]),
};
