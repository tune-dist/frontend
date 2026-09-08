import { describe, expect, it } from 'vitest';
import { validateWavAudioSpecs } from './audio-format';

describe('validateWavAudioSpecs', () => {
  const base = { sampleRate: 44100, bitDepth: 16 };

  it('accepts mono WAV (1 channel)', () => {
    expect(validateWavAudioSpecs({ ...base, channels: 1 }).valid).toBe(true);
  });

  it('accepts stereo WAV (2 channels)', () => {
    expect(validateWavAudioSpecs({ ...base, channels: 2 }).valid).toBe(true);
  });

  it('accepts 16-bit WAV at 48kHz', () => {
    expect(
      validateWavAudioSpecs({ sampleRate: 48000, bitDepth: 16, channels: 2 })
        .valid,
    ).toBe(true);
  });

  it('rejects 16-bit WAV at unsupported HD sample rates', () => {
    const result = validateWavAudioSpecs({
      sampleRate: 96000,
      bitDepth: 16,
      channels: 2,
    });
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/44\.1kHz or 48kHz/);
  });

  it('rejects multi-channel WAV', () => {
    const result = validateWavAudioSpecs({ ...base, channels: 6 });
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/Mono \(1 channel\) or Stereo \(2 channels\)/);
  });
});
