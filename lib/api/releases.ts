import apiClient from "../api-client";
import { uploadFile, getAudioMetadata, getImageMetadata } from "./upload";
import { uploadFileInChunks } from "@/lib/upload/chunk-uploader";
import Cookies from "js-cookie";
import { config } from "@/lib/config";
import { toast } from "react-hot-toast";
import { isInstrumentalRelease, resolveLanguage } from "@/components/dashboard/upload/genre-language";

export interface ReleaseFormData {
  title: string;
  artistName: string;
  artists?: Array<{
    name: string;
    spotifyProfile?: any;
    appleMusicProfile?: any;
    youtubeMusicProfile?: any;
    instagramProfile?: string;
    facebookProfile?: string;
  }>;
  numberOfSongs?: string;
  userId?: string;
  version?: string;

  // Release info
  previouslyReleased?: string;
  originalReleaseDate?: string;
  releaseDate?: string;
  recordLabel?: string;
  labelName?: string;
  language: string;
  primaryGenre: string;
  secondaryGenre?: string;
  subGenre?: string;
  genres?: string[];

  // Social media & platforms
  socialMediaPack?: boolean;
  spotifyProfile?: any;
  appleMusicProfile?: any;
  youtubeMusicProfile?: any;
  instagramProfile?: string;
  instagramProfileUrl?: string;
  facebookProfile?: string;
  facebookProfileUrl?: string;

  // Files
  coverArt: any; // Can be File or object
  coverArtPreview?: string;
  audioFile?: any; // Can be File or object
  audioFileName?: string;
  audioFiles?: any[];

  // Track details (Legacy/Single)
  artworkConfirmed?: boolean;
  explicitLyrics?: string;
  isExplicit?: boolean;
  radioEdit?: string;
  instrumental?: string;
  previewClipStartTime?: string;
  trackNumber?: number;
  catalogNumber?: string;
  barcode?: string;
  upc?: string;
  isrc?: string;
  writers?: string[];
  composers?: string[];
  producers?: string[];
  publisher?: string;
  copyright?: string;
  recordingYear?: string | number;
  albumTitle?: string;

  distributionTerritories?: string[];
  format?: string;
  mood?: string;

  // Multi-track support
  tracks?: any[];

  // Other
  releaseType: ReleaseType;
  featuredArtists?: string[];
  featuringArtist?: string;
  audioConsent?: boolean;
  coverArtConsent?: boolean;
}

export type ReleaseStatus = "Draft" | "In Process" | "Submitted" | "Rejected" | "Released";
export type ReleaseType = "single" | "ep" | "album" | "compilation";

export interface AudioFile {
  url: string;
  filename: string;
  size: number;
  duration: number;
  format: string;
  bitrate?: number;
  sampleRate?: number;
  fingerprint?: string;
  hash?: string;
}

export interface CoverArt {
  url: string;
  filename: string;
  size: number;
  dimensions: {
    width: number;
    height: number;
  };
  format: string;
}

export interface TrackPayload {
  title: string;
  artistName: string;
  audioFile: AudioFile | null;
  isExplicit: boolean;
  isInstrumental: boolean;
  previewStartTime?: string;
  price?: string;
  writers?: string[];
  composers?: string[];
  primaryGenre?: string;
  secondaryGenre?: string;
  previouslyReleased?: string;
  originalReleaseDate?: string;
  fingerprint?: string;
  hash?: string;
  featuringArtist?: string;
  isrc?: string;
  language?: string;
  spotifyProfile?: any;
  appleMusicProfile?: any;
  youtubeMusicProfile?: any;
  instagramProfile?: string;
  facebookProfile?: string;
  mood?: string;
}

