"use client";

import React, { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin, { Region } from "wavesurfer.js/dist/plugins/regions.js";
import { Play, Pause, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/class-names";
import {
  CRBT_CLIP_DURATION_SEC,
  CRBT_MIN_TRACK_DURATION_SEC,
  getCrbtIneligibilityMessage,
  isTrackEligibleForCrbt,
} from "./crbt-validation";

interface WaveformTrimmerProps {
  audioFile: File | string | null;
  initialStartTime?: string; // HH:MM:SS
  onTimeChange: (startTime: string) => void;
  /** Known duration in seconds (from upload metadata). Used before waveform loads. */
  trackDurationSec?: number | null;
}

const CLIP_MAX_DURATION_SEC = CRBT_CLIP_DURATION_SEC;
/** Green clip-range overlay opacity on the waveform grid (55%). */
const CLIP_RANGE_OPACITY = 0.55;

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

const timeToSeconds = (timeStr: string) => {
  if (!timeStr) return 0;
  const parts = timeStr.split(":").map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] || 0;
};

const formatStartTimeHMS = (start: number) => {
  const h = Math.floor(start / 3600);
  const m = Math.floor((start % 3600) / 60);
  const s = Math.floor(start % 60);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

function getAudioSourceKey(audioFile: File | string | null): string | null {
  if (!audioFile) return null;
  if (typeof audioFile === "string") return audioFile;
  return `${audioFile.name}-${audioFile.size}-${audioFile.lastModified}`;
}

function getFixedClipRange(totalDur: number, startSeconds: number) {
  const clipDuration = Math.min(CLIP_MAX_DURATION_SEC, totalDur);
  const start = Math.max(0, Math.min(startSeconds, Math.max(0, totalDur - clipDuration)));
  const end = start + clipDuration;
  return { start, end, clipDuration };
}

export default function WaveformTrimmer({
  audioFile,
  initialStartTime = "00:00:00",
  onTimeChange,
  trackDurationSec,
}: WaveformTrimmerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const waveSurferRef = useRef<WaveSurfer | null>(null);
  const regionsRef = useRef<ReturnType<typeof RegionsPlugin.create> | null>(null);
  const onTimeChangeRef = useRef(onTimeChange);
  const initialStartRef = useRef(initialStartTime);
  const isApplyingRegionRef = useRef(false);
  const isClipPlaybackRef = useRef(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [selection, setSelection] = useState({ start: 0, end: 30 });
  const [isReady, setIsReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isEligible, setIsEligible] = useState(() =>
    trackDurationSec == null ? true : isTrackEligibleForCrbt(trackDurationSec),
  );
  const [ineligibilityMessage, setIneligibilityMessage] = useState<string | null>(
    () =>
      trackDurationSec != null && !isTrackEligibleForCrbt(trackDurationSec)
        ? getCrbtIneligibilityMessage(trackDurationSec)
        : null,
  );

  const audioSourceKey = getAudioSourceKey(audioFile);

  onTimeChangeRef.current = onTimeChange;
  initialStartRef.current = initialStartTime;

  useEffect(() => {
    if (trackDurationSec == null) return;
    const eligible = isTrackEligibleForCrbt(trackDurationSec);
    setIsEligible(eligible);
    setIneligibilityMessage(eligible ? null : getCrbtIneligibilityMessage(trackDurationSec));
    if (!eligible) {
      setIsReady(false);
      setIsPlaying(false);
    }
  }, [trackDurationSec]);

  const applyFixedRegion = (region: Region, totalDur: number, preferredStart?: number) => {
    const startSeconds =
      preferredStart ?? timeToSeconds(initialStartRef.current || "00:00:00");
    const { start, end } = getFixedClipRange(totalDur, startSeconds);

    isApplyingRegionRef.current = true;
    region.setOptions({ start, end });
    isApplyingRegionRef.current = false;

    setSelection({ start, end });
    onTimeChangeRef.current(formatStartTimeHMS(start));
    return { start, end };
  };

  const getTrimRegion = () =>
    regionsRef.current?.getRegions().find((r) => r.id === "trim-region");

  const resetClipToStart = (ws: WaveSurfer, region: Region) => {
    ws.setTime(region.start);
    setCurrentTime(region.start);
  };

  const playClip = (ws: WaveSurfer, region: Region) => {
    const time = ws.getCurrentTime();
    const playFrom =
      time >= region.start && time < region.end - 0.05 ? time : region.start;

    isClipPlaybackRef.current = true;
    void ws.play(playFrom, region.end).catch(() => {
      isClipPlaybackRef.current = false;
    });
  };

  useEffect(() => {
    if (!containerRef.current || !audioFile || !audioSourceKey || !isEligible) return;

    setIsReady(false);
    setLoadError(null);

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "rgba(109, 40, 217, 0.8)",
      progressColor: "rgba(109, 40, 217, 0.4)",
      cursorColor: "transparent",
      cursorWidth: 0,
      barWidth: 2,
      barGap: 0,
      barRadius: 0,
      height: 70,
      normalize: true,
      backend: "WebAudio",
    });

    const regions = ws.registerPlugin(RegionsPlugin.create());
    regionsRef.current = regions;
    waveSurferRef.current = ws;

    let objectUrl = "";

    const loadAudio = async () => {
      try {
        if (typeof audioFile === "string") {
          await ws.load(audioFile);
        } else {
          objectUrl = URL.createObjectURL(audioFile);
          await ws.load(objectUrl);
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== "AbortError") {
          console.error("WaveSurfer load error:", err);
          setLoadError("Could not render the audio waveform. Try re-opening this step.");
        }
      }
    };

    loadAudio();

    ws.on("ready", () => {
      const totalDur = ws.getDuration();
      const eligible = isTrackEligibleForCrbt(totalDur);

      setIsEligible(eligible);
      if (!eligible) {
        setIneligibilityMessage(getCrbtIneligibilityMessage(totalDur));
        setIsReady(false);
        ws.pause();
        return;
      }

      setIneligibilityMessage(null);
      const { start, end, clipDuration } = getFixedClipRange(
        totalDur,
        timeToSeconds(initialStartRef.current || "00:00:00"),
      );

      setDuration(totalDur);
      setSelection({ start, end });
      setIsReady(true);

      regions.addRegion({
        id: "trim-region",
        start,
        end,
        color: `rgba(74, 222, 128, ${CLIP_RANGE_OPACITY})`,
        drag: true,
        resize: false,
        minLength: clipDuration,
        maxLength: clipDuration,
      });

      onTimeChangeRef.current(formatStartTimeHMS(start));
    });

    const handleClipEnd = () => {
      const region = regions.getRegions().find((r) => r.id === "trim-region");
      if (!region || !isClipPlaybackRef.current) return;

      isClipPlaybackRef.current = false;
      ws.pause();
      resetClipToStart(ws, region);
    };

    ws.on("timeupdate", (time) => {
      setCurrentTime(time);
    });

    ws.on("audioprocess", (time) => {
      setCurrentTime(time);
    });

    regions.on("region-out", (region) => {
      if (region.id !== "trim-region" || !ws.isPlaying()) return;
      handleClipEnd();
    });

    ws.on("play", () => setIsPlaying(true));
    ws.on("pause", () => {
      setIsPlaying(false);

      const activeRegion = regions.getRegions().find((r) => r.id === "trim-region");
      if (
        activeRegion &&
        isClipPlaybackRef.current &&
        ws.getCurrentTime() >= activeRegion.end - 0.1
      ) {
        isClipPlaybackRef.current = false;
        resetClipToStart(ws, activeRegion);
      }
    });

    regions.on("region-updated", (region: Region) => {
      if (isApplyingRegionRef.current) return;

      const totalDur = ws.getDuration() || duration;
      applyFixedRegion(region, totalDur, region.start);

      if (ws.isPlaying()) {
        playClip(ws, region);
      }
    });

    return () => {
      isClipPlaybackRef.current = false;
      setIsReady(false);
      setIsPlaying(false);
      try {
        ws.pause();
        ws.destroy();
      } catch {
        // Ignore destroy errors
      }
      waveSurferRef.current = null;
      regionsRef.current = null;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [audioSourceKey, isEligible]);

  // Restore saved start time when returning to the step without reloading audio.
  useEffect(() => {
    if (!isReady || !regionsRef.current || !waveSurferRef.current) return;

    const region = regionsRef.current
      .getRegions()
      .find((r) => r.id === "trim-region");
    if (!region) return;

    const totalDur = waveSurferRef.current.getDuration();
    const targetStart = timeToSeconds(initialStartTime || "00:00:00");

    if (Math.abs(region.start - targetStart) < 0.5) return;

    applyFixedRegion(region, totalDur, targetStart);
  }, [initialStartTime, isReady, isEligible]);

  useEffect(() => {
    return () => {
      isClipPlaybackRef.current = false;
      waveSurferRef.current?.pause();
    };
  }, []);

  if (!isEligible) {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5">
        <p className="text-sm text-amber-200/90">
          {ineligibilityMessage ?? getCrbtIneligibilityMessage(trackDurationSec)}
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Upload a track of at least {CRBT_MIN_TRACK_DURATION_SEC} seconds to enable a{" "}
          {CRBT_CLIP_DURATION_SEC}-second caller tune highlight.
        </p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5">
        <p className="text-sm text-red-200/90">{loadError}</p>
      </div>
    );
  }

  const togglePlay = () => {
    const ws = waveSurferRef.current;
    const region = getTrimRegion();
    if (!ws || !region) return;

    if (ws.isPlaying()) {
      isClipPlaybackRef.current = false;
      ws.pause();
      return;
    }

    playClip(ws, region);
  };

  return (
    <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-5 space-y-4 overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
            Clip Selection (30s fixed)
          </span>
        </div>
      </div>

      <div className="relative group min-h-[70px]">
        <div
          ref={containerRef}
          className="w-full cursor-pointer overflow-hidden bg-gradient-to-b from-transparent to-white/5"
        />
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <Loader2 className="h-5 w-5 animate-spin text-white/70" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 justify-between w-full">
            <Button
              type="button"
              className={cn(
                "h-8 px-3 rounded-full flex items-center gap-1 transition-all active:scale-95 group shadow-xl",
                isPlaying
                  ? "bg-primary text-white hover:bg-primary/90 shadow-primary/20"
                  : "bg-white text-black hover:bg-white/90 shadow-white/10",
              )}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                togglePlay();
              }}
            >
              <div className="flex items-center justify-center">
                {isPlaying ? (
                  <Pause className="h-4 w-4 fill-white" />
                ) : (
                  <Play className="h-4 w-4 fill-black" />
                )}
              </div>
              <div className="flex flex-col items-start leading-none">
                <span className="text-[12px] font-black uppercase tracking-tight">Preview</span>
              </div>
            </Button>
            <div className="flex items-center justify-between bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 w-full">
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-red-500 uppercase tracking-widest mb-0.5">
                  Start Time
                </span>
                <span className="text-sm font-bold text-white">{formatTime(selection.start)}</span>
              </div>
              <div className="h-6 w-px bg-white/10" />
              <div className="flex flex-col items-center">
                <span className="text-[8px] font-black text-green-500 uppercase tracking-widest mb-0.5">
                  Duration
                </span>
                <span className="text-sm font-bold text-white">
                  {formatTime(selection.end - selection.start)}
                </span>
              </div>
              <div className="h-6 w-px bg-white/10" />
              <div className="flex flex-col items-end">
                <span className="text-[8px] font-black text-green-500 uppercase tracking-widest mb-0.5">
                  End Time
                </span>
                <span className="text-sm font-bold text-white">{formatTime(selection.end)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
