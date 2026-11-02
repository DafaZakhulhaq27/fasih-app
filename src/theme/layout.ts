// Layout values from docs/design/README.md.
export const radius = {
  card: 4,
  button: 10,
  segmented: 12,
} as const;

export const borderWidth = {
  /** Card borders and dividers */
  hairline: 1,
  /** Secondary and destructive button outlines */
  control: 1.5,
} as const;

/** Minimum width and height of anything tappable, in points. */
export const touchTarget = 44;

/** Side gutters on the 390pt mobile baseline. */
export const gutter = {
  compact: 16,
  regular: 24,
} as const;

/** Width of the `pencil` focus ring. */
export const focusRingWidth = 2;
