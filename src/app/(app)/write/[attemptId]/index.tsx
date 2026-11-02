import { countUnits, getLanguagePack } from '@core/language-pack.ts';
import { useQueryClient } from '@tanstack/react-query';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState, type ReactElement } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { ScreenHeader } from '@/components/screen-header';
import { saveEssay, useWritingAttempt, type WritingAttempt, writingKeys } from '@/data/writing';
import { essayTypeLabels } from '@/features/writing/self-check-content';
import { useNow } from '@/hooks/use-now';
import {
  borderWidth,
  colors,
  focusRingWidth,
  fonts,
  gutter,
  radius,
  tabularNums,
  textStyles,
} from '@/theme';

const en = getLanguagePack('en');
const AUTOSAVE_DELAY_MS = 2000;
const WIDE_LAYOUT_MIN_WIDTH = 900;

// Writing Task 2 in test conditions (docs/design/screens/14-writedesktop.png): visible timer, word
// count, spell-check and autocorrect off.
export default function WriteScreen(): ReactElement {
  const { attemptId } = useLocalSearchParams<{ attemptId: string }>();
  const attempt = useWritingAttempt(attemptId);

  if (attempt.isPending) {
    return <Message text="Loading your essay…" />;
  }
  if (attempt.isError) {
    return <Message text={`Could not load this essay: ${attempt.error.message}`} alert />;
  }
  if (attempt.data.status !== 'draft') {
    return <Redirect href={{ pathname: '/write/[attemptId]/self-check', params: { attemptId } }} />;
  }
  return <Editor attempt={attempt.data} />;
}

type SaveState =
  | { kind: 'idle' }
  | { kind: 'saving' }
  | { kind: 'saved'; at: number }
  | { kind: 'error'; message: string };

