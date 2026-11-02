import { describe, expect, it } from 'vitest';

import { isLocalUrl } from './local-url';

describe('isLocalUrl', () => {
  it.each([
    'http://127.0.0.1:54321',
    'http://localhost:54321',
    'http://api.localhost:8081',
    'http://[::1]:54321',
    'http://10.0.2.2:54321',
    'http://192.168.1.20:54321',
    'http://172.20.0.5:54321',
  ])('treats %s as local', (url) => {
    expect(isLocalUrl(url)).toBe(true);
  });

  it.each([
    'https://abcdefgh.supabase.co',
    'https://localhost.example.com',
    'http://172.32.0.1:54321',
    'http://8.8.8.8',
    'http://192.169.0.1',
    'not a url',
  ])('treats %s as not local', (url) => {
    expect(isLocalUrl(url)).toBe(false);
  });
});
