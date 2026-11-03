import type { ReactElement } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { borderWidth, colors, radius, tabularNums, textStyles, touchTarget } from '@/theme';

type BandChipsProps = {
  /** Names the group for screen readers, e.g. "Your band for Task Response". */
  label: string;
  options: readonly number[];
  value: number | undefined;
  onChange: (band: number) => void;
  disabled?: boolean;
};

/** Equal chips for picking a band; the chosen one is filled with pencil (docs/design/README.md). */
export function BandChips({
  label,
  options,
  value,
  onChange,
  disabled = false,
}: BandChipsProps): ReactElement {
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={label} style={styles.row}>
      {options.map((band) => {
        const selected = band === value;
        return (
          <Pressable
            key={band}
            accessibilityRole="radio"
            accessibilityLabel={`Band ${band.toFixed(1)}`}
            aria-checked={selected}
            aria-disabled={disabled}
            disabled={disabled}
            onPress={() => onChange(band)}
            style={[styles.chip, selected && styles.selected]}
          >
            <Text style={[styles.text, selected && styles.selectedText]}>{band.toFixed(1)}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    flexGrow: 1,
    flexBasis: touchTarget,
    minWidth: touchTarget,
    minHeight: touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.button,
    borderWidth: borderWidth.control,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  selected: {
    backgroundColor: colors.pencil,
    borderColor: colors.pencil,
  },
  text: {
    ...textStyles.bodyStrong,
    ...tabularNums,
    color: colors.ink,
  },
  selectedText: {
    color: colors.surface,
  },
});
