import apiClient from '@/lib/api-client';
import type { UseFormSetValue } from 'react-hook-form';
import type { UploadFormData } from '@/components/dashboard/upload/upload-form.schema';

export type UploadSession = {
  /** Keys uploaded during this submit attempt — removed if the API save fails. */
  newKeys: string[];
  /** Prior keys replaced by new uploads — removed after a successful save. */
  supersededKeys: string[];
};

export function createUploadSession(): UploadSession {
  return { newKeys: [], supersededKeys: [] };
}

export function recordUploadedKey(
  session: UploadSession,
  storageKey: string,
  replaceKey?: string | null,
): void {
  const key = storageKey?.trim();
  if (!key) return;

  const previous = replaceKey?.trim();
  if (previous && previous === key) return;

  session.newKeys.push(key);

  if (previous && !session.supersededKeys.includes(previous)) {
    session.supersededKeys.push(previous);
  }
}

function uniqueTrimmed(keys: string[]): string[] {
  const result: string[] = [];
  for (const key of keys) {
    const trimmed = key.trim();
    if (!trimmed || result.includes(trimmed)) continue;
    result.push(trimmed);
  }
  return result;
}

/** New uploads from this attempt that are not already stored on the release. */
export function keysToDeleteOnFailedSave(
  session: UploadSession,
  savedKeys: string[],
): string[] {
  const saved = new Set(uniqueTrimmed(savedKeys));
  return uniqueTrimmed(session.newKeys).filter((key) => !saved.has(key));
}

/** Replaced files that the successful save no longer points at. */
export function keysToDeleteAfterSuccessfulSave(
  session: UploadSession,
  savedKeys: string[],
): string[] {
  const saved = new Set(uniqueTrimmed(savedKeys));
  return uniqueTrimmed(session.supersededKeys).filter((key) => !saved.has(key));
}

export function collectSnapshotStorageKeys(
  snapshot:
    | {
        coverArt?: { url?: string; storageKey?: string } | null;
        tracks?: Array<{ audioFile?: { url?: string } | null }> | null;
      }
    | null
    | undefined,
): string[] {
  if (!snapshot) return [];

  const keys: string[] = [];
  const cover =
    snapshot.coverArt?.storageKey?.trim() || snapshot.coverArt?.url?.trim();
  if (cover && !cover.startsWith('http')) keys.push(cover);

  for (const track of snapshot.tracks || []) {
    const url = track.audioFile?.url?.trim();
    if (url && !url.startsWith('http')) keys.push(url);
  }

  return keys;
}

export async function abandonUploadKeys(keys: string[]): Promise<void> {
  const uniqueKeys: string[] = [];
  for (const key of keys) {
    const trimmed = key.trim();
    if (!trimmed || uniqueKeys.includes(trimmed)) continue;
    uniqueKeys.push(trimmed);
  }
  if (uniqueKeys.length === 0) return;

  try {
    await apiClient.post('/chunk_files/abandon', { keys: uniqueKeys });
  } catch (error) {
    console.warn('[upload] Failed to abandon orphaned S3 keys', error);
  }
}

export async function abandonUploadSession(
  session: UploadSession,
  savedKeys: string[] = [],
): Promise<void> {
  const keys = keysToDeleteOnFailedSave(session, savedKeys);
  if (keys.length === 0) {
    session.newKeys.length = 0;
    return;
  }

  try {
    await abandonUploadKeys(keys);
  } catch (error) {
    console.warn('[upload] Failed to abandon orphaned S3 keys', error);
  } finally {
    session.newKeys.length = 0;
  }
}

export async function finalizeUploadSession(
  session: UploadSession,
  savedKeys: string[] = [],
): Promise<void> {
  const keys = keysToDeleteAfterSuccessfulSave(session, savedKeys);
  session.newKeys.length = 0;
  session.supersededKeys.length = 0;
  if (keys.length === 0) return;

  try {
    await apiClient.post('/chunk_files/abandon', { keys });
  } catch (error) {
    console.warn('[upload] Failed to delete superseded S3 keys', error);
  }
}

export type FormMediaAudioFile = {
  id?: string;
  file?: File | null;
  fileName?: string;
  size?: number;
  path?: string;
  replacedPath?: string;
  duration?: number;
  hash?: string;
  fingerprint?: string;
  playbackUrl?: string;
};

export type FormMediaUpdates = {
  audioFiles?: FormMediaAudioFile[];
  audioFile?: FormMediaAudioFile | null;
  coverArt?: UploadFormData['coverArt'];
};

export function applyFormMediaUpdates(
  updates: FormMediaUpdates,
  setValue: UseFormSetValue<UploadFormData>,
): void {
  if (updates.audioFiles) {
    setValue('audioFiles', updates.audioFiles as UploadFormData['audioFiles'], {
      shouldValidate: true,
    });
  }
  if (updates.audioFile !== undefined) {
    setValue('audioFile', updates.audioFile as UploadFormData['audioFile'], {
      shouldValidate: true,
    });
  }
  if (updates.coverArt !== undefined) {
    setValue('coverArt', updates.coverArt, { shouldValidate: true });
  }
}
