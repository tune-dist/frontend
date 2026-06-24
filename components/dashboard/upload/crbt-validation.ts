/** Fixed length of the caller tune highlight clip. */
export const CRBT_CLIP_DURATION_SEC = 30;

/** Minimum full track length required before CRBT selection is allowed. */
export const CRBT_MIN_TRACK_DURATION_SEC = 60;

export function isTrackEligibleForCrbt(durationSec?: number | null): boolean {
  return (
    typeof durationSec === "number" &&
    durationSec >= CRBT_MIN_TRACK_DURATION_SEC
  );
}

export function formatTrackDuration(durationSec: number): string {
  const total = Math.max(0, Math.floor(durationSec));
  const m = Math.floor(total / 60);
  const s = total % 60;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function getCrbtIneligibilityMessage(durationSec?: number | null): string {
  const durationLabel =
    typeof durationSec === "number"
      ? formatTrackDuration(durationSec)
      : "unknown";

  return `Caller tune highlight requires a song of at least ${CRBT_MIN_TRACK_DURATION_SEC} seconds. Current duration: ${durationLabel}.`;
}
