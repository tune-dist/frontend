"use client";

import { useCallback, useRef, useState } from "react";
import { getDisplayUrl } from "@/lib/api/s3";

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
  const [playingTrackIndex, setPlayingTrackIndex] = useState<number | null>(null);
  const [loadingTrackIndex, setLoadingTrackIndex] = useState<number | null>(null);

  const toggleTrackPlayback = useCallback(
    async (index: number, audioUrl: string) => {
      const audio = audioRef.current;
      if (!audio || loadingTrackIndex !== null) return;

      if (playingTrackIndex === index) {
        audio.pause();
        setPlayingTrackIndex(null);
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
        await waitForAudioReady(audio);
        await audio.play();
        setPlayingTrackIndex(index);
      } catch (error) {
        console.error("Failed to play track audio", error);
        audio.pause();
        setPlayingTrackIndex(null);
        throw error;
      } finally {
        setLoadingTrackIndex(null);
      }
    },
    [loadingTrackIndex, playingTrackIndex],
  );

  const stopPlayback = useCallback(() => {
    audioRef.current?.pause();
    setPlayingTrackIndex(null);
  }, []);

  return {
    audioRef,
    playingTrackIndex,
    loadingTrackIndex,
    toggleTrackPlayback,
    stopPlayback,
  };
}
