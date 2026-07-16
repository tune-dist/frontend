"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getDisplayUrl } from "@/lib/api/s3";
import {
  clampSeekTime,
  resolveTogglePlaybackAction,
} from "./release-track-playback.util";

export { formatTrackTime } from "./release-track-playback.util";

function waitForAudioReady(audio: HTMLAudioElement): Promise<void> {
  if (audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const onReady = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error("Failed to load audio"));
    };
    const cleanup = () => {
      audio.removeEventListener("canplay", onReady);
      audio.removeEventListener("error", onError);
    };

    audio.addEventListener("canplay", onReady, { once: true });
    audio.addEventListener("error", onError, { once: true });
  });
}

export function useReleaseTrackPlayback() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isSeekingRef = useRef(false);
  const detachListenersRef = useRef<(() => void) | null>(null);

  const [activeTrackIndex, setActiveTrackIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loadingTrackIndex, setLoadingTrackIndex] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const bindAudioElement = useCallback((node: HTMLAudioElement | null) => {
    detachListenersRef.current?.();
    detachListenersRef.current = null;
    audioRef.current = node;

    if (!node) {
      return;
    }

    const onTimeUpdate = () => {
      if (!isSeekingRef.current) {
        setCurrentTime(node.currentTime);
      }
    };
    const onLoadedMetadata = () => {
      if (Number.isFinite(node.duration)) {
        setDuration(node.duration);
      }
    };
    const onDurationChange = () => {
      if (Number.isFinite(node.duration)) {
        setDuration(node.duration);
      }
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      setIsPlaying(false);
      setActiveTrackIndex(null);
      setCurrentTime(0);
    };

    node.addEventListener("timeupdate", onTimeUpdate);
    node.addEventListener("loadedmetadata", onLoadedMetadata);
    node.addEventListener("durationchange", onDurationChange);
    node.addEventListener("play", onPlay);
    node.addEventListener("pause", onPause);
    node.addEventListener("ended", onEnded);

    detachListenersRef.current = () => {
      node.removeEventListener("timeupdate", onTimeUpdate);
      node.removeEventListener("loadedmetadata", onLoadedMetadata);
      node.removeEventListener("durationchange", onDurationChange);
      node.removeEventListener("play", onPlay);
      node.removeEventListener("pause", onPause);
      node.removeEventListener("ended", onEnded);
    };
  }, []);

  useEffect(() => {
    return () => {
      detachListenersRef.current?.();
      detachListenersRef.current = null;
    };
  }, []);

  const toggleTrackPlayback = useCallback(
    async (index: number, audioUrl: string) => {
      const audio = audioRef.current;
      if (!audio) return;

      const action = resolveTogglePlaybackAction({
        activeTrackIndex,
        loadingTrackIndex,
        targetIndex: index,
        audioPaused: audio.paused,
      });

      if (action === "noop") {
        return;
      }

      if (action === "pause") {
        audio.pause();
        setIsPlaying(false);
        return;
      }

      if (action === "resume") {
        await audio.play();
        setIsPlaying(true);
        return;
      }

      setLoadingTrackIndex(index);
      try {
        const playbackUrl = await getDisplayUrl(audioUrl);
        if (!playbackUrl) {
          throw new Error("Could not resolve audio URL");
        }

        audio.pause();
        audio.src = playbackUrl;
        audio.load();
        setCurrentTime(0);
        setDuration(0);
        await waitForAudioReady(audio);
        await audio.play();
        setActiveTrackIndex(index);
        setIsPlaying(true);
      } catch (error) {
        console.error("Failed to play track audio", error);
        audio.pause();
        setActiveTrackIndex(null);
        setIsPlaying(false);
        setCurrentTime(0);
        throw error;
      } finally {
        setLoadingTrackIndex(null);
      }
    },
    [activeTrackIndex, loadingTrackIndex],
  );

  const seekTo = useCallback(
    (time: number) => {
      const audio = audioRef.current;
      if (!audio || activeTrackIndex === null) return;

      const nextTime = clampSeekTime(time, audio.duration);
      audio.currentTime = nextTime;
      setCurrentTime(nextTime);
    },
    [activeTrackIndex],
  );

  const beginSeek = useCallback(() => {
    isSeekingRef.current = true;
  }, []);

  const endSeek = useCallback(
    (time: number) => {
      isSeekingRef.current = false;
      seekTo(time);
    },
    [seekTo],
  );

  const stopPlayback = useCallback(() => {
    const audio = audioRef.current;
    audio?.pause();
    setActiveTrackIndex(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, []);

  return {
    audioRef: bindAudioElement,
    activeTrackIndex,
    isPlaying,
    loadingTrackIndex,
    currentTime,
    duration,
    toggleTrackPlayback,
    seekTo,
    beginSeek,
    endSeek,
    stopPlayback,
  };
};
