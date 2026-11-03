export function releaseMetadataOptions(
  values?: string[] | null,
  legacy?: string | null,
): string[] {
  const result: string[] = [];
  const seen = new Set<string>();
  const list = [...(values ?? [])];
  if (legacy) {
    list.push(legacy);
  }

  for (const value of list) {
    const trimmed = value.trim();
    const key = trimmed.toLowerCase();
    if (!trimmed || seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push(trimmed);
  }

  return result;
}

/** Add is offered only when the search has no matching saved value. */
export function filterMetadataOptions(
  options: string[],
  query: string,
): { matches: string[]; addValue: string | null } {
  const trimmed = query.trim();
  if (!trimmed) {
    return { matches: options, addValue: null };
  }

  const needle = trimmed.toLowerCase();
  const matches = options.filter((option) =>
    option.toLowerCase().includes(needle),
  );
  if (matches.length > 0) {
    return { matches, addValue: null };
  }

  return { matches: [], addValue: trimmed };
}

export function canonicalMetadataValue(options: string[], value: string): string {
  const key = value.trim().toLowerCase();
  const existing = options.find((option) => option.toLowerCase() === key);
  return existing || value.trim();
}
