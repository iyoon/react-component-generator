import { describe, it, expect } from 'vitest';
import { parseProvider, parseApiKeys, DEFAULT_PROVIDER } from './settings';

describe('parseProvider', () => {
  it("'anthropic'과 'google'은 그대로 반환한다", () => {
    expect(parseProvider('anthropic')).toBe('anthropic');
    expect(parseProvider('google')).toBe('google');
  });

  it('알 수 없는 값은 기본값 google로 fallback한다', () => {
    expect(DEFAULT_PROVIDER).toBe('google');
    expect(parseProvider('openai')).toBe('google');
    expect(parseProvider(null)).toBe('google');
    expect(parseProvider(42)).toBe('google');
  });
});

describe('parseApiKeys', () => {
  it('provider별 문자열 키를 그대로 반환한다', () => {
    expect(parseApiKeys({ anthropic: 'a', google: 'g' })).toEqual({ anthropic: 'a', google: 'g' });
  });

  it('누락되었거나 문자열이 아닌 값은 빈 문자열로 채운다', () => {
    expect(parseApiKeys({ anthropic: 5 })).toEqual({ anthropic: '', google: '' });
  });

  it('객체가 아니면 모두 빈 문자열이다', () => {
    expect(parseApiKeys(null)).toEqual({ anthropic: '', google: '' });
    expect(parseApiKeys('x')).toEqual({ anthropic: '', google: '' });
  });
});
