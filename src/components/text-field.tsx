import { useId, useState, type ReactElement } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { borderWidth, colors, focusRingWidth, radius, textStyles, touchTarget } from '@/theme';

type TextFieldProps = Omit<TextInputProps, 'style' | 'accessibilityLabel'> & {
  label: string;
  /** Shown under the field; read out with it. */
  hint?: string | null;
};

/** A labelled single-line input (every input has a visible label). */
export function TextField({ label, hint, ...inputProps }: TextFieldProps): ReactElement {
  const [focused, setFocused] = useState(false);
  const id = useId();

  return (
    <View style={styles.field}>
      <Text nativeID={`${id}-label`} style={styles.label}>
        {label}
      </Text>
      <TextInput
        {...inputProps}
        accessibilityLabel={label}
        accessibilityLabelledBy={`${id}-label`}
        accessibilityHint={hint ?? undefined}
        onFocus={(event) => {
          setFocused(true);
          inputProps.onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          inputProps.onBlur?.(event);
        }}
        placeholderTextColor={colors.ink2}
        style={[styles.input, focused && styles.focused]}
      />
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 6,
  },
  label: {
    ...textStyles.caption,
    color: colors.ink2,
  },
  input: {
    ...textStyles.body,
    minHeight: touchTarget + 4,
    paddingHorizontal: 14,
    borderRadius: radius.button,
    borderWidth: borderWidth.control,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.ink,
  },
  focused: {
    borderColor: colors.pencil,
    outlineColor: colors.pencil,
    outlineStyle: 'solid',
    outlineWidth: focusRingWidth - 1,
  },
  hint: {
    ...textStyles.captionSmall,
    color: colors.ink2,
  },
});
