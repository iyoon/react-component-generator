export function addToHistory(history: string[], prompt: string, max = 20): string[] {
  const trimmed = prompt.trim();
  if (!trimmed) return history;
  return [trimmed, ...history.filter((h) => h !== trimmed)].slice(0, max);
}
