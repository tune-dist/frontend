"use client";

import { Loader2, Pause, Play } from "lucide-react";

interface TrackPlayButtonProps {
  isPlaying: boolean;
  loading: boolean;
  onClick: () => void;
}

export function TrackPlayButton({ isPlaying, loading, onClick }: TrackPlayButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-primary hover:text-black text-white text-xs font-bold tracking-wide transition-all flex items-center gap-2 disabled:opacity-60"
      aria-label={isPlaying ? "Pause track" : "Play track"}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : isPlaying ? (
        <Pause className="w-3.5 h-3.5 fill-current" />
      ) : (
        <Play className="w-3.5 h-3.5 fill-current" />
      )}
      {isPlaying ? "Pause" : "Play"}
    </button>
  );
}
