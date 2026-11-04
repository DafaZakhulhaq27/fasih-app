// Motion tokens. The design has no motion spec, so these follow its tone: short, ease-out, moving
// only transform, opacity and colors. Every animation is skipped under the system's Reduce Motion
// (see src/hooks/use-reduce-motion.ts). Durations are in milliseconds.
export const motion = {
  /** Press feedback on buttons and chips. */
  press: 120,
  /** A selection or color changing state. */
  state: 200,
  /** Content arriving on screen. */
  enter: 320,
  /** Gap between items that arrive together. */
  stagger: 60,
  /** A pen stroke being drawn. */
  draw: 700,
  /** How far content rises as it arrives, in points. */
  rise: 8,
  /** Pressed controls shrink to this scale. */
  pressScale: 0.97,
  /** Pressed controls that also dim go to this opacity. */
  pressDim: 0.85,
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
} as const;
