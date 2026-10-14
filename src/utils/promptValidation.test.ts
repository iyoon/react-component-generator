import { describe, it, expect } from 'vitest';
import { validatePromptLength } from './promptValidation';

describe('validatePromptLength', () => {
  it('빈 문자열은 길이 0이며 유효하다', () => {
    expect(validatePromptLength('')).toEqual({ valid: true, length: 0, max: 500 });
  });

  it('정확히 500자는 유효하다', () => {
    expect(validatePromptLength('a'.repeat(500))).toEqual({ valid: true, length: 500, max: 500 });
  });

  it('501자는 유효하지 않다', () => {
    expect(validatePromptLength('a'.repeat(501))).toEqual({ valid: false, length: 501, max: 500 });
  });

  it('앞뒤 공백은 길이에서 제외된다', () => {
    expect(validatePromptLength('  ' + 'a'.repeat(500) + ' \n')).toEqual({
      valid: true,
      length: 500,
      max: 500,
    });
  });

  it('이모지는 코드포인트 1개로 계산한다', () => {
    expect(validatePromptLength('😀'.repeat(500))).toEqual({ valid: true, length: 500, max: 500 });
  });

  it('한글은 글자당 1로 계산한다', () => {
    expect(validatePromptLength('가'.repeat(501))).toEqual({ valid: false, length: 501, max: 500 });
  });

  it('max 인자를 지정하면 그 값을 기준으로 검증한다', () => {
    expect(validatePromptLength('abcdef', 5)).toEqual({ valid: false, length: 6, max: 5 });
    expect(validatePromptLength('abcde', 5)).toEqual({ valid: true, length: 5, max: 5 });
  });
});
