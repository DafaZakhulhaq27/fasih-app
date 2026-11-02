import { Image } from 'expo-image';
import { useState, type ReactElement } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { colors, focusRingWidth } from '@/theme';

const BUTTON_HEIGHT = 48;
// The asset is 720×160; Google's rules allow scaling only with the aspect ratio kept.
const BUTTON_WIDTH = BUTTON_HEIGHT * (720 / 160);

type GoogleSignInButtonProps = {
  onPress: () => void;
  busy?: boolean;
};

/** Google's official "Sign in with Google" button (assets/images/google/README.md). */
export function GoogleSignInButton({
  onPress,
  busy = false,
}: GoogleSignInButtonProps): ReactElement {
  const [focused, setFocused] = useState(false);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Sign in with Google"
      accessibilityState={{ disabled: busy, busy }}
      disabled={busy}
      onPress={onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => [
        styles.button,
        (pressed || busy) && styles.dimmed,
        focused && styles.focused,
      ]}
    >
      <Image
        source={require('@/assets/images/google/sign-in-with-google-light.png')}
        style={styles.image}
        contentFit="contain"
        accessible={false}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'center',
    borderRadius: 4,
  },
  image: {
    width: BUTTON_WIDTH,
    height: BUTTON_HEIGHT,
  },
  dimmed: {
    opacity: 0.6,
  },
  focused: {
    outlineColor: colors.pencil,
    outlineStyle: 'solid',
    outlineWidth: focusRingWidth,
    outlineOffset: 2,
  },
});
