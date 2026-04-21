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
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function clearData(key: string): Promise<void> {
  await AsyncStorage.removeItem(key);
}

export const STORAGE_KEYS = {
  GAME: 'dinofocus:game',
  MISSIONS: 'dinofocus:missions',
  PARENT: 'dinofocus:parent',
} as const;
