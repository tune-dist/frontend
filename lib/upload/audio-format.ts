export const WAV_SAMPLE_RATE_MIN_HZ = 44100;
export const WAV_SAMPLE_RATE_MAX_HZ = 48000;
/** @deprecated Use WAV_SAMPLE_RATE_MIN_HZ / WAV_SAMPLE_RATE_MAX_HZ */
export const WAV_SAMPLE_RATE_HZ = WAV_SAMPLE_RATE_MIN_HZ;
export const ALLOWED_WAV_BIT_DEPTHS = [16, 24] as const;

export function isAllowedWavSampleRate(sampleRate: number): boolean {
  return (
    sampleRate >= WAV_SAMPLE_RATE_MIN_HZ && sampleRate <= WAV_SAMPLE_RATE_MAX_HZ
  );
}

export function isAllowedWavBitDepth(bitDepth: number): boolean {
  return (ALLOWED_WAV_BIT_DEPTHS as readonly number[]).includes(bitDepth);
}

export function formatAllowedBitDepths(): string {
  return ALLOWED_WAV_BIT_DEPTHS.map((depth) => `${depth}-bit`).join(' or ');
}

export function formatSampleRateRange(): string {
  return `${(WAV_SAMPLE_RATE_MIN_HZ / 1000).toFixed(1)}–${WAV_SAMPLE_RATE_MAX_HZ / 1000} kHz`;
}

export function formatSampleRateRangeHz(): string {
  return `${WAV_SAMPLE_RATE_MIN_HZ.toLocaleString()}–${WAV_SAMPLE_RATE_MAX_HZ.toLocaleString()} Hz`;
}
