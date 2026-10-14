import type { Provider } from '../types';

export const DEFAULT_PROVIDER: Provider = 'google';

export function parseProvider(raw: unknown): Provider {
  return raw === 'anthropic' || raw === 'google' ? raw : DEFAULT_PROVIDER;
}

export function parseApiKeys(raw: unknown): Record<Provider, string> {
  const obj = typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : {};
  return {
    anthropic: typeof obj.anthropic === 'string' ? obj.anthropic : '',
    google: typeof obj.google === 'string' ? obj.google : '',
  };
}