export interface Release {
  _id: string;
  releaseCode?: string;
  userId: string | { _id: string; email: string; fullName: string };
  status: ReleaseStatus;
  title: string;
  artistName: string;
  featuredArtists?: string[];
  labelName?: string;
  language: string;
  primaryGenre: string;
  secondaryGenre?: string;
  releaseType: ReleaseType;
  isExplicit: boolean;
  audioFile?: AudioFile; // Optional
  trackNumber?: number;
  coverArt: CoverArt;
  releaseDate?: string;
  originalReleaseDate?: string;
  distributionTerritories?: string[];
  catalogNumber?: string;
  barcode?: string;
  upc?: string;
  isrc?: string;
  writers?: string[];
  composers?: string[];
  producers?: string[];
  publisher?: string;
  copyright?: string;
  recordingYear?: number;
  albumTitle?: string;
  rejectionReason?: string;
  adminNotes?: string;
  approvedBy?: string | { _id: string; fullName: string };
  submittedAt?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
  primaryArtists?: Array<{
    name: string;
    spotifyProfile?: any;
    appleMusicProfile?: any;
    youtubeMusicProfile?: any;
    instagramProfile?: string;
    facebookProfile?: string;
  }>;
  // Multi-track
  tracks?: TrackPayload[];
  socialPlatforms?: {
    spotifyProfile?: any;
    appleMusicProfile?: any;
    youtubeMusicProfile?: any;
    instagramProfile?: string;
    instagramProfileUrl?: string;
    facebookProfile?: string;
    facebookProfileUrl?: string;
  };
  /** Set after initial platform processing (metadata + assets upload) succeeds */
  pdlAlbumId?: string;
}


export interface CreateReleaseData {
  title: string;
  artistName: string;
  version?: string;
  featuredArtists?: string[];
  labelName?: string;
  language: string;
  releaseType: ReleaseType;
  isExplicit: boolean;
  audioFile?: AudioFile; // Optional
  trackNumber?: number;
  coverArt: CoverArt;
  releaseDate?: string;
  originalReleaseDate?: string;
  distributionTerritories?: string[];
  catalogNumber?: string;
  barcode?: string;
  upc?: string;
  isrc?: string;
  writers?: string[];
  producers?: string[];
  composers?: string[];
  publisher?: string;
  copyright?: string;
  recordingYear?: number;
  albumTitle?: string;


  // PRIMARY ARTISTS
  primaryArtists?: Array<{
    name: string;
    spotifyProfile?: any;
    appleMusicProfile?: any;
    youtubeMusicProfile?: any;
    instagramProfile?: string;
    facebookProfile?: string;
  }>;

  // New fields
  numberOfSongs?: number;
  socialMediaPack?: boolean;

  // Flat social fields
  spotifyProfile?: any;
  appleMusicProfile?: any;
  youtubeMusicProfile?: any;
  instagramProfile?: string;
  instagramProfileUrl?: string;
  facebookProfile?: string;
  facebookProfileUrl?: string;

  primaryGenre?: string;
  secondaryGenre?: string;
  subGenre?: string;

  socialPlatforms?: {
    spotifyProfile?: any;
    appleMusicProfile?: any;
    youtubeMusicProfile?: any;
    instagramProfile?: string;
    instagramProfileUrl?: string;
    facebookProfile?: string;
    facebookProfileUrl?: string;
  };
  artworkConfirmed?: boolean;
  previewClipStartTime?: string;
  radioEdit?: string;
  instrumental?: string;
  genres?: string[];

  // Multi-track
  tracks?: TrackPayload[];

  // Optional userId override (e.g. for admin/testing)
  userId?: string;

  // Layer 3: Rights
  rightsAccepted?: boolean;
  audioConsent?: boolean;
  coverArtConsent?: boolean;
}

export interface ReleasesResponse {
  releases: Release[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    pages: number;
  };
}

export interface GetReleasesParams {
  status?: ReleaseStatus;
  page?: number;
  limit?: number;
  userId?: string;
  search?: string;
}

