import { useState, type ReactElement } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { borderWidth, colors, focusRingWidth, radius, textStyles } from '@/theme';

type ButtonProps = {
  label: string;
  onPress: () => void;
  /** Primary = ink fill. Secondary = ink outline on surface. */
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  /** Shows a spinner and blocks presses while an action runs. */
  busy?: boolean;
  accessibilityHint?: string;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  busy = false,
  accessibilityHint,
}: ButtonProps): ReactElement {
  const [focused, setFocused] = useState(false);
  const inactive = disabled || busy;
  const textColor = variant === 'primary' ? colors.surface : colors.ink;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy }}
      accessibilityHint={accessibilityHint}
      disabled={inactive}
      onPress={onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' ? styles.primary : styles.secondary,
        pressed && styles.pressed,
        inactive && styles.inactive,
        focused && styles.focused,
      ]}
    >
      {busy ? <ActivityIndicator color={textColor} /> : null}
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: radius.button,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 20,
  },
  primary: {
    backgroundColor: colors.ink,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: borderWidth.control,
    borderColor: colors.ink,
  },
  pressed: {
    opacity: 0.85,
  },
  inactive: {
    opacity: 0.6,
  },
  focused: {
    outlineColor: colors.pencil,
    outlineStyle: 'solid',
    outlineWidth: focusRingWidth,
    outlineOffset: 2,
  },
  label: {
    ...textStyles.bodyStrong,
  },
});
