import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useComponentGenerator } from './useComponentGenerator';

const okResponse = (code = 'render(<div/>)') =>
  ({ ok: true, json: async () => ({ code }) }) as Response;
const failResponse = () =>
  ({ ok: false, json: async () => ({ error: 'boom' }) }) as Response;

const storedComponent = (id: string) => ({
  id,
  prompt: `p-${id}`,
  code: `c-${id}`,
  createdAt: '2026-01-02T03:04:05.000Z',
});

describe('useComponentGenerator 영속화', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('저장된 컴포넌트 목록을 초기 상태로 불러오고 createdAt을 Date로 복원한다', () => {
    localStorage.setItem('rcg:components', JSON.stringify([storedComponent('1')]));
    const { result } = renderHook(() => useComponentGenerator());
    expect(result.current.components).toHaveLength(1);
    expect(result.current.components[0].createdAt).toBeInstanceOf(Date);
  });

  it('손상된 저장값이면 빈 목록으로 시작한다', () => {
    localStorage.setItem('rcg:components', '{broken');
    const { result } = renderHook(() => useComponentGenerator());
    expect(result.current.components).toEqual([]);
  });

  it('저장된 히스토리를 초기 상태로 불러온다', () => {
    localStorage.setItem('rcg:history', JSON.stringify(['a', 'b']));
    const { result } = renderHook(() => useComponentGenerator());
    expect(result.current.history).toEqual(['a', 'b']);
  });

  it('생성에 성공하면 컴포넌트 목록이 localStorage에 저장된다', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(okResponse()));
    const { result } = renderHook(() => useComponentGenerator());

    await act(async () => {
      await result.current.generate('카드', undefined, 'google');
    });

    const saved = JSON.parse(localStorage.getItem('rcg:components')!);
    expect(saved).toHaveLength(1);
    expect(saved[0].prompt).toBe('카드');
    expect(typeof saved[0].createdAt).toBe('string');
  });

  it('생성 요청이 성공하면 히스토리에 기록된다', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(okResponse()));
    const { result } = renderHook(() => useComponentGenerator());

    await act(async () => {
      await result.current.generate('카드', undefined, 'google');
    });

    expect(result.current.history).toEqual(['카드']);
    expect(JSON.parse(localStorage.getItem('rcg:history')!)).toEqual(['카드']);
  });

  it('생성 요청이 실패해도 히스토리에 기록된다', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(failResponse()));
    const { result } = renderHook(() => useComponentGenerator());

    await act(async () => {
      await result.current.generate('실패 프롬프트', undefined, 'google');
    });

    expect(result.current.error).toBe('boom');
    expect(result.current.history).toEqual(['실패 프롬프트']);
  });

  it('같은 프롬프트를 다시 생성하면 히스토리에서 맨 앞으로 이동한다', async () => {
    localStorage.setItem('rcg:history', JSON.stringify(['a', 'b']));
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(okResponse()));
    const { result } = renderHook(() => useComponentGenerator());

    await act(async () => {
      await result.current.generate('b', undefined, 'google');
    });

    expect(result.current.history).toEqual(['b', 'a']);
  });

  it('removeComponent는 저장소에도 반영된다', async () => {
    localStorage.setItem(
      'rcg:components',
      JSON.stringify([storedComponent('1'), storedComponent('2')]),
    );
    const { result } = renderHook(() => useComponentGenerator());

    act(() => result.current.removeComponent('1'));

    await waitFor(() => {
      const saved = JSON.parse(localStorage.getItem('rcg:components')!);
      expect(saved.map((c: { id: string }) => c.id)).toEqual(['2']);
    });
  });

  it('clearAll은 저장소의 컴포넌트 목록도 비운다', () => {
    localStorage.setItem('rcg:components', JSON.stringify([storedComponent('1')]));
    const { result } = renderHook(() => useComponentGenerator());

    act(() => result.current.clearAll());

    expect(result.current.components).toEqual([]);
    expect(JSON.parse(localStorage.getItem('rcg:components')!)).toEqual([]);
  });

  it('컴포넌트가 50개를 넘으면 저장은 최신 50개로 제한된다', async () => {
    const existing = Array.from({ length: 50 }, (_, i) => storedComponent(String(i)));
    localStorage.setItem('rcg:components', JSON.stringify(existing));
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(okResponse()));
    const { result } = renderHook(() => useComponentGenerator());

    await act(async () => {
      await result.current.generate('new', undefined, 'google');
    });

    const saved = JSON.parse(localStorage.getItem('rcg:components')!);
    expect(saved).toHaveLength(50);
    expect(saved[0].prompt).toBe('new');
    expect(saved.map((c: { id: string }) => c.id)).not.toContain('49');
  });
});
