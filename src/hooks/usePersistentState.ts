import { useState, useEffect, type Dispatch, type SetStateAction } from 'react';
import { loadJSON, saveJSON } from '../utils/storage';

interface Options<T> {
  parse?: (raw: unknown) => T;
  serialize?: (value: T) => unknown;
}

const MISSING = Symbol('missing');

// parse/serialize는 모듈 상수처럼 안정적인 참조를 넘겨야 불필요한 재저장이 없다.
export function usePersistentState<T>(
  key: string,
  fallback: T,
  { parse, serialize }: Options<T> = {},
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    const raw = loadJSON<unknown>(key, MISSING);
    if (raw === MISSING) return fallback;
    return parse ? parse(raw) : (raw as T);
  });

  useEffect(() => {
    saveJSON(key, serialize ? serialize(value) : value);
  }, [key, value, serialize]);

  return [value, setValue];
}
