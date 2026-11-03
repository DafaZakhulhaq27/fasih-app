import { useRouter } from 'expo-router';
import type { ReactElement } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { useDueCount } from '@/data/review';
import { colors, gutter, tabularNums, textStyles } from '@/theme';

export default function ReviewTab(): ReactElement {
  const router = useRouter();
  const dueCount = useDueCount();
  const due = dueCount.data ?? 0;

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.column}>
          <Text accessibilityRole="header" style={styles.title}>
            Review
          </Text>
          <Text style={styles.count}>
            {dueCount.isPending ? '…' : `${due} card${due === 1 ? '' : 's'} due`}
          </Text>
          {dueCount.isError ? (
            <Text accessibilityRole="alert" style={styles.body}>
              Could not count your cards: {dueCount.error.message}
            </Text>
          ) : null}
          <Text style={styles.body}>
            Cards come from the mistakes you mark in a self-check. Each one comes back just before
            you are likely to forget it, sooner if you found it hard.
          </Text>
          {due > 0 ? (
            <Button label="Start review" onPress={() => router.push('/review-session')} />
          ) : (
            <Button
              variant="secondary"
              label="Write a Task 2 essay"
              onPress={() => router.push('/write')}
            />
          )}
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
  count: {
    ...textStyles.headline,
    ...tabularNums,
    color: colors.ink,
  },
  body: {
    ...textStyles.bodySmall,
    color: colors.ink2,
  },
});
