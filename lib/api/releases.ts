import apiClient from "../api-client";
import { uploadFile, getAudioMetadata, getImageMetadata } from "./upload";

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
  spotifyProfile?: string;
  appleMusicProfile?: string;
  youtubeMusicProfile?: string;
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
  publisher?: string;
  copyright?: string;
  recordingYear?: number;
  albumTitle?: string;
  selectedPlatforms?: string[];
  format?: string;
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
  userId: string;
  status: ReleaseStatus;
  title: string;
  artistName: string;
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
  publisher?: string;
  copyright?: string;
  recordingYear?: number;
  albumTitle?: string;
  rejectionReason?: string;
  adminNotes?: string;
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
  spotifyProfile?: string;
  appleMusicProfile?: string;
  youtubeMusicProfile?: string;
  instagramProfile?: string;
  instagramProfileUrl?: string;
  facebookProfile?: string;
  facebookProfileUrl?: string;

  primaryGenre?: string;
  secondaryGenre?: string;

  socialPlatforms?: {
    spotifyProfile?: string;
    appleMusicProfile?: string;
    youtubeMusicProfile?: string;
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
}

// Process and submit new release with file uploads
export const submitNewRelease = async (formData: ReleaseFormData) => {
  try {
    // 1. Upload audio file (if single/present)
    let audioData: AudioFile | undefined = undefined;
    if (formData.audioFile) {
      console.log("Uploading audio file...");
      const audioUrl = await uploadFile(formData.audioFile, "audio");
      const audioMetadata = await getAudioMetadata(formData.audioFile);
      audioData = {
        url: audioUrl,
        filename: formData.audioFile.name,
        size: formData.audioFile.size,
        duration: audioMetadata.duration,
        format: audioMetadata.format,
      };
    }

    // 2. Upload cover art
    console.log("Uploading cover art...");
    const coverUrl = await uploadFile(formData.coverArt, "cover");
    const coverMetadata = await getImageMetadata(formData.coverArt);

    // 3. Process Tracks (if any)
    let tracksPayload: TrackPayload[] = [];
    if (formData.tracks && formData.tracks.length > 0) {
      console.log(`Processing ${formData.tracks.length} tracks...`);
      tracksPayload = await Promise.all(
        formData.tracks.map(async (track: any) => {
          let trackAudioData = null;
          if (track.audioFile) {
            const url = await uploadFile(track.audioFile, "audio");
            const metadata = await getAudioMetadata(track.audioFile);
            trackAudioData = {
              url,
              filename: track.audioFile.name,
              size: track.audioFile.size,
              duration: metadata.duration,
              format: metadata.format,
            };
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
            songwriters: track.songwriters,
            composers: track.composers,
            previouslyReleased: track.previouslyReleased,
            originalReleaseDate: track.originalReleaseDate,
            primaryGenre: track.primaryGenre,
            secondaryGenre: track.secondaryGenre,
          };
        })
      );
    }

    // 4. Prepare release data
    const releaseData: CreateReleaseData = {
      title: formData.title,
      artistName: formData.artistName,
      language: formData.language,
      releaseType: formData.releaseType,
      isExplicit: formData.explicitLyrics === "yes",
      releaseDate: formData.releaseDate,

      audioFile: audioData,

      coverArt: {
        url: coverUrl,
        filename: formData.coverArt.name,
        size: formData.coverArt.size,
        dimensions: {
          width: coverMetadata.width,
          height: coverMetadata.height,
        },
        format: coverMetadata.format,
      },

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
      ...(formData.writers && { writers: formData.writers }),
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

      // Flat fields mapping
      ...(formData.primaryGenre && { primaryGenre: formData.primaryGenre }),
      ...(formData.secondaryGenre && {
        secondaryGenre: formData.secondaryGenre,
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
      ...(formData.instagramProfile && {
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
    };

    // 5. Create release via API
    console.log("Creating release...", releaseData);
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
