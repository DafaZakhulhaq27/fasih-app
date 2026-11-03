import { previewRatings, ratingLabels, type ReviewRating, reviewRatings } from '@core/fsrs.ts';
import { checkClozeAnswer, CLOZE_GAP } from '@core/review-card.ts';
import { useQueryClient } from '@tanstack/react-query';
import * as Crypto from 'expo-crypto';
import { useRouter } from 'expo-router';
import { useRef, useState, type ReactElement } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { ScreenHeader } from '@/components/screen-header';
import { TextField } from '@/components/text-field';
import { type DueCard, recordReview, reviewKeys, useDueCards } from '@/data/review';
import { writingKeys } from '@/data/writing';
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

// docs/design/screens/10-review.png
export default function ReviewScreen(): ReactElement {
  const router = useRouter();
  const cards = useDueCards();

  if (cards.isPending) {
    return <Centered text="Loading your cards…" />;
  }
  if (cards.isError) {
    return <Centered text={`Could not load your cards: ${cards.error.message}`} alert />;
  }
  if (cards.data.length === 0) {
    return (
      <Centered text="Nothing to review right now. Mistakes you mark in a self-check become cards here.">
        <Button label="Back to Today" onPress={() => router.replace('/')} />
      </Centered>
    );
  }
  return <Session cards={cards.data} />;
}

type Phase = { kind: 'answer' } | { kind: 'revealed'; typed: string; correct: boolean };

