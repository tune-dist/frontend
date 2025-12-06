import apiClient from '../api-client';
import { uploadFile, getAudioMetadata, getImageMetadata } from './upload';

export interface SubmissionFormData {
    title: string;
    artistName: string;
    numberOfSongs?: string;

    // Release info
    previouslyReleased?: string;
    releaseDate: string;
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
    audioFile: File;
    audioFileName?: string;

    // Track details
    artworkConfirmed?: boolean;
    explicitLyrics?: string;
    radioEdit?: string;
    instrumental?: string;
    previewClipStartTime?: string;

    // Other
    releaseType: ReleaseType;
    featuredArtists?: string[];
    subGenre?: string;
    labelName?: string; // Explicitly added to interface if needed or handled via transformation
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
}

export type SubmissionStatus = 'draft' | 'pending_review' | 'processing' | 'approved' | 'rejected';
export type ReleaseType = 'single' | 'ep' | 'album' | 'compilation';

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

export interface Submission {
    _id: string;
    userId: string;
    status: SubmissionStatus;
    title: string;
    artistName: string;
    featuredArtists?: string[];
    labelName?: string;
    language: string;
    releaseType: ReleaseType;
    isExplicit: boolean;
    audioFile: AudioFile;
    trackNumber?: number;
    coverArt: CoverArt;
    releaseDate: string;
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
}

export interface CreateSubmissionData {
    title: string;
    artistName: string;
    featuredArtists?: string[];
    labelName?: string;
    language: string;
    releaseType: ReleaseType;
    isExplicit: boolean;
    audioFile: AudioFile;
    trackNumber?: number;
    coverArt: CoverArt;
    releaseDate: string;
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
}

export interface SubmissionsResponse {
    submissions: Submission[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface GetSubmissionsParams {
    status?: SubmissionStatus;
    page?: number;
    limit?: number;
}

// Process and submit new submission with file uploads
export const submitNewSubmission = async (formData: SubmissionFormData) => {
    try {
        // 1. Upload audio file
        console.log('Uploading audio file...');
        const audioUrl = await uploadFile(formData.audioFile, 'audio');
        const audioMetadata = await getAudioMetadata(formData.audioFile);

        // 2. Upload cover art
        console.log('Uploading cover art...');
        const coverUrl = await uploadFile(formData.coverArt, 'cover');
        const coverMetadata = await getImageMetadata(formData.coverArt);

        // 3. Prepare submission data
        const submissionData: CreateSubmissionData = {
            title: formData.title,
            artistName: formData.artistName,
            language: formData.language,
            releaseType: formData.releaseType,
            isExplicit: formData.explicitLyrics === 'yes',
            releaseDate: formData.releaseDate,

            audioFile: {
                url: audioUrl,
                filename: formData.audioFile.name,
                size: formData.audioFile.size,
                duration: audioMetadata.duration,
                format: audioMetadata.format,
            },

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

            // Optional fields mapping
            ...(formData.featuredArtists && { featuredArtists: formData.featuredArtists }),

            // Map labelName from recordLabel if not present
            ...(formData.labelName ? { labelName: formData.labelName } : (formData.recordLabel && { labelName: formData.recordLabel })),

            ...(formData.trackNumber && { trackNumber: formData.trackNumber }),
            ...(formData.originalReleaseDate && { originalReleaseDate: formData.originalReleaseDate }),
            ...(formData.distributionTerritories && { distributionTerritories: formData.distributionTerritories }),
            ...(formData.catalogNumber && { catalogNumber: formData.catalogNumber }),
            ...(formData.barcode && { barcode: formData.barcode }),
            ...(formData.isrc && { isrc: formData.isrc }),
            ...(formData.writers && { writers: formData.writers }),
            ...(formData.publisher && { publisher: formData.publisher }),
            ...(formData.copyright && { copyright: formData.copyright }),
            ...(formData.recordingYear && { recordingYear: formData.recordingYear }),
            ...(formData.albumTitle && { albumTitle: formData.albumTitle }),
            ...(formData.selectedPlatforms && { selectedPlatforms: formData.selectedPlatforms }),

            // New fields specific to submissions
            ...(formData.numberOfSongs && { numberOfSongs: parseInt(formData.numberOfSongs) || 1 }),
            ...(formData.socialMediaPack !== undefined && { socialMediaPack: formData.socialMediaPack }),

            // Flat fields mapping
            ...(formData.primaryGenre && { primaryGenre: formData.primaryGenre }),
            ...(formData.secondaryGenre && { secondaryGenre: formData.secondaryGenre }),

            ...(formData.spotifyProfile && { spotifyProfile: formData.spotifyProfile }),
            ...(formData.appleMusicProfile && { appleMusicProfile: formData.appleMusicProfile }),
            ...(formData.youtubeMusicProfile && { youtubeMusicProfile: formData.youtubeMusicProfile }),
            ...(formData.instagramProfile && { instagramProfile: formData.instagramProfile }),
            ...(formData.instagramProfileUrl && { instagramProfileUrl: formData.instagramProfileUrl }),
            ...(formData.facebookProfile && { facebookProfile: formData.facebookProfile }),
            ...(formData.facebookProfileUrl && { facebookProfileUrl: formData.facebookProfileUrl }),

            socialPlatforms: {
                spotifyProfile: formData.spotifyProfile,
                appleMusicProfile: formData.appleMusicProfile,
                youtubeMusicProfile: formData.youtubeMusicProfile,
                instagramProfile: formData.instagramProfile,
                instagramProfileUrl: formData.instagramProfileUrl,
                facebookProfile: formData.facebookProfile,
                facebookProfileUrl: formData.facebookProfileUrl,
            },

            ...(formData.artworkConfirmed !== undefined && { artworkConfirmed: formData.artworkConfirmed }),
            ...(formData.previewClipStartTime && { previewClipStartTime: formData.previewClipStartTime }),
            ...(formData.radioEdit && { radioEdit: formData.radioEdit }),
            ...(formData.instrumental && { instrumental: formData.instrumental }),
        };

        // 4. Create submission via API
        console.log('Creating submission...', submissionData);
        return createSubmission(submissionData);
    } catch (error: any) {
        console.error('Submission failed:', error);
        throw new Error(
            error.response?.data?.message ||
            error.message ||
            'Failed to submit. Please try again.'
        );
    }
};

// Get all user submissions
export const getSubmissions = async (params?: GetSubmissionsParams): Promise<SubmissionsResponse> => {
    const response = await apiClient.get<SubmissionsResponse>('/submissions', { params });
    return response.data;
};

// Get single submission by ID
export const getSubmission = async (id: string): Promise<Submission> => {
    const response = await apiClient.get<Submission>(`/submissions/${id}`);
    return response.data;
};

// Create new submission (draft)
export const createSubmission = async (data: CreateSubmissionData): Promise<Submission> => {
    const response = await apiClient.post<Submission>('/submissions', data);
    return response.data;
};

// Update submission (draft only)
export const updateSubmission = async (id: string, data: Partial<CreateSubmissionData>): Promise<Submission> => {
    const response = await apiClient.put<Submission>(`/submissions/${id}`, data);
    return response.data;
};

// Submit submission for review
export const submitSubmission = async (id: string): Promise<Submission> => {
    const response = await apiClient.post<Submission>(`/submissions/${id}/submit`);
    return response.data;
};

// Cancel submitted submission
export const cancelSubmission = async (id: string): Promise<Submission> => {
    const response = await apiClient.post<Submission>(`/submissions/${id}/cancel`);
    return response.data;
};

// Delete submission (draft only)
export const deleteSubmission = async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(`/submissions/${id}`);
    return response.data;
};
