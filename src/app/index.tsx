import { useState, type ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSession } from '@/auth/session-provider';
import { Button } from '@/components/button';
import { Wordmark } from '@/components/wordmark';
import { supabase } from '@/lib/supabase';
import { colors, gutter, textStyles } from '@/theme';

// Placeholder until the Today screen (docs/design/screens/02-main.png) is built.
export default function TodayScreen(): ReactElement {
  const { session } = useSession();
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Wordmark />
        <Text style={styles.body}>
          Signed in as {session?.user.email}. Your daily lesson, practice and review will appear
          here.
        </Text>
        {error ? (
          <Text accessibilityRole="alert" style={styles.body}>
            {error}
          </Text>
        ) : null}
        {/* Sign out moves to the Account screen (13-account) once it exists. */}
        <Button variant="secondary" label="Sign out" busy={signingOut} onPress={handleSignOut} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    paddingHorizontal: gutter.regular,
    gap: 16,
  },
  body: {
    ...textStyles.body,
    color: colors.ink2,
  },
});
