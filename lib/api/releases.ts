import apiClient from "../api-client";
import { uploadFile, getAudioMetadata, getImageMetadata } from "./upload";
import { uploadFileInChunks } from "@/lib/upload/chunk-uploader";

export interface ReleaseFormData {
  title: string;
  artistName: string;
  artists?: Array<{
    name: string;
    spotifyProfile?: any;
    appleMusicProfile?: any;
    youtubeMusicProfile?: any;
  }>;
  numberOfSongs?: string;
  userId?: string;
  version?: string;

  // Release info
  previouslyReleased?: string;
  releaseDate?: string;
  recordLabel?: string;
  language: string;
  primaryGenre: string;
  secondaryGenre?: string;
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
  coverArt: File;
  coverArtPreview?: string;
  audioFile?: File; // Optional for multi-track
  audioFileName?: string;

  // Track details (Legacy/Single)
  artworkConfirmed?: boolean;
  explicitLyrics?: string;
  radioEdit?: string;
  instrumental?: string;
  previewClipStartTime?: string;

  // Multi-track support
  // We use 'any' here to accommodate the incoming Track structure from the form,
  // which might have extra UI fields.
  tracks?: any[];

  // Other
  releaseType: ReleaseType;
  featuredArtists?: string[];
  subGenre?: string;
  labelName?: string;
  trackNumber?: number;
  originalReleaseDate?: string;
  distributionTerritories?: string[];
  catalogNumber?: string;
  barcode?: string;
  isrc?: string;
  writers?: string[];
  producers?: string[];
  composers?: string[];
  publisher?: string;
  copyright?: string;
  recordingYear?: number;
  albumTitle?: string;
  selectedPlatforms?: string[];
  format?: string;
  songwriters?: any[];
}

export type ReleaseStatus = "In Process" | "Approved" | "Rejected" | "Released";
export type ReleaseType = "single" | "ep" | "album" | "compilation";

export interface AudioFile {
  url: string;
  filename: string;
  size: number;
  duration: number;
  format: string;
  bitrate?: number;
  sampleRate?: number;
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
  songwriters?: any[];
  composers?: any[];
  // Add other fields as needed
}

export interface Release {
  _id: string;
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
  isrc?: string;
  writers?: string[];
  composers?: string[];
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
  // Multi-track
  tracks?: TrackPayload[];
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
  isrc?: string;
  writers?: string[];
  producers?: string[];
  composers?: string[];
  publisher?: string;
  copyright?: string;
  recordingYear?: number;
  albumTitle?: string;
  selectedPlatforms?: string[];

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
}

