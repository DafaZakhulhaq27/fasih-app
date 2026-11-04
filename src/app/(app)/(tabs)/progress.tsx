import { averageBand } from '@core/band.ts';
import { groupMistakesByType } from '@core/mistake-types.ts';
import { useRouter } from 'expo-router';
import type { ReactElement } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BarRow } from '@/components/bar-row';
import { FadeUp } from '@/components/motion';
import { Button } from '@/components/button';
import { LineChart } from '@/components/line-chart';
import { useMistakes, useTargetBand, useWritingStats } from '@/data/progress';
import { borderWidth, colors, fonts, gutter, tabularNums, textStyles } from '@/theme';

const RECENT_ESSAYS = 3;

// docs/design/screens/11-mistakes.png. Self-check bands are drawn outlined and labelled
// "self-check"; AI estimates and official scores will get their own styles and are never mixed.
export default function ProgressScreen(): ReactElement {
  const router = useRouter();
  const stats = useWritingStats();
  const mistakes = useMistakes();
  const target = useTargetBand();

  const targetBand = target.data ?? 7;
  const banded = (stats.data ?? []).filter((stat) => stat.selfBand !== null);
  const recentBands = banded.slice(-RECENT_ESSAYS).map((stat) => stat.selfBand as number);
  const writingBand = averageBand(recentBands);
  const errorPoints = (stats.data ?? []).flatMap((stat) =>
    stat.errorsPer100 === null
      ? []
      : [
          {
            key: stat.attemptId,
            label: `Essay of ${new Date(stat.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`,
            value: stat.errorsPer100,
          },
        ],
  );
  const groups = groupMistakesByType(mistakes.data ?? []);
  const maxCount = Math.max(1, ...groups.map((group) => group.count));
  const loading = stats.isPending || mistakes.isPending;
  const failed = stats.error ?? mistakes.error;

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.column}>
          <Text accessibilityRole="header" style={styles.title}>
            Progress
          </Text>
          {loading ? <Text style={styles.body}>Loading…</Text> : null}
          {failed ? (
            <Text accessibilityRole="alert" style={styles.body}>
              Could not load your progress: {failed.message}
            </Text>
          ) : null}
          <Text style={styles.lead}>
            {writingBand === null
              ? `Write an essay and check it yourself to start your progress. Target ${targetBand.toFixed(1)}.`
              : `Writing about ${writingBand.toFixed(1)} by your own check. Target ${targetBand.toFixed(1)}.`}
          </Text>

          <View>
            <BarRow
              title="Writing"
              value={writingBand === null ? '—' : writingBand.toFixed(1)}
              fraction={(writingBand ?? 0) / 9}
              target={targetBand / 9}
              kind="self-check"
              index={0}
            >
              <Text style={styles.caption}>
                {writingBand === null
                  ? 'No checked essays yet'
                  : `Self-check from ${recentBands.length} essay${recentBands.length === 1 ? '' : 's'}`}
              </Text>
            </BarRow>
            {['Listening', 'Reading', 'Speaking'].map((skill) => (
              <BarRow key={skill} title={skill} value="—" fraction={0} target={targetBand / 9}>
                <Text style={styles.caption}>No scores yet</Text>
              </BarRow>
            ))}
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={styles.swatchSelfCheck} />
                <Text style={styles.caption}>self-check</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={styles.swatchTick} />
                <Text style={styles.caption}>target {targetBand.toFixed(1)}</Text>
              </View>
            </View>
          </View>

          <FadeUp index={1} style={styles.section}>
            <Text accessibilityRole="header" style={styles.sectionTitle}>
              Errors per 100 words
            </Text>
            <Text style={styles.body}>{errorSummary(errorPoints.map((point) => point.value))}</Text>
            {errorPoints.length > 0 ? (
              <LineChart
                title="Errors per 100 words, by essay"
                points={errorPoints}
                format={(value) => value.toFixed(1)}
                startLabel="First"
                endLabel="Latest"
              />
            ) : null}
          </FadeUp>

          <FadeUp index={2} style={styles.section}>
            <Text accessibilityRole="header" style={styles.sectionTitle}>
              {mistakes.data && mistakes.data.length > 0
                ? `${mistakes.data.length} mistake${mistakes.data.length === 1 ? '' : 's'}, by type`
                : 'Mistakes, by type'}
            </Text>
            {groups.length === 0 && !mistakes.isPending ? (
              <Text style={styles.body}>
                Mistakes you mark in a self-check are counted here and become review cards.
              </Text>
            ) : null}
            {groups.map((group, groupIndex) => (
              <Pressable
                key={group.label}
                accessibilityRole="button"
                accessibilityLabel={`${group.label}, ${group.count}. Show these mistakes`}
                onPress={() =>
                  router.push({ pathname: '/mistakes', params: { type: group.label } })
                }
              >
                <BarRow
                  title={group.label}
                  value={String(group.count)}
                  fraction={group.count / maxCount}
                  index={groupIndex}
                >
                  <Text style={styles.example}>
                    <Text style={styles.struck}>{group.latest.original}</Text>{' '}
                    <Text style={styles.insertion}>{group.latest.corrected}</Text>
                  </Text>
                </BarRow>
              </Pressable>
            ))}
            {groups.length > 0 ? (
              <Button
                variant="secondary"
                label="See all mistakes"
                onPress={() => router.push('/mistakes')}
              />
            ) : null}
          </FadeUp>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function errorSummary(values: number[]): string {
  if (values.length === 0) {
    return 'Shown once you have checked an essay. Only the mistakes you mark are counted.';
  }
  const latest = values[values.length - 1] as number;
  if (values.length === 1) {
    return `${latest.toFixed(1)} in your first checked essay. Only the mistakes you mark are counted.`;
  }
  const first = values[0] as number;
  const direction = latest < first ? 'down' : latest > first ? 'up' : 'the same as';
  return direction === 'the same as'
    ? `${latest.toFixed(1)} in your latest essay, the same as your first.`
    : `${latest.toFixed(1)} in your latest essay, ${direction} from ${first.toFixed(1)} in your first.`;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  scroll: {
    paddingHorizontal: gutter.compact,
    paddingVertical: 20,
  },
  column: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    gap: 16,
  },
  title: {
    ...textStyles.pageTitle,
    color: colors.ink,
  },
  lead: {
    ...textStyles.lead,
    color: colors.ink,
  },
  body: {
    ...textStyles.bodySmall,
    color: colors.ink2,
  },
  caption: {
    ...textStyles.captionSmall,
    color: colors.ink2,
  },
  legend: {
    flexDirection: 'row',
    gap: 18,
    paddingTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  swatchSelfCheck: {
    width: 18,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.pencil,
    backgroundColor: colors.surface,
  },
  swatchTick: {
    width: 2,
    height: 14,
    backgroundColor: colors.ink,
  },
  section: {
    gap: 8,
    paddingTop: 8,
    borderTopWidth: borderWidth.hairline,
    borderTopColor: colors.rule,
  },
  sectionTitle: {
    ...textStyles.section,
    ...tabularNums,
    color: colors.ink,
  },
  example: {
    ...textStyles.bodySmall,
    color: colors.ink2,
  },
  struck: {
    textDecorationLine: 'line-through',
    textDecorationColor: colors.pencil,
  },
  insertion: {
    fontFamily: fonts.hand,
    fontSize: 18,
    color: colors.pencil,
  },
});
