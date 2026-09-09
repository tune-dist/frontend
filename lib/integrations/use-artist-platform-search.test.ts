import { describe, expect, it } from 'vitest';
import {
  buildArtistSearchCacheKey,
  shouldShowArtistSearchSkeleton,
} from './use-artist-platform-search';

describe('buildArtistSearchCacheKey', () => {
  it('isolates cache per artist index', () => {
    expect(buildArtistSearchCacheKey('main', 'Rohan Suthar')).toBe(
      'main:rohan suthar',
    );
    expect(buildArtistSearchCacheKey(0, 'Rohan Suthar')).toBe('0:rohan suthar');
    expect(buildArtistSearchCacheKey(1, 'Rohan Suthar')).toBe('1:rohan suthar');
    expect(buildArtistSearchCacheKey(2, 'Rohan Suthar')).toBe('2:rohan suthar');
  });

  it('normalizes artist name for cache lookup', () => {
    expect(buildArtistSearchCacheKey(1, '  Rohan Suthar  ')).toBe(
      '1:rohan suthar',
    );
  });
});

describe('shouldShowArtistSearchSkeleton', () => {
  it('shows skeleton only for the artist index that is actively searching', () => {
    expect(shouldShowArtistSearchSkeleton(true, true, false)).toBe(true);
    expect(shouldShowArtistSearchSkeleton(true, false, false)).toBe(false);
    expect(shouldShowArtistSearchSkeleton(false, true, false)).toBe(false);
  });

  it('does not block picker when a platform is already selected', () => {
    expect(shouldShowArtistSearchSkeleton(true, true, true)).toBe(false);
  });

  it('models multi-artist upload: artist 1 search must not block artist 3', () => {
    const artist1Searching = shouldShowArtistSearchSkeleton(true, true, false);
    const artist3WhileArtist1Searches = shouldShowArtistSearchSkeleton(
      false,
      true,
      false,
    );

    expect(artist1Searching).toBe(true);
    expect(artist3WhileArtist1Searches).toBe(false);
  });
});

describe('secondary artist profile selection contract', () => {
  it('buildProfileValueToSave keeps platform ids for nested artist slots', async () => {
    const { buildProfileValueToSave } = await import(
      './apply-artist-profile-selection'
    );

    const saved = buildProfileValueToSave({
      id: 'spotify-artist-1',
      name: 'Rohan Suthar',
      image: 'https://example.com/a.jpg',
      externalUrl: 'https://open.spotify.com/artist/abc',
      followers: 0,
    });

    expect(saved).toEqual({
      id: 'spotify-artist-1',
      name: 'Rohan Suthar',
      image: 'https://example.com/a.jpg',
      url: 'https://open.spotify.com/artist/abc',
      followers: 0,
      track: undefined,
      cosmosId: undefined,
    });
  });
});
