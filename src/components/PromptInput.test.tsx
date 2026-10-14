import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PromptInput } from './PromptInput';

describe('PromptInput', () => {
  it('프롬프트가 비어 있으면 생성 버튼이 비활성이다', () => {
    render(<PromptInput onGenerate={vi.fn()} isLoading={false} />);
    expect(screen.getByRole('button', { name: '컴포넌트 생성' })).toBeDisabled();
  });

  it('입력하면 버튼이 활성화되고 클릭 시 입력값으로 onGenerate가 호출된다', async () => {
    const onGenerate = vi.fn();
    const user = userEvent.setup();
    render(<PromptInput onGenerate={onGenerate} isLoading={false} />);

    await user.type(screen.getByRole('textbox'), '프로필 카드');
    const submit = screen.getByRole('button', { name: '컴포넌트 생성' });
    expect(submit).toBeEnabled();

    await user.click(submit);
    expect(onGenerate).toHaveBeenCalledWith('프로필 카드');
  });

  it('로딩 중에는 생성 버튼이 비활성이고 "생성 중..." 을 보여준다', () => {
    render(<PromptInput onGenerate={vi.fn()} isLoading={true} />);
    expect(screen.getByRole('button', { name: '생성 중...' })).toBeDisabled();
  });

  it('글자 수 카운터가 현재/500 형태로 표시된다', () => {
    render(<PromptInput onGenerate={vi.fn()} isLoading={false} />);
    expect(screen.getByText('0/500')).toBeInTheDocument();

    fireEvent.change(screen.getByRole('textbox'), { target: { value: '프로필 카드' } });
    expect(screen.getByText('6/500')).toBeInTheDocument();
  });

  it('500자를 초과하면 오류 문구를 alert로 표시하고 생성 버튼이 비활성이다', () => {
    render(<PromptInput onGenerate={vi.fn()} isLoading={false} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'a'.repeat(501) } });

    expect(screen.getByRole('alert')).toHaveTextContent('프롬프트는 500자 이하로 입력해주세요.');
    expect(screen.getByRole('button', { name: '컴포넌트 생성' })).toBeDisabled();
  });

  it('500자를 초과하면 Ctrl+Enter 단축키로도 onGenerate가 호출되지 않는다', () => {
    const onGenerate = vi.fn();
    render(<PromptInput onGenerate={onGenerate} isLoading={false} />);
    const textbox = screen.getByRole('textbox');
    fireEvent.change(textbox, { target: { value: 'a'.repeat(501) } });

    fireEvent.keyDown(textbox, { key: 'Enter', ctrlKey: true });
    expect(onGenerate).not.toHaveBeenCalled();
  });

  it('정확히 500자는 오류 없이 제출할 수 있다', async () => {
    const onGenerate = vi.fn();
    const user = userEvent.setup();
    render(<PromptInput onGenerate={onGenerate} isLoading={false} />);
    const value = 'a'.repeat(500);
    fireEvent.change(screen.getByRole('textbox'), { target: { value } });

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '컴포넌트 생성' }));
    expect(onGenerate).toHaveBeenCalledWith(value);
  });
});
