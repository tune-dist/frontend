import type { Release } from "@/lib/api/releases";
import type { UploadFormData, AudioFile, Track } from "@/components/dashboard/upload/types";

function toAudioFormFile(
  audio: { url?: string; filename?: string; size?: number; duration?: number; hash?: string; fingerprint?: string } | undefined,
  id: string,
  fallbackName: string,
): AudioFile | null {
  if (!audio?.url) return null;
  return {
    id,
    file: null,
    fileName: audio.filename || fallbackName,
    size: audio.size,
    path: audio.url,
    duration: audio.duration,
    hash: audio.hash,
    fingerprint: audio.fingerprint,
  };
}

function formatDateInput(value?: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function releaseToUploadFormData(release: Release): Partial<UploadFormData> {
  const r = release as Release & {
    mood?: string;
    subGenre?: string;
    spotifyProfile?: string;
    appleMusicProfile?: string;
    youtubeMusicProfile?: string;
    instagramProfile?: string;
    instagramProfileUrl?: string;
    facebookProfile?: string;
    facebookProfileUrl?: string;
    instrumental?: string;
  };

  const format = (release.releaseType || "single") as UploadFormData["format"];
  const audioFiles: AudioFile[] = [];
  const tracks: Track[] = [];

  if (release.tracks?.length) {
    release.tracks.forEach((track, index) => {
      const audioId = `existing-audio-${index}`;
      const audio = toAudioFormFile(track.audioFile ?? undefined, audioId, track.title);
      if (audio) audioFiles.push(audio);

      tracks.push({
        id: `existing-track-${index}`,
        title: track.title,
        audioFileId: audio?.id || "",
        artistName: track.artistName || release.artistName,
        language: track.language || release.language,
        isrc: track.isrc || release.isrc,
        previouslyReleased: track.previouslyReleased,
        originalReleaseDate: track.originalReleaseDate
          ? formatDateInput(track.originalReleaseDate)
          : undefined,
        primaryGenre: track.primaryGenre || release.primaryGenre,
        secondaryGenre: track.secondaryGenre || release.secondaryGenre,
        writers: track.writers || [],
        composers: track.composers || [],
        isInstrumental: track.isInstrumental ? "yes" : "no",
        isExplicit: track.isExplicit ?? release.isExplicit,
        previewClipStartTime: track.previewStartTime,
        spotifyProfile: track.spotifyProfile,
        appleMusicProfile: track.appleMusicProfile,
        youtubeMusicProfile: track.youtubeMusicProfile,
        instagramProfile: track.instagramProfile,
        facebookProfile: track.facebookProfile,
        featuringArtist: track.featuringArtist,
        mood: track.mood || r.mood || "",
      });
    });
  }

  const rootAudio = toAudioFormFile(
    release.audioFile,
    "existing-root-audio",
    release.title,
  );

  const isSingle = format === "single";
  const previewClipStartTime =
    release.tracks?.[0]?.previewStartTime || release.previewClipStartTime;

  if (isSingle && rootAudio) {
    const hasLinkedTrackAudio = tracks.some((track) => Boolean(track.audioFileId));
    if (!hasLinkedTrackAudio) {
      if (!audioFiles.some((audio) => audio.id === rootAudio.id)) {
        audioFiles.push(rootAudio);
      }
      if (tracks.length > 0) {
        tracks[0] = {
          ...tracks[0],
          audioFileId: rootAudio.id,
          previewClipStartTime:
            tracks[0].previewClipStartTime || previewClipStartTime,
        };
      }
    } else if (tracks.length > 0 && previewClipStartTime) {
      tracks[0] = {
        ...tracks[0],
        previewClipStartTime:
          tracks[0].previewClipStartTime || previewClipStartTime,
      };
    }
  }

  const primaryArtists = release.primaryArtists || [];
  const secondaryArtists =
    primaryArtists.length > 1
      ? primaryArtists.slice(1).map((artist) => ({
          name: artist.name,
          spotifyProfile: artist.spotifyProfile,
          appleMusicProfile: artist.appleMusicProfile,
          youtubeMusicProfile: artist.youtubeMusicProfile,
          instagramProfile: artist.instagramProfile,
          facebookProfile: artist.facebookProfile,
        }))
      : [];

  const mainArtist = primaryArtists[0];

  return {
    numberOfSongs: String(release.tracks?.length || 1),
    title: release.title,
    artistName: release.artistName,
    artists: secondaryArtists as UploadFormData["artists"],
    isrc: release.isrc,
    primaryGenre: release.primaryGenre,
    secondaryGenre: release.secondaryGenre || r.subGenre,
    language: release.language,
    releaseType: format,
    format,
    isExplicit: release.isExplicit,
    explicitLyrics: release.isExplicit ? "yes" : "no",
    featuringArtist: release.featuredArtists?.[0] || release.tracks?.[0]?.featuringArtist,
    upc: release.upc || release.barcode,
    spotifyProfile: r.spotifyProfile || mainArtist?.spotifyProfile,
    appleMusicProfile: r.appleMusicProfile || mainArtist?.appleMusicProfile,
    youtubeMusicProfile: r.youtubeMusicProfile || mainArtist?.youtubeMusicProfile,
    instagramProfile: r.instagramProfile || release.socialPlatforms?.instagramProfile || "no",
    instagramProfileUrl: r.instagramProfileUrl || release.socialPlatforms?.instagramProfileUrl,
    facebookProfile: r.facebookProfile || release.socialPlatforms?.facebookProfile || "no",
    facebookProfileUrl: r.facebookProfileUrl || release.socialPlatforms?.facebookProfileUrl,
    audioFile: rootAudio,
    audioFiles,
    tracks,
    releaseDate: formatDateInput(release.releaseDate),
    labelName: release.labelName || "",
    distributionTerritories: release.distributionTerritories || ["Worldwide"],
    previewClipStartTime,
    copyright: release.copyright,
    instrumental: r.instrumental === "yes" ? "yes" : "no",
    writers: release.writers || [],
    composers: release.composers || [],
    recordingYear: release.recordingYear || new Date().getFullYear(),
    mood: r.mood,
    producers: release.producers?.length
      ? release.producers
      : [process.env.NEXT_PUBLIC_DEFAULT_LABEL || "KratoLib"],
    coverArt: release.coverArt?.url
      ? {
          path: release.coverArt.url,
          fileName: release.coverArt.filename,
          size: release.coverArt.size,
          dimensions: release.coverArt.dimensions,
          format: release.coverArt.format,
        }
      : undefined,
    audioConsent: true,
    coverArtConsent: true,
    coverArtChanged: false,
  };
}
