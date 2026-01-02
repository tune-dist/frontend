'use client';

import { useState, useEffect, ImgHTMLAttributes } from 'react';
import { getSignedUrl, isS3Key } from '@/lib/api/s3';

interface S3ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
    src: string | undefined;
    fallback?: React.ReactNode;
}

/**
 * Image component that automatically handles S3 keys by converting them to pre-signed URLs
 * Use this component instead of <img> when the src might be an S3 key
 */
export function S3Image({ src, fallback, alt, ...props }: S3ImageProps) {
    const [displayUrl, setDisplayUrl] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!src) {
            setDisplayUrl('');
            setLoading(false);
            return;
        }

        // If it's not an S3 key, use as-is
        if (!isS3Key(src)) {
            setDisplayUrl(src);
            setLoading(false);
            return;
        }

        // Fetch signed URL
        setLoading(true);
        setError(false);

        getSignedUrl(src)
            .then((signedUrl) => {
                setDisplayUrl(signedUrl);
            })
            .catch((err) => {
                console.error('Failed to get signed URL:', err);
                setError(true);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [src]);

    if (!src || error) {
        return fallback ? <>{fallback}</> : null;
    }

    if (loading) {
        // Show a placeholder while loading
        return (
            <div
                className={`animate-pulse bg-muted ${props.className || ''}`}
                style={props.style}
            />
        );
    }

    return <img src={displayUrl} alt={alt} {...props} />;
}

/**
 * Get a background image style with S3 support
 * Returns the style object to use in inline styles
 */
export function useS3BackgroundUrl(src: string | undefined): {
    backgroundImage: string;
    loading: boolean;
} {
    const [displayUrl, setDisplayUrl] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!src) {
            setDisplayUrl('');
            setLoading(false);
            return;
        }

        if (!isS3Key(src)) {
            setDisplayUrl(src);
            setLoading(false);
            return;
        }

        setLoading(true);
        getSignedUrl(src)
            .then((signedUrl) => {
                setDisplayUrl(signedUrl);
            })
            .catch(() => {
                setDisplayUrl('');
            })
            .finally(() => {
                setLoading(false);
            });
    }, [src]);

    return {
        backgroundImage: displayUrl ? `url(${displayUrl})` : '',
        loading,
    };
}
