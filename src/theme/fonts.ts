// Import each weight from its own subpath so unused weights stay out of the bundle.
import { AtkinsonHyperlegible_400Regular } from '@expo-google-fonts/atkinson-hyperlegible/400Regular';
import { AtkinsonHyperlegible_400Regular_Italic } from '@expo-google-fonts/atkinson-hyperlegible/400Regular_Italic';
import { AtkinsonHyperlegible_700Bold } from '@expo-google-fonts/atkinson-hyperlegible/700Bold';
import { Kalam_400Regular } from '@expo-google-fonts/kalam/400Regular';
import { Kalam_700Bold } from '@expo-google-fonts/kalam/700Bold';

// Passed to useFonts in the root layout. Each key becomes a fontFamily name.
export const fontAssets = {
  AtkinsonHyperlegible_400Regular,
  AtkinsonHyperlegible_400Regular_Italic,
  AtkinsonHyperlegible_700Bold,
  Kalam_400Regular,
  Kalam_700Bold,
};

// Custom fonts ignore fontWeight on Android, so every weight is its own family.
export const fonts = {
  body: 'AtkinsonHyperlegible_400Regular',
  bodyItalic: 'AtkinsonHyperlegible_400Regular_Italic',
  bodyBold: 'AtkinsonHyperlegible_700Bold',
  // Kalam is only for handwritten notes, insertions and the wordmark.
  hand: 'Kalam_400Regular',
  handBold: 'Kalam_700Bold',
} as const satisfies Record<string, keyof typeof fontAssets>;
