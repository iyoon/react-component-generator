import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

describe('App 설정 영속화', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ envKeys: { anthropic: false, google: false } }),
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('저장된 provider와 해당 provider의 API 키로 시작한다', () => {
    localStorage.setItem('rcg:provider', JSON.stringify('anthropic'));
    localStorage.setItem('rcg:apiKeys', JSON.stringify({ anthropic: 'key-a', google: 'key-g' }));
    render(<App />);

    expect(screen.getByLabelText('Provider')).toHaveValue('anthropic');
    expect(screen.getByLabelText('API Key')).toHaveValue('key-a');
  });

  it('저장된 provider가 유효하지 않으면 google로 시작한다', () => {
    localStorage.setItem('rcg:provider', JSON.stringify('openai'));
    render(<App />);
    expect(screen.getByLabelText('Provider')).toHaveValue('google');
  });

  it('API 키를 입력하면 현재 provider의 키로 저장된다', () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText('API Key'), { target: { value: 'my-key' } });

    expect(JSON.parse(localStorage.getItem('rcg:apiKeys')!)).toEqual({
      anthropic: '',
      google: 'my-key',
    });
  });

  it('provider를 전환해도 다른 provider의 키는 유지되고 입력창은 현재 provider의 키를 보여준다', () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText('API Key'), { target: { value: 'g-key' } });

    fireEvent.change(screen.getByLabelText('Provider'), { target: { value: 'anthropic' } });
    expect(screen.getByLabelText('API Key')).toHaveValue('');
    fireEvent.change(screen.getByLabelText('API Key'), { target: { value: 'a-key' } });

    fireEvent.change(screen.getByLabelText('Provider'), { target: { value: 'google' } });
    expect(screen.getByLabelText('API Key')).toHaveValue('g-key');
    expect(JSON.parse(localStorage.getItem('rcg:apiKeys')!)).toEqual({
      anthropic: 'a-key',
      google: 'g-key',
    });
  });

  it('provider 선택이 localStorage에 저장된다', () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText('Provider'), { target: { value: 'anthropic' } });
    expect(JSON.parse(localStorage.getItem('rcg:provider')!)).toBe('anthropic');
  });
});
