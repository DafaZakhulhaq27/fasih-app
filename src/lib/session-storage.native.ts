import AsyncStorage from '@react-native-async-storage/async-storage';
import * as aesjs from 'aes-js';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

// SecureStore holds about 2 KB per value and a Supabase session is larger. So the session is
// encrypted with AES-256-CTR: the key lives in SecureStore (Keychain / Keystore) and only the
// ciphertext goes to AsyncStorage. Based on the LargeSecureStore pattern in the Supabase Expo
// tutorial, with a stable key per item and a random counter per write, so two overlapping writes
// can never pair one write's key with the other's ciphertext.
class LargeSecureStore {
  async getItem(key: string): Promise<string | null> {
    const stored = await AsyncStorage.getItem(key);
    const keyHex = await SecureStore.getItemAsync(key);
    if (!stored || !keyHex) {
      return null;
    }
    const [counterHex, cipherHex] = stored.split(':');
    if (!counterHex || !cipherHex) {
      return null;
    }
    const cipher = new aesjs.ModeOfOperation.ctr(
      aesjs.utils.hex.toBytes(keyHex),
      new aesjs.Counter(aesjs.utils.hex.toBytes(counterHex)),
    );
    return aesjs.utils.utf8.fromBytes(cipher.decrypt(aesjs.utils.hex.toBytes(cipherHex)));
  }

  async setItem(key: string, value: string): Promise<void> {
    const encryptionKey = await this.getOrCreateKey(key);
    // A fresh random 128-bit counter per write, so the keystream is never reused.
    const counter = Crypto.getRandomValues(new Uint8Array(16));
    const cipher = new aesjs.ModeOfOperation.ctr(encryptionKey, new aesjs.Counter(counter));
    const encrypted = cipher.encrypt(aesjs.utils.utf8.toBytes(value));
    await AsyncStorage.setItem(
      key,
      `${aesjs.utils.hex.fromBytes(counter)}:${aesjs.utils.hex.fromBytes(encrypted)}`,
    );
  }

  async removeItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
    await SecureStore.deleteItemAsync(key);
  }

  private async getOrCreateKey(key: string): Promise<Uint8Array> {
    const existing = await SecureStore.getItemAsync(key);
    if (existing) {
      return aesjs.utils.hex.toBytes(existing);
    }
    const created = Crypto.getRandomValues(new Uint8Array(32));
    await SecureStore.setItemAsync(key, aesjs.utils.hex.fromBytes(created));
    return created;
  }
}

export const authStorage = new LargeSecureStore();
