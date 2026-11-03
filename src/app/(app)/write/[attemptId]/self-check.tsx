import { countUnits, getLanguagePack } from '@core/language-pack.ts';
import { selfReviewOverall, selfReviewSchema, type SelfReview } from '@core/self-review.ts';
import { writingStats } from '@core/writing-stats.ts';
import { useQueryClient } from '@tanstack/react-query';
import * as Crypto from 'expo-crypto';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useState, type ReactElement } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BandChips } from '@/components/band-chips';
import { Button } from '@/components/button';
import { Checkbox } from '@/components/checkbox';
import { ScreenHeader } from '@/components/screen-header';
import { TextField } from '@/components/text-field';
import { reviewKeys } from '@/data/review';
import {
  type MarkedMistake,
  saveSelfCheck,
  useMistakeCategories,
  useWritingAttempt,
  type WritingAttempt,
  writingKeys,
} from '@/data/writing';
import {
  bandOptions,
  checklist,
  criterionLabels,
  essayTypeLabels,
  type MistakeTypeId,
  mistakeTypes,
  writingCriteria,
} from '@/features/writing/self-check-content';
import {
  borderWidth,
  colors,
  fonts,
  gutter,
  radius,
  tabularNums,
  textStyles,
  touchTarget,
} from '@/theme';

const en = getLanguagePack('en');

// docs/design/screens/07-writeself.png. Nothing here calls AI (CLAUDE.md rule 3).
export default function SelfCheckScreen(): ReactElement {
  const { attemptId } = useLocalSearchParams<{ attemptId: string }>();
  const attempt = useWritingAttempt(attemptId);

  if (attempt.isPending) {
    return <Message text="Loading your essay…" />;
  }
  if (attempt.isError) {
    return <Message text={`Could not load this essay: ${attempt.error.message}`} alert />;
  }
  if (attempt.data.status === 'draft') {
    return <Redirect href={{ pathname: '/write/[attemptId]', params: { attemptId } }} />;
  }
  return <SelfCheck attempt={attempt.data} />;
}

type MarkedRow = MarkedMistake & { typeLabel: string };

