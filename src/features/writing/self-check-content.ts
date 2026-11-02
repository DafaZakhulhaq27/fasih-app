import type { Criterion } from '@core/feedback.ts';

// Self-check content for Writing Task 2 (docs/design/screens/07-writeself.png). The checklist is
// written in plain words of our own, not copied from the official band descriptors.

export const writingCriteria = [
  'task',
  'coherence',
  'lexical',
  'grammar',
] as const satisfies readonly Criterion[];

export type WritingCriterion = (typeof writingCriteria)[number];

export const criterionLabels: Record<WritingCriterion, string> = {
  task: 'Task Response',
  coherence: 'Coherence & Cohesion',
  lexical: 'Lexical Resource',
  grammar: 'Grammatical Range & Accuracy',
};

export const checklist: Record<WritingCriterion, readonly { id: string; label: string }[]> = {
  task: [
    { id: 'task-position', label: 'My position is clear in the introduction and the conclusion.' },
    { id: 'task-all-parts', label: 'Every part of the question gets its own paragraph.' },
  ],
  coherence: [
    { id: 'coherence-one-idea', label: 'One main idea per paragraph.' },
    {
      id: 'coherence-linking',
      label: 'Linking words vary, and not every paragraph opens with one.',
    },
  ],
  lexical: [
    { id: 'lexical-topic-words', label: 'I used topic words, not only very, good and important.' },
    { id: 'lexical-no-repeats', label: 'No phrase appears more than twice.' },
  ],
  grammar: [
    { id: 'grammar-mixed', label: 'Simple and complex sentences are mixed.' },
    { id: 'grammar-checked', label: 'I checked articles, verb endings and plurals.' },
  ],
};

export const bandOptions = [5, 5.5, 6, 6.5, 7, 7.5, 8] as const;

/** Mistake types for self-marking, mapped to the mistake_categories slugs and a subcategory. */
export const mistakeTypes = [
  { id: 'verb', label: 'Verb forms and tense', category: 'grammar', subcategory: 'verb form' },
  { id: 'article', label: 'Articles (a, the)', category: 'grammar', subcategory: 'article' },
  { id: 'preposition', label: 'Prepositions', category: 'grammar', subcategory: 'preposition' },
  {
    id: 'agreement',
    label: 'Plurals and agreement',
    category: 'grammar',
    subcategory: 'agreement',
  },
  { id: 'collocation', label: 'Collocations', category: 'collocation', subcategory: null },
  { id: 'word-choice', label: 'Word choice', category: 'word_choice', subcategory: null },
  { id: 'spelling', label: 'Spelling', category: 'word_choice', subcategory: 'spelling' },
  { id: 'linking', label: 'Linking words', category: 'cohesion', subcategory: 'linking word' },
] as const;

export type MistakeTypeId = (typeof mistakeTypes)[number]['id'];

export const essayTypeLabels: Record<string, string> = {
  opinion: 'Opinion essay',
  discussion: 'Discussion essay',
  problem_solution: 'Problem and solution essay',
  advantages_disadvantages: 'Advantages and disadvantages essay',
  two_part: 'Two-part question',
};
