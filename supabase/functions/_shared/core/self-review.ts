import { z } from 'zod';

import { averageBand } from './band.ts';
import { criteria } from './feedback.ts';

// The shape of attempts.self_review: what the writer ticked and the band they gave each criterion.
// Edge Functions read it to compare self bands with AI estimates (docs/plan.md, "Selisih band sendiri
// vs AI").

const halfBand = z
  .number()
  .min(0)
  .max(9)
  .refine((band) => Number.isInteger(band * 2), 'Bands are whole or half bands');

export const selfReviewSchema = z.object({
  version: z.literal(1),
  /** Checklist item ids that were ticked. */
  checked: z.array(z.string().min(1)),
  /** The writer's own band per criterion. */
  bands: z.partialRecord(z.enum(criteria), halfBand),
});

export type SelfReview = z.infer<typeof selfReviewSchema>;

/** Overall self band, rounded like the real test, or null until every given criterion has a band. */
export function selfReviewOverall(
  review: Pick<SelfReview, 'bands'>,
  required: readonly (typeof criteria)[number][],
): number | null {
  const bands = required.map((criterion) => review.bands[criterion]);
  if (bands.some((band) => band === undefined)) {
    return null;
  }
  return averageBand(bands as number[]);
}
