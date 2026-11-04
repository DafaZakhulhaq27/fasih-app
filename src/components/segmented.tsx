import { useState, type ReactElement } from 'react';
import { I18nManager, Pressable, StyleSheet, View } from 'react-native';

import { MotionText, MotionView, useStateTransition } from '@/components/motion';
import { colors, focusRingWidth, fonts, motion, radius, textStyles, touchTarget } from '@/theme';

type SegmentedProps<T extends string> = {
  /** Names the group for screen readers. */
  label: string;
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
};

const TRACK_PADDING = 4;
const GAP = 4;

/**
 * Wash track, the selected segment on surface with a light shadow (docs/design/README.md). The
 * surface is one thumb that slides to the chosen segment.
 */
export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
  disabled = false,
}: SegmentedProps<T>): ReactElement {
  const [focused, setFocused] = useState<T | null>(null);
  const [trackWidth, setTrackWidth] = useState(0);
  const slide = useStateTransition(['transform'], motion.enter);
  const textFill = useStateTransition(['color']);

  const selectedIndex = options.findIndex((option) => option.value === value);
  const segmentWidth =
    (trackWidth - TRACK_PADDING * 2 - GAP * (options.length - 1)) / options.length;
  const offset = selectedIndex * (segmentWidth + GAP);

  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={label}
      onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
      style={styles.track}
    >
      {trackWidth > 0 && selectedIndex >= 0 ? (
        <MotionView
          aria-hidden
          pointerEvents="none"
          style={[
            styles.thumb,
            {
              width: segmentWidth,
              transform: [{ translateX: I18nManager.isRTL ? -offset : offset }],
            },
            slide,
          ]}
        />
      ) : null}
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
            style={[styles.segment, focused === option.value && styles.focused]}
          >
            <MotionText style={[styles.text, selected && styles.selectedText, textFill]}>
              {option.label}
            </MotionText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    padding: TRACK_PADDING,
    gap: GAP,
    borderRadius: radius.segmented,
    backgroundColor: colors.wash,
  },
  thumb: {
    position: 'absolute',
    top: TRACK_PADDING,
    bottom: TRACK_PADDING,
    start: TRACK_PADDING,
    borderRadius: radius.segmented - 4,
    backgroundColor: colors.surface,
    shadowColor: colors.ink,
    shadowOpacity: 0.12,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  segment: {
    flex: 1,
    minHeight: touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    borderRadius: radius.segmented - 4,
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
