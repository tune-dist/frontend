import { describe, expect, it } from 'vitest';
import {
  artistRoleConflictMessage,
  omitBlockedArtistNames,
  releaseFeaturingArtistNames,
  releaseMainArtistNames,
  sharedArtistName,
} from './main-featuring-artist';

describe('main artist and featuring artist cannot be the same person', () => {
  it('matches names ignoring case and extra spaces', () => {
    expect(sharedArtistName(['Aamir'], ['  aamir  '])).toBe('aamir');
    expect(sharedArtistName(['Aamir'], ['Neha'])).toBeNull();
    expect(sharedArtistName(['Aamir'], [''])).toBeNull();
  });

  it('collects release mains and featuring credits, including track artists', () => {
    expect(
      releaseMainArtistNames({
        artistName: 'Aamir',
        artists: [{ name: 'Neha' }],
        tracks: [{ trackMainArtists: [{ name: 'Kabir' }], artistName: 'Ignored' }],
      }),
    ).toEqual(['Aamir', 'Neha', 'Kabir']);

    expect(
      releaseFeaturingArtistNames({
        featuringArtist: 'Riya',
        tracks: [{ featuringArtist: 'Dev' }],
      }),
    ).toEqual(['Riya', 'Dev']);
  });

  it('hides a featuring artist from the main artist list, and keeps the current selection', () => {
    expect(
      omitBlockedArtistNames(['Aamir', 'Neha', 'Kabir'], ['neha']),
    ).toEqual(['Aamir', 'Kabir']);

    expect(
      omitBlockedArtistNames(['Aamir', 'Neha'], ['aamir'], 'Aamir'),
    ).toEqual(['Aamir', 'Neha']);
  });

  it('uses one message for either direction of the conflict', () => {
    expect(artistRoleConflictMessage('Aamir')).toBe(
      'Aamir cannot be both a main artist and a featuring artist.',
    );
  });
});
