export type TogglePlaybackAction = "pause" | "resume" | "load" | "noop";

export interface TogglePlaybackInput {
  activeTrackIndex: number | null;
  loadingTrackIndex: number | null;
  targetIndex: number;
  audioPaused: boolean;
}

export function resolveTogglePlaybackAction({
  activeTrackIndex,
  loadingTrackIndex,
  targetIndex,
  audioPaused,
}: TogglePlaybackInput): TogglePlaybackAction {
  if (loadingTrackIndex !== null) {
    return "noop";
  }

  if (activeTrackIndex === targetIndex) {
    return audioPaused ? "resume" : "pause";
  }

  return "load";
}

export function clampSeekTime(
  time: number,
  duration: number | null | undefined,
): number {
  if (!Number.isFinite(time) || time < 0) {
    return 0;
  }

  if (Number.isFinite(duration) && (duration as number) > 0) {
    return Math.min(time, duration as number);
  }

  return time;
}

export function formatTrackTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  const minutes = Math.floor(total / 60);
  const secs = total % 60;
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

export function getTrackProgressPercent(
  currentTime: number,
  duration: number,
): number {
  if (!Number.isFinite(duration) || duration <= 0) {
    return 0;
  }

  return Math.min(100, Math.max(0, (currentTime / duration) * 100));
}
