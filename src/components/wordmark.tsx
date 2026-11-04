import type { ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { MotionView, useEnterAnimation } from '@/components/motion';
import { colors, motion, textStyles } from '@/theme';

// The 'write' animation reveals exactly this width.
const UNDERLINE_WIDTH = 116;

/** "Fasih" in Kalam with the graphite wave and pencil stroke underneath (docs/design 01-signin). */
export function Wordmark(): ReactElement {
  // The underline is revealed from the start, as if written with a pen.
  const draw = useEnterAnimation('write', { duration: motion.draw, delay: motion.enter });
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Fasih</Text>
      <MotionView aria-hidden style={[styles.underline, draw]}>
        <Svg width={UNDERLINE_WIDTH} height={12} viewBox="0 0 116 12" fill="none">
          <Path
            d="M2 6c4-5 8-5 12 0s8 5 12 0 8-5 12 0 8 5 12 0"
            stroke={colors.graphite}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path d="M56 6H114" stroke={colors.pencil} strokeWidth={3} strokeLinecap="round" />
        </Svg>
      </MotionView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    paddingBottom: 12,
  },
  text: {
    ...textStyles.wordmark,
    color: colors.ink,
  },
  underline: {
    position: 'absolute',
    start: 0,
    bottom: 2,
    width: UNDERLINE_WIDTH,
    overflow: 'hidden',
  },
});
