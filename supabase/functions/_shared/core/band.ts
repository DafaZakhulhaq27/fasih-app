// Band arithmetic is done here, never by the model (CLAUDE.md rule 6).

/**
 * Rounds to the nearest half band, with quarters rounding up, as for the overall IELTS band:
 * 6.25 -> 6.5, 6.75 -> 7.0, 6.125 -> 6.0. Results are clamped to 0-9.
 */
export function roundBand(value: number): number {
  if (!Number.isFinite(value)) {
    throw new RangeError(`Band must be a finite number, got ${value}`);
  }
  const rounded = Math.floor(value * 2 + 0.5) / 2;
  return Math.min(9, Math.max(0, rounded));
}

/** Mean of the bands rounded with roundBand, or null when there are none. */
export function averageBand(bands: readonly number[]): number | null {
  if (bands.length === 0) {
    return null;
  }
  const sum = bands.reduce((total, band) => total + band, 0);
  return roundBand(sum / bands.length);
}
