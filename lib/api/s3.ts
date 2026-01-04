import apiClient from '../api-client';

// Cache for pre-signed URLs to avoid redundant API calls
const urlCache = new Map<string, { url: string; expiresAt: number }>();

// Default cache duration (45 minutes to be safe, since URLs expire in 1 hour)
const CACHE_DURATION_MS = 45 * 60 * 1000;

/**
 * Check if a URL is an S3 key (not a full URL)
 */
export const isS3Key = (url: string): boolean => {
    if (!url) return false;
    // S3 keys don't start with http/https and typically follow pattern: type/uuid.ext or s3://...
    return url.startsWith('s3://') || (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('/uploads/'));
};

/**
 * Get a pre-signed URL for an S3 key
 * Caches URLs to avoid redundant API calls
 */
export const getSignedUrl = async (s3Key: string): Promise<string> => {
    if (!s3Key || !isS3Key(s3Key)) {
        // If it's already a full URL, return as-is
        return s3Key;
    }

    // Check cache first
    const cached = urlCache.get(s3Key);
    if (cached && cached.expiresAt > Date.now()) {
        return cached.url;
    }

    try {
        // Strip s3:// prefix if present
        const cleanKey = s3Key.startsWith('s3://') ? s3Key.replace('s3://', '') : s3Key;

        const response = await apiClient.get('/s3/signed-url', {
            params: { key: cleanKey }
        });

        const signedUrl = response.data.url;

        // Cache the URL
        urlCache.set(s3Key, {
            url: signedUrl,
            expiresAt: Date.now() + CACHE_DURATION_MS
        });

        return signedUrl;
    } catch (error) {
        console.error('Failed to get signed URL for:', s3Key, error);
        // Return the original key if we can't get a signed URL
        // This allows graceful degradation
        return s3Key;
    }
};

/**
 * Convert multiple S3 keys to signed URLs in parallel
 */
export const getSignedUrls = async (s3Keys: string[]): Promise<Map<string, string>> => {
    const results = new Map<string, string>();

    const promises = s3Keys.map(async (key) => {
        const url = await getSignedUrl(key);
        results.set(key, url);
    });

    await Promise.all(promises);
    return results;
};

/**
 * Clear the URL cache (useful when user logs out or for testing)
 */
export const clearUrlCache = (): void => {
    urlCache.clear();
};

/**
 * Get a displayable URL - handles both S3 keys and regular URLs
 * This is the main function to use in components
 */
export const getDisplayUrl = async (url: string | undefined): Promise<string> => {
    if (!url) return '';

    if (isS3Key(url)) {
        return getSignedUrl(url);
    }

    return url;
};
