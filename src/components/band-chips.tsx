import type { ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  MotionPressable,
  MotionText,
  usePressFeedback,
  useStateTransition,
} from '@/components/motion';
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
  const press = usePressFeedback({ disabled });
  // One transition list for fill and press: a later transitionProperty replaces an earlier one.
  const fill = useStateTransition(['backgroundColor', 'borderColor', 'transform', 'opacity']);
  const textFill = useStateTransition(['color']);

  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={label} style={styles.row}>
      {options.map((band) => {
        const selected = band === value;
        return (
          <MotionPressable
            key={band}
            accessibilityRole="radio"
            accessibilityLabel={`Band ${band.toFixed(1)}`}
            aria-checked={selected}
            aria-disabled={disabled}
            disabled={disabled}
            onPress={() => onChange(band)}
            dataSet={press.dataSet}
            style={[styles.chip, selected && styles.selected, press.style, fill]}
          >
            <MotionText style={[styles.text, selected && styles.selectedText, textFill]}>
              {band.toFixed(1)}
            </MotionText>
          </MotionPressable>
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
