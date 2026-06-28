export function getDefaultLabelName(): string {
  return process.env.NEXT_PUBLIC_DEFAULT_LABEL?.trim() || 'KratoLib';
}
