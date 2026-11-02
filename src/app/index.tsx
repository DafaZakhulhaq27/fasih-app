import type { ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, gutter, textStyles } from '@/theme';

// Placeholder until the Today screen (docs/design/screens/02-main.png) is built.
export default function TodayScreen(): ReactElement {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text accessibilityRole="header" style={styles.wordmark}>
          Fasih
        </Text>
        <Text style={styles.body}>Your daily lesson, practice and review will appear here.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: gutter.regular,
    gap: 8,
  },
  wordmark: {
    ...textStyles.wordmark,
    color: colors.ink,
  },
  body: {
    ...textStyles.body,
    color: colors.ink2,
  },
});
