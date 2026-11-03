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

// Mistake types live in core so Progress groups mistakes with the same labels.
export { type MistakeTypeId, mistakeTypes } from '@core/mistake-types.ts';

export const essayTypeLabels: Record<string, string> = {
  opinion: 'Opinion essay',
  discussion: 'Discussion essay',
  problem_solution: 'Problem and solution essay',
  advantages_disadvantages: 'Advantages and disadvantages essay',
  two_part: 'Two-part question',
};
