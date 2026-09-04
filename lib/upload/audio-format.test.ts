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

  it('rejects multi-channel WAV', () => {
    const result = validateWavAudioSpecs({ ...base, channels: 6 });
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/Mono \(1 channel\) or Stereo \(2 channels\)/);
  });
});
