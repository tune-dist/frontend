import apiClient from '../api-client';
import { CreateReleaseData } from './releases';

/**
 * Mock file upload function
 * TODO: Replace with real cloud storage implementation (AWS S3/Cloudinary)
 */
export const uploadFile = async (file: File, type: 'audio' | 'cover'): Promise<string> => {
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Generate mock URL (replace with real upload to S3/Cloudinary)
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const mockUrl = `https://storage.tuneflow.com/${type}/${timestamp}.${extension}`;

    console.log(`Mock upload: ${file.name} -> ${mockUrl}`);

    return mockUrl;
};

/**
 * Extract audio file metadata
 */
export const getAudioMetadata = async (file: File): Promise<{
    duration: number;
    format: string;
}> => {
    return new Promise((resolve) => {
        const audio = document.createElement('audio');
        audio.preload = 'metadata';

        audio.onloadedmetadata = () => {
            const duration = Math.floor(audio.duration);
            const format = file.type.split('/')[1] || file.name.split('.').pop() || 'unknown';

            URL.revokeObjectURL(audio.src);
            resolve({ duration, format });
        };

        audio.onerror = () => {
            URL.revokeObjectURL(audio.src);
            // Default values if metadata extraction fails
            resolve({ duration: 0, format: file.name.split('.').pop() || 'unknown' });
        };

        audio.src = URL.createObjectURL(file);
    });
};

/**
 * Extract image metadata
 */
export const getImageMetadata = async (file: File): Promise<{
    width: number;
    height: number;
    format: string;
}> => {
    return new Promise((resolve) => {
        const img = new Image();

        img.onload = () => {
            const width = img.width;
            const height = img.height;
            const format = file.type.split('/')[1] || file.name.split('.').pop() || 'unknown';

            URL.revokeObjectURL(img.src);
            resolve({ width, height, format });
        };

        img.onerror = () => {
            URL.revokeObjectURL(img.src);
            // Default values if extraction fails
            resolve({ width: 0, height: 0, format: file.name.split('.').pop() || 'unknown' });
        };

        img.src = URL.createObjectURL(file);
    });
};

/**
 * Submit upload form with file uploads
 */
export interface UploadFormData {
    title: string;
    artistName: string;
    genres: string[];
    language: string;
    releaseType: 'single' | 'ep' | 'album' | 'compilation';
    isExplicit: boolean;
    audioFile: File;
    coverArt: File;
    releaseDate: string;
    // Optional fields
    featuredArtists?: string[];
    labelName?: string;
    subGenre?: string;
    trackNumber?: number;
    originalReleaseDate?: string;
    distributionTerritories?: string[];
    catalogNumber?: string;
    barcode?: string;
    isrc?: string;
    producers?: string[];
    writers?: string[];
    composers?: string[];
    publisher?: string;
    copyright?: string;
    recordingYear?: number;
    albumTitle?: string;
    selectedPlatforms?: string[];
}

export const submitUploadForm = async (formData: UploadFormData) => {
    try {
        // 1. Upload audio file
        console.log('Uploading audio file...');
        const audioUrl = await uploadFile(formData.audioFile, 'audio');
        const audioMetadata = await getAudioMetadata(formData.audioFile);

        // 2. Upload cover art
        console.log('Uploading cover art...');
        const coverUrl = await uploadFile(formData.coverArt, 'cover');
        const coverMetadata = await getImageMetadata(formData.coverArt);

        // 3. Prepare release data
        const releaseData: CreateReleaseData = {
            title: formData.title,
            artistName: formData.artistName,
            genres: formData.genres,
            language: formData.language,
            releaseType: formData.releaseType,
            isExplicit: formData.isExplicit,
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

            // Optional fields
            ...(formData.featuredArtists && { featuredArtists: formData.featuredArtists }),
            ...(formData.labelName && { labelName: formData.labelName }),
            ...(formData.subGenre && { subGenre: formData.subGenre }),
            ...(formData.trackNumber && { trackNumber: formData.trackNumber }),
            ...(formData.originalReleaseDate && { originalReleaseDate: formData.originalReleaseDate }),
            ...(formData.distributionTerritories && { distributionTerritories: formData.distributionTerritories }),
            ...(formData.catalogNumber && { catalogNumber: formData.catalogNumber }),
            ...(formData.barcode && { barcode: formData.barcode }),
            ...(formData.isrc && { isrc: formData.isrc }),
            ...(formData.producers && { producers: formData.producers }),
            ...(formData.writers && { writers: formData.writers }),
            ...(formData.composers && { composers: formData.composers }),
            ...(formData.publisher && { publisher: formData.publisher }),
            ...(formData.copyright && { copyright: formData.copyright }),
            ...(formData.recordingYear && { recordingYear: formData.recordingYear }),
            ...(formData.albumTitle && { albumTitle: formData.albumTitle }),
            ...(formData.selectedPlatforms && { selectedPlatforms: formData.selectedPlatforms }),
        };

        // 4. Create release via API
        console.log('Creating release...', releaseData);
        const response = await apiClient.post('/releases', releaseData);

        return response.data;
    } catch (error: any) {
        console.error('Upload failed:', error);
        throw new Error(
            error.response?.data?.message ||
            error.message ||
            'Failed to submit release. Please try again.'
        );
    }
};
