import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { loadJSON, saveJSON } from './storage';

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('저장한 값을 그대로 다시 읽는다', () => {
    saveJSON('rcg:test', { a: 1, b: ['x'] });
    expect(loadJSON('rcg:test', null)).toEqual({ a: 1, b: ['x'] });
  });

  it('없는 키는 fallback을 반환한다', () => {
    expect(loadJSON('rcg:missing', 'fb')).toBe('fb');
  });

  it('손상된 JSON이면 fallback을 반환한다', () => {
    localStorage.setItem('rcg:bad', '{not json');
    expect(loadJSON('rcg:bad', ['fb'])).toEqual(['fb']);
  });

  it('getItem이 throw해도 fallback을 반환한다', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied');
    });
    expect(loadJSON('rcg:x', 'fb')).toBe('fb');
  });

  it('setItem이 throw(quota 초과)해도 예외가 전파되지 않는다', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('quota', 'QuotaExceededError');
    });
    expect(() => saveJSON('rcg:x', { a: 1 })).not.toThrow();
  });
});
