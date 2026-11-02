import type { ReactElement } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { borderWidth, colors, textStyles, touchTarget } from '@/theme';

type CheckboxProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
};

export function Checkbox({
  label,
  checked,
  onChange,
  disabled = false,
}: CheckboxProps): ReactElement {
  return (
    <Pressable
      accessibilityRole="checkbox"
      aria-checked={checked}
      aria-disabled={disabled}
      accessibilityLabel={label}
      disabled={disabled}
      onPress={() => onChange(!checked)}
      style={styles.row}
    >
      <View style={[styles.box, checked && styles.boxChecked]}>
        {checked ? (
          <Svg width={14} height={14} viewBox="0 0 14 14" fill="none">
            <Path
              d="M2.5 7.5l3 3 6-7"
              stroke={colors.surface}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        ) : null}
      </View>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    minHeight: touchTarget,
    paddingVertical: 8,
  },
  box: {
    width: 22,
    height: 22,
    marginTop: 1,
    borderRadius: 4,
    borderWidth: borderWidth.control,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxChecked: {
    backgroundColor: colors.pencil,
    borderColor: colors.pencil,
  },
  label: {
    ...textStyles.bodySmall,
    flex: 1,
    color: colors.ink,
  },
});
