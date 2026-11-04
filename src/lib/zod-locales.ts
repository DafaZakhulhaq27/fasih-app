// Stands in for zod's locale index in the app bundle (see metro.config.js), so `z.locales` holds
// English only. Vitest and Edge Functions still load zod's full index.
export { default as en } from 'zod/v4/locales/en.js';
