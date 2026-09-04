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

  session.newKeys.push(key);

  const previous = replaceKey?.trim();
  if (previous && previous !== key && !session.supersededKeys.includes(previous)) {
    session.supersededKeys.push(previous);
  }
}

export async function abandonUploadSession(session: UploadSession): Promise<void> {
  if (session.newKeys.length === 0) return;

  try {
    await apiClient.post('/chunk_files/abandon', { keys: session.newKeys });
  } catch (error) {
    console.warn('[upload] Failed to abandon orphaned S3 keys', error);
  } finally {
    session.newKeys.length = 0;
  }
}

export async function finalizeUploadSession(session: UploadSession): Promise<void> {
  if (session.supersededKeys.length === 0) {
    session.newKeys.length = 0;
    return;
  }

  try {
    await apiClient.post('/chunk_files/abandon', { keys: session.supersededKeys });
  } catch (error) {
    console.warn('[upload] Failed to delete superseded S3 keys', error);
  } finally {
    session.newKeys.length = 0;
    session.supersededKeys.length = 0;
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
