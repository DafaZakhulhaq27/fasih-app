import type { TextStyle } from 'react-native';

import { fonts } from './fonts';

// Sizes from docs/design/README.md (font size / line height).
export const textStyles = {
  pageTitle: { fontFamily: fonts.bodyBold, fontSize: 30, lineHeight: 36 },
  headline: { fontFamily: fonts.bodyBold, fontSize: 28, lineHeight: 34 },
  section: { fontFamily: fonts.bodyBold, fontSize: 20, lineHeight: 26 },
  cardTitle: { fontFamily: fonts.bodyBold, fontSize: 17, lineHeight: 24 },
  lead: { fontFamily: fonts.body, fontSize: 17, lineHeight: 26 },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24 },
  bodyStrong: { fontFamily: fonts.bodyBold, fontSize: 17, lineHeight: 24 },
  bodySmall: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22 },
  caption: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20 },
  captionSmall: { fontFamily: fonts.body, fontSize: 13, lineHeight: 18 },
  wordmark: { fontFamily: fonts.handBold, fontSize: 48, lineHeight: 54 },
} as const satisfies Record<string, TextStyle>;

/** Add to any text whose digits change (timers, word counts, bands). */
export const tabularNums = { fontVariant: ['tabular-nums'] } as const satisfies TextStyle;
