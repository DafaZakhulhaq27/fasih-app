const atStart =
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Whether the browser asked for reduced motion when the app loaded. */
export function useReduceMotionAtStart(): boolean {
  return atStart;
}
