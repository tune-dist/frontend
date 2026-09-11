import { useEffect, useMemo, useState } from "react";
import type { AudioFile, Track, UploadFormData } from "@/components/dashboard/upload/upload-form.schema";
import { getDisplayUrl, getS3ObjectBlob, getSignedUrl, isS3Key, toStorageKey } from "@/lib/api/s3";

type FormAudio = UploadFormData["audioFile"] | AudioFile | null | undefined;

function isFile(value: unknown): value is File {
  return typeof File !== "undefined" && value instanceof File;
}

function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

/** Sign a stored S3 key. Never treat the raw key as a fetchable website URL. */
export async function resolveAudioPlaybackUrl(
  record: AudioFile | FormAudio,
): Promise<string | null> {
  const audio = record as AudioFile;
  const path = audio.path?.trim() || "";
  const playbackUrl = audio.playbackUrl?.trim() || "";

  if (path && isS3Key(path)) {
    const signed = await getSignedUrl(path);
    if (signed && isHttpUrl(signed)) return signed;
  }

  const candidate = playbackUrl || path;
  if (!candidate) return null;
  if (isHttpUrl(candidate)) return candidate;

  const resolved = await getDisplayUrl(candidate);
  if (resolved && isHttpUrl(resolved)) return resolved;
  return null;
}

export async function attachSignedPlaybackUrl(
  audio: AudioFile | null | undefined,
): Promise<AudioFile | null | undefined> {
  if (!audio) return audio;
  if (!audio.path && !audio.playbackUrl) return audio;

  try {
    const playbackUrl = await resolveAudioPlaybackUrl(audio);
    if (!playbackUrl) return audio;
    return { ...audio, playbackUrl };
  } catch (error) {
    console.error("Failed to resolve signed audio playback URL", error);
    return audio;
  }
}

/**
 * Load audio through the API so the browser never fetches S3 directly.
 * Signed S3 URLs fail here because bucket CORS is not set for WebAudio/fetch.
 */
export async function createWaveformObjectUrl(
  audioFile: File | string,
  signal?: AbortSignal,
): Promise<{ url: string; shouldRevoke: boolean }> {
  if (typeof audioFile !== "string") {
    return { url: URL.createObjectURL(audioFile), shouldRevoke: true };
  }
  if (audioFile.startsWith("blob:")) {
    return { url: audioFile, shouldRevoke: false };
  }

  const key = toStorageKey(audioFile);
  if (!key) {
    throw new Error("Could not load the saved audio file for clip selection.");
  }

  const blob = await getS3ObjectBlob(key, signal);
  return { url: URL.createObjectURL(blob), shouldRevoke: true };
}

export async function attachSignedPlaybackUrls(
  audioFiles: AudioFile[],
): Promise<AudioFile[]> {
  return Promise.all(
    audioFiles.map(async (audio) => (await attachSignedPlaybackUrl(audio)) as AudioFile),
  );
}

export function findCrbtAudioRecord(
  audioFile: FormAudio,
  audioFiles: AudioFile[],
  tracks: Track[],
): AudioFile | FormAudio | null {
  const root = audioFile as AudioFile | null | undefined;
  if (root && (isFile(root.file) || root.playbackUrl || root.path)) {
    return root;
  }

  const linkedTrack = tracks.find((track) => track.audioFileId);
  if (!linkedTrack?.audioFileId) return null;

  return audioFiles.find((audio) => audio.id === linkedTrack.audioFileId) ?? null;
}

export function resolveCrbtTrackDuration(
  audioFile: FormAudio,
  audioFiles: AudioFile[],
  tracks: Track[],
): number | null {
  const record = findCrbtAudioRecord(audioFile, audioFiles, tracks) as AudioFile | null;
  if (typeof record?.duration === "number") return record.duration;
  return null;
}

async function toWaveformSource(record: AudioFile | FormAudio): Promise<File | string | null> {
  if (isFile((record as AudioFile).file)) {
    return (record as AudioFile).file as File;
  }

  const audio = record as AudioFile;
  const source = audio.path?.trim() || audio.playbackUrl?.trim() || "";
  if (!source) return null;

  const loaded = await createWaveformObjectUrl(source);
  return loaded.url;
}

export function useResolvedCrbtPlayback(
  audioFile: FormAudio,
  audioFiles: AudioFile[],
  tracks: Track[],
) {
  const audioRecord = useMemo(
    () => findCrbtAudioRecord(audioFile, audioFiles, tracks),
    [audioFile, audioFiles, tracks],
  );
  const trackDurationSec = useMemo(
    () => resolveCrbtTrackDuration(audioFile, audioFiles, tracks),
    [audioFile, audioFiles, tracks],
  );

  const [playbackSource, setPlaybackSource] = useState<File | string | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  const [resolveError, setResolveError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;

    const resolve = async () => {
      setIsResolving(true);
      setResolveError(null);
      setPlaybackSource(null);

      if (!audioRecord) {
        setIsResolving(false);
        return;
      }

      try {
        const source = await toWaveformSource(audioRecord);
        if (cancelled) return;

        if (!source) {
          setResolveError("Could not load the saved audio file for clip selection.");
          return;
        }

        if (typeof source === "string" && source.startsWith("blob:")) {
          objectUrl = source;
        }

        setPlaybackSource(source);
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to resolve CRBT playback source", error);
          setResolveError(
            error instanceof Error
              ? error.message
              : "Failed to load audio for clip selection.",
          );
        }
      } finally {
        if (!cancelled) setIsResolving(false);
      }
    };

    void resolve();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [audioRecord]);

  return {
    hasAudio: !!audioRecord,
    playbackSource,
    isResolving,
    resolveError,
    trackDurationSec,
  };
}
