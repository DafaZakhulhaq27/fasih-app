import { useSyncExternalStore } from 'react';
import { AccessibilityInfo } from 'react-native';

import { useReduceMotionAtStart } from '@/hooks/reduce-motion-at-start';

// One listener for the whole app, however many animated components ask.
let latest: boolean | null = null;
const listeners = new Set<() => void>();
let subscription: { remove: () => void } | null = null;

function update(enabled: boolean): void {
  if (enabled !== latest) {
    latest = enabled;
    listeners.forEach((notify) => notify());
  }
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (!subscription) {
    subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', update);
    // Catches a change made while nothing was listening.
    AccessibilityInfo.isReduceMotionEnabled()
      .then(update)
      .catch(() => undefined);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      subscription?.remove();
      subscription = null;
    }
  };
}

/** True while the system asks for reduced motion, including changes made while the app runs. */
export function useReduceMotion(): boolean {
  // Read synchronously at app start, so nothing animates before the first change event.
  const atStart = useReduceMotionAtStart();
  return useSyncExternalStore(subscribe, () => latest ?? atStart);
}