function Session({ cards: loaded }: { cards: DueCard[] }): ReactElement {
  // Fixed for the whole session: a background refetch would drop rated cards and shift the index.
  const [cards] = useState(loaded);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>({ kind: 'answer' });
  const [typed, setTyped] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [reviewed, setReviewed] = useState(0);
  // One log id per card, so retrying a failed send never records the rating twice.
  const logIds = useRef(new Map<string, string>());

  const done = index >= cards.length;

  async function finish(): Promise<void> {
    await queryClient.invalidateQueries({ queryKey: reviewKeys.dueCount });
    await queryClient.invalidateQueries({ queryKey: writingKeys.recent });
    router.replace('/');
  }

  if (done) {
    return (
      <Centered
        text={`Done for now: ${reviewed} card${reviewed === 1 ? '' : 's'} reviewed. Cards you found hard come back sooner.`}
      >
        <Button label="Back to Today" onPress={finish} />
      </Centered>
    );
  }

  const card = cards[index] as DueCard;
  const now = new Date();
  const preview = phase.kind === 'revealed' ? previewRatings(card.state, now) : null;
  const [before, after] = splitGap(card.front);

  function check(): void {
    setPhase({
      kind: 'revealed',
      typed: typed.trim(),
      correct: checkClozeAnswer(typed, card.back),
    });
  }

  async function rate(rating: ReviewRating): Promise<void> {
    setSaving(true);
    setMessage(null);
    let logId = logIds.current.get(card.id);
    if (!logId) {
      logId = Crypto.randomUUID();
      logIds.current.set(card.id, logId);
    }
    try {
      const result = await recordReview(card, rating, logId, new Date());
      if (result.status === 'conflict') {
        setMessage('This card was reviewed on another device, so it was skipped here.');
      } else {
        setReviewed((count) => count + 1);
      }
      setIndex((current) => current + 1);
      setPhase({ kind: 'answer' });
      setTyped('');
    } catch (e) {
      setMessage(`Not saved: ${e instanceof Error ? e.message : 'unknown error'}. Try again.`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.column}>
          <ScreenHeader
            title={`Card ${index + 1} of ${cards.length}`}
            onBack={finish}
            backLabel="Stop reviewing"
          />
          <View
            accessibilityRole="progressbar"
            accessibilityLabel="Cards done"
            accessibilityValue={{ min: 0, max: cards.length, now: index }}
            style={styles.track}
          >
            <View style={[styles.fill, { width: `${(index / cards.length) * 100}%` }]} />
          </View>

          <Text style={styles.caption}>{sourceLine(card)}</Text>

          <View style={styles.card}>
            <View style={styles.marginLine} />
            <Text style={styles.sentence}>
              {before}
              {phase.kind === 'revealed' ? (
                <Text style={styles.answer}>{card.back}</Text>
              ) : (
                <Text accessibilityLabel="blank" style={styles.gap}>
                  {'      '}
                </Text>
              )}
              {after}
            </Text>

            {phase.kind === 'answer' ? (
              <View style={styles.answerForm}>
                <TextField
                  label="Type the missing words"
                  value={typed}
                  onChangeText={setTyped}
                  autoCapitalize="none"
                  autoCorrect={false}
                  spellCheck={false}
                  onSubmitEditing={check}
                  returnKeyType="done"
                />
                <Button label="Check" onPress={check} />
              </View>
            ) : (
              <View style={styles.result}>
                <Text accessibilityRole="alert" style={styles.resultLine}>
                  {phase.correct
                    ? `✓ You typed “${phase.typed}”. Correct.`
                    : phase.typed === ''
                      ? `The answer is “${card.back}”.`
                      : `You typed “${phase.typed}”. The answer is “${card.back}”.`}
                </Text>
                {card.context ? (
                  <Text style={styles.muted}>
                    Originally you wrote “{card.context.originalSentence.replace(/[.!?]+$/, '')}”.
                  </Text>
                ) : null}
              </View>
            )}
          </View>

          {message ? (
            <Text accessibilityRole="alert" style={styles.message}>
              {message}
            </Text>
          ) : null}

          {preview ? (
            <View style={styles.rateBlock}>
              <Text style={styles.rateTitle}>When should this card come back?</Text>
              <View style={styles.rateRow}>
                {reviewRatings.map((rating) => (
                  <Pressable
                    key={rating}
                    accessibilityRole="button"
                    accessibilityLabel={`${ratingLabels[rating]}, back in ${preview[rating].interval}`}
                    aria-disabled={saving}
                    disabled={saving}
                    onPress={() => rate(rating)}
                    style={({ pressed }) => [styles.rateButton, (pressed || saving) && styles.dim]}
                  >
                    <Text style={styles.rateLabel}>{ratingLabels[rating]}</Text>
                    <Text style={styles.rateInterval}>{preview[rating].interval}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function splitGap(front: string): [string, string] {
  const at = front.indexOf(CLOZE_GAP);
  if (at === -1) {
    return [`${front} `, ''];
  }
  return [front.slice(0, at), front.slice(at + CLOZE_GAP.length)];
}

function sourceLine(card: DueCard): string {
  const date = new Date(card.createdAt).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  return card.context?.source === 'writing_task2'
    ? `From your Task 2 essay, ${date}`
    : `Added ${date}`;
}

function Centered({
  text,
  alert = false,
  children,
}: {
  text: string;
  alert?: boolean;
  children?: ReactElement;
}): ReactElement {
  return (
    <SafeAreaView style={[styles.safeArea, styles.center]}>
      <View style={styles.centerColumn}>
        <Text accessibilityRole={alert ? 'alert' : undefined} style={styles.centerText}>
          {text}
        </Text>
        {children}
      </View>
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
  centerColumn: {
    width: '100%',
    maxWidth: 480,
    gap: 16,
  },
  centerText: {
    ...textStyles.lead,
    color: colors.ink,
    textAlign: 'center',
  },
  scroll: {
    paddingHorizontal: gutter.compact,
    paddingVertical: 16,
  },
  column: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    gap: 16,
  },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.wash,
    overflow: 'hidden',
  },
  fill: {
    height: 6,
    backgroundColor: colors.pencil,
  },
  caption: {
    ...textStyles.caption,
    color: colors.ink2,
  },
  card: {
    gap: 16,
    paddingVertical: 24,
    paddingStart: 56,
    paddingEnd: 20,
    backgroundColor: colors.surface,
    borderWidth: borderWidth.hairline,
    borderColor: colors.rule,
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  marginLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    start: 36,
    width: 2,
    backgroundColor: colors.margin,
  },
  sentence: {
    ...textStyles.headline,
    lineHeight: 42,
    color: colors.ink,
  },
  gap: {
    textDecorationLine: 'underline',
    textDecorationColor: colors.pencil,
  },
  answer: {
    fontFamily: fonts.handBold,
    color: colors.pencil,
    textDecorationLine: 'underline',
    textDecorationColor: colors.pencil,
  },
  answerForm: {
    gap: 12,
  },
  result: {
    gap: 8,
  },
  resultLine: {
    ...textStyles.bodyStrong,
    color: colors.ink,
  },
  muted: {
    ...textStyles.body,
    color: colors.ink2,
  },
  message: {
    ...textStyles.bodySmall,
    color: colors.ink,
    backgroundColor: colors.wash,
    borderRadius: radius.card,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  rateBlock: {
    gap: 12,
  },
  rateTitle: {
    ...textStyles.body,
    color: colors.ink2,
    textAlign: 'center',
  },
  rateRow: {
    flexDirection: 'row',
    gap: 8,
  },
  rateButton: {
    flex: 1,
    minHeight: touchTarget + 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    borderRadius: radius.button,
    borderWidth: borderWidth.control,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  dim: {
    opacity: 0.6,
  },
  rateLabel: {
    ...textStyles.bodyStrong,
    color: colors.ink,
  },
  rateInterval: {
    ...textStyles.caption,
    ...tabularNums,
    color: colors.ink2,
  },
});
