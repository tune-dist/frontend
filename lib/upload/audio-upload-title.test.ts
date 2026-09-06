import { describe, expect, it } from 'vitest';
import { resolveAudioUploadTitle } from './audio-upload-title';

describe('resolveAudioUploadTitle', () => {
  const tracks = [
    { audioFileId: 'af-1', title: 'Track Alpha' },
    { audioFileId: 'af-2', title: 'Track Beta' },
  ];

  it('prefers linked track title over album title', () => {
    expect(
      resolveAudioUploadTitle(
        { id: 'af-1', fileName: 'raw.wav' },
        tracks,
        0,
        'My Album',
      ),
    ).toBe('Track Alpha');
  });

  it('uses file name when track title is empty', () => {
    expect(
      resolveAudioUploadTitle(
        { id: 'af-9', fileName: 'custom-name.wav' },
        [{ audioFileId: 'af-9', title: '' }],
        0,
        'My Album',
      ),
    ).toBe('custom-name');
  });

  it('falls back to album title with index when no link exists', () => {
    expect(
      resolveAudioUploadTitle(
        { id: 'orphan', fileName: '' },
        tracks,
        2,
        'Summer EP',
      ),
    ).toBe('Summer EP-track-3');
  });

  it('uses different titles for different tracks in the same album', () => {
    const t0 = resolveAudioUploadTitle({ id: 'af-1' }, tracks, 0, 'Same Album');
    const t1 = resolveAudioUploadTitle({ id: 'af-2' }, tracks, 1, 'Same Album');
    expect(t0).not.toBe(t1);
  });
});
