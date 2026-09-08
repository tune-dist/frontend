import { describe, expect, it } from 'vitest';
import {
  CRBT_MIN_TRACK_DURATION_SEC,
  formatTrackDuration,
  getCrbtIneligibilityMessage,
  getMinTrackDurationError,
  isTrackEligibleForCrbt,
} from '@/components/dashboard/upload/crbt-validation';

describe('crbt-validation — caller tune step', () => {
  it('allows CRBT when track is at least 60 seconds', () => {
    expect(isTrackEligibleForCrbt(60)).toBe(true);
    expect(isTrackEligibleForCrbt(180)).toBe(true);
  });

  it('blocks CRBT for short or unknown duration', () => {
    expect(isTrackEligibleForCrbt(59)).toBe(false);
    expect(isTrackEligibleForCrbt(undefined)).toBe(false);
  });

  it('returns min duration error for short tracks', () => {
    expect(getMinTrackDurationError(45)).toContain('60 seconds');
    expect(getMinTrackDurationError(null)).toContain('60 seconds');
  });

  it('returns null error when duration is valid', () => {
    expect(getMinTrackDurationError(120)).toBeNull();
  });

  it('formats track duration for user messages', () => {
    expect(formatTrackDuration(90)).toBe('1m 30s');
    expect(formatTrackDuration(45)).toBe('45s');
  });

  it('builds ineligibility message with current duration', () => {
    const message = getCrbtIneligibilityMessage(45);
    expect(message).toContain(String(CRBT_MIN_TRACK_DURATION_SEC));
    expect(message).toContain('45s');
  });
});