// Process and submit new release with file uploads
export const submitNewRelease = async (formData: ReleaseFormData) => {
  const token = Cookies.get(config.tokenKey) || "";
  let submissionToastId: string | undefined;

  try {
    submissionToastId = toast.loading("Finalizing assets and submitting release...");

    // 1. Process Tracks (if any)
    let tracksPayload: TrackPayload[] = [];
    if (formData.tracks && formData.tracks.length > 0) {
      console.log(`Processing ${formData.tracks.length} tracks...`);

      // Build a map of audioFileId to audioFile for quick lookup
      const audioFilesMap = new Map();
      if (
        (formData as any).audioFiles &&
        Array.isArray((formData as any).audioFiles)
      ) {
        const audioFiles = (formData as any).audioFiles as any[];

        // Ensure all audio files are uploaded if they are still File objects
        for (let i = 0; i < audioFiles.length; i++) {
          const af = audioFiles[i];
          if (af.file instanceof File && !af.path) {
            console.log(`Uploading missing audio file for track: ${af.fileName}`);
            toast.loading(`Uploading audio: ${af.fileName}...`, { id: submissionToastId });
            const result = await uploadFileInChunks(af.file, token, undefined, 'audio', formData.artistName, formData.title, formData.audioConsent);
            af.path = result.path;
            af.duration = result.metaData?.duration;
            af.hash = result.metaData?.hash;
            af.fingerprint = result.metaData?.fingerprint;
          }

          if (af.id) {
            audioFilesMap.set(af.id, af);
          }
        }
      }

      tracksPayload = formData.tracks.map((track: any) => {
        let trackAudioData = null;

        // Look up the audio file using audioFileId
        if (track.audioFileId && audioFilesMap.has(track.audioFileId)) {
          const audioFile = audioFilesMap.get(track.audioFileId);

          if (audioFile.path) {
            // Audio was uploaded via chunks - path is now S3 key
            trackAudioData = {
              url: audioFile.path, // Store S3 key directly
              filename: audioFile.fileName || "audio.wav",
              size: audioFile.size || 0,
              duration: audioFile.duration || 0,
              format: "wav",
              hash: audioFile.hash,
              fingerprint: audioFile.fingerprint,
            };
          }
        }

        const trackNoLyrics = isInstrumentalRelease(
          track.primaryGenre || formData.primaryGenre,
          track.isInstrumental,
        );

        return {
          title: track.title,
          artistName: track.artistName || formData.artistName,
          audioFile: trackAudioData,
          isExplicit: trackNoLyrics
            ? false
            : track.explicitLyrics === "yes" || track.isExplicit === true,
          isInstrumental: trackNoLyrics || track.isInstrumental === "yes",
          previewStartTime: track.previewClipStartTime,
          price: track.price,
          writers: trackNoLyrics ? [] : track.writers,
          composers: track.composers,
          previouslyReleased: track.previouslyReleased,
          originalReleaseDate: track.originalReleaseDate,
          primaryGenre: track.primaryGenre,
          secondaryGenre: track.secondaryGenre,
          featuringArtist: track.featuringArtist,
          isrc: track.isrc || formData.isrc,
          language: (() => {
            const lang = resolveLanguage(
              track.primaryGenre || formData.primaryGenre,
              track.language || formData.language,
            );
            return lang
              ? lang.charAt(0).toUpperCase() + lang.slice(1).toLowerCase()
              : undefined;
          })(),
          spotifyProfile: track.spotifyProfile || formData.spotifyProfile,
          appleMusicProfile: track.appleMusicProfile || formData.appleMusicProfile,
          youtubeMusicProfile: track.youtubeMusicProfile || formData.youtubeMusicProfile,
          instagramProfile: track.instagramProfile || formData.instagramProfile,
          facebookProfile: track.facebookProfile || formData.facebookProfile,
          mood: track.mood,
        };
      });
    }

    const releaseNoLyrics = isInstrumentalRelease(
      formData.primaryGenre,
      formData.instrumental,
    );

    // For single releases, ensure we have track metadata even if tracks array is empty
    if ((formData.format === 'single' || formData.releaseType === 'single') && tracksPayload.length === 0) {
      console.log('Single release detected with empty tracks array. Creating track from root metadata...');

      // Create a track from root form data
      tracksPayload = [{
        title: formData.title,
        artistName: formData.artistName,
        audioFile: null, // Will be populated below from audioData
        isExplicit: releaseNoLyrics
          ? false
          : formData.explicitLyrics === 'yes' || formData.isExplicit === true,
        isInstrumental: releaseNoLyrics || formData.instrumental === 'yes',
        previewStartTime: formData.previewClipStartTime,
        price: undefined, // Not available in single release root form data
        writers: releaseNoLyrics ? [] : (formData.writers || []),
        composers: formData.composers || [],
        previouslyReleased: formData.previouslyReleased,
        originalReleaseDate: formData.originalReleaseDate,
        primaryGenre: formData.primaryGenre,
        secondaryGenre: formData.secondaryGenre,
        featuringArtist: formData.featuringArtist,
        isrc: formData.isrc,
        language: (() => {
          const lang = resolveLanguage(formData.primaryGenre, formData.language);
          return lang
            ? lang.charAt(0).toUpperCase() + lang.slice(1).toLowerCase()
            : undefined;
        })(),
        spotifyProfile: formData.spotifyProfile,
        appleMusicProfile: formData.appleMusicProfile,
        youtubeMusicProfile: formData.youtubeMusicProfile,
        instagramProfile: formData.instagramProfileUrl || formData.instagramProfile || undefined,
        facebookProfile: formData.facebookProfileUrl || formData.facebookProfile || undefined,
        mood: (formData as any).mood,
      }];
    }

    // 2. Process audio file (if single/present)
    let audioData: AudioFile | undefined = undefined;
    if (formData.audioFile) {
      const audioFileData = formData.audioFile as any;

      if (audioFileData.path) {
        // Path is now S3 key
        audioData = {
          url: audioFileData.path, // Store S3 key directly
          filename:
            audioFileData.fileName || audioFileData.file?.name || "audio.wav",
          size: audioFileData.size || audioFileData.file?.size || 0,
          duration: audioFileData.duration || 0,
          format: "wav",
          hash: audioFileData.hash,
          fingerprint: audioFileData.fingerprint,
        };
      } else if (audioFileData instanceof File || audioFileData.file instanceof File) {
        const fileToUpload = audioFileData instanceof File ? audioFileData : audioFileData.file;
        console.log(`Uploading missing root audio file: ${fileToUpload.name}`);
        toast.loading(`Uploading audio: ${fileToUpload.name}...`, { id: submissionToastId });
        const result = await uploadFileInChunks(fileToUpload, token, undefined, 'audio', formData.artistName, formData.title, formData.audioConsent);
        // Path is now S3 key
        audioData = {
          url: result.path, // Store S3 key directly
          filename: fileToUpload.name,
          size: fileToUpload.size,
          duration: result.metaData?.duration || 0,
          format: "wav",
          hash: result.metaData?.hash,
          fingerprint: result.metaData?.fingerprint,
        };
      }
    }

    // Fallback for single releases if root audio is missing but tracks exist
    if (
      !audioData &&
      (formData.format === "single" || formData.releaseType === "single") &&
      tracksPayload.length > 0
    ) {
      console.log("Promoting track 1 audio to root for single release...");
      audioData = tracksPayload[0].audioFile || undefined;
    }

    // 3. Upload cover art
    // submissionToastId is already set at the top

    console.log("Processing cover art...");
    let coverUrl: string;
    const coverArtData = formData.coverArt as any;

    if (!coverArtData) {
      toast.dismiss(submissionToastId);
      throw new Error("Cover art is missing or invalid. Please check the Cover Art step.");
    }

    if (coverArtData.path) {
      console.log("Using already uploaded cover art:", coverArtData.path);
      coverUrl = coverArtData.path;
    } else if (formData.coverArt instanceof File || coverArtData.file instanceof File) {
      console.log("Cover art not uploaded yet, uploading now...");
      toast.loading("Uploading cover art...", { id: submissionToastId });

      const fileToUpload = formData.coverArt instanceof File ? formData.coverArt : coverArtData.file;
      const result = await uploadFileInChunks(fileToUpload, token, undefined, 'coverart', formData.artistName, formData.title, formData.coverArtConsent);
      coverUrl = result.path;
      
      // Update local metadata if backend returned optimized values
      if (result.metaData) {
        if (result.metaData.size) coverArtData.size = result.metaData.size;
        if (result.metaData.resolution) {
          coverArtData.dimensions = result.metaData.resolution;
          coverArtData.format = 'jpeg'; // Backend always converts to JPEG for optimization
        }
      }
    } else {
      toast.dismiss(submissionToastId);
      throw new Error("Invalid cover art data. Please re-upload your cover art.");
    }

    // Get metadata - use saved if available
    let coverMetadata;
    if (coverArtData.dimensions && coverArtData.format) {
      coverMetadata = coverArtData.dimensions;
      coverMetadata.format = coverArtData.format;
    } else {
      console.log("Extracting cover metadata manually...");
      coverMetadata = await getImageMetadata(
        formData.coverArt instanceof File
          ? formData.coverArt
          : coverArtData.file || new File([], "temp")
      );
    }

    toast.loading("Submitting metadata to stores...", { id: submissionToastId });

    // 4. Prepare release data
    const releaseData: CreateReleaseData = {
      title: formData.title,
      artistName: formData.artistName,
      version: formData.version,
      ...(resolveLanguage(formData.primaryGenre, formData.language) && {
        language: (() => {
          const lang = resolveLanguage(formData.primaryGenre, formData.language);
          return lang.charAt(0).toUpperCase() + lang.slice(1).toLowerCase();
        })(),
      }),
      ...(formData.primaryGenre && { primaryGenre: formData.primaryGenre }),
      ...(formData.secondaryGenre && {
        secondaryGenre: formData.secondaryGenre,
      }),
      ...(formData.subGenre && { subGenre: formData.subGenre }),
      releaseType: (formData.format as any) || formData.releaseType || "single",
      isExplicit: releaseNoLyrics
        ? false
        : formData.explicitLyrics === "yes" || formData.isExplicit === true,
      releaseDate: formData.releaseDate || new Date().toISOString(),
      genres: ([formData.primaryGenre, formData.secondaryGenre].filter(Boolean)
        .length > 0
        ? [formData.primaryGenre, formData.secondaryGenre]
        : (formData.format === "single" || formData.releaseType === "single") &&
          tracksPayload.length > 0
          ? [tracksPayload[0].primaryGenre, tracksPayload[0].secondaryGenre]
          : []
      ).filter(Boolean) as string[],

      audioFile: audioData,

      coverArt: {
        url: coverUrl,
        filename:
          (formData.coverArt as any).name ||
          (formData.coverArt as any).fileName ||
          "cover.jpg",
        size: coverArtData.size || formData.coverArt.size || (formData.coverArt as any).file?.size || 0,
        dimensions: {
          width: coverMetadata.width,
          height: coverMetadata.height,
        },
        format: coverMetadata.format,
      },

      tracks: tracksPayload,

      ...(formData.featuredArtists && {
        featuredArtists: formData.featuredArtists,
      }),
      // Map singular featuringArtist to featuredArtists array for backend if present
      ...(!formData.featuredArtists && formData.featuringArtist && {
        featuredArtists: [formData.featuringArtist]
      }),

      ...(formData.labelName
        ? { labelName: formData.labelName }
        : formData.recordLabel && { labelName: formData.recordLabel }),

      ...(formData.trackNumber && { trackNumber: formData.trackNumber }),
      ...(formData.originalReleaseDate && {
        originalReleaseDate: formData.originalReleaseDate,
      }),
      ...(formData.distributionTerritories && {
        distributionTerritories: formData.distributionTerritories,
      }),
      ...(formData.catalogNumber && { catalogNumber: formData.catalogNumber }),
      ...((formData.barcode || (formData as { upc?: string }).upc) && {
        upc: (formData as { upc?: string }).upc || formData.barcode,
        barcode: formData.barcode || (formData as { upc?: string }).upc,
      }),
      ...(formData.isrc && { isrc: formData.isrc }),
      ...(!releaseNoLyrics && formData.writers?.length && { writers: formData.writers }),
      ...(releaseNoLyrics && { writers: [] }),
      ...(formData.producers && { producers: formData.producers }),
      ...((formData as any).composers && { composers: (formData as any).composers }),
      ...(formData.publisher && { publisher: formData.publisher }),
      ...(formData.copyright && { copyright: formData.copyright }),
      ...(formData.recordingYear && { recordingYear: formData.recordingYear }),
      ...(formData.mood && { mood: formData.mood }),
      ...(formData.albumTitle && { albumTitle: formData.albumTitle }),


      ...(formData.numberOfSongs && {
        numberOfSongs: parseInt(formData.numberOfSongs || "1") || 1,
      }),
      ...(formData.socialMediaPack !== undefined && {
        socialMediaPack: formData.socialMediaPack,
      }),

      ...(formData.spotifyProfile && {
        spotifyProfile: formData.spotifyProfile,
      }),
      ...(formData.appleMusicProfile && {
        appleMusicProfile: formData.appleMusicProfile,
      }),
      ...(formData.youtubeMusicProfile && {
        youtubeMusicProfile: formData.youtubeMusicProfile,
      }),
      ...(formData.instagramProfile &&
        formData.instagramProfile !== "no" && {
        instagramProfile: formData.instagramProfile,
      }),
      ...(formData.instagramProfileUrl && {
        instagramProfileUrl: formData.instagramProfileUrl,
      }),
      ...(formData.facebookProfile && {
        facebookProfile: formData.facebookProfile,
      }),
      ...(formData.facebookProfileUrl && {
        facebookProfileUrl: formData.facebookProfileUrl,
      }),

      socialPlatforms: {
        spotifyProfile: formData.spotifyProfile,
        appleMusicProfile: formData.appleMusicProfile,
        youtubeMusicProfile: formData.youtubeMusicProfile,
        instagramProfile: formData.instagramProfile,
        instagramProfileUrl: formData.instagramProfileUrl,
        facebookProfile: formData.facebookProfile,
        facebookProfileUrl: formData.facebookProfileUrl,
      },

      ...(formData.artworkConfirmed !== undefined && {
        artworkConfirmed: formData.artworkConfirmed,
      }),
      ...(formData.previewClipStartTime && {
        previewClipStartTime: formData.previewClipStartTime,
      }),
      ...(formData.radioEdit && { radioEdit: formData.radioEdit }),
      ...(releaseNoLyrics
        ? { instrumental: 'yes' }
        : formData.instrumental && { instrumental: formData.instrumental }),

      ...(formData.artistName || (formData.artists && formData.artists.length > 0) ? {
        primaryArtists: [
          {
            name: formData.artistName,
            spotifyProfile: formData.spotifyProfile,
            appleMusicProfile: formData.appleMusicProfile,
            youtubeMusicProfile: formData.youtubeMusicProfile,
            instagramProfile: formData.instagramProfileUrl || formData.instagramProfile || undefined,
            facebookProfile: formData.facebookProfileUrl || formData.facebookProfile || undefined,
          },
          ...((formData.artists || [])
            .filter((artist) => artist.name?.trim())
            .map((artist) => ({
              name: artist.name,
              spotifyProfile: artist.spotifyProfile,
              appleMusicProfile: artist.appleMusicProfile,
              youtubeMusicProfile: artist.youtubeMusicProfile,
              instagramProfile: artist.instagramProfile,
              facebookProfile: artist.facebookProfile,
            })) || []),
        ],
      } : {}),
      ...(formData.userId && { userId: formData.userId }),

      // Map mandatory checks to backend fields
      rightsAccepted: (formData as any).mandatoryChecks?.rightsAuthorization === true ||
        (formData as any).mandatoryChecks?.ownershipConfirmation === true ||
        (formData as any).rightsAccepted === true,
      audioConsent: formData.audioConsent === true,
      coverArtConsent: formData.coverArtConsent === true
    };

    // 5. Create release via API
    console.log(
      "Creating release with data:",
      JSON.stringify(releaseData, null, 2)
    );

    try {
      JSON.stringify(releaseData);
    } catch (e) {
      console.error("Release data contains non-serializable objects:", e);
      throw new Error(
        "Release data contains File objects or other non-serializable data"
      );
    }

    const result = await createRelease(releaseData);
    toast.dismiss(submissionToastId);
    return result;
  } catch (error: any) {
    if (submissionToastId) toast.dismiss(submissionToastId);
    console.error("Release submission failed:", error);
    throw new Error(
      error.response?.data?.message ||
      error.message ||
      "Failed to submit release. Please try again."
    );
  }
};

