export const WAV_SAMPLE_RATE_HZ = 44100;
export const ALLOWED_WAV_BIT_DEPTHS = [16, 24] as const;

export function isAllowedWavBitDepth(bitDepth: number): boolean {
  return (ALLOWED_WAV_BIT_DEPTHS as readonly number[]).includes(bitDepth);
}

export function formatAllowedBitDepths(): string {
  return ALLOWED_WAV_BIT_DEPTHS.map((depth) => `${depth}-bit`).join(' or ');
}
