export const ALLOWED_WAV_BIT_DEPTHS = [16, 24] as const;
export const ALLOWED_16BIT_SAMPLE_RATES_HZ = [44100] as const;
export const ALLOWED_24BIT_SAMPLE_RATES_HZ = [44100, 48000, 88200, 96000, 192000] as const;

export function isAllowedWavBitDepth(bitDepth: number): boolean {
  return (ALLOWED_WAV_BIT_DEPTHS as readonly number[]).includes(bitDepth);
}

export function formatAllowedBitDepths(): string {
  return ALLOWED_WAV_BIT_DEPTHS.map((depth) => `${depth}-bit`).join(' or ');
}

export function validateWavAudioSpecs(params: {
  sampleRate: number;
  bitDepth: number;
  channels?: number;
}): { valid: boolean; error?: string } {
  const { sampleRate, bitDepth, channels } = params;

  if (!isAllowedWavBitDepth(bitDepth)) {
    return {
      valid: false,
      error: `Invalid Bit Depth: ${bitDepth}-bit. File must be 16-bit or 24-bit HD.`,
    };
  }

  if (bitDepth === 16) {
    if (!(ALLOWED_16BIT_SAMPLE_RATES_HZ as readonly number[]).includes(sampleRate)) {
      return {
        valid: false,
        error: `Invalid Sample Rate for 16-bit audio: ${sampleRate.toLocaleString()}Hz. 16-bit standard WAV must be 44,100Hz.`,
      };
    }
  } else if (bitDepth === 24) {
    if (!(ALLOWED_24BIT_SAMPLE_RATES_HZ as readonly number[]).includes(sampleRate)) {
      return {
        valid: false,
        error: `Invalid Sample Rate for 24-bit HD audio: ${sampleRate.toLocaleString()}Hz. 24-bit HD files must be 44.1kHz, 48kHz, 88.2kHz, 96kHz, or 192kHz.`,
      };
    }
  }

  if (channels !== undefined && channels !== 2) {
    return {
      valid: false,
      error: `Invalid Channels: ${channels === 1 ? 'Mono (1 channel)' : `${channels} channels`}. Audio file must be Stereo (2 channels).`,
    };
  }

  return { valid: true };
}
