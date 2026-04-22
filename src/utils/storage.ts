import AsyncStorage from '@react-native-async-storage/async-storage';

export async function loadData<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export async function saveData<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or serialization error — fail silently
  }
}

export async function clearData(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    // ignore removal errors
  }
}

export const STORAGE_KEYS = {
  GAME: 'dinofocus:game',
  MISSIONS: 'dinofocus:missions',
  PARENT: 'dinofocus:parent',
} as const;
