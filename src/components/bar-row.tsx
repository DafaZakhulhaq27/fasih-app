import type { ReactElement, ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { growOrigin, MotionView, useEnterAnimation } from '@/components/motion';
import { colors, motion, tabularNums, textStyles } from '@/theme';

type BarRowProps = {
  title: string;
  /** Shown at the end of the title row, in text colors (never the bar color). */
  value: string;
  /** 0-1 share of the track to fill. */
  fraction: number;
  /** 0-1 position of a target tick, if any. */
  target?: number;
  /** "self-check" bars are outlined so they never read as official or AI results. */
  kind?: 'solid' | 'self-check';
  /** Position among bars shown together; later bars start growing a little later. */
  index?: number;
  children?: ReactNode;
};

/** A labelled horizontal bar on a wash track (docs/design/screens/11-mistakes.png). */
export function BarRow({
  title,
  value,
  fraction,
  target,
  kind = 'solid',
  index = 0,
  children,
}: BarRowProps): ReactElement {
  const width = `${Math.max(0, Math.min(1, fraction)) * 100}%` as const;
  // The bar grows from the start of the track when it first appears.
  const enter = useEnterAnimation('grow', {
    delay: index * motion.stagger,
    duration: motion.draw,
  });
  return (
    <View style={styles.row}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
      <View style={styles.track}>
        <MotionView
          style={[
            styles.fill,
            kind === 'self-check' && styles.fillSelfCheck,
            { width, transformOrigin: growOrigin },
            enter,
          ]}
        />
        {target !== undefined ? (
          <View style={[styles.tick, { start: `${target * 100}%` }]} />
        ) : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    ...textStyles.cardTitle,
    flex: 1,
    color: colors.ink,
  },
  value: {
    ...textStyles.cardTitle,
    ...tabularNums,
    color: colors.ink,
  },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.wash,
    justifyContent: 'center',
  },
  fill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.pencil,
  },
  fillSelfCheck: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.pencil,
  },
  tick: {
    position: 'absolute',
    width: 2,
    height: 18,
    marginStart: -1,
    backgroundColor: colors.ink,
  },
});
