export const ALLOWED_WAV_BIT_DEPTHS = [16, 24] as const;
export const ALLOWED_WAV_CHANNELS = [1, 2] as const;
export const ALLOWED_16BIT_SAMPLE_RATES_HZ = [44100] as const;
export const ALLOWED_24BIT_SAMPLE_RATES_HZ = [44100, 48000, 88200, 96000, 192000] as const;

export function isAllowedWavBitDepth(bitDepth: number): boolean {
  return (ALLOWED_WAV_BIT_DEPTHS as readonly number[]).includes(bitDepth);
}

export function isAllowedWavChannelCount(channels: number): boolean {
  return (ALLOWED_WAV_CHANNELS as readonly number[]).includes(channels);
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
      error: `This file is ${bitDepth}-bit. Please upload a 16-bit or 24-bit WAV file.`,
    };
  }

  if (bitDepth === 16) {
    if (!(ALLOWED_16BIT_SAMPLE_RATES_HZ as readonly number[]).includes(sampleRate)) {
      return {
        valid: false,
        error: `This file is ${sampleRate.toLocaleString()}Hz. 16-bit WAV files must be 44.1kHz (44,100Hz). Re-export at the correct sample rate and try again.`,
      };
    }
  } else if (bitDepth === 24) {
    if (!(ALLOWED_24BIT_SAMPLE_RATES_HZ as readonly number[]).includes(sampleRate)) {
      return {
        valid: false,
        error: `This file is ${sampleRate.toLocaleString()}Hz. 24-bit HD WAV files must be 44.1kHz, 48kHz, 88.2kHz, 96kHz, or 192kHz. Re-export at a supported sample rate and try again.`,
      };
    }
  }

  if (channels !== undefined && !isAllowedWavChannelCount(channels)) {
    return {
      valid: false,
      error: `This file has ${channels} audio channels. We only accept Mono (1 channel) or Stereo (2 channels) WAV files. Re-export from your DAW or audio editor and try again.`,
    };
  }

  return { valid: true };
}
