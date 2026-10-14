import { describe, it, expect } from 'vitest';
import { addToHistory } from './history';

describe('addToHistory', () => {
  it('새 프롬프트를 맨 앞에 추가한다', () => {
    expect(addToHistory(['a'], 'b')).toEqual(['b', 'a']);
  });

  it('중복이면 기존 항목을 제거하고 맨 앞으로 옮긴다', () => {
    expect(addToHistory(['a', 'b', 'c'], 'b')).toEqual(['b', 'a', 'c']);
  });

  it('앞뒤 공백을 trim해 저장한다', () => {
    expect(addToHistory(['a'], '  b  ')).toEqual(['b', 'a']);
  });

  it('trim 후 빈 문자열은 무시한다', () => {
    expect(addToHistory(['a'], '   ')).toEqual(['a']);
  });

  it('max를 초과하면 오래된 항목을 잘라낸다', () => {
    expect(addToHistory(['a', 'b', 'c'], 'd', 3)).toEqual(['d', 'a', 'b']);
  });

  it('기본 max는 20이다', () => {
    const history = Array.from({ length: 20 }, (_, i) => `p${i}`);
    const result = addToHistory(history, 'new');
    expect(result).toHaveLength(20);
    expect(result[0]).toBe('new');
    expect(result).not.toContain('p19');
  });

  it('원본 배열을 변경하지 않는다', () => {
    const history = ['a'];
    addToHistory(history, 'b');
    expect(history).toEqual(['a']);
  });
});
