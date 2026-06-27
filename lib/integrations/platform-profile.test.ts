import { describe, expect, it } from 'vitest';
import {
  extractAppleArtistId,
  profileNeedsAppleEnrichment,
  resolvePlatformProfile,
} from '@/lib/integrations/platform-profile.util';

describe('platform-profile.util', () => {
  describe('extractAppleArtistId', () => {
    it('extracts id from regional Apple Music artist URLs', () => {
      expect(
        extractAppleArtistId('https://music.apple.com/in/artist/dj-glory/909253'),
      ).toBe('909253');
    });

    it('extracts id from simple Apple Music artist URLs', () => {
      expect(extractAppleArtistId('https://music.apple.com/artist/909253')).toBe(
        '909253',
      );
    });

    it('returns plain numeric ids', () => {
      expect(extractAppleArtistId('909253')).toBe('909253');
    });
  });

  describe('profileNeedsAppleEnrichment', () => {
    it('is true for linked Apple URLs without images', () => {
      expect(
        profileNeedsAppleEnrichment(
          'https://music.apple.com/in/artist/dj-glory/909253',
        ),
      ).toBe(true);
    });

    it('is false when a rich profile already has an image', () => {
      expect(
        profileNeedsAppleEnrichment({
          id: '909253',
          name: 'DJ Glory',
          image: 'https://is1-ssl.mzstatic.com/image.jpg',
          url: 'https://music.apple.com/artist/909253',
        }),
      ).toBe(false);
    });
  });

  describe('resolvePlatformProfile (apple)', () => {
    it('matches stored regional URLs to search hits by numeric id', () => {
      const resolved = resolvePlatformProfile(
        'apple',
        'https://music.apple.com/in/artist/dj-glory/909253',
        'DJ Glory',
        {
          spotify: [],
          apple: [
            {
              id: '909253',
              name: 'DJ Glory',
              image: 'https://is1-ssl.mzstatic.com/album.jpg',
              externalUrl: 'https://music.apple.com/artist/909253',
              track: 'Latest Album',
            },
          ],
          youtube: [],
        },
      );

      expect(resolved).toEqual({
        id: '909253',
        name: 'DJ Glory',
        image: 'https://is1-ssl.mzstatic.com/album.jpg',
        url: 'https://music.apple.com/artist/909253',
        track: 'Latest Album',
      });
    });
  });
});
