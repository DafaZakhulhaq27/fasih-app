import { type Card, createEmptyCard, fsrs, type Grade, type ReviewLog } from 'ts-fsrs';
import { z } from 'zod';

// Spaced repetition with ts-fsrs (docs/plan.md: "FSRS tetap dihitung di app dengan ts-fsrs"). The
// state is stored as JSON in review_cards.fsrs so the schema does not depend on the library version;
// due dates are a separate indexed column.

/** Share of cards the scheduler aims to have remembered when they come back. */
export const REQUEST_RETENTION = 0.9;

const scheduler = fsrs({ request_retention: REQUEST_RETENTION });

export const reviewRatings = [1, 2, 3, 4] as const;
export type ReviewRating = (typeof reviewRatings)[number];

export const ratingLabels: Record<ReviewRating, string> = {
  1: 'Again',
  2: 'Hard',
  3: 'Good',
  4: 'Easy',
};

const isoDate = z.iso.datetime({ offset: true });

export const storedCardSchema = z.object({
  due: isoDate,
  stability: z.number(),
  difficulty: z.number(),
  elapsed_days: z.number(),
  scheduled_days: z.number(),
  learning_steps: z.number(),
  reps: z.number(),
  lapses: z.number(),
  state: z.number().int().min(0).max(3),
  last_review: isoDate.nullable(),
});

export type StoredCard = z.infer<typeof storedCardSchema>;

export type StoredLog = Omit<ReviewLog, 'due' | 'review' | 'rating' | 'state'> & {
  rating: ReviewRating;
  state: number;
  due: string;
  review: string;
};

function toStored(card: Card): StoredCard {
  return {
    due: card.due.toISOString(),
    stability: card.stability,
    difficulty: card.difficulty,
    elapsed_days: card.elapsed_days,
    scheduled_days: card.scheduled_days,
    learning_steps: card.learning_steps,
    reps: card.reps,
    lapses: card.lapses,
    state: card.state,
    last_review: card.last_review ? card.last_review.toISOString() : null,
  };
}

function toStoredLog(log: ReviewLog): StoredLog {
  return {
    ...log,
    rating: log.rating as ReviewRating,
    state: log.state,
    due: log.due.toISOString(),
    review: log.review.toISOString(),
  };
}

/** Scheduling state for a card that has never been reviewed; it is due straight away. */
export function newCardState(now: Date): { due: string; fsrs: StoredCard } {
  const card = toStored(createEmptyCard(now));
  return { due: card.due, fsrs: card };
}

/** Reads review_cards.fsrs, or null when it does not have the expected shape. */
export function parseCardState(value: unknown): StoredCard | null {
  const result = storedCardSchema.safeParse(value);
  return result.success ? result.data : null;
}

export type RatingResult = { due: string; fsrs: StoredCard; log: StoredLog };

/** The card's next state for a rating given at `now`. */
export function applyRating(state: StoredCard, rating: ReviewRating, now: Date): RatingResult {
  const { card, log } = scheduler.next(state, now, rating as Grade);
  return { due: card.due.toISOString(), fsrs: toStored(card), log: toStoredLog(log) };
}

/** When the card would come back for each rating, for the labels on the rating buttons. */
export function previewRatings(
  state: StoredCard,
  now: Date,
): Record<ReviewRating, { due: string; interval: string }> {
  const preview = scheduler.repeat(state, now);
  const entry = (rating: ReviewRating): { due: string; interval: string } => {
    const due = preview[rating as Grade].card.due;
    return { due: due.toISOString(), interval: formatInterval(now, due) };
  };
  return { 1: entry(1), 2: entry(2), 3: entry(3), 4: entry(4) };
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** A short, human interval such as "1 min", "8 min", "3 h", "2 days" or "4 mo". */
export function formatInterval(from: Date, to: Date): string {
  const ms = Math.max(0, to.getTime() - from.getTime());
  if (ms < HOUR) {
    return `${Math.max(1, Math.round(ms / MINUTE))} min`;
  }
  if (ms < DAY) {
    return `${Math.round(ms / HOUR)} h`;
  }
  const days = Math.round(ms / DAY);
  if (days < 31) {
    return days === 1 ? '1 day' : `${days} days`;
  }
  const months = Math.round(days / 30);
  if (months < 12) {
    return `${months} mo`;
  }
  const years = Math.round((days / 365) * 10) / 10;
  return `${years} yr`;
}
