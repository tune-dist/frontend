import type { UseFormSetValue } from 'react-hook-form';
import type { UploadFormData } from '@/components/dashboard/upload/types';

/** Clear platform + social fields for the main artist (roster switch / change artist). */
export function clearMainArtistFormProfiles(
  setValue: UseFormSetValue<UploadFormData>,
): void {
  setValue('spotifyProfile', '', { shouldValidate: true });
  setValue('appleMusicProfile', '', { shouldValidate: true });
  setValue('youtubeMusicProfile', '', { shouldValidate: true });
  setValue('cosmosArtistId', undefined, { shouldValidate: true });
  setValue('instagramProfile', '', { shouldValidate: true });
  setValue('facebookProfile', '', { shouldValidate: true });
  setValue('instagramProfileUrl', '', { shouldValidate: true });
  setValue('facebookProfileUrl', '', { shouldValidate: true });
}

export type RosterArtist =
  | string
  | {
      name: string;
      cosmosId?: string;
      cosmosArtistId?: string;
      profilesPending?: boolean;
      spotifyProfile?: unknown;
      appleMusicProfile?: unknown;
      youtubeMusicProfile?: unknown;
      instagramProfile?: unknown;
      facebookProfile?: unknown;
    };

export function rosterArtistName(artist: RosterArtist): string {
  return typeof artist === 'string' ? artist : artist.name;
}

/** Apply roster artist profiles onto main form after fields were cleared. */
export function applyRosterArtistToMainForm(
  setValue: UseFormSetValue<UploadFormData>,
  artist: RosterArtist,
): void {
  if (typeof artist !== 'object') return;

  const cosmosId =
    artist.cosmosArtistId?.trim() ||
    artist.cosmosId?.trim();
  if (cosmosId) {
    setValue('cosmosArtistId', cosmosId, { shouldValidate: true });
  }
  if (artist.spotifyProfile) {
    setValue('spotifyProfile', artist.spotifyProfile as UploadFormData['spotifyProfile'], {
      shouldValidate: true,
    });
  }
  if (artist.appleMusicProfile) {
    setValue(
      'appleMusicProfile',
      artist.appleMusicProfile as UploadFormData['appleMusicProfile'],
      { shouldValidate: true },
    );
  }
  if (artist.youtubeMusicProfile) {
    setValue(
      'youtubeMusicProfile',
      artist.youtubeMusicProfile as UploadFormData['youtubeMusicProfile'],
      { shouldValidate: true },
    );
  }
  if (artist.instagramProfile) {
    if (
      typeof artist.instagramProfile === 'string' &&
      artist.instagramProfile.startsWith('http')
    ) {
      setValue('instagramProfile', 'yes', { shouldValidate: true });
      setValue('instagramProfileUrl', artist.instagramProfile, { shouldValidate: true });
    } else {
      setValue('instagramProfile', artist.instagramProfile as string, { shouldValidate: true });
    }
  }
  if (artist.facebookProfile) {
    if (
      typeof artist.facebookProfile === 'string' &&
      artist.facebookProfile.startsWith('http')
    ) {
      setValue('facebookProfile', 'yes', { shouldValidate: true });
      setValue('facebookProfileUrl', artist.facebookProfile, { shouldValidate: true });
    } else {
      setValue('facebookProfile', artist.facebookProfile as string, { shouldValidate: true });
    }
  }
}

/** Reset a secondary artist slot when name changes or artist is switched. */
export function emptySecondaryArtistSlot(name: string): UploadFormData['artists'][number] {
  return {
    name,
    spotifyProfile: '',
    appleMusicProfile: '',
    youtubeMusicProfile: '',
    cosmosArtistId: undefined,
    instagramProfile: '',
    facebookProfile: '',
  };
}

export function applyRosterArtistToSecondarySlot(
  rosterArtist: RosterArtist,
): UploadFormData['artists'][number] {
  const name = rosterArtistName(rosterArtist);
  const next = emptySecondaryArtistSlot(name);

  if (typeof rosterArtist !== 'object') return next;

  return {
    ...next,
    ...(rosterArtist.cosmosArtistId?.trim() || rosterArtist.cosmosId?.trim()
      ? {
          cosmosArtistId:
            rosterArtist.cosmosArtistId?.trim() || rosterArtist.cosmosId?.trim(),
        }
      : {}),
    ...(rosterArtist.spotifyProfile
      ? { spotifyProfile: rosterArtist.spotifyProfile as UploadFormData['spotifyProfile'] }
      : {}),
    ...(rosterArtist.appleMusicProfile
      ? { appleMusicProfile: rosterArtist.appleMusicProfile as UploadFormData['appleMusicProfile'] }
      : {}),
    ...(rosterArtist.youtubeMusicProfile
      ? { youtubeMusicProfile: rosterArtist.youtubeMusicProfile as UploadFormData['youtubeMusicProfile'] }
      : {}),
    ...(rosterArtist.instagramProfile
      ? { instagramProfile: rosterArtist.instagramProfile as string }
      : {}),
    ...(rosterArtist.facebookProfile
      ? { facebookProfile: rosterArtist.facebookProfile as string }
      : {}),
  };
}
