import { useRouter } from 'expo-router';
import type { ReactElement } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { FadeUp } from '@/components/motion';
import { type RecentWritingAttempt, useRecentWritingAttempts } from '@/data/writing';
import { borderWidth, colors, gutter, radius, tabularNums, textStyles, touchTarget } from '@/theme';

export default function PracticeScreen(): ReactElement {
  const router = useRouter();
  const recent = useRecentWritingAttempts();

  function openAttempt(attempt: RecentWritingAttempt): void {
    if (attempt.status === 'draft') {
      router.push({ pathname: '/write/[attemptId]', params: { attemptId: attempt.id } });
    } else {
      router.push({ pathname: '/write/[attemptId]/self-check', params: { attemptId: attempt.id } });
    }
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.column}>
          <Text accessibilityRole="header" style={styles.title}>
            Practice
          </Text>

          <FadeUp index={0} style={styles.card}>
            <Text style={styles.cardTitle}>Writing Task 2</Text>
            <Text style={styles.body}>
              40 minutes, at least 250 words, spell-check off. Check it yourself afterwards.
            </Text>
            <Button label="Write a Task 2 essay" onPress={() => router.push('/write')} />
          </FadeUp>

          <FadeUp index={1} style={styles.card}>
            <Text style={styles.cardTitle}>Speaking Part 2</Text>
            <Text style={styles.body}>
              A cue card, one minute to prepare and up to two minutes of recording. Coming soon.
            </Text>
          </FadeUp>

          <Text accessibilityRole="header" style={styles.section}>
            Your recent essays
          </Text>
          {recent.isPending ? <Text style={styles.body}>Loading…</Text> : null}
          {recent.isError ? (
            <Text accessibilityRole="alert" style={styles.body}>
              Could not load your essays: {recent.error.message}
            </Text>
          ) : null}
          {recent.data?.length === 0 ? (
            <Text style={styles.body}>No essays yet. Your first one will appear here.</Text>
          ) : null}
          {recent.data?.map((attempt) => (
            <Pressable
              key={attempt.id}
              accessibilityRole="button"
              accessibilityLabel={`${attempt.topic}, ${statusText(attempt)}`}
              onPress={() => openAttempt(attempt)}
              style={styles.attempt}
            >
              <View style={styles.attemptText}>
                <Text style={styles.cardTitle}>{attempt.topic}</Text>
                <Text style={styles.meta}>
                  {new Date(attempt.createdAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                  })}
                  {attempt.wordCount !== null ? ` · ${attempt.wordCount} words` : ''}
                </Text>
              </View>
              <Text style={styles.status}>{statusText(attempt)}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function statusText(attempt: RecentWritingAttempt): string {
  if (attempt.status === 'draft') {
    return 'Draft';
  }
  if (attempt.selfBand !== null) {
    return `Self-check ${attempt.selfBand.toFixed(1)}`;
  }
  return 'Ready to check';
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  scroll: {
    paddingHorizontal: gutter.compact,
    paddingVertical: 20,
  },
  column: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    gap: 14,
  },
  title: {
    ...textStyles.pageTitle,
    color: colors.ink,
  },
  section: {
    ...textStyles.section,
    marginTop: 8,
    color: colors.ink,
  },
  card: {
    gap: 10,
    padding: 16,
    backgroundColor: colors.surface,
    borderWidth: borderWidth.hairline,
    borderColor: colors.rule,
    borderRadius: radius.card,
  },
  cardTitle: {
    ...textStyles.cardTitle,
    color: colors.ink,
  },
  body: {
    ...textStyles.bodySmall,
    color: colors.ink2,
  },
  attempt: {
    minHeight: touchTarget + 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderWidth: borderWidth.hairline,
    borderColor: colors.rule,
    borderRadius: radius.card,
  },
  attemptText: {
    flex: 1,
    gap: 2,
  },
  meta: {
    ...textStyles.caption,
    color: colors.ink2,
  },
  status: {
    ...textStyles.caption,
    ...tabularNums,
    color: colors.pencil,
  },
});
