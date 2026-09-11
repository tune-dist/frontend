import { beforeEach, describe, expect, it, vi } from 'vitest';
import { isS3Key } from '@/lib/api/s3';

vi.mock('@/lib/api/s3', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api/s3')>(
    '@/lib/api/s3',
  );
  return {
    ...actual,
    getSignedUrl: vi.fn(async (key: string) => `https://signed.example/${key}`),
    getDisplayUrl: vi.fn(async (url: string) => {
      if (actual.isS3Key(url)) return `https://signed.example/${url}`;
      return url;
    }),
    getS3ObjectBlob: vi.fn(async () => new Blob(['audio-bytes'])),
  };
});

import { getS3ObjectBlob, getSignedUrl } from '@/lib/api/s3';
import {
  attachSignedPlaybackUrl,
  createWaveformObjectUrl,
  resolveAudioPlaybackUrl,
} from './audio-playback';

const STORAGE_KEY = 'tracks/user-1/audio/song.wav';

describe('resolveAudioPlaybackUrl', () => {
  beforeEach(() => {
    vi.mocked(getSignedUrl).mockClear();
  });

  it('signs a storage key even when playbackUrl is also the key', async () => {
    expect(isS3Key(STORAGE_KEY)).toBe(true);

    const url = await resolveAudioPlaybackUrl({
      id: 'audio-1',
      file: null,
      fileName: 'song.wav',
      path: STORAGE_KEY,
      playbackUrl: STORAGE_KEY,
    });

    expect(url).toBe(`https://signed.example/${STORAGE_KEY}`);
    expect(getSignedUrl).toHaveBeenCalledWith(STORAGE_KEY);
  });

  it('does not return a raw S3 key as a fetch URL', async () => {
    const url = await resolveAudioPlaybackUrl({
      id: 'audio-1',
      file: null,
      fileName: 'song.wav',
      path: STORAGE_KEY,
      playbackUrl: STORAGE_KEY,
    });

    expect(url).not.toBe(STORAGE_KEY);
    expect(url?.startsWith('https://')).toBe(true);
  });

  it('passes through an already-signed HTTP URL when path is missing', async () => {
    const signed =
      'https://bucket.s3.amazonaws.com/tracks/user-1/audio/song.wav?X-Amz-Signature=abc';

    const url = await resolveAudioPlaybackUrl({
      id: 'audio-1',
      file: null,
      fileName: 'song.wav',
      playbackUrl: signed,
    });

    expect(url).toBe(signed);
  });
});

describe('attachSignedPlaybackUrl', () => {
  it('replaces a key stored in playbackUrl with a signed URL', async () => {
    const result = await attachSignedPlaybackUrl({
      id: 'audio-1',
      file: null,
      fileName: 'song.wav',
      path: STORAGE_KEY,
      playbackUrl: STORAGE_KEY,
    });

    expect(result?.playbackUrl).toBe(`https://signed.example/${STORAGE_KEY}`);
  });
});

describe('createWaveformObjectUrl', () => {
  beforeEach(() => {
    vi.mocked(getS3ObjectBlob).mockClear();
    vi.stubGlobal(
      'URL',
      Object.assign(URL, {
        createObjectURL: vi.fn(() => 'blob:mock-waveform'),
        revokeObjectURL: vi.fn(),
      }),
    );
  });

  it('loads an S3 key through the API instead of fetching S3 in the browser', async () => {
    const result = await createWaveformObjectUrl(STORAGE_KEY);

    expect(getS3ObjectBlob).toHaveBeenCalledWith(STORAGE_KEY, undefined);
    expect(result).toEqual({ url: 'blob:mock-waveform', shouldRevoke: true });
  });

  it('extracts the storage key from a signed S3 URL', async () => {
    await createWaveformObjectUrl(
      'https://bucket.s3.amazonaws.com/tracks/user-1/audio/song.wav?X-Amz-Signature=abc',
    );

    expect(getS3ObjectBlob).toHaveBeenCalledWith(STORAGE_KEY, undefined);
  });

  it('strips the bucket name from a path-style S3 URL', async () => {
    await createWaveformObjectUrl(
      'https://s3.ap-south-1.amazonaws.com/krato-lib-dev/tracks/user-1/audio/song.wav',
    );

    expect(getS3ObjectBlob).toHaveBeenCalledWith(STORAGE_KEY, undefined);
  });

  it('does not refetch an existing blob URL', async () => {
    const result = await createWaveformObjectUrl('blob:already-loaded');

    expect(getS3ObjectBlob).not.toHaveBeenCalled();
    expect(result).toEqual({
      url: 'blob:already-loaded',
      shouldRevoke: false,
    });
  });
});
