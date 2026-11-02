import { describe, expect, it } from 'vitest';

import { parseEnv } from './env';

const valid = {
  EXPO_PUBLIC_SUPABASE_URL: 'http://127.0.0.1:54321',
  EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_test',
};

describe('parseEnv', () => {
  it('accepts the required public values', () => {
    expect(parseEnv(valid)).toEqual(valid);
  });

  it('treats an empty Google client ID as not set', () => {
    expect(parseEnv({ ...valid, EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: '' })).toEqual(valid);
  });

  it('names the missing variable', () => {
    expect(() => parseEnv({ ...valid, EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: ' ' })).toThrow(
      /EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY/,
    );
  });

  it('rejects a Supabase URL that is not a URL', () => {
    expect(() => parseEnv({ ...valid, EXPO_PUBLIC_SUPABASE_URL: 'localhost' })).toThrow(
      /EXPO_PUBLIC_SUPABASE_URL/,
    );
  });
});
