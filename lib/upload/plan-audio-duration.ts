import { formatTrackDuration } from '@/components/dashboard/upload/crbt-validation';

/**
 * Per-plan max audio duration (minutes).
 * Only listed plans are capped — add a key here to enable validation for that plan.
 */
const PLAN_MAX_AUDIO_DURATION_MINUTES: Partial<Record<string, number>> = {
  free: 10,
  solo: 30,
};

export function getPlanMaxAudioDurationMinutes(
  planKey?: string | null,
): number | null {
  const key = (planKey || 'free').toLowerCase();
  return PLAN_MAX_AUDIO_DURATION_MINUTES[key] ?? null;
}

export function getMaxPlanAudioDurationError(
  planKey: string | undefined | null,
  durationSec?: number | null,
): string | null {
  if (typeof durationSec !== 'number' || !Number.isFinite(durationSec)) {
    return null;
  }

  const maxMinutes = getPlanMaxAudioDurationMinutes(planKey);
  if (maxMinutes === null) {
    return null;
  }

  const durationMinutes = durationSec / 60;
  if (durationMinutes <= maxMinutes) {
    return null;
  }

  return `Audio duration exceeds the maximum ${maxMinutes} minutes allowed for your plan. Current duration: ${formatTrackDuration(durationSec)}.`;
}
