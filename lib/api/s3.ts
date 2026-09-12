import apiClient from '../api-client';
import { isPlanInactiveError } from '../plan-inactive';

const urlCache = new Map<string, { url: string; expiresAt: number }>();
const inFlight = new Map<string, Promise<string>>();

const CACHE_DURATION_MS = 45 * 60 * 1000;

function normalizeS3Key(s3Key: string): string {
  const trimmed = s3Key.trim();
  return trimmed.startsWith('s3://') ? trimmed.slice(5) : trimmed;
}

export const isS3Key = (url: string): boolean => {
  if (!url) return false;
  if (url.startsWith('s3://')) return true;
  return !url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('/');
};

export const getSignedUrl = async (s3Key: string): Promise<string> => {
  if (!s3Key || !isS3Key(s3Key)) {
    return s3Key;
  }

  const key = normalizeS3Key(s3Key);

  const cached = urlCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.url;
  }

  const pending = inFlight.get(key);
  if (pending) {
    return pending;
  }

  const promise = (async () => {
    try {
      const response = await apiClient.get<{ url: string }>('/s3/signed-url', {
        params: { key },
      });

      const signedUrl = response.data.url;
      urlCache.set(key, {
        url: signedUrl,
        expiresAt: Date.now() + CACHE_DURATION_MS,
      });

      return signedUrl;
    } catch (error) {
      if (isPlanInactiveError(error)) {
        throw error;
      }
      console.warn('Failed to get signed URL for:', key, error);
      return '';
    } finally {
      inFlight.delete(key);
    }
  })();

  inFlight.set(key, promise);
  return promise;
};

export const getSignedUrls = async (s3Keys: string[]): Promise<Map<string, string>> => {
  const uniqueKeys = Array.from(new Set(s3Keys.filter((key) => key && isS3Key(key))));
  const entries = await Promise.all(
    uniqueKeys.map(async (key) => [key, await getSignedUrl(key)] as const),
  );

  const results = new Map<string, string>();
  s3Keys.forEach((key) => {
    if (key && !isS3Key(key)) {
      results.set(key, key);
    }
  });
  entries.forEach(([key, url]) => results.set(key, url));

  return results;
};

export const clearUrlCache = (): void => {
  urlCache.clear();
  inFlight.clear();
};

export const getDisplayUrl = async (url: string | undefined): Promise<string> => {
  if (!url) return '';
  if (isS3Key(url)) return getSignedUrl(url);
  return url;
};

export function toStorageKey(urlOrKey: string): string {
  const trimmed = urlOrKey.trim();
  if (!trimmed || trimmed.startsWith('blob:')) return '';

  let key = trimmed;
  if (key.startsWith('s3://')) key = key.slice(5);
  if (/^https?:\/\//i.test(key)) {
    try {
      key = decodeURIComponent(new URL(key).pathname.replace(/^\/+/, ''));
    } catch {
      return '';
    }
  } else {
    key = key.replace(/^\//, '');
  }

  const tracksAt = key.indexOf('tracks/');
  if (tracksAt > 0) {
    return key.slice(tracksAt);
  }
  const usersAt = key.indexOf('users/');
  if (usersAt > 0) {
    return key.slice(usersAt);
  }
  return key;
}

export async function getS3ObjectBlob(
  key: string,
  signal?: AbortSignal,
): Promise<Blob> {
  try {
    const response = await apiClient.get<Blob>('/s3/object', {
      params: { key },
      responseType: 'blob',
      signal,
    });
    return response.data;
  } catch (error) {
    if (isPlanInactiveError(error)) {
      throw error;
    }
    const status = (error as { response?: { status?: number } })?.response
      ?.status;
    if (status) {
      throw new Error(`Failed to load audio (${status})`);
    }
    throw error;
  }
}
