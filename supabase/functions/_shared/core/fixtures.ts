// Test fixtures written for this repo: no personal data and no official test material.

export const sampleAnswer = [
  'Many people believe that coding should be taught in primary schools.',
  'In my opinion, coding teach children to think logically, so schools should to add it.',
  'However, some parents worry that children spend too much time on screens.',
].join('\n');

/** A well-formed model response for sampleAnswer, before normalization. */
export function sampleModelOutput(): Record<string, unknown> {
  return {
    task: 'writing_task2',
    criteria: [
      {
        criterion: 'task',
        band: 6,
        evidence: ['coding should be taught in primary schools'],
        reason: 'The position is clear but the main idea is not developed.',
        next_step: 'Support each claim with an example.',
      },
      {
        criterion: 'coherence',
        band: 6.5,
        evidence: ['However, some parents worry'],
        reason: 'Ideas are linked with simple connectors.',
        next_step: 'Use a clear topic sentence in each paragraph.',
      },
      {
        criterion: 'lexical',
        band: 6,
        evidence: ['think logically'],
        reason: 'Vocabulary is adequate but repetitive.',
        next_step: 'Vary words for "children" and "schools".',
      },
      {
        criterion: 'grammar',
        band: 5.5,
        evidence: ['coding teach children'],
        reason: 'Frequent agreement and modal errors.',
        next_step: 'Check subject-verb agreement in every sentence.',
      },
    ],
    corrections: [
      {
        original: 'coding teach children',
        corrected: 'coding teaches children',
        category: 'grammar',
        subcategory: 'subject-verb agreement',
        severity: 'error',
        explanation: 'Coding is one activity, so the verb takes -s.',
      },
      {
        original: 'should to add',
        corrected: 'should add',
        category: 'grammar',
        subcategory: 'modal verb',
        severity: 'error',
        explanation: 'A modal verb is followed by the base form without "to".',
      },
    ],
    improved:
      'In my view, coding teaches children to think logically, so schools should add it to the timetable.',
    strengths: ['A clear position in the first paragraph.'],
    overall: 'A clear opinion with grammar slips that lower the score.',
  };
}
