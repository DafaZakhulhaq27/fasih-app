import { webcrypto } from 'node:crypto';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// In-memory stand-ins for the native modules.
const asyncStore = new Map<string, string>();
const secureStore = new Map<string, string>();

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: async (key: string) => asyncStore.get(key) ?? null,
    setItem: async (key: string, value: string) => void asyncStore.set(key, value),
    removeItem: async (key: string) => void asyncStore.delete(key),
  },
}));

vi.mock('expo-secure-store', () => ({
  getItemAsync: async (key: string) => secureStore.get(key) ?? null,
  setItemAsync: async (key: string, value: string) => void secureStore.set(key, value),
  deleteItemAsync: async (key: string) => void secureStore.delete(key),
}));

vi.mock('expo-crypto', () => ({
  getRandomValues: (array: Uint8Array<ArrayBuffer>): Uint8Array<ArrayBuffer> =>
    webcrypto.getRandomValues(array),
}));

const { authStorage } = await import('./session-storage.native');

const KEY = 'sb-test-auth-token';
const session = JSON.stringify({ access_token: 'a'.repeat(1500), refresh_token: 'r' });

describe('LargeSecureStore', () => {
  beforeEach(() => {
    asyncStore.clear();
    secureStore.clear();
  });

  it('round-trips a session larger than SecureStore allows', async () => {
    await authStorage.setItem(KEY, session);
    expect(await authStorage.getItem(KEY)).toBe(session);
    expect(asyncStore.get(KEY)).not.toContain('access_token');
    expect(secureStore.get(KEY)).toHaveLength(64);
  });

  it('encrypts the same value differently on every write', async () => {
    await authStorage.setItem(KEY, session);
    const first = asyncStore.get(KEY);
    await authStorage.setItem(KEY, session);
    expect(asyncStore.get(KEY)).not.toBe(first);
  });

  it('keeps the last value readable when writes overlap', async () => {
    await authStorage.setItem(KEY, 'first');
    await Promise.all([authStorage.setItem(KEY, 'second'), authStorage.setItem(KEY, 'third')]);
    expect(['second', 'third']).toContain(await authStorage.getItem(KEY));
  });

  it('returns null after removal or when nothing was stored', async () => {
    expect(await authStorage.getItem(KEY)).toBeNull();
    await authStorage.setItem(KEY, session);
    await authStorage.removeItem(KEY);
    expect(await authStorage.getItem(KEY)).toBeNull();
    expect(secureStore.has(KEY)).toBe(false);
  });
});
