import type { GeneratedComponent } from '../types';

export const MAX_STORED_COMPONENTS = 50;

export interface StoredComponent {
  id: string;
  prompt: string;
  code: string;
  createdAt: string;
}

// 목록은 최신이 앞이므로 상한 초과 시 뒤쪽(오래된 것)을 제거한다.
export function serializeComponents(components: GeneratedComponent[]): StoredComponent[] {
  return components.slice(0, MAX_STORED_COMPONENTS).map((c) => ({
    id: c.id,
    prompt: c.prompt,
    code: c.code,
    createdAt: c.createdAt.toISOString(),
  }));
}

export function deserializeComponents(raw: unknown): GeneratedComponent[] {
  if (!Array.isArray(raw)) return [];
  const result: GeneratedComponent[] = [];
  for (const item of raw) {
    if (typeof item !== 'object' || item === null) continue;
    const { id, prompt, code, createdAt } = item as Record<string, unknown>;
    if (
      typeof id !== 'string' ||
      typeof prompt !== 'string' ||
      typeof code !== 'string' ||
      typeof createdAt !== 'string'
    ) {
      continue;
    }
    const date = new Date(createdAt);
    if (Number.isNaN(date.getTime())) continue;
    result.push({ id, prompt, code, createdAt: date });
  }
  return result;
}
