# Fasih design reference

The screens were designed on a canvas before any code existed. Treat them as the visual target, not as code to copy: rebuild them as React Native components with the tokens below.

- `screens/` — PNG renders of every screen at 1.5x, with the real fonts.
- `source/` — the original canvas files (`*.dc.html`). They need the canvas runtime to render, but they are the place to read exact spacing, sizes and copy. `{{pencil}}` is the accent color token; `sc-for` blocks are lists filled from the `renderVals()` data at the bottom of each file.

## Screens

| PNG | Screen | Suggested route | Notes |
| --- | --- | --- | --- |
| `01-signin` | Sign in | `/(auth)/sign-in` | Google only, invite-only note, privacy note. Use Google's official sign-in button asset in the app. |
| `02-main` | Today | `/(tabs)/` | Today's lesson, review, free practice, weakest criterion. Avatar opens Account. |
| `03-learn` | Learn | `/(tabs)/learn` | 12-week IELTS track, this week's 5 lessons + Saturday checkpoint. |
| `04-lesson` | Lesson, notice step | `/lesson/[id]` | Four-step progress: Input, Notice, Practice, Produce. |
| `05-lessonquiz` | Lesson, practice step | `/lesson/[id]` | Matching headings question with answer explanation. |
| `06-write` | Writing Task 2, AI feedback | `/write/[attemptId]` | Band per criterion with evidence, corrections, band 7–8 version. |
| `07-writeself` | Writing Task 2, self-check | `/write/[attemptId]?check=self` | No AI: app-computed stats, checklist, own band, model answer, mark own mistakes. |
| `08-speakrecord` | Speaking Part 2, recording | `/speak/[promptId]` | Cue card, 2-minute cap. |
| `09-speakfeedback` | Speaking Part 2, AI feedback | `/speak/[attemptId]/feedback` | Band per criterion, timeline of speech, fillers and pauses. |
| `10-review` | Review card | `/(tabs)/review` | FSRS rating buttons with next interval. |
| `11-mistakes` | Progress | `/(tabs)/progress` | Band per skill (official test vs AI estimate), errors per 100 words, mistakes by type. |
| `12-languages` | Languages | `/languages` | English active; Arabic and Mandarin "not available yet". |
| `13-account` | Account | `/account` | IELTS plan, default check mode, AI opt-out, sync, AI quota, admin, privacy, sign out, delete account. |
| `14-writedesktop` | Writing Task 2, test mode (web) | `/write/test` | Mirrors the computer-delivered test: timer, word count, spell-check and autocorrect off. |

Self-check for Speaking follows the same pattern as `07-writeself` and is not drawn yet.

## Concept

A blue-pencil exercise book. The paper is calm and ruled; the teacher's pencil is the only strong color, and it is used for corrections, progress and focus. Handwriting (Kalam) appears only where a teacher would write: insertions, margin notes, short encouragements, the wordmark.

## Color tokens

| Token | Value | Use |
| --- | --- | --- |
| `paper` | `#F5F7FB` | App background |
| `surface` | `#FFFFFF` | Cards, inputs, buttons on paper |
| `ink` | `#18233A` | Primary text, primary button background |
| `ink2` | `#4A5670` | Secondary text, captions |
| `rule` | `#DCE5F1` | Dividers, card borders |
| `ruleStrong` | `#D5E1EF` | Ruled lines behind essay text |
| `border` | `#C9D6E8` | Control borders, inactive day boxes |
| `wash` | `#E9EEF6` | Tracks, segmented control background, question box |
| `margin` | `#EBB0B6` | Exercise-book margin line only |
| `pencil` | `#1F56C8` | Accent: corrections, progress, focus ring, selected states |
| `graphite` | `#7C8598` | Wavy underline for "could sound more natural", chevrons, experimental scores |
| `danger` | `#B42318` | Destructive actions only (delete account) |

`pencil` has two user-selectable alternatives in the canvas, `#1C7A57` and `#6B3FC9`; ship the blue first.

## Typography

- **Atkinson Hyperlegible** 400 and 700 for all UI and body text.
- **Kalam** 400 and 700 only for handwritten notes, insertions and the wordmark. Never for body copy or buttons.
- Sizes used: page title 30/36, headline 28/34, section 20/26, card title 17/24, body 15–16/22–26, caption 13–14/18–20. Numbers that change use `tabular-nums`.

## Correction marks

| Mark | Meaning | How it looks |
| --- | --- | --- |
| Strike-through | Mistake | 2px `pencil` line through the word, correction in Kalam above it |
| Caret | Missing word | Small `pencil` caret, inserted word in Kalam above |
| Wavy underline | Correct but could sound more natural | 1.5px `graphite` wavy underline |
| Superscript number | Links a mark to its explanation in the list below | Kalam, `pencil` |

## Components

- **Buttons:** height 44–52, radius 10. Primary = `ink` background, white text. Secondary = 1.5px `ink` outline. Destructive = 1.5px `danger` outline with `danger` text.
- **Cards:** `surface`, 1px `rule` border, radius 4. Essay cards add the `margin` line and ruled background.
- **Segmented control:** `wash` track, radius 12; selected segment is `surface` with a light shadow.
- **Band chips:** five equal chips, the chosen one filled with `pencil`.
- **Tab bar:** 76px, five tabs (Today, Learn, Practice, Review, Progress); the active tab gets a short `pencil` underline.
- **Estimate labels:** dashed `border` pill reading "estimate" (AI) or "self-check" (manual). The two are never mixed in one chart.

## Layout and accessibility

- Mobile baseline 390pt wide, 16–24 side gutters. Desktop test mode uses two columns: question left, editor right.
- Touch targets at least 44×44. Every input has a label; icon-only buttons have an accessible label.
- Focus ring: 2px `pencil`.
- Keep `start`/`end` instead of `left`/`right` so a right-to-left language can be added later.
