import { useRouter } from 'expo-router';
import { useState, type ReactElement } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { ScreenHeader } from '@/components/screen-header';
import { startWritingAttempt, useWritingPrompts } from '@/data/writing';
import { essayTypeLabels } from '@/features/writing/self-check-content';
import { borderWidth, colors, gutter, radius, textStyles } from '@/theme';

/** Pick a Writing Task 2 question and start a timed attempt. */
export default function WritingPromptsScreen(): ReactElement {
  const router = useRouter();
  const prompts = useWritingPrompts();
  const [starting, setStarting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function start(promptId: string): Promise<void> {
    setStarting(promptId);
    setError(null);
    try {
      const attemptId = await startWritingAttempt(promptId);
      router.replace({ pathname: '/write/[attemptId]', params: { attemptId } });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not start the essay.');
      setStarting(null);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.column}>
          <ScreenHeader
            title="Writing Task 2"
            subtitle="40 minutes, at least 250 words. The timer starts when you open a question."
            onBack={() => router.back()}
          />
          {error ? (
            <Text accessibilityRole="alert" style={styles.error}>
              {error}
            </Text>
          ) : null}
          {prompts.isPending ? <Text style={styles.muted}>Loading questions…</Text> : null}
          {prompts.isError ? (
            <Text accessibilityRole="alert" style={styles.error}>
              Could not load questions: {prompts.error.message}
            </Text>
          ) : null}
          {prompts.data?.length === 0 ? (
            <Text style={styles.muted}>
              No questions yet. An admin adds them to the question bank.
            </Text>
          ) : null}
          {prompts.data?.map((prompt) => (
            <View key={prompt.id} style={styles.card}>
              <Text style={styles.meta}>
                {prompt.topic}
                {prompt.essayType
                  ? ` · ${essayTypeLabels[prompt.essayType] ?? prompt.essayType}`
                  : ''}
              </Text>
              <Text style={styles.question}>{prompt.question}</Text>
              <Button
                variant="secondary"
                label="Start writing"
                accessibilityHint={`Starts a ${Math.round(prompt.timeLimitS / 60)}-minute timer`}
                busy={starting === prompt.id}
                disabled={starting !== null && starting !== prompt.id}
                onPress={() => start(prompt.id)}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  scroll: {
    paddingHorizontal: gutter.regular,
    paddingVertical: 24,
  },
  column: {
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    gap: 16,
  },
  card: {
    gap: 12,
    padding: 18,
    backgroundColor: colors.surface,
    borderWidth: borderWidth.hairline,
    borderColor: colors.rule,
    borderRadius: radius.card,
  },
  meta: {
    ...textStyles.caption,
    color: colors.ink2,
  },
  question: {
    ...textStyles.lead,
    color: colors.ink,
  },
  muted: {
    ...textStyles.body,
    color: colors.ink2,
  },
  error: {
    ...textStyles.bodySmall,
    color: colors.ink,
    backgroundColor: colors.wash,
    borderRadius: radius.card,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
});
