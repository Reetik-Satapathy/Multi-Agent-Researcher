import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';

export function readLocalStorage<T>(key: string, fallback: T): T {
  try {
    const stored = window.localStorage.getItem(key);
    return stored === null ? fallback : JSON.parse(stored) as T;
  } catch (error) {
    console.error(`Unable to read saved workspace data for "${key}".`, error);
    return fallback;
  }
}

export function writeLocalStorage<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Unable to save workspace data for "${key}".`, error);
  }
}

export function useLocalStorageState<T>(
  key: string,
  initialValue: T | (() => T),
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    const fallback = typeof initialValue === 'function'
      ? (initialValue as () => T)()
      : initialValue;
    return readLocalStorage(key, fallback);
  });

  useEffect(() => {
    writeLocalStorage(key, value);
  }, [key, value]);

  return [value, setValue];
}
