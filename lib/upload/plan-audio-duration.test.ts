import { describe, expect, it } from 'vitest';
import {
  getMaxPlanAudioDurationError,
  getPlanMaxAudioDurationMinutes,
} from './plan-audio-duration';

describe('plan-audio-duration', () => {
  it('returns 10 minutes for free and 30 for solo', () => {
    expect(getPlanMaxAudioDurationMinutes('free')).toBe(10);
    expect(getPlanMaxAudioDurationMinutes('solo')).toBe(30);
  });

  it('returns null for plans without a configured limit', () => {
    expect(getPlanMaxAudioDurationMinutes('creator_plus')).toBeNull();
    expect(getPlanMaxAudioDurationMinutes('enterprise')).toBeNull();
    expect(getPlanMaxAudioDurationMinutes('unknown')).toBeNull();
  });

  it('allows solo tracks up to 30 minutes', () => {
    expect(getMaxPlanAudioDurationError('solo', 30 * 60)).toBeNull();
  });

  it('rejects solo tracks over 30 minutes', () => {
    const error = getMaxPlanAudioDurationError('solo', 30 * 60 + 1);
    expect(error).toContain('30 minutes');
  });

  it('does not limit enterprise or other unlisted plans', () => {
    expect(getMaxPlanAudioDurationError('enterprise', 120 * 60)).toBeNull();
    expect(getMaxPlanAudioDurationError('creator_plus', 90 * 60)).toBeNull();
  });
});
