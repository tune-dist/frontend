import { describe, expect, it } from 'vitest';
import {
  applyRosterArtistToSecondarySlot,
  emptySecondaryArtistSlot,
  rosterArtistName,
} from '@/lib/integrations/artist-form-state.util';
import {
  buildProfileValueToSave,
  rosterArtistHasPendingProfiles,
} from '@/lib/integrations/apply-artist-profile-selection';
import { buildArtistSearchCacheKey } from '@/lib/integrations/use-artist-platform-search';
import { buildProfilesFromLegacy, profilesToLegacyFormFields } from '@/lib/releases/platform-ref.util';

describe('artist-flow (frontend)', () => {
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

    it('applyRosterArtistToSecondarySlot reads cosmosId from roster', () => {
      const artistB = applyRosterArtistToSecondarySlot({
        name: 'Artist B',
        cosmosId: 'cosmos-b',
      });
      expect(artistB.cosmosArtistId).toBe('cosmos-b');
    });
  });

  describe('Create New profile value', () => {
    it('buildProfileValueToSave keeps new sentinel', () => {
      expect(buildProfileValueToSave('new')).toBe('new');
    });

    it('buildProfileValueToSave preserves cosmosId on search hits', () => {
      expect(
        buildProfileValueToSave({
          id: 'sp1',
          cosmosId: 'cosmos-from-search',
          name: 'Artist',
        }),
      ).toEqual(
        expect.objectContaining({
          id: 'sp1',
          cosmosId: 'cosmos-from-search',
        }),
      );
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

  describe('roster pending profiles', () => {
    it('rosterArtistHasPendingProfiles detects new sentinels and flag', () => {
      expect(
        rosterArtistHasPendingProfiles({
          name: 'Artist',
          profilesPending: true,
        }),
      ).toBe(true);
      expect(
        rosterArtistHasPendingProfiles({
          name: 'Artist',
          spotifyProfile: 'new',
        }),
      ).toBe(true);
      expect(
        rosterArtistHasPendingProfiles({
          name: 'Artist',
          spotifyProfile: { id: 'sp1' },
        }),
      ).toBe(false);
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
