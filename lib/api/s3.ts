import apiClient from '../api-client';

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
      console.error('Failed to get signed URL for:', key, error);
      return s3Key;
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
