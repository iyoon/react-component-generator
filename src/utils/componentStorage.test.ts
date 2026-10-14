import { describe, it, expect } from 'vitest';
import {
  MAX_STORED_COMPONENTS,
  serializeComponents,
  deserializeComponents,
} from './componentStorage';
import type { GeneratedComponent } from '../types';

const make = (id: string, iso = '2026-01-02T03:04:05.000Z'): GeneratedComponent => ({
  id,
  prompt: `p-${id}`,
  code: `c-${id}`,
  createdAt: new Date(iso),
});

describe('componentStorage', () => {
  it('직렬화 후 복원하면 createdAt이 Date로 복원된다', () => {
    const restored = deserializeComponents(serializeComponents([make('1')]));
    expect(restored).toHaveLength(1);
    expect(restored[0].createdAt).toBeInstanceOf(Date);
    expect(restored[0].createdAt.toISOString()).toBe('2026-01-02T03:04:05.000Z');
    expect(restored[0].id).toBe('1');
  });

  it('직렬화 결과의 createdAt은 문자열이다', () => {
    const [item] = serializeComponents([make('1')]);
    expect(item.createdAt).toBe('2026-01-02T03:04:05.000Z');
  });

  it('저장 상한은 50개다', () => {
    expect(MAX_STORED_COMPONENTS).toBe(50);
  });

  it('50개를 초과하면 오래된 것(뒤쪽)을 제거하고 앞쪽 50개만 저장한다', () => {
    const list = Array.from({ length: 55 }, (_, i) => make(String(i)));
    const result = serializeComponents(list);
    expect(result).toHaveLength(50);
    expect(result[0].id).toBe('0');
    expect(result[49].id).toBe('49');
  });

  it('배열이 아니면 빈 배열을 반환한다', () => {
    expect(deserializeComponents({ a: 1 })).toEqual([]);
    expect(deserializeComponents(null)).toEqual([]);
    expect(deserializeComponents('x')).toEqual([]);
  });

  it('필드가 누락되었거나 타입이 틀린 항목은 걸러낸다', () => {
    const valid = { id: '1', prompt: 'p', code: 'c', createdAt: '2026-01-02T03:04:05.000Z' };
    const result = deserializeComponents([
      valid,
      { ...valid, id: undefined },
      { ...valid, code: 5 },
      { id: '2', prompt: 'p', code: 'c' },
      null,
      'str',
    ]);
    expect(result.map((c) => c.id)).toEqual(['1']);
  });

  it('createdAt이 유효하지 않은 날짜 문자열인 항목은 걸러낸다', () => {
    const result = deserializeComponents([
      { id: '1', prompt: 'p', code: 'c', createdAt: 'not-a-date' },
    ]);
    expect(result).toEqual([]);
  });
});
