// Color tokens from docs/design/README.md. Use these instead of ad-hoc colors.
export const colors = {
  /** App background */
  paper: '#F5F7FB',
  /** Cards, inputs, buttons on paper */
  surface: '#FFFFFF',
  /** Primary text, primary button background */
  ink: '#18233A',
  /** Secondary text, captions */
  ink2: '#4A5670',
  /** Dividers, card borders */
  rule: '#DCE5F1',
  /** Ruled lines behind essay text */
  ruleStrong: '#D5E1EF',
  /** Control borders, inactive day boxes */
  border: '#C9D6E8',
  /** Tracks, segmented control background, question box */
  wash: '#E9EEF6',
  /** Exercise-book margin line only */
  margin: '#EBB0B6',
  /** Accent: corrections, progress, focus ring, selected states */
  pencil: '#1F56C8',
  /** Wavy "could sound more natural" underline, chevrons, experimental scores */
  graphite: '#7C8598',
  /** Destructive actions only */
  danger: '#B42318',
} as const;

export type ColorToken = keyof typeof colors;
