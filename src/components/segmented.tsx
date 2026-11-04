import { useState, type ReactElement } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, focusRingWidth, fonts, radius, textStyles, touchTarget } from '@/theme';

type SegmentedProps<T extends string> = {
  /** Names the group for screen readers. */
  label: string;
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
};

/** Wash track, the selected segment on surface with a light shadow (docs/design/README.md). */
export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
  disabled = false,
}: SegmentedProps<T>): ReactElement {
  const [focused, setFocused] = useState<T | null>(null);

  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={label} style={styles.track}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityLabel={option.label}
            aria-checked={selected}
            aria-disabled={disabled}
            disabled={disabled}
            onPress={() => onChange(option.value)}
            onFocus={() => setFocused(option.value)}
            onBlur={() => setFocused(null)}
            style={[
              styles.segment,
              selected && styles.selected,
              focused === option.value && styles.focused,
            ]}
          >
            <Text style={[styles.text, selected && styles.selectedText]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    padding: 4,
    gap: 4,
    borderRadius: radius.segmented,
    backgroundColor: colors.wash,
  },
  segment: {
    flex: 1,
    minHeight: touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    borderRadius: radius.segmented - 4,
  },
  selected: {
    backgroundColor: colors.surface,
    shadowColor: colors.ink,
    shadowOpacity: 0.12,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  focused: {
    outlineColor: colors.pencil,
    outlineStyle: 'solid',
    outlineWidth: focusRingWidth,
    outlineOffset: 2,
  },
  text: {
    ...textStyles.caption,
    color: colors.ink2,
    textAlign: 'center',
  },
  selectedText: {
    color: colors.ink,
    fontFamily: fonts.bodyBold,
  },
});
