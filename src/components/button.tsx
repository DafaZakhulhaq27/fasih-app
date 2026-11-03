import { useState, type ReactElement } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { borderWidth, colors, focusRingWidth, radius, textStyles } from '@/theme';

type ButtonProps = {
  label: string;
  onPress: () => void;
  /** Primary = ink fill. Secondary = ink outline on surface. Danger = destructive actions only. */
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  /** Shows a spinner and blocks presses while an action runs. */
  busy?: boolean;
  /** A longer name when the visible label is ambiguous, e.g. "Remove friend@example.test". */
  accessibilityLabel?: string;
  accessibilityHint?: string;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  busy = false,
  accessibilityLabel,
  accessibilityHint,
}: ButtonProps): ReactElement {
  const [focused, setFocused] = useState(false);
  const inactive = disabled || busy;
  const textColor =
    variant === 'primary' ? colors.surface : variant === 'danger' ? colors.danger : colors.ink;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      aria-disabled={inactive}
      aria-busy={busy}
      accessibilityHint={accessibilityHint}
      disabled={inactive}
      onPress={onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
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
  danger: {
    backgroundColor: colors.surface,
    borderWidth: borderWidth.control,
    borderColor: colors.danger,
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
