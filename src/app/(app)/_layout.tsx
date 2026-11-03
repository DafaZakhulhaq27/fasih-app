import { Stack } from 'expo-router';
import type { ReactElement } from 'react';

import { colors } from '@/theme';

// Everything in this group needs a session; the root layout guards the whole group.
export default function AppLayout(): ReactElement {
  return (
    <Stack
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.paper } }}
    />
  );
}
