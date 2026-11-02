import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState, type ReactElement } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { devSignIn, devSignInAvailable } from '@/auth/dev-sign-in';
import { signInWithGoogle } from '@/auth/google-sign-in';
import { Button } from '@/components/button';
import { GoogleSignInButton } from '@/components/google-sign-in-button';
import { Wordmark } from '@/components/wordmark';
import { borderWidth, colors, fonts, gutter, radius, textStyles } from '@/theme';

// docs/design/screens/01-signin.png
export default function SignInScreen(): ReactElement {
  // Supabase Auth redirects back here with error params when sign-in fails, for example
  // when the "Before User Created" hook rejects an email without an invite.
  const params = useLocalSearchParams<{ error_description?: string | string[] }>();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const message = error ?? firstValue(params.error_description) ?? redirectErrorFromHash();

  useEffect(() => {
    if (Platform.OS !== 'web') {
      return;
    }
    // Back from Google restores this page from the back-forward cache with pending still set.
    const onPageShow = (event: PageTransitionEvent): void => {
      if (event.persisted) {
        setPending(false);
      }
    };
    window.addEventListener('pageshow', onPageShow);
    return () => window.removeEventListener('pageshow', onPageShow);
  }, []);

  async function handleSignIn(): Promise<void> {
    setPending(true);
    setError(null);
    try {
      // On the web this navigates away to Google, so the pending state stays until the page unloads.
      await signInWithGoogle();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign-in failed. Try again.');
      setPending(false);
    }
  }

  async function handleDevSignIn(): Promise<void> {
    setPending(true);
    setError(null);
    try {
      // The session provider picks up the new session and the route guard moves on.
      await devSignIn();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Dev sign-in failed.');
      setPending(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.column}>
          <Wordmark />
          <Text accessibilityRole="header" style={styles.headline}>
            IELTS practice that learns from your own mistakes.
          </Text>
          <Text style={styles.lead}>
            A 12-week plan, honest band estimates, and a review deck built from what you got wrong.
          </Text>
          <CorrectionExample />

          <View style={styles.actions}>
            {message ? (
              <Text accessibilityRole="alert" style={styles.error}>
                {message}
              </Text>
            ) : null}
            <GoogleSignInButton busy={pending} onPress={handleSignIn} />
            <Text accessibilityLiveRegion="polite" style={styles.inviteNote}>
              {pending
                ? 'Opening Google…'
                : 'Invite only for now. Use the Google account your invite was sent to.'}
            </Text>
            {devSignInAvailable ? (
              <Button
                variant="secondary"
                label="Dev sign-in (local Supabase only)"
                busy={pending}
                onPress={handleDevSignIn}
              />
            ) : null}
          </View>

          <View style={styles.privacy}>
            <Text style={styles.privacyText}>
              Your answers go to Google&apos;s Gemini for feedback. On the free tier Google may use
              them to improve its models, so keep names, workplaces and addresses out.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function firstValue(value: string | string[] | undefined): string | null {
  return (Array.isArray(value) ? value[0] : value) ?? null;
}

// Auth may also put redirect errors in the URL fragment (#error_description=...).
function redirectErrorFromHash(): string | null {
  if (Platform.OS !== 'web') {
    return null;
  }
  return new URLSearchParams(window.location.hash.slice(1)).get('error_description');
}

const RULE_GAP = 36;

/** A ruled exercise-book card with one teacher's correction, as in the design. */
function CorrectionExample(): ReactElement {
  return (
    <View
      accessible
      accessibilityLabel="Example correction: in “Coding teach children to think logically”, teach is corrected to teaches, because one activity takes a verb ending in -s."
      style={styles.card}
    >
      {[0, 1, 2, 3].map((i) => (
        <View key={i} style={[styles.rule, { top: RULE_GAP - 1 + i * RULE_GAP }]} />
      ))}
      <View style={styles.marginLine} />
      <Text style={styles.essayText}>
        Coding <Text style={styles.struck}>teach</Text>{' '}
        <Text style={styles.insertion}>teaches</Text> children to think logically.
      </Text>
      <Text style={styles.note}>One activity, so the verb takes -s.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: gutter.regular,
    paddingTop: 24,
    paddingBottom: 32,
  },
  column: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  headline: {
    ...textStyles.headline,
    color: colors.ink,
    marginTop: 28,
    letterSpacing: -0.28,
  },
  lead: {
    ...textStyles.lead,
    color: colors.ink2,
    marginTop: 10,
  },
  card: {
    marginTop: 28,
    backgroundColor: colors.surface,
    borderWidth: borderWidth.hairline,
    borderColor: colors.rule,
    borderRadius: radius.card,
    paddingTop: 30,
    paddingBottom: 18,
    paddingStart: 60,
    paddingEnd: 18,
    overflow: 'hidden',
  },
  rule: {
    position: 'absolute',
    start: 0,
    end: 0,
    height: 1,
    backgroundColor: colors.rule,
  },
  marginLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    start: 44,
    width: 2,
    backgroundColor: colors.margin,
  },
  essayText: {
    fontFamily: fonts.body,
    fontSize: 18,
    lineHeight: RULE_GAP,
    color: colors.ink,
  },
  struck: {
    color: colors.ink2,
    textDecorationLine: 'line-through',
    textDecorationColor: colors.pencil,
  },
  insertion: {
    fontFamily: fonts.hand,
    fontSize: 21,
    color: colors.pencil,
  },
  note: {
    fontFamily: fonts.hand,
    fontSize: 17,
    lineHeight: RULE_GAP,
    color: colors.pencil,
  },
  actions: {
    marginTop: 'auto',
    paddingTop: 32,
    gap: 14,
  },
  error: {
    ...textStyles.bodySmall,
    color: colors.ink,
    backgroundColor: colors.wash,
    borderRadius: radius.card,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  inviteNote: {
    ...textStyles.bodySmall,
    color: colors.ink2,
    textAlign: 'center',
  },
  privacy: {
    marginTop: 22,
    paddingTop: 16,
    borderTopWidth: borderWidth.hairline,
    borderTopColor: colors.rule,
  },
  privacyText: {
    ...textStyles.caption,
    lineHeight: 21,
    color: colors.ink2,
  },
});
