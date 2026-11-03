import { useState, type ReactElement } from 'react';
import { type LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Polyline } from 'react-native-svg';

import { colors, fonts, tabularNums, textStyles } from '@/theme';

// A single-series line chart: 2px line, 8px markers, labels on the first and last points only, a
// recessive baseline, and tap-to-read values. One series, so no legend; the title names it.

export type LinePoint = { key: string; label: string; value: number };

type LineChartProps = {
  /** Read out instead of the drawing, e.g. "Errors per 100 words by essay". */
  title: string;
  points: readonly LinePoint[];
  format: (value: number) => string;
  startLabel: string;
  endLabel: string;
};

const HEIGHT = 140;
const PAD_X = 10;
const PAD_TOP = 24;
const PAD_BOTTOM = 28;
const MARKER_R = 4;
const HIT_R = 22;

export function LineChart({
  title,
  points,
  format,
  startLabel,
  endLabel,
}: LineChartProps): ReactElement {
  const [width, setWidth] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);

  const values = points.map((point) => point.value);
  const max = Math.max(...values);
  const min = Math.min(0, ...values);
  const span = max - min || 1;
  const innerW = Math.max(0, width - PAD_X * 2);
  const innerH = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const x = (i: number): number =>
    PAD_X + (points.length === 1 ? innerW / 2 : (i / (points.length - 1)) * innerW);
  const y = (value: number): number => PAD_TOP + (1 - (value - min) / span) * innerH;
  const last = points.length - 1;
  const shown = selected ?? last;

  return (
    <View
      onLayout={(event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width)}
      style={styles.box}
    >
      {width > 0 ? (
        <View
          accessible
          accessibilityRole="image"
          accessibilityLabel={`${title}: ${points.map((point) => `${point.label}, ${format(point.value)}`).join('; ')}`}
        >
          <Svg width={width} height={HEIGHT}>
            <Line
              x1={0}
              x2={width}
              y1={HEIGHT - PAD_BOTTOM + 8}
              y2={HEIGHT - PAD_BOTTOM + 8}
              stroke={colors.rule}
              strokeWidth={1}
            />
            {points.length > 1 ? (
              <Polyline
                points={points.map((point, i) => `${x(i)},${y(point.value)}`).join(' ')}
                fill="none"
                stroke={colors.pencil}
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            ) : null}
            {points.map((point, i) => (
              <Circle
                key={point.key}
                cx={x(i)}
                cy={y(point.value)}
                r={i === shown ? MARKER_R + 1 : MARKER_R}
                fill={i === last || i === shown ? colors.pencil : colors.surface}
                stroke={colors.pencil}
                strokeWidth={2}
              />
            ))}
          </Svg>
        </View>
      ) : null}
      {width > 0
        ? points.map((point, i) => (
            <Pressable
              key={`${point.key}-hit`}
              accessibilityRole="button"
              accessibilityLabel={`${point.label}: ${format(point.value)}`}
              onPress={() => setSelected(i)}
              style={[styles.hit, { start: x(i) - HIT_R, top: y(point.value) - HIT_R }]}
            />
          ))
        : null}
      {width > 0 ? (
        <>
          <Text style={[styles.pointLabel, { start: x(0) - 4, top: y(values[0] as number) - 22 }]}>
            {format(values[0] as number)}
          </Text>
          {last > 0 ? (
            <Text
              style={[
                styles.pointLabel,
                styles.lastLabel,
                { end: width - x(last) - 4, top: y(values[last] as number) + 8 },
              ]}
            >
              {format(values[last] as number)}
            </Text>
          ) : null}
        </>
      ) : null}
      <View style={styles.axis}>
        <Text style={styles.axisText}>{startLabel}</Text>
        <Text style={styles.axisText}>{endLabel}</Text>
      </View>
      {selected !== null ? (
        <Text accessibilityLiveRegion="polite" style={styles.readout}>
          {points[selected]?.label}: {format(points[selected]?.value ?? 0)}
        </Text>
      ) : (
        <Text style={styles.hint}>Tap a point to see its value.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    gap: 4,
  },
  hit: {
    position: 'absolute',
    width: HIT_R * 2,
    height: HIT_R * 2,
    borderRadius: HIT_R,
  },
  pointLabel: {
    position: 'absolute',
    ...textStyles.captionSmall,
    ...tabularNums,
    color: colors.ink2,
  },
  lastLabel: {
    fontFamily: fonts.handBold,
    fontSize: 17,
    color: colors.pencil,
  },
  axis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -PAD_BOTTOM + 14,
  },
  axisText: {
    ...textStyles.captionSmall,
    color: colors.ink2,
  },
  readout: {
    ...textStyles.caption,
    ...tabularNums,
    color: colors.ink,
  },
  hint: {
    ...textStyles.captionSmall,
    color: colors.ink2,
  },
});