// Process and submit new release with file uploads
export const submitNewRelease = async (formData: ReleaseFormData) => {
  try {
    // 1. Process audio file (if single/present)
    // Audio files are now uploaded via chunks, so they already have a 'path' property
    let audioData: AudioFile | undefined = undefined;
    if (formData.audioFile) {
      const audioFileData = formData.audioFile as any;

      // Check if audio was already uploaded via chunks (has 'path' property)
      if (audioFileData.path) {
        console.log("Using chunked-uploaded audio file...");
        // The path from chunk upload is relative (/uploads/filename)
        // We need to construct the full URL
        const baseUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        audioData = {
          url: `${baseUrl}${audioFileData.path}`,
          filename:
            audioFileData.fileName || audioFileData.file?.name || "audio.wav",
          size: audioFileData.size || audioFileData.file?.size || 0,
          duration: audioFileData.duration || 0,
          format: "wav",
        };
      } else if (audioFileData instanceof File) {
        // Fallback: if it's a File object, upload it using chunks
        console.log("Uploading audio file (standard)...");
        const result = await uploadFileInChunks(audioFileData, "");
        const baseUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        audioData = {
          url: `${baseUrl}${result.path}`,
          filename: audioFileData.name,
          size: audioFileData.size,
          duration: result.metaData?.duration || 0,
          format: "wav", // Presumed format or extract from metadata if available
        };
      }
    }

    // 2. Upload cover art
    console.log("Uploading cover art...");
    let coverUrl: string;
    const coverArtData = formData.coverArt as any;

    if (coverArtData.path) {
      // Already uploaded via chunks in the UI step
      console.log("Using pre-uploaded chunk cover art...");
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      coverUrl = `${baseUrl}${coverArtData.path}`;
    } else if (formData.coverArt instanceof File) {
      // Fallback: upload standard files via chunks too
      console.log("Cover art not pre-uploaded, uploading via chunks...");
      const result = await uploadFileInChunks(formData.coverArt, "");
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      coverUrl = `${baseUrl}${result.path}`;
    } else {
      throw new Error("Invalid cover art data");
    }
    const coverMetadata = await getImageMetadata(
      formData.coverArt instanceof File
        ? formData.coverArt
        : coverArtData.file || new File([], "temp")
    );

    // 3. Process Tracks (if any)
    let tracksPayload: TrackPayload[] = [];
    if (formData.tracks && formData.tracks.length > 0) {
      console.log(`Processing ${formData.tracks.length} tracks...`);

      // Build a map of audioFileId to audioFile for quick lookup
      const audioFilesMap = new Map();
      if (
        (formData as any).audioFiles &&
        Array.isArray((formData as any).audioFiles)
      ) {
        ((formData as any).audioFiles as any[]).forEach((af) => {
          if (af.id) {
            audioFilesMap.set(af.id, af);
          }
        });
      }

      tracksPayload = formData.tracks.map((track: any) => {
        let trackAudioData = null;

        // Look up the audio file using audioFileId
        if (track.audioFileId && audioFilesMap.has(track.audioFileId)) {
          const audioFile = audioFilesMap.get(track.audioFileId);

          if (audioFile.path) {
            // Audio was uploaded via chunks
            const baseUrl =
              process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
            trackAudioData = {
              url: `${baseUrl}${audioFile.path}`,
              filename: audioFile.fileName || "audio.wav",
              size: audioFile.size || 0,
              duration: audioFile.duration || 0,
              format: "wav",
            };
          }
        }

        return {
          title: track.title,
          artistName: track.artistName,
          audioFile: trackAudioData,
          isExplicit:
            track.explicitLyrics === "yes" || track.isExplicit === true,
          isInstrumental: track.isInstrumental === "yes",
          previewStartTime: track.previewStartTime,
          price: track.price,
          songwriters: track.songwriters?.map((sw: any) => ({
            firstName: sw.firstName,
            lastName: sw.lastName || "",
          })),
          composers: track.composers?.map((sw: any) => ({
            firstName: sw.firstName,
            lastName: sw.lastName || "",
          })),
          previouslyReleased: track.previouslyReleased,
          originalReleaseDate: track.originalReleaseDate,
          primaryGenre: track.primaryGenre,
          secondaryGenre: track.secondaryGenre,
        };
      });
    }

    // 4. Prepare release data
    // Note: We explicitly construct releaseData to avoid sending unwanted properties
    // like audioFiles array, File objects, or chunk upload metadata
    const releaseData: CreateReleaseData = {
      title: formData.title,
      artistName: formData.artistName,
      version: formData.version,
      language: formData.language,
      primaryGenre: formData.primaryGenre,
      secondaryGenre: formData.secondaryGenre,
      releaseType: formData.releaseType,
      isExplicit: formData.explicitLyrics === "yes",
      releaseDate: formData.releaseDate || new Date().toISOString(),
      genres: [formData.primaryGenre, formData.secondaryGenre].filter(
        Boolean
      ) as string[],

      // Use the processed audioData (already converted from chunk upload path)
      audioFile: audioData,

      coverArt: {
        url: coverUrl,
        filename:
          formData.coverArt.name ||
          (formData.coverArt as any).fileName ||
          "cover.jpg",
        size: formData.coverArt.size,
        dimensions: {
          width: coverMetadata.width,
          height: coverMetadata.height,
        },
        format: coverMetadata.format,
      },

      // Use the processed tracks payload (already has audio files resolved)
      tracks: tracksPayload,

      // Optional fields mapping
      ...(formData.featuredArtists && {
        featuredArtists: formData.featuredArtists,
      }),

      // Map labelName from recordLabel if not present
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
      ...(formData.barcode && { barcode: formData.barcode }),
      ...(formData.isrc && { isrc: formData.isrc }),
      // Map songwriters to writers as string array (FirstName LastName only)
      ...(formData.songwriters && {
        writers: formData.songwriters
          .map((sw: any) => `${sw.firstName} ${sw.lastName || ""}`.trim())
          .filter(Boolean),
      }),

      ...(formData.producers && { producers: formData.producers }),

      // Map composers as string array (FirstName LastName only)
      ...(formData.composers && {
        composers: formData.composers
          .map((sw: any) => `${sw.firstName} ${sw.lastName || ""}`.trim())
          .filter(Boolean),
      }),
      ...(formData.publisher && { publisher: formData.publisher }),
      ...(formData.copyright && { copyright: formData.copyright }),
      ...(formData.recordingYear && { recordingYear: formData.recordingYear }),
      ...(formData.albumTitle && { albumTitle: formData.albumTitle }),
      ...(formData.selectedPlatforms && {
        selectedPlatforms: formData.selectedPlatforms,
      }),

      // New fields specific to releases
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
      ...(formData.instrumental && { instrumental: formData.instrumental }),

      // Map artists to primaryArtists
      ...(formData.artists &&
        formData.artists.length > 0 && {
          primaryArtists: formData.artists.map((artist) => ({
            name: artist.name,
            spotifyProfile: artist.spotifyProfile,
            appleMusicProfile: artist.appleMusicProfile,
            youtubeMusicProfile: artist.youtubeMusicProfile,
          })),
        }),
      ...(formData.userId && { userId: formData.userId }),
    };

    // 5. Create release via API
    console.log(
      "Creating release with data:",
      JSON.stringify(releaseData, null, 2)
    );

    // Double-check we can JSON serialize (this will fail if File objects are present)
    try {
      JSON.stringify(releaseData);
    } catch (e) {
      console.error("Release data contains non-serializable objects:", e);
      throw new Error(
        "Release data contains File objects or other non-serializable data"
      );
    }

    return createRelease(releaseData);
  } catch (error: any) {
    console.error("Release submission failed:", error);
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to submit release. Please try again."
    );
  }
};

// Get all user releases
export const getReleases = async (
  params?: GetReleasesParams
): Promise<ReleasesResponse> => {
  const response = await apiClient.get<ReleasesResponse>("/releases", {
    params,
  });
  return response.data;
};

// Get single release by ID
export const getRelease = async (id: string): Promise<Release> => {
  const response = await apiClient.get<Release>(`/releases/${id}`);
  return response.data;
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

// Submit release for review
export const submitRelease = async (id: string): Promise<Release> => {
  const response = await apiClient.post<Release>(`/releases/${id}/submit`);
  return response.data;
};

// Cancel submitted release
export const cancelRelease = async (id: string): Promise<Release> => {
  const response = await apiClient.post<Release>(`/releases/${id}/cancel`);
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

// Mark release as distributed (Admin only)
export const releaseRelease = async (id: string): Promise<Release> => {
  const response = await apiClient.post<Release>(`/releases/${id}/release`);
  return response.data;
};

// Get artist usage
export const getArtistUsage = async (): Promise<{ artists: any[] }> => {
  const response = await apiClient.get<{ artists: any[] }>(
    "/releases/artists/usage"
  );
  return response.data;
};
