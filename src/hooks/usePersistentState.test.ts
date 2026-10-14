import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePersistentState } from './usePersistentState';

describe('usePersistentState', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('저장된 값이 없으면 fallback으로 시작한다', () => {
    const { result } = renderHook(() => usePersistentState('rcg:t', 'init'));
    expect(result.current[0]).toBe('init');
  });

  it('저장된 값이 있으면 초기 상태로 불러온다', () => {
    localStorage.setItem('rcg:t', JSON.stringify('saved'));
    const { result } = renderHook(() => usePersistentState('rcg:t', 'init'));
    expect(result.current[0]).toBe('saved');
  });

  it('값이 바뀌면 localStorage에 저장한다', () => {
    const { result } = renderHook(() => usePersistentState('rcg:t', 'init'));
    act(() => result.current[1]('next'));
    expect(result.current[0]).toBe('next');
    expect(JSON.parse(localStorage.getItem('rcg:t')!)).toBe('next');
  });

  it('parse 옵션으로 저장된 값을 검증/변환한다', () => {
    localStorage.setItem('rcg:t', JSON.stringify('weird'));
    const { result } = renderHook(() =>
      usePersistentState('rcg:t', 'a', { parse: (raw) => String(raw).toUpperCase() }),
    );
    expect(result.current[0]).toBe('WEIRD');
  });

  it('serialize 옵션으로 저장 형태를 변환한다', () => {
    const { result } = renderHook(() =>
      usePersistentState('rcg:t', 1, { serialize: (v) => ({ doubled: v * 2 }) }),
    );
    act(() => result.current[1](5));
    expect(JSON.parse(localStorage.getItem('rcg:t')!)).toEqual({ doubled: 10 });
  });
});
