import { useRouter } from 'expo-router';
import { useState, type ReactElement, type ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSession } from '@/auth/session-provider';
import { Button } from '@/components/button';
import { useTargetBand } from '@/data/progress';
import { useDueCount } from '@/data/review';
import { supabase } from '@/lib/supabase';
import { borderWidth, colors, fonts, gutter, radius, textStyles } from '@/theme';

// docs/design/screens/02-main.png. The lesson slot waits for the week 1-2 content (Fase 0 step 8).
export default function TodayScreen(): ReactElement {
  const router = useRouter();
  const { session } = useSession();
  const dueCount = useDueCount();
  const target = useTargetBand();
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignOut(): Promise<void> {
    setSigningOut(true);
    setError(null);
    // The session provider sees SIGNED_OUT and the route guard returns to sign-in.
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      setError(`Could not sign out: ${signOutError.message}`);
      setSigningOut(false);
    }
  }

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
          <Text style={styles.date}>{today}</Text>
          <Text accessibilityRole="header" style={styles.title}>
            Today&apos;s page
          </Text>
          {target.data !== undefined ? (
            <Text style={styles.hand}>Target {target.data.toFixed(1)}.</Text>
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

          <Text style={styles.signedIn}>Signed in as {session?.user.email}.</Text>
          {error ? (
            <Text accessibilityRole="alert" style={styles.body}>
              {error}
            </Text>
          ) : null}
          {/* Sign out moves to the Account screen (13-account) once it exists. */}
          <Button variant="secondary" label="Sign out" busy={signingOut} onPress={handleSignOut} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
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
    <View style={[styles.entry, !last && styles.entryRule]}>
      <Text style={styles.number}>{number}</Text>
      <View style={styles.entryBody}>
        <Text accessibilityRole="header" style={styles.entryTitle}>
          {title}
        </Text>
        {children}
      </View>
    </View>
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
  date: {
    ...textStyles.bodySmall,
    color: colors.ink2,
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
  signedIn: {
    ...textStyles.caption,
    marginTop: 12,
    color: colors.ink2,
  },
});
