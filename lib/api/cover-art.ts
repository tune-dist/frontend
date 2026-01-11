import apiClient from '../api-client';

export interface CoverArtMetadata {
    artistName: string;
    trackTitle: string;
    featuredArtists?: string[];
    isExplicit?: boolean;
    releaseYear?: string;
    recordLabel?: string;
}

export type ValidationStatus = 'approved' | 'rejected' | 'warned' | 'warning';

export interface ValidationError {
    code: string;
    message: string;
    field?: string;
    severity?: 'error' | 'warning';
}

export interface ValidationResponse {
    status: ValidationStatus;
    issues?: ValidationError[];
    errors: ValidationError[];
}

export const validateCoverArt = async (file: File, metadata: CoverArtMetadata): Promise<ValidationResponse> => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('metadata', JSON.stringify(metadata));

    const response = await apiClient.post<ValidationResponse>('/cover-art-validation/validate', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data;
};
