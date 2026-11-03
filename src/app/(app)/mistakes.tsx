import { mistakeTypeLabel } from '@core/mistake-types.ts';
import { useLocalSearchParams, useRouter } from 'expo-router';
import type { ReactElement } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/screen-header';
import { type MistakeListItem, useMistakes } from '@/data/progress';
import { borderWidth, colors, fonts, gutter, textStyles } from '@/theme';

/** The Mistake Bank: every active mistake, newest first, optionally one type only. */
export default function MistakesScreen(): ReactElement {
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type?: string }>();
  const mistakes = useMistakes();
  const rows = (mistakes.data ?? []).filter(
    (row) => !type || mistakeTypeLabel(row.category, row.subcategory) === type,
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={rows}
        keyExtractor={(row) => row.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <ScreenHeader
              title="Mistake Bank"
              subtitle={
                type
                  ? `${type}: ${rows.length} mistake${rows.length === 1 ? '' : 's'}`
                  : `${rows.length} mistake${rows.length === 1 ? '' : 's'}, newest first`
              }
              onBack={() => router.back()}
            />
            {mistakes.isPending ? <Text style={styles.body}>Loading…</Text> : null}
            {mistakes.isError ? (
              <Text accessibilityRole="alert" style={styles.body}>
                Could not load your mistakes: {mistakes.error.message}
              </Text>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          mistakes.isPending ? undefined : (
            <Text style={styles.body}>
              Nothing here yet. Mistakes you mark in a self-check are kept here.
            </Text>
          )
        }
        renderItem={({ item }) => <MistakeItem item={item} />}
      />
    </SafeAreaView>
  );
}

function MistakeItem({ item }: { item: MistakeListItem }): ReactElement {
  return (
    <View style={styles.item}>
      <Text style={styles.line}>
        <Text style={styles.struck}>{item.original}</Text>{' '}
        <Text style={styles.insertion}>{item.corrected}</Text>
      </Text>
      <Text style={styles.meta}>
        {mistakeTypeLabel(item.category, item.subcategory)} ·{' '}
        {new Date(item.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
        {item.source === 'self' ? ' · marked by you' : item.source === 'ai' ? ' · AI' : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  list: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    paddingHorizontal: gutter.compact,
    paddingVertical: 16,
  },
  header: {
    gap: 8,
    paddingBottom: 8,
  },
  body: {
    ...textStyles.bodySmall,
    color: colors.ink2,
  },
  item: {
    gap: 4,
    paddingVertical: 12,
    borderBottomWidth: borderWidth.hairline,
    borderBottomColor: colors.rule,
  },
  line: {
    ...textStyles.body,
    color: colors.ink,
  },
  struck: {
    color: colors.ink2,
    textDecorationLine: 'line-through',
    textDecorationColor: colors.pencil,
  },
  insertion: {
    fontFamily: fonts.hand,
    fontSize: 19,
    color: colors.pencil,
  },
  meta: {
    ...textStyles.captionSmall,
    color: colors.ink2,
  },
});