function Editor({ attempt }: { attempt: WritingAttempt }): ReactElement {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { width } = useWindowDimensions();
  const now = useNow(1000);
  const [text, setText] = useState(attempt.rawText);
  const [saveState, setSaveState] = useState<SaveState>({ kind: 'idle' });
  const [finishing, setFinishing] = useState(false);
  const [editorFocused, setEditorFocused] = useState(false);
  const lastSaved = useRef(attempt.rawText);

  const { prompt } = attempt;
  const words = countUnits(en, text);
  const elapsedS = Math.max(0, Math.floor((now - Date.parse(attempt.createdAt)) / 1000));
  const remainingS = prompt.timeLimitS - elapsedS;

  async function save(status: 'draft' | 'pending'): Promise<void> {
    setSaveState({ kind: 'saving' });
    const draft = { rawText: text, wordCount: words, timeSpentS: elapsedS };
    try {
      await saveEssay(attempt.id, draft, status);
      lastSaved.current = draft.rawText;
      setSaveState({ kind: 'saved', at: Date.now() });
    } catch (e) {
      setSaveState({ kind: 'error', message: e instanceof Error ? e.message : 'unknown error' });
      throw e;
    }
  }

  // Autosave a moment after typing stops.
  useEffect(() => {
    if (text === lastSaved.current) {
      return;
    }
    const id = setTimeout(() => {
      save('draft').catch(() => undefined);
    }, AUTOSAVE_DELAY_MS);
    return () => clearTimeout(id);
    // save reads the latest text through this effect's closure.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  async function finish(): Promise<void> {
    setFinishing(true);
    try {
      await save('pending');
      await queryClient.invalidateQueries({ queryKey: writingKeys.attempt(attempt.id) });
      await queryClient.invalidateQueries({ queryKey: writingKeys.recent });
      router.replace({
        pathname: '/write/[attemptId]/self-check',
        params: { attemptId: attempt.id },
      });
    } catch {
      setFinishing(false);
    }
  }

  const wide = width >= WIDE_LAYOUT_MIN_WIDTH;
  const essayType = prompt.essayType ? essayTypeLabels[prompt.essayType] : null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <ScreenHeader
          title="Writing Task 2"
          subtitle={essayType ?? 'Timed practice'}
          onBack={() => router.back()}
          backLabel="Close; your draft is kept"
          trailing={
            <View style={styles.headerEnd}>
              <Timer remainingS={remainingS} limitS={prompt.timeLimitS} />
              {wide ? <Button label="Finish and check" busy={finishing} onPress={finish} /> : null}
            </View>
          }
        />
      </View>
      <ScrollView
        contentContainerStyle={[styles.body, wide && styles.bodyWide]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.task, wide && styles.taskWide]}>
          <Text style={styles.taskLabel}>TASK 2</Text>
          <Text style={styles.taskText}>
            Spend about {Math.round(prompt.timeLimitS / 60)} minutes on this task. Write about this
            topic:
          </Text>
          <View style={styles.question}>
            <Text style={styles.questionText}>{prompt.question}</Text>
          </View>
          <Text style={styles.taskText}>
            Support your answer with reasons and with examples from your own knowledge or
            experience.
          </Text>
          <Text style={styles.taskStrong}>Write at least {prompt.minWords} words.</Text>
        </View>

        <View style={[styles.editor, wide && styles.editorWide]}>
          <TextInput
            accessibilityLabel="Your essay"
            accessibilityHint="Spell-check and autocorrect are off, as in the test"
            value={text}
            onChangeText={setText}
            multiline
            spellCheck={false}
            autoCorrect={false}
            autoComplete="off"
            autoCapitalize="sentences"
            textAlignVertical="top"
            placeholder="Start writing here…"
            placeholderTextColor={colors.ink2}
            onFocus={() => setEditorFocused(true)}
            onBlur={() => setEditorFocused(false)}
            style={[styles.input, editorFocused && styles.inputFocused]}
          />
          <View style={styles.footer}>
            <WordCount words={words} target={prompt.minWords} />
            <Text accessibilityLiveRegion="polite" style={styles.note}>
              Spell-check and autocorrect are off, as in the test. {saveText(saveState, now)}
            </Text>
          </View>
        </View>

        {!wide ? <Button label="Finish and check" busy={finishing} onPress={finish} /> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function Timer({ remainingS, limitS }: { remainingS: number; limitS: number }): ReactElement {
  const over = remainingS < 0;
  return (
    <View
      accessible
      accessibilityLabel={
        over
          ? `Time is up, ${formatClock(-remainingS)} over`
          : `${formatClock(remainingS)} left of ${formatClock(limitS)}`
      }
      style={styles.timer}
    >
      <Text style={[styles.timerValue, over && styles.timerOver]}>
        {over ? `+${formatClock(-remainingS)}` : formatClock(remainingS)}
      </Text>
      <Text style={styles.timerLabel}>
        {over ? 'time is up' : `left of ${formatClock(limitS)}`}
      </Text>
    </View>
  );
}

function WordCount({ words, target }: { words: number; target: number }): ReactElement {
  const progress = Math.min(1, words / target);
  return (
    <View style={styles.wordRow}>
      <Text style={styles.wordCount}>{words} words</Text>
      <View
        accessibilityRole="progressbar"
        accessibilityLabel="Words written"
        accessibilityValue={{ min: 0, max: target, now: Math.min(words, target) }}
        style={styles.track}
      >
        <View style={[styles.fill, { width: `${progress * 100}%` }]} />
      </View>
      <Text style={styles.wordTarget}>of at least {target}</Text>
    </View>
  );
}

function Message({ text, alert = false }: { text: string; alert?: boolean }): ReactElement {
  return (
    <SafeAreaView style={[styles.safeArea, styles.center]}>
      <Text accessibilityRole={alert ? 'alert' : undefined} style={styles.taskText}>
        {text}
      </Text>
    </SafeAreaView>
  );
}

function formatClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function saveText(state: SaveState, now: number): string {
  switch (state.kind) {
    case 'idle':
      return 'Your draft saves as you type.';
    case 'saving':
      return 'Saving…';
    case 'error':
      return `Not saved yet (${state.message}); it will retry when you type again.`;
    case 'saved': {
      const seconds = Math.round((now - state.at) / 1000);
      return seconds < 60
        ? 'Saved a few seconds ago.'
        : `Saved ${Math.round(seconds / 60)} min ago.`;
    }
  }
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
  header: {
    paddingHorizontal: gutter.regular,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: borderWidth.hairline,
    borderBottomColor: colors.rule,
  },
  headerEnd: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  timer: {
    alignItems: 'flex-end',
  },
  timerValue: {
    ...textStyles.headline,
    ...tabularNums,
    color: colors.ink,
  },
  timerOver: {
    color: colors.pencil,
  },
  timerLabel: {
    ...textStyles.captionSmall,
    ...tabularNums,
    color: colors.ink2,
  },
  body: {
    padding: gutter.compact,
    gap: 16,
  },
  bodyWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: gutter.regular,
    gap: gutter.regular,
  },
  task: {
    gap: 12,
    padding: 20,
    backgroundColor: colors.surface,
    borderWidth: borderWidth.hairline,
    borderColor: colors.rule,
    borderRadius: radius.card,
  },
  taskWide: {
    width: 420,
  },
  taskLabel: {
    ...textStyles.captionSmall,
    fontFamily: fonts.bodyBold,
    letterSpacing: 1,
    color: colors.ink2,
  },
  taskText: {
    ...textStyles.body,
    color: colors.ink,
  },
  taskStrong: {
    ...textStyles.body,
    fontFamily: fonts.bodyBold,
    color: colors.ink,
  },
  question: {
    padding: 16,
    backgroundColor: colors.wash,
    borderStartWidth: 4,
    borderStartColor: colors.ink,
  },
  questionText: {
    ...textStyles.cardTitle,
    color: colors.ink,
  },
  editor: {
    backgroundColor: colors.surface,
    borderWidth: borderWidth.hairline,
    borderColor: colors.rule,
    borderRadius: radius.card,
  },
  editorWide: {
    flex: 1,
  },
  input: {
    ...textStyles.lead,
    lineHeight: 32,
    minHeight: 420,
    padding: 20,
    color: colors.ink,
  },
  inputFocused: {
    outlineColor: colors.pencil,
    outlineStyle: 'solid',
    outlineWidth: focusRingWidth,
    outlineOffset: -focusRingWidth,
  },
  footer: {
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: borderWidth.hairline,
    borderTopColor: colors.rule,
  },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  wordCount: {
    ...textStyles.cardTitle,
    ...tabularNums,
    color: colors.ink,
  },
  track: {
    flex: 1,
    maxWidth: 240,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.wash,
    overflow: 'hidden',
  },
  fill: {
    height: 6,
    backgroundColor: colors.pencil,
  },
  wordTarget: {
    ...textStyles.caption,
    ...tabularNums,
    color: colors.ink2,
  },
  note: {
    ...textStyles.captionSmall,
    color: colors.ink2,
  },
});
