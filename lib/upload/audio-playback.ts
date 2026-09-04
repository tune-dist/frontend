import { useEffect, useMemo, useState } from "react";
import type { AudioFile, Track, UploadFormData } from "@/components/dashboard/upload/upload-form.schema";
import { getSignedUrl } from "@/lib/api/s3";

type FormAudio = UploadFormData["audioFile"] | AudioFile | null | undefined;

function isFile(value: unknown): value is File {
  return typeof File !== "undefined" && value instanceof File;
}

export async function attachSignedPlaybackUrl(
  audio: AudioFile | null | undefined,
): Promise<AudioFile | null | undefined> {
  if (!audio?.path) return audio;
  if (audio.playbackUrl) return audio;
  if (audio.path.startsWith("http")) {
    return { ...audio, playbackUrl: audio.path };
  }

  try {
    const playbackUrl = await getSignedUrl(audio.path);
    if (!playbackUrl) return audio;
    return { ...audio, playbackUrl };
  } catch (error) {
    console.error("Failed to resolve signed audio playback URL", error);
    return audio;
  }
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

async function resolvePlaybackUrl(record: AudioFile | FormAudio): Promise<string | null> {
  const audio = record as AudioFile;
  if (audio.playbackUrl?.trim()) return audio.playbackUrl;
  if (!audio.path?.trim()) return null;

  if (audio.path.startsWith("http")) {
    return audio.path;
  }

  const hydrated = await attachSignedPlaybackUrl(audio);
  return hydrated?.playbackUrl?.trim() || null;
}

async function toWaveformSource(record: AudioFile | FormAudio): Promise<File | string | null> {
  if (isFile((record as AudioFile).file)) {
    return (record as AudioFile).file as File;
  }

  const playbackUrl = await resolvePlaybackUrl(record);
  if (!playbackUrl) return null;

  const response = await fetch(playbackUrl);
  if (!response.ok) {
    throw new Error(`Failed to load audio (${response.status})`);
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
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
