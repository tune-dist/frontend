"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin, { Region } from "wavesurfer.js/dist/plugins/regions.js";
import { Play, Pause, Info, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WaveformTrimmerProps {
  audioFile: File | string | null;
  initialStartTime?: string; // HH:MM:SS
  onTimeChange: (startTime: string) => void;
}

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const timeToSeconds = (timeStr: string) => {
  if (!timeStr) return 0;
  const parts = timeStr.split(":").map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] || 0;
};

export default function WaveformTrimmer({
  audioFile,
  initialStartTime = "00:00:00",
  onTimeChange,
}: WaveformTrimmerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const waveSurferRef = useRef<WaveSurfer | null>(null);
  const regionsRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [selection, setSelection] = useState({ start: 0, end: 30 });
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current || !audioFile) return;

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "rgba(109, 40, 217, 0.8)", // Primary color with opacity
      progressColor: "rgba(109, 40, 217, 0.4)", // Primary color
      cursorColor: "#fb923c",
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

    let url = "";
    if (typeof audioFile === "string") {
      ws.load(audioFile);
    } else {
      url = URL.createObjectURL(audioFile);
      ws.load(url);
    }

    ws.on("ready", () => {
      const totalDur = ws.getDuration();
      setDuration(totalDur);
      setIsReady(true);

      // Fix: Ensure start time is within [0, totalDur]
      const clipDuration = Math.min(30, totalDur);
      const start = Math.max(0, Math.min(timeToSeconds(initialStartTime), totalDur - clipDuration));
      const end = Math.min(start + clipDuration, totalDur);

      setSelection({ start, end });

      regions.addRegion({
        id: "trim-region",
        start: start,
        end: end,
        color: "rgba(74, 222, 128, 0.2)",
        drag: true,
        resize: true,
      });
    });

    ws.on("audioprocess", () => {
      const time = ws.getCurrentTime();
      setCurrentTime(time);

      // Restrict playback to region and LOOP
      const region = regions.getRegions().find((r: any) => r.id === "trim-region");
      if (region && time >= region.end) {
        ws.setTime(region.start);
        if (!ws.isPlaying()) ws.play(); // Ensure it keeps playing for loop
      }
    });

    ws.on("play", () => setIsPlaying(true));
    ws.on("pause", () => setIsPlaying(false));

    regions.on("region-updated", (region: Region) => {
      const start = Math.max(0, Math.round(region.start));
      const end = Math.min(duration, Math.round(region.end));
      setSelection({ start, end });

      // Convert start to HH:MM:SS for the form
      const h = Math.floor(start / 3600);
      const m = Math.floor((start % 3600) / 60);
      const s = start % 60;
      const formatted = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
      onTimeChange(formatted);

      // If playing and region updated, ensure we are still in bounds
      if (waveSurferRef.current?.isPlaying()) {
        const time = waveSurferRef.current.getCurrentTime();
        if (time < region.start || time > region.end) {
          waveSurferRef.current.setTime(region.start);
        }
      }
    });

    return () => {
      ws.destroy();
      if (url) URL.revokeObjectURL(url);
    };
  }, [audioFile, initialStartTime]);

  const togglePlay = () => {
    if (waveSurferRef.current && regionsRef.current) {
      const ws = waveSurferRef.current;
      const region = regionsRef.current.getRegions().find((r: any) => r.id === "trim-region");

      if (ws.isPlaying()) {
        ws.pause();
      } else {
        if (region) {
          const time = ws.getCurrentTime();
          // If outside region, jump to start
          if (time < region.start || time >= region.end) {
            ws.setTime(region.start);
          }
        }
        ws.play();
      }
    }
  };

  return (
    <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-5 space-y-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Clip Selection</span>
        </div>
        <Info className="h-4 w-4 text-white/20 cursor-help" />
      </div>

      {/* Waveform Area */}
      <div className="relative group">
        <div
          ref={containerRef}
          className="w-full cursor-pointer overflow-hidden bg-gradient-to-b from-transparent to-white/5"
        />

        {/* Playback Progress Overlay */}
        <div className="absolute top-0 right-0 p-2 pointer-events-none">
          <span className="text-[9px] font-mono text-white/40 bg-black/40 backdrop-blur-sm px-2 py-1 rounded">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Controls & Metrics */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              className={cn(
                "h-8 px-3 rounded-full flex items-center gap-1 transition-all active:scale-95 group shadow-xl",
                isPlaying
                  ? "bg-primary text-white hover:bg-primary/90 shadow-primary/20"
                  : "bg-white text-black hover:bg-white/90 shadow-white/10"
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
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="h-1 w-3 rounded-full bg-[#6625d0]" />
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-tighter">Waveform</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-1 w-3 rounded-full bg-green-500" />
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-tighter">Selection</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-1 w-3 rounded-full bg-orange-500" />
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-tighter">Playback</span>
            </div>
          </div>
        </div>

        {/* Compact Horizontal Metrics Strip */}
        <div className="flex items-center justify-between bg-white/5 border border-white/5 rounded-xl px-4 py-2.5">
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-red-500 uppercase tracking-widest mb-0.5">Start Time</span>
            <span className="text-sm font-bold text-white">{formatTime(selection.start)}</span>
          </div>
          <div className="h-6 w-px bg-white/10" />
          <div className="flex flex-col items-center">
            <span className="text-[8px] font-black text-green-500 uppercase tracking-widest mb-0.5">Duration</span>
            <span className="text-sm font-bold text-white">{formatTime(selection.end - selection.start)}</span>
          </div>
          <div className="h-6 w-px bg-white/10" />
          <div className="flex flex-col items-end">
            <span className="text-[8px] font-black text-green-500 uppercase tracking-widest mb-0.5">End Time</span>
            <span className="text-sm font-bold text-white">{formatTime(selection.end)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
