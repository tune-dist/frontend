import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  applyRosterArtistToSecondarySlot,
  emptySecondaryArtistSlot,
  rosterArtistName,
} from '@/lib/integrations/artist-form-state.util';
import {
  buildProfileValueToSave,
  registerCosmosArtistIfNeeded,
} from '@/lib/integrations/apply-artist-profile-selection';
import { buildArtistSearchCacheKey } from '@/lib/integrations/use-artist-platform-search';
import { buildProfilesFromLegacy, profilesToLegacyFormFields } from '@/lib/releases/platform-ref.util';

vi.mock('@/lib/api/cosmos-artists', () => ({
  findOrAddCosmosArtist: vi.fn(),
}));

import { findOrAddCosmosArtist } from '@/lib/api/cosmos-artists';

const mockedFindOrAdd = vi.mocked(findOrAddCosmosArtist);

describe('artist-flow (frontend)', () => {
  beforeEach(() => {
    mockedFindOrAdd.mockReset();
  });

  describe('roster switch does not leak previous artist data', () => {
    it('emptySecondaryArtistSlot clears all platform fields', () => {
      const slot = emptySecondaryArtistSlot('Artist B');
      expect(slot).toEqual({
        name: 'Artist B',
        spotifyProfile: '',
        appleMusicProfile: '',
        youtubeMusicProfile: '',
        cosmosArtistId: undefined,
        instagramProfile: '',
        facebookProfile: '',
      });
    });

    it('applyRosterArtistToSecondarySlot only applies selected artist fields', () => {
      const artistA = {
        name: 'Artist A',
        cosmosArtistId: 'cosmos-a',
        spotifyProfile: { id: 'spotify-a', name: 'A' },
        appleMusicProfile: { id: '111' },
      };
      const artistB = applyRosterArtistToSecondarySlot({
        name: 'Artist B',
        spotifyProfile: { id: 'spotify-b', name: 'B' },
      });

      expect(artistB.name).toBe('Artist B');
      expect(artistB.spotifyProfile).toEqual({ id: 'spotify-b', name: 'B' });
      expect(artistB.cosmosArtistId).toBeUndefined();
      expect(artistB.appleMusicProfile).toBe('');
      expect(rosterArtistName(artistA)).toBe('Artist A');
    });
  });

  describe('Create New profile value', () => {
    it('buildProfileValueToSave keeps new sentinel', () => {
      expect(buildProfileValueToSave('new')).toBe('new');
    });

    it('draft roundtrip preserves new for UI reload', () => {
      const profiles = buildProfilesFromLegacy({
        spotifyProfile: 'new',
        appleMusicProfile: 'new',
      });
      const legacy = profilesToLegacyFormFields(profiles);
      expect(legacy.spotifyProfile).toBe('new');
      expect(legacy.appleMusicProfile).toBe('new');
    });
  });

  describe('registerCosmosArtistIfNeeded', () => {
    const cosmosSearch = {
      source: 'cosmos' as const,
      spotify: [],
      apple: [],
      youtube: [],
    };

    it('does not call find-or-add for Spotify Create New', async () => {
      const id = await registerCosmosArtistIfNeeded({
        searchResults: cosmosSearch,
        artistName: 'New Artist',
        platform: 'spotify',
        profile: 'new',
        valueToSave: 'new',
        existingProfiles: {},
      });

      expect(id).toBeUndefined();
      expect(mockedFindOrAdd).not.toHaveBeenCalled();
    });

    it('does not call find-or-add for YouTube', async () => {
      await registerCosmosArtistIfNeeded({
        searchResults: cosmosSearch,
        artistName: 'Artist',
        platform: 'youtube',
        profile: { id: 'yt1' },
        valueToSave: { id: 'yt1' },
        existingProfiles: {},
      });

      expect(mockedFindOrAdd).not.toHaveBeenCalled();
    });

    it('uses cosmosId from search row without API call', async () => {
      const id = await registerCosmosArtistIfNeeded({
        searchResults: cosmosSearch,
        artistName: 'Existing',
        platform: 'spotify',
        profile: { id: 'sp1', cosmosId: 'cosmos-from-search' },
        valueToSave: { id: 'sp1' },
        existingProfiles: {},
      });

      expect(id).toBe('cosmos-from-search');
      expect(mockedFindOrAdd).not.toHaveBeenCalled();
    });

    it('calls find-or-add for linked Spotify profile without cosmosId', async () => {
      mockedFindOrAdd.mockResolvedValue({
        matchedExisting: false,
        cosmosId: 'registered-id',
        name: 'Linked Artist',
      });

      const id = await registerCosmosArtistIfNeeded({
        searchResults: cosmosSearch,
        artistName: 'Linked Artist',
        platform: 'spotify',
        profile: { id: '38O4JwTrDeZv9OVXPYRkZy', name: 'Linked' },
        valueToSave: { id: '38O4JwTrDeZv9OVXPYRkZy' },
        existingProfiles: {},
      });

      expect(id).toBe('registered-id');
      expect(mockedFindOrAdd).toHaveBeenCalledOnce();
    });
  });

  describe('search cache keys are per artist name', () => {
    it('buildArtistSearchCacheKey isolates artists on same slot', () => {
      expect(buildArtistSearchCacheKey('main', 'Artist A')).toBe('main:artist a');
      expect(buildArtistSearchCacheKey('main', 'Artist B')).toBe('main:artist b');
      expect(buildArtistSearchCacheKey(0, 'Artist A')).toBe('0:artist a');
    });
  });
});