function SelfCheck({ attempt }: { attempt: WritingAttempt }): ReactElement {
  const router = useRouter();
  const queryClient = useQueryClient();
  const categories = useMistakeCategories();

  const savedReview = selfReviewSchema.safeParse(attempt.selfReview);
  const alreadySaved = attempt.status === 'done' && savedReview.success;
  const [checked, setChecked] = useState<Set<string>>(
    () => new Set(savedReview.success ? savedReview.data.checked : []),
  );
  const [bands, setBands] = useState<SelfReview['bands']>(() =>
    savedReview.success ? savedReview.data.bands : {},
  );
  const [mistakes, setMistakes] = useState<MarkedRow[]>([]);
  const [wrote, setWrote] = useState('');
  const [better, setBetter] = useState('');
  const [typeId, setTypeId] = useState<MistakeTypeId>('verb');
  const [formError, setFormError] = useState<string | null>(null);
  // Ids are made once, so pressing Save again after a failure never duplicates rows.
  const [bandIds] = useState(() => ({
    overall: Crypto.randomUUID(),
    task: Crypto.randomUUID(),
    coherence: Crypto.randomUUID(),
    lexical: Crypto.randomUUID(),
    grammar: Crypto.randomUUID(),
  }));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(alreadySaved);
  const [saveError, setSaveError] = useState<string | null>(null);

  const text = attempt.rawText;
  const words = countUnits(en, text);
  const stats = writingStats(en, text);
  const overall = selfReviewOverall({ bands }, writingCriteria);
  const { prompt } = attempt;
  const locked = saved;

  function toggle(id: string, value: boolean): void {
    setChecked((current) => {
      const next = new Set(current);
      if (value) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }

  function addMistake(): void {
    const original = wrote.trim();
    const corrected = better.trim();
    const type = mistakeTypes.find((item) => item.id === typeId);
    const categoryId = type ? categories.data?.get(type.category) : undefined;
    if (original === '' || corrected === '') {
      setFormError('Fill in both what you wrote and the better version.');
      return;
    }
    if (!text.includes(original)) {
      setFormError('Copy “I wrote” exactly as it appears in your essay.');
      return;
    }
    if (original === corrected) {
      setFormError('The better version is the same as what you wrote.');
      return;
    }
    if (!type || !categoryId) {
      setFormError('Mistake types are still loading. Try again in a moment.');
      return;
    }
    setMistakes((current) => [
      ...current,
      {
        id: Crypto.randomUUID(),
        cardId: Crypto.randomUUID(),
        original,
        corrected,
        categoryId,
        subcategory: type.subcategory,
        typeLabel: type.label,
      },
    ]);
    setWrote('');
    setBetter('');
    setFormError(null);
  }

  async function save(): Promise<void> {
    if (overall === null) {
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      await saveSelfCheck({
        attemptId: attempt.id,
        essay: text,
        review: { version: 1, checked: [...checked], bands },
        bands: [
          { id: bandIds.overall, criterion: null, band: overall },
          ...writingCriteria.map((criterion) => ({
            id: bandIds[criterion],
            criterion,
            band: bands[criterion] as number,
          })),
        ],
        mistakes,
      });
      await queryClient.invalidateQueries({ queryKey: writingKeys.attempt(attempt.id) });
      await queryClient.invalidateQueries({ queryKey: writingKeys.recent });
      await queryClient.invalidateQueries({ queryKey: reviewKeys.dueCount });
      setSaved(true);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Could not save the self-check.');
    } finally {
      setSaving(false);
    }
  }

  const minutes = Math.max(1, Math.round(attempt.timeSpentS / 60));
  const limitMinutes = Math.round(prompt.timeLimitS / 60);
  const essayType = prompt.essayType ? essayTypeLabels[prompt.essayType] : 'Essay';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.column}>
          <ScreenHeader
            title="Writing Task 2"
            subtitle={`${essayType}. ${words} words in ${minutes} of ${limitMinutes} minutes.`}
            onBack={() => router.replace('/')}
            backLabel="Back to Today"
          />
          <Text style={styles.muted}>Self-check. Nothing here is sent to AI.</Text>

          <View style={styles.card}>
            <Text accessibilityRole="header" style={styles.cardTitle}>
              From your essay
            </Text>
            <Text style={styles.caption}>Counted by the app. Signals, not a band.</Text>
            <StatRow
              label="Words"
              value={`${words}, ${words >= prompt.minWords ? 'above' : 'below'} ${prompt.minWords}`}
            />
            <StatRow label="Paragraphs" value={String(stats.paragraphs)} />
            <StatRow
              label="Sentence length"
              value={
                stats.sentenceLength
                  ? `${stats.sentenceLength.min} to ${stats.sentenceLength.max} words`
                  : '—'
              }
            />
            <StatRow
              label="Linking words"
              value={
                stats.repeatedOpeners[0]
                  ? `“${stats.repeatedOpeners[0].phrase}” starts ${stats.repeatedOpeners[0].paragraphs} paragraphs`
                  : 'No paragraph opener repeats'
              }
              note={stats.repeatedOpeners[0] ? 'vary these' : undefined}
            />
            <StatRow
              label="Repeated phrases"
              value={
                stats.repeatedPhrases.length > 0
                  ? stats.repeatedPhrases
                      .map((item) => `“${item.phrase}” ×${item.count}`)
                      .join(', ')
                  : 'None found'
              }
              note={stats.repeatedPhrases.length > 0 ? 'find a precise word' : undefined}
              last
            />
          </View>

          <View style={styles.section}>
            <Text accessibilityRole="header" style={styles.sectionTitle}>
              Check each criterion
            </Text>
            <Text style={styles.muted}>
              Tick what is true, then give yourself a band. The checks are plain-language hints, not
              the official band descriptors.
            </Text>
          </View>

          {writingCriteria.map((criterion) => (
            <View key={criterion} style={styles.criterion}>
              <Text accessibilityRole="header" style={styles.criterionTitle}>
                {criterionLabels[criterion]}
              </Text>
              {checklist[criterion].map((item) => (
                <Checkbox
                  key={item.id}
                  label={item.label}
                  checked={checked.has(item.id)}
                  onChange={(value) => toggle(item.id, value)}
                  disabled={locked}
                />
              ))}
              <Text style={styles.caption}>Your band</Text>
              <BandChips
                label={`Your band for ${criterionLabels[criterion]}`}
                options={bandOptions}
                value={bands[criterion]}
                onChange={(band) => setBands((current) => ({ ...current, [criterion]: band }))}
                disabled={locked}
              />
            </View>
          ))}

          {!locked ? (
            <View style={styles.section}>
              <Text accessibilityRole="header" style={styles.sectionTitle}>
                Mark your own mistakes
              </Text>
              <Text style={styles.muted}>
                They are saved to your Mistake Bank, the same as AI corrections.
              </Text>
              <TextField
                label="I wrote"
                value={wrote}
                onChangeText={setWrote}
                autoCorrect={false}
                spellCheck={false}
                autoCapitalize="none"
                hint="Copy it exactly from your essay."
              />
              <TextField
                label="Better"
                value={better}
                onChangeText={setBetter}
                autoCorrect={false}
                spellCheck={false}
                autoCapitalize="none"
              />
              <Text style={styles.caption}>Type</Text>
              <View
                accessibilityRole="radiogroup"
                accessibilityLabel="Mistake type"
                style={styles.types}
              >
                {mistakeTypes.map((type) => {
                  const selected = type.id === typeId;
                  return (
                    <Pressable
                      key={type.id}
                      accessibilityRole="radio"
                      aria-checked={selected}
                      onPress={() => setTypeId(type.id)}
                      style={[styles.type, selected && styles.typeSelected]}
                    >
                      <Text style={[styles.typeText, selected && styles.typeTextSelected]}>
                        {type.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              {formError ? (
                <Text accessibilityRole="alert" style={styles.formError}>
                  {formError}
                </Text>
              ) : null}
              <Button variant="secondary" label="Add mistake" onPress={addMistake} />
              {mistakes.map((mistake) => (
                <View key={mistake.id} style={styles.mistake}>
                  <View style={styles.mistakeText}>
                    <Text style={styles.mistakeLine}>
                      <Text style={styles.struck}>{mistake.original}</Text>{' '}
                      <Text style={styles.insertion}>{mistake.corrected}</Text>
                    </Text>
                    <Text style={styles.caption}>{mistake.typeLabel}</Text>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Remove “${mistake.original}”`}
                    onPress={() =>
                      setMistakes((current) => current.filter((item) => item.id !== mistake.id))
                    }
                    style={styles.remove}
                  >
                    <Text style={styles.removeText}>Remove</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          ) : null}

          <View style={styles.card}>
            <View style={styles.overallRow}>
              <Text style={styles.overall}>{overall === null ? '—' : overall.toFixed(1)}</Text>
              <View style={styles.pill}>
                <Text style={styles.pillText}>self-check</Text>
              </View>
            </View>
            <Text style={styles.caption}>
              {overall === null
                ? 'Give a band for all four criteria to see your overall self-check band.'
                : 'Average of your four bands, rounded the way the real test rounds. Kept apart from AI estimates in Progress.'}
            </Text>
          </View>

          {saveError ? (
            <Text accessibilityRole="alert" style={styles.formError}>
              Not saved: {saveError}
            </Text>
          ) : null}
          {saved ? (
            <>
              <Text accessibilityRole="alert" style={styles.savedNote}>
                Self-check saved.
              </Text>
              <Button label="Back to Today" onPress={() => router.replace('/')} />
            </>
          ) : (
            <Button
              label="Save self-check"
              busy={saving}
              disabled={overall === null}
              accessibilityHint={
                overall === null ? 'Give a band for every criterion first' : undefined
              }
              onPress={save}
            />
          )}
          <Button variant="secondary" label="Ask AI too" disabled onPress={() => undefined} />
          <Text style={styles.caption}>
            AI checks are not connected yet. Your essay stays saved, so you can ask for AI feedback
            later.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatRow({
  label,
  value,
  note,
  last = false,
}: {
  label: string;
  value: string;
  note?: string;
  last?: boolean;
}): ReactElement {
  return (
    <View style={[styles.statRow, last && styles.statRowLast]}>
      <Text style={styles.statLabel}>{label}</Text>
      <View style={styles.statValueBox}>
        <Text style={styles.statValue}>{value}</Text>
        {note ? <Text style={styles.handNote}>{note}</Text> : null}
      </View>
    </View>
  );
}

function Message({ text, alert = false }: { text: string; alert?: boolean }): ReactElement {
  return (
    <SafeAreaView style={[styles.safeArea, styles.center]}>
      <Text accessibilityRole={alert ? 'alert' : undefined} style={styles.muted}>
        {text}
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: gutter.regular,
  },
  scroll: {
    paddingHorizontal: gutter.compact,
    paddingVertical: 20,
  },
  column: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    gap: 16,
  },
  muted: {
    ...textStyles.bodySmall,
    color: colors.ink2,
  },
  caption: {
    ...textStyles.caption,
    color: colors.ink2,
  },
  card: {
    gap: 4,
    padding: 18,
    backgroundColor: colors.surface,
    borderWidth: borderWidth.hairline,
    borderColor: colors.rule,
    borderRadius: radius.card,
  },
  cardTitle: {
    ...textStyles.cardTitle,
    color: colors.ink,
  },
  statRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: borderWidth.hairline,
    borderBottomColor: colors.rule,
  },
  statRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  statLabel: {
    ...textStyles.bodySmall,
    width: 120,
    color: colors.ink2,
  },
  statValueBox: {
    flex: 1,
    alignItems: 'flex-end',
  },
  statValue: {
    ...textStyles.bodySmall,
    ...tabularNums,
    fontFamily: fonts.bodyBold,
    color: colors.ink,
    textAlign: 'right',
  },
  handNote: {
    fontFamily: fonts.hand,
    fontSize: 17,
    lineHeight: 22,
    color: colors.pencil,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    ...textStyles.section,
    color: colors.ink,
  },
  criterion: {
    gap: 4,
    paddingTop: 12,
    borderTopWidth: borderWidth.hairline,
    borderTopColor: colors.rule,
  },
  criterionTitle: {
    ...textStyles.cardTitle,
    color: colors.ink,
  },
  types: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  type: {
    minHeight: touchTarget,
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: radius.button,
    borderWidth: borderWidth.control,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  typeSelected: {
    borderColor: colors.pencil,
    backgroundColor: colors.pencil,
  },
  typeText: {
    ...textStyles.caption,
    color: colors.ink,
  },
  typeTextSelected: {
    color: colors.surface,
  },
  formError: {
    ...textStyles.bodySmall,
    color: colors.ink,
    backgroundColor: colors.wash,
    borderRadius: radius.card,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  mistake: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  mistakeText: {
    flex: 1,
    gap: 2,
  },
  mistakeLine: {
    ...textStyles.body,
    color: colors.ink,
  },
  struck: {
    color: colors.ink2,
    textDecorationLine: 'line-through',
    textDecorationColor: colors.pencil,
  },
  insertion: {
    fontFamily: fonts.hand,
    fontSize: 19,
    color: colors.pencil,
  },
  remove: {
    minHeight: touchTarget,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  removeText: {
    ...textStyles.caption,
    color: colors.ink,
    textDecorationLine: 'underline',
  },
  overallRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  overall: {
    ...textStyles.pageTitle,
    ...tabularNums,
    fontSize: 40,
    lineHeight: 46,
    color: colors.ink,
  },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: borderWidth.hairline,
    borderStyle: 'dashed',
    borderColor: colors.border,
  },
  pillText: {
    ...textStyles.captionSmall,
    color: colors.ink2,
  },
  savedNote: {
    ...textStyles.body,
    color: colors.pencil,
  },
});
