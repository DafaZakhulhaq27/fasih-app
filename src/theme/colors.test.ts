import { describe, expect, it } from 'vitest';

import { colors, type ColorToken } from './colors';

// WCAG 2.x relative luminance and contrast ratio.
function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const channel = parseInt(hex.slice(i, i + 2), 16) / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: ColorToken, b: ColorToken): number {
  const [light, dark] = [luminance(colors[a]), luminance(colors[b])].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

// [foreground, background] pairs the screens use for text.
const textPairs: [ColorToken, ColorToken][] = [
  ['ink', 'paper'],
  ['ink', 'surface'],
  ['ink', 'wash'],
  ['ink2', 'paper'],
  ['ink2', 'surface'],
  ['ink2', 'wash'],
  ['pencil', 'paper'],
  ['pencil', 'surface'],
  ['danger', 'surface'],
  ['surface', 'ink'],
  ['surface', 'pencil'],
];

// Marks that are not text: wavy underline, chevrons, focus ring.
const nonTextPairs: [ColorToken, ColorToken][] = [
  ['graphite', 'paper'],
  ['graphite', 'surface'],
  ['pencil', 'paper'],
];

describe('color tokens', () => {
  it.each(textPairs)('%s on %s meets WCAG AA for text (4.5:1)', (fg, bg) => {
    expect(contrast(fg, bg)).toBeGreaterThanOrEqual(4.5);
  });

  it.each(nonTextPairs)('%s on %s meets WCAG AA for non-text (3:1)', (fg, bg) => {
    expect(contrast(fg, bg)).toBeGreaterThanOrEqual(3);
  });
});
