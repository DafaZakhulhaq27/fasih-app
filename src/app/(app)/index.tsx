import { useRouter } from 'expo-router';
import { useState, type ReactElement } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSession } from '@/auth/session-provider';
import { Button } from '@/components/button';
import { Wordmark } from '@/components/wordmark';
import { type RecentWritingAttempt, useRecentWritingAttempts } from '@/data/writing';
import { supabase } from '@/lib/supabase';
import { borderWidth, colors, gutter, radius, tabularNums, textStyles, touchTarget } from '@/theme';

// Placeholder until the Today screen (docs/design/screens/02-main.png) is built.
export default function TodayScreen(): ReactElement {
  const router = useRouter();
  const { session } = useSession();
  const recent = useRecentWritingAttempts();
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

  function openAttempt(attempt: RecentWritingAttempt): void {
    if (attempt.status === 'draft') {
      router.push({ pathname: '/write/[attemptId]', params: { attemptId: attempt.id } });
    } else {
      router.push({ pathname: '/write/[attemptId]/self-check', params: { attemptId: attempt.id } });
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.column}>
          <Wordmark />
          <Text style={styles.body}>Signed in as {session?.user.email}.</Text>

          <View style={styles.section}>
            <Text accessibilityRole="header" style={styles.sectionTitle}>
              Practice
            </Text>
            <Button label="Write a Task 2 essay" onPress={() => router.push('/write')} />
          </View>

          <View style={styles.section}>
            <Text accessibilityRole="header" style={styles.sectionTitle}>
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
                  <Text style={styles.attemptTopic}>{attempt.topic}</Text>
                  <Text style={styles.attemptMeta}>
                    {formatDate(attempt.createdAt)}
                    {attempt.wordCount !== null ? ` · ${attempt.wordCount} words` : ''}
                  </Text>
                </View>
                <Text style={styles.attemptStatus}>{statusText(attempt)}</Text>
              </Pressable>
            ))}
          </View>

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

function statusText(attempt: RecentWritingAttempt): string {
  if (attempt.status === 'draft') {
    return 'Draft';
  }
  if (attempt.selfBand !== null) {
    return `Self-check ${attempt.selfBand.toFixed(1)}`;
  }
  return 'Ready to check';
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: gutter.regular,
    paddingVertical: 32,
  },
  column: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    gap: 20,
  },
  body: {
    ...textStyles.body,
    color: colors.ink2,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    ...textStyles.section,
    color: colors.ink,
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
  attemptTopic: {
    ...textStyles.cardTitle,
    color: colors.ink,
  },
  attemptMeta: {
    ...textStyles.caption,
    color: colors.ink2,
  },
  attemptStatus: {
    ...textStyles.caption,
    ...tabularNums,
    color: colors.pencil,
  },
});
