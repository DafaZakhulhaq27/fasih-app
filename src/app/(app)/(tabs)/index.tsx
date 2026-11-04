import { useRouter } from 'expo-router';
import { useState, type ReactElement, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSession } from '@/auth/session-provider';
import { Button } from '@/components/button';
import { FadeUp } from '@/components/motion';
import { useExamPlan, useProfile } from '@/data/account';
import { useTargetBand } from '@/data/progress';
import { useDueCount } from '@/data/review';
import {
  borderWidth,
  colors,
  focusRingWidth,
  fonts,
  gutter,
  radius,
  textStyles,
  touchTarget,
} from '@/theme';

// docs/design/screens/02-main.png. The lesson slot waits for the week 1-2 content (Fase 0 step 8).
export default function TodayScreen(): ReactElement {
  const router = useRouter();
  const { session } = useSession();
  const dueCount = useDueCount();
  const target = useTargetBand();
  const profile = useProfile();
  const plan = useExamPlan();
  const [avatarFocused, setAvatarFocused] = useState(false);

  const name = profile.data?.display_name ?? session?.user.email ?? '';
  const mockDays = daysUntil(plan.data?.final_mock_date ?? null);
  const due = dueCount.data ?? 0;
  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.column}>
          <View style={styles.top}>
            <Text style={styles.date}>{today}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Account"
              onPress={() => router.push('/account')}
              onFocus={() => setAvatarFocused(true)}
              onBlur={() => setAvatarFocused(false)}
              style={[styles.avatar, avatarFocused && styles.avatarFocused]}
            >
              <Text style={styles.avatarText}>{(name[0] ?? '?').toUpperCase()}</Text>
            </Pressable>
          </View>
          <Text accessibilityRole="header" style={styles.title}>
            Today&apos;s page
          </Text>
          {target.data !== undefined ? (
            <Text style={styles.hand}>
              Target {target.data.toFixed(1)}.{mockDays !== null ? ` ${mockText(mockDays)}` : ''}
            </Text>
          ) : null}

          <View style={styles.page}>
            <View style={styles.marginLine} />
            <Entry number="1" title="Today's lesson">
              <Text style={styles.body}>
                Lessons start once the week 1 and 2 content has been written and checked.
              </Text>
            </Entry>
            <Entry
              number="2"
              title={due > 0 ? `Review ${due} card${due === 1 ? '' : 's'}` : 'Review'}
            >
              <Text style={styles.body}>
                {dueCount.isPending
                  ? 'Counting your cards…'
                  : due > 0
                    ? 'Cards from the mistakes you marked.'
                    : 'Nothing due right now.'}
              </Text>
              {due > 0 ? (
                <View style={styles.actions}>
                  <Button
                    variant="secondary"
                    label="Start review"
                    onPress={() => router.push('/review-session')}
                  />
                </View>
              ) : null}
            </Entry>
            <Entry number="3" title="Free practice" last>
              <Text style={styles.body}>A timed Task 2 essay, checked by yourself.</Text>
              <View style={styles.actions}>
                <Button
                  variant="secondary"
                  label="Task 2 essay"
                  onPress={() => router.push('/write')}
                />
              </View>
            </Entry>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/** Whole days from today to a YYYY-MM-DD date, in the device's time zone; null without a date. */
function daysUntil(date: string | null): number | null {
  if (!date) {
    return null;
  }
  const [year, month, day] = date.split('-').map(Number);
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((new Date(year, month - 1, day).getTime() - start.getTime()) / 86_400_000);
}

function mockText(days: number): string {
  if (days < 0) {
    return 'Final mock done.';
  }
  if (days === 0) {
    return 'Final mock today.';
  }
  return `Final mock in ${days} day${days === 1 ? '' : 's'}.`;
}

function Entry({
  number,
  title,
  last = false,
  children,
}: {
  number: string;
  title: string;
  last?: boolean;
  children: ReactNode;
}): ReactElement {
  return (
    <FadeUp index={Number(number)} style={[styles.entry, !last && styles.entryRule]}>
      <Text style={styles.number}>{number}</Text>
      <View style={styles.entryBody}>
        <Text accessibilityRole="header" style={styles.entryTitle}>
          {title}
        </Text>
        {children}
      </View>
    </FadeUp>
  );
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
    gap: 12,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  date: {
    ...textStyles.bodySmall,
    color: colors.ink2,
  },
  avatar: {
    width: touchTarget,
    height: touchTarget,
    borderRadius: touchTarget / 2,
    borderWidth: borderWidth.control,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFocused: {
    outlineColor: colors.pencil,
    outlineStyle: 'solid',
    outlineWidth: focusRingWidth,
    outlineOffset: 2,
  },
  avatarText: {
    ...textStyles.bodyStrong,
    color: colors.ink,
  },
  title: {
    ...textStyles.pageTitle,
    color: colors.ink,
  },
  hand: {
    fontFamily: fonts.hand,
    fontSize: 20,
    lineHeight: 26,
    color: colors.pencil,
  },
  page: {
    marginTop: 8,
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
    start: 56,
    width: 2,
    backgroundColor: colors.margin,
  },
  entry: {
    flexDirection: 'row',
    paddingVertical: 18,
    paddingEnd: 18,
  },
  entryRule: {
    borderBottomWidth: borderWidth.hairline,
    borderBottomColor: colors.rule,
  },
  number: {
    width: 56,
    textAlign: 'center',
    fontFamily: fonts.hand,
    fontSize: 22,
    lineHeight: 26,
    color: colors.pencil,
  },
  entryBody: {
    flex: 1,
    gap: 6,
    paddingStart: 16,
  },
  entryTitle: {
    ...textStyles.cardTitle,
    color: colors.ink,
  },
  body: {
    ...textStyles.bodySmall,
    color: colors.ink2,
  },
  actions: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
});
