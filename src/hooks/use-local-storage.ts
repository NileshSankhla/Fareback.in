"use client";

import { useCallback, useRef, useSyncExternalStore } from "react";

export const useLocalStorage = <T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((val: T) => T)) => void] => {
  const initialValueRef = useRef(initialValue);

  const subscribe = useCallback(
    (callback: () => void) => {
      const handler = (event: StorageEvent) => {
        if (event.key === key) callback();
      };
      window.addEventListener("storage", handler);
      return () => window.removeEventListener("storage", handler);
    },
    [key],
  );

  const getSnapshot = useCallback((): T => {
    try {
      const item = localStorage.getItem(key);
      return item !== null ? (JSON.parse(item) as T) : initialValueRef.current;
    } catch {
      return initialValueRef.current;
    }
  }, [key]);

  const getServerSnapshot = useCallback(
    (): T => initialValueRef.current,
    [],
  );

  const storedValue = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        const serialized = JSON.stringify(valueToStore);
        window.localStorage.setItem(key, serialized);
        window.dispatchEvent(new StorageEvent("storage", { key, newValue: serialized }));
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error(`Error setting localStorage key "${key}":`, error);
        }
      }
    },
    [key, storedValue],
  );

  return [storedValue, setValue];
};
