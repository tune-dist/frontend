"use client";

import { Loader2, Pause, Play } from "lucide-react";
import { formatTrackTime } from "@/lib/releases/release-track-playback.util";

interface TrackAudioPlayerProps {
  isActive: boolean;
  isPlaying: boolean;
  loading: boolean;
  currentTime: number;
  duration: number;
  durationHint?: number;
  onToggle: () => void;
  onSeekStart: () => void;
  onSeek: (time: number) => void;
  onSeekEnd: (time: number) => void;
}

export function TrackAudioPlayer({
  isActive,
  isPlaying,
  loading,
  currentTime,
  duration,
  durationHint,
  onToggle,
  onSeekStart,
  onSeek,
  onSeekEnd,
}: TrackAudioPlayerProps) {
  const displayDuration =
    isActive && duration > 0 ? duration : durationHint && durationHint > 0 ? durationHint : 0;
  const sliderMax = displayDuration > 0 ? displayDuration : 100;
  const sliderValue = isActive ? currentTime : 0;
  const progressPercent =
    displayDuration > 0 ? Math.min(100, (sliderValue / displayDuration) * 100) : 0;

  return (
    <div className="flex items-center gap-3 w-full min-w-0 opacity-80 group-hover:opacity-100 transition-opacity">
      <button
        type="button"
        onClick={onToggle}
        disabled={loading}
        className="h-10 w-10 shrink-0 rounded-full bg-white/10 hover:bg-primary hover:text-black text-white transition-all flex items-center justify-center disabled:opacity-60"
        aria-label={isPlaying ? "Pause track" : "Play track"}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isPlaying ? (
          <Pause className="h-4 w-4 fill-current" />
        ) : (
          <Play className="h-4 w-4 fill-current ml-0.5" />
        )}
      </button>

      <div className="flex-1 min-w-0 flex items-center gap-3">
        <div className="relative flex-1 min-w-0 h-6 flex items-center">
          <div className="absolute inset-x-0 h-1.5 rounded-full bg-white/10 overflow-hidden pointer-events-none">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-75"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <input
            type="range"
            min={0}
            max={sliderMax}
            step={0.1}
            value={sliderValue}
            disabled={!isActive || loading || displayDuration <= 0}
            onMouseDown={onSeekStart}
            onTouchStart={onSeekStart}
            onChange={(event) => onSeek(Number(event.target.value))}
            onMouseUp={(event) => onSeekEnd(Number(event.currentTarget.value))}
            onTouchEnd={(event) => onSeekEnd(Number(event.currentTarget.value))}
            className="relative z-10 w-full h-6 appearance-none bg-transparent cursor-pointer disabled:cursor-default [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border-0 [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0"
            aria-label="Seek track"
          />
        </div>

        <span className="text-[10px] font-mono text-white/50 tabular-nums shrink-0 min-w-[72px] text-right">
          {formatTrackTime(isActive ? currentTime : 0)}
          {" / "}
          {formatTrackTime(displayDuration)}
        </span>
      </div>
    </div>
  );
}