// Helper to normalize release data from backend
export const normalizeRelease = (release: any): Release => {
  if (!release) return release;

  // Backend may return UPC as `upc` (PDL) or `barcode` (manual entry)
  if (!release.barcode?.trim() && release.upc?.trim()) {
    release.barcode = release.upc.trim();
  }

  // Hydrate root fields from socialPlatforms for UI compatibility
  if (release.socialPlatforms) {
    const s = release.socialPlatforms;
    release.spotifyProfile = release.spotifyProfile || s.spotifyProfile;
    release.appleMusicProfile = release.appleMusicProfile || s.appleMusicProfile;
    release.youtubeMusicProfile = release.youtubeMusicProfile || s.youtubeMusicProfile;

    // Special handling for instagram/facebook which might be "yes" or URL
    release.instagramProfile = release.instagramProfile || s.instagramProfile;
    release.instagramProfileUrl = release.instagramProfileUrl || s.instagramProfileUrl;
    release.facebookProfile = release.facebookProfile || s.facebookProfile;
    release.facebookProfileUrl = release.facebookProfileUrl || s.facebookProfileUrl;
  }

  // Ensure recordingYear is a number if it comes in as string
  if (release.recordingYear) {
    release.recordingYear = typeof release.recordingYear === 'string' ? parseInt(release.recordingYear) : release.recordingYear;
  }

  return release;
};


