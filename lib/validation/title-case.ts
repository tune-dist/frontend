/** Capitalize the first character of each whitespace-separated word. */
export function toTitleCase(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;

  return trimmed
    .split(/\s+/)
    .map((word) => {
      if (!word) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}
