// Reanimated reads the setting synchronously when the app starts (iOS and Android).
// The web build uses reduce-motion-at-start.web.ts, so Reanimated stays out of its bundle.
export { useReducedMotion as useReduceMotionAtStart } from 'react-native-reanimated';
