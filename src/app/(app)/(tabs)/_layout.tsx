import { Tabs, type TabsScreenOptions } from 'expo-router/js-tabs';
import type { ReactElement } from 'react';
import { type ColorValue, StyleSheet, Text, View } from 'react-native';

import {
  LearnIcon,
  PracticeIcon,
  ProgressIcon,
  ReviewIcon,
  TodayIcon,
} from '@/components/tab-icons';
import { MotionView, useStateTransition } from '@/components/motion';
import { colors, fonts, motion, textStyles } from '@/theme';

// Five tabs; the active one gets a short pencil underline (docs/design/README.md "Tab bar").
export default function TabsLayout(): ReactElement {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.paper },
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.ink2,
        tabBarStyle: styles.bar,
      }}
    >
      <Tabs.Screen name="index" options={tab('Today', TodayIcon)} />
      <Tabs.Screen name="learn" options={tab('Learn', LearnIcon)} />
      <Tabs.Screen name="practice" options={tab('Practice', PracticeIcon)} />
      <Tabs.Screen name="review" options={tab('Review', ReviewIcon)} />
      <Tabs.Screen name="progress" options={tab('Progress', ProgressIcon)} />
    </Tabs>
  );
}

function tab(
  title: string,
  Icon: (props: { color: ColorValue }) => ReactElement,
): TabsScreenOptions {
  return {
    title,
    tabBarIcon: ({ color }) => <Icon color={color} />,
    tabBarLabel: ({ focused, color }) => <TabLabel title={title} focused={focused} color={color} />,
  };
}

/** The pencil underline draws out from the middle when a tab becomes active. */
function TabLabel({
  title,
  focused,
  color,
}: {
  title: string;
  focused: boolean;
  color: ColorValue;
}): ReactElement {
  const draw = useStateTransition(['transform', 'opacity'], motion.enter);
  return (
    <View style={styles.labelBox}>
      <Text style={[styles.label, { color }, focused && styles.labelActive]}>{title}</Text>
      <MotionView
        style={[
          styles.underline,
          { opacity: focused ? 1 : 0, transform: [{ scaleX: focused ? 1 : 0.2 }] },
          draw,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: 76,
    paddingTop: 8,
    backgroundColor: colors.surface,
    borderTopColor: colors.rule,
  },
  labelBox: {
    alignItems: 'center',
    gap: 3,
  },
  label: {
    ...textStyles.captionSmall,
  },
  labelActive: {
    fontFamily: fonts.bodyBold,
  },
  underline: {
    width: 22,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.pencil,
  },
});
