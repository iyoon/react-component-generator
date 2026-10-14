export const MAX_PROMPT_LENGTH = 500;

export function validatePromptLength(
  prompt: string,
  max: number = MAX_PROMPT_LENGTH,
): { valid: boolean; length: number; max: number } {
  const length = Array.from(prompt.trim()).length;
  return { valid: length <= max, length, max };
}
