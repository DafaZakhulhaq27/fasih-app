import type { ReactElement } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { borderWidth, colors, gutter, radius, textStyles } from '@/theme';

// docs/design/screens/03-learn.png, once the curriculum data exists (Fase 0 step 8).
const firstWeeks = [
  { week: 1, topic: 'Education', focus: 'Task 2 opinion essays; Part 1 answers with reasons' },
  { week: 2, topic: 'Technology', focus: 'Task 2 discussion essays; a 1-minute Part 2 plan' },
];

export default function LearnScreen(): ReactElement {
  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.column}>
          <Text accessibilityRole="header" style={styles.title}>
            Learn
          </Text>
          <Text style={styles.body}>
            A 12-week IELTS track: five short lessons each week and a Saturday checkpoint. The
            lessons for weeks 1 and 2 are being written and checked by hand, and will appear here.
          </Text>
          {firstWeeks.map((week) => (
            <View key={week.week} style={styles.card}>
              <Text style={styles.meta}>Week {week.week}</Text>
              <Text style={styles.cardTitle}>{week.topic}</Text>
              <Text style={styles.body}>{week.focus}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
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
    gap: 14,
  },
  title: {
    ...textStyles.pageTitle,
    color: colors.ink,
  },
  body: {
    ...textStyles.bodySmall,
    color: colors.ink2,
  },
  card: {
    gap: 4,
    padding: 16,
    backgroundColor: colors.surface,
    borderWidth: borderWidth.hairline,
    borderColor: colors.rule,
    borderRadius: radius.card,
  },
  meta: {
    ...textStyles.captionSmall,
    color: colors.ink2,
  },
  cardTitle: {
    ...textStyles.cardTitle,
    color: colors.ink,
  },
});