// Get all user releases
export const getReleases = async (
  params?: GetReleasesParams
): Promise<ReleasesResponse> => {
  const response = await apiClient.get<ReleasesResponse>("/releases", {
    params,
  });
  if (response.data.releases) {
    response.data.releases = response.data.releases.map(normalizeRelease);
  }
  return response.data;

};

// Get single release by ID
export const getRelease = async (id: string): Promise<Release> => {
  const response = await apiClient.get<Release>(`/releases/${id}`);
  return normalizeRelease(response.data);
};


// Create new release (draft)
export const createRelease = async (
  data: CreateReleaseData
): Promise<Release> => {
  const response = await apiClient.post<Release>("/releases", data);
  return response.data;
};

// Update release (draft only)
export const updateRelease = async (
  id: string,
  data: Partial<CreateReleaseData>
): Promise<Release> => {
  const response = await apiClient.put<Release>(`/releases/${id}`, data);
  return response.data;
};





// Delete release (draft only)
export const deleteRelease = async (
  id: string
): Promise<{ message: string }> => {
  const response = await apiClient.delete<{ message: string }>(
    `/releases/${id}`
  );
  return response.data;
};

// Approve release (Admin only)
export const approveRelease = async (id: string): Promise<Release> => {
  const response = await apiClient.post<Release>(`/releases/${id}/approve`);
  return response.data;
};

// Reject release (Admin only)
export const rejectRelease = async (
  id: string,
  reason: string
): Promise<Release> => {
  const response = await apiClient.post<Release>(`/releases/${id}/reject`, {
    reason,
  });
  return response.data;
};

/** Phase 1: verify metadata + upload artwork & audio to distribution pipeline */
export const submitToPdl = async (id: string, data: any = {}): Promise<any> => {
  const response = await apiClient.post(`/releases/${id}/submit-to-pdl`, data);
  return response.data;
};

/** Phase 2: final distribute to selected platforms */
export const pdlSubmit = async (id: string, data: any = {}): Promise<any> => {
  const response = await apiClient.post(`/releases/${id}/pdl-submit`, data);
  return response.data;
};



// Get artist usage
export const getArtistUsage = async (): Promise<{ artists: any[] }> => {
  const response = await apiClient.get<{ artists: any[] }>(
    "/releases/artists/usage"
  );
  return response.data;
};
