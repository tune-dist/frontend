'use client';

import { useState, useEffect } from 'react';
import { getSignedUrl, isS3Key } from '@/lib/api/s3';

/**
 * React hook to convert an S3 key to a pre-signed URL
 * Returns the signed URL or the original URL if not an S3 key
 */
export function useS3Url(s3KeyOrUrl: string | undefined): {
    url: string;
    loading: boolean;
    error: Error | null;
} {
    const [url, setUrl] = useState<string>(s3KeyOrUrl || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!s3KeyOrUrl) {
            setUrl('');
            return;
        }

        // If it's not an S3 key, use as-is
        if (!isS3Key(s3KeyOrUrl)) {
            setUrl(s3KeyOrUrl);
            return;
        }

        // Fetch signed URL
        setLoading(true);
        setError(null);

        getSignedUrl(s3KeyOrUrl)
            .then((signedUrl) => {
                setUrl(signedUrl);
            })
            .catch((err) => {
                setError(err);
                // Fallback to original key
                setUrl(s3KeyOrUrl);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [s3KeyOrUrl]);

    return { url, loading, error };
}

/**
 * React hook to convert multiple S3 keys to pre-signed URLs
 */
export function useS3Urls(s3KeysOrUrls: (string | undefined)[]): {
    urls: Map<string, string>;
    loading: boolean;
} {
    const [urls, setUrls] = useState<Map<string, string>>(new Map());
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const keysToFetch = s3KeysOrUrls.filter(
            (key): key is string => !!key && isS3Key(key)
        );

        if (keysToFetch.length === 0) {
            // Build map with original values
            const map = new Map<string, string>();
            s3KeysOrUrls.forEach((key) => {
                if (key) map.set(key, key);
            });
            setUrls(map);
            return;
        }

        setLoading(true);

        Promise.all(
            keysToFetch.map(async (key) => {
                const signedUrl = await getSignedUrl(key);
                return { key, signedUrl };
            })
        )
            .then((results) => {
                const map = new Map<string, string>();
                // Add original URLs that weren't S3 keys
                s3KeysOrUrls.forEach((key) => {
                    if (key && !isS3Key(key)) {
                        map.set(key, key);
                    }
                });
                // Add signed URLs
                results.forEach(({ key, signedUrl }) => {
                    map.set(key, signedUrl);
                });
                setUrls(map);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [JSON.stringify(s3KeysOrUrls)]);

    return { urls, loading };
}
