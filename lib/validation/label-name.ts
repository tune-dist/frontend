export const RESERVED_LABEL_NAME_MESSAGE =
  '“Kratolib” is reserved for the platform default label. Choose a different label name.';

export function getDefaultLabelName(): string {
  return process.env.NEXT_PUBLIC_DEFAULT_LABEL?.trim() || 'KratoLib';
}

/** Case-insensitive; ignores spaces, hyphens, and underscores. */
export function normalizeLabelNameForComparison(name: string): string {
  return name.trim().toLowerCase().replace(/[\s\-_]/g, '');
}

export function isReservedPlatformLabelName(name: string): boolean {
  const normalized = normalizeLabelNameForComparison(name);
  return normalized.length > 0 && normalized === 'kratolib';
}

export function isCustomLabelNameAllowed(name: string): boolean {
  return !isReservedPlatformLabelName(name);
}
