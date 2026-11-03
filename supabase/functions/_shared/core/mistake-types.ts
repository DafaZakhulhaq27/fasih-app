// Mistake types as the learner sees them: the self-check type picker and the "mistakes, by type"
// list on Progress (docs/design/screens/07-writeself.png, 11-mistakes.png). Each maps to a
// mistake_categories slug and an optional subcategory.

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

/** Fallback labels for categories when no type matches the subcategory (e.g. AI corrections). */
const categoryLabels: Record<string, string> = {
  grammar: 'Other grammar',
  word_choice: 'Word choice',
  collocation: 'Collocations',
  cohesion: 'Linking and cohesion',
  register: 'Register and tone',
  fluency: 'Fluency',
  pronunciation: 'Pronunciation',
};

/** The learner-facing label for a mistake's category slug and subcategory. */
export function mistakeTypeLabel(category: string, subcategory: string | null): string {
  const exact = mistakeTypes.find(
    (type) => type.category === category && type.subcategory === (subcategory ?? null),
  );
  if (exact) {
    return exact.label;
  }
  const byCategory = mistakeTypes.find(
    (type) => type.category === category && type.subcategory === null,
  );
  return byCategory?.label ?? categoryLabels[category] ?? 'Other';
}

export type MistakeRow = {
  category: string;
  subcategory: string | null;
  original: string;
  corrected: string;
  createdAt: string;
};

export type MistakeTypeGroup = {
  label: string;
  count: number;
  /** The most recent mistake of this type, shown as an example. */
  latest: { original: string; corrected: string };
};

/** Groups mistakes by learner-facing type, most frequent first (ties: alphabetical). */
export function groupMistakesByType(rows: readonly MistakeRow[]): MistakeTypeGroup[] {
  const groups = new Map<string, MistakeTypeGroup & { latestAt: string }>();
  for (const row of rows) {
    const label = mistakeTypeLabel(row.category, row.subcategory);
    const group = groups.get(label);
    if (!group) {
      groups.set(label, {
        label,
        count: 1,
        latest: { original: row.original, corrected: row.corrected },
        latestAt: row.createdAt,
      });
      continue;
    }
    group.count += 1;
    if (row.createdAt > group.latestAt) {
      group.latest = { original: row.original, corrected: row.corrected };
      group.latestAt = row.createdAt;
    }
  }
  return [...groups.values()]
    .map(({ label, count, latest }) => ({ label, count, latest }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}
