import { describe, expect, it } from 'vitest';
import {
  collectSnapshotStorageKeys,
  createUploadSession,
  keysToDeleteAfterSuccessfulSave,
  keysToDeleteOnFailedSave,
  recordUploadedKey,
} from './upload-session';

const savedCover = 'tracks/user/coverart/Ram Aayenge Afro House-ca.png';
const savedAudio =
  'tracks/user/audio/Ram_Aayenge_Afro_House-ad-0d1f1871.wav';
const newCover = 'tracks/user/coverart/Ram_Aayenge_Afro_House-ca-new.png';
const newAudio = 'tracks/user/audio/Ram_Aayenge_Afro_House-ad-new.wav';

describe('upload session S3 cleanup', () => {
  it('does not delete the saved cover when a re-upload reuses that key', () => {
    const session = createUploadSession();
    recordUploadedKey(session, savedCover, savedCover);

    expect(keysToDeleteOnFailedSave(session, [savedCover, savedAudio])).toEqual(
      [],
    );
    expect(session.newKeys).toEqual([]);
  });

  it('on a failed save deletes only the new file, not the files still on the draft', () => {
    const session = createUploadSession();
    recordUploadedKey(session, newCover, savedCover);
    recordUploadedKey(session, newAudio, savedAudio);

    expect(keysToDeleteOnFailedSave(session, [savedCover, savedAudio])).toEqual([
      newCover,
      newAudio,
    ]);
    expect(keysToDeleteAfterSuccessfulSave(session, [savedCover, savedAudio])).toEqual(
      [],
    );
  });

  it('after a successful save deletes the old file only when the draft no longer points at it', () => {
    const session = createUploadSession();
    recordUploadedKey(session, newCover, savedCover);
    recordUploadedKey(session, newAudio, savedAudio);

    expect(
      keysToDeleteAfterSuccessfulSave(session, [newCover, newAudio]),
    ).toEqual([savedCover, savedAudio]);
  });

  it('keeps the old audio when the saved snapshot still uses it', () => {
    const session = createUploadSession();
    recordUploadedKey(session, newAudio, savedAudio);

    expect(
      keysToDeleteAfterSuccessfulSave(session, [savedCover, savedAudio]),
    ).toEqual([]);
  });

  it('reads cover and track paths from a release snapshot', () => {
    expect(
      collectSnapshotStorageKeys({
        coverArt: { url: savedCover },
        tracks: [{ audioFile: { url: savedAudio } }],
      }),
    ).toEqual([savedCover, savedAudio]);
  });
});
