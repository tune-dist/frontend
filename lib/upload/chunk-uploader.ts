import axios from 'axios';

const CHUNK_SIZE = 1024 * 1024; // 1MB
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface UploadProgressCallback {
    (progress: number): void;
}

interface UploadCompleteResponse {
    path: string;
    status?: string;
    message?: string;
    metaData: {
        duration?: number;
        resolution?: { width: number; height: number };
        hash?: string;
        fingerprint?: string;
    }
}

export const uploadFileInChunks = async (
    file: File,
    accessToken: string,
    onProgress?: UploadProgressCallback,
    type?: string,
    artistName?: string,
    trackTitle?: string,
    consent?: boolean
): Promise<UploadCompleteResponse> => {

    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    const identifier = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    let currentChunk = 0;

    // Retry logic helpers
    const maxRetries = 10;

    const uploadChunk = async (chunk: Blob, chunkIndex: number, retryCount = 0): Promise<any> => {
        const formData = new FormData();
        formData.append('chunk', chunk);
        formData.append('identifier', identifier);
        formData.append('totalChunks', totalChunks.toString());
        formData.append('currentChunk', chunkIndex.toString());
        if (type) formData.append('type', type);
        if (artistName) formData.append('artistName', artistName);
        if (trackTitle) formData.append('trackTitle', trackTitle);
        if (consent) formData.append('consent', 'true');

        try {
            const response = await axios.post(`${API_URL}/chunk_files/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${accessToken}`,
                }
            });
            return response.data;
        } catch (error: any) {
            const backendMessage = error.response?.data?.message;
            const status = error.response?.status;

            console.error(`Error uploading chunk ${chunkIndex} (Attempt ${retryCount + 1})`, error);

            // Don't retry on client errors (like 400 Bad Request for duplicates)
            if (status >= 400 && status < 500) {
                throw new Error(backendMessage || `Upload failed with status ${status}`);
            }

            if (retryCount < maxRetries) {
                // Exponential backoffish
                const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
                await new Promise(resolve => setTimeout(resolve, delay));
                return uploadChunk(chunk, chunkIndex, retryCount + 1);
            }
            throw new Error(backendMessage || `Failed to upload chunk ${chunkIndex} after ${maxRetries} retries.`);
        }
    };

    let result: any;

    for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min((i + 1) * CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        result = await uploadChunk(chunk, i);

        // Progress
        if (onProgress) {
            const progress = Math.round(((i + 1) / totalChunks) * 100);
            onProgress(progress);
        }
    }

    // The last chunk response should contain the final data
    if (result && result.path) {
        return {
            path: result.path,
            status: result.status,
            message: result.message,
            metaData: {
                duration: result.metaData?.duration,
                resolution: result.metaData?.resolution,
                hash: result.metaData?.hash,
                fingerprint: result.metaData?.fingerprint
            }
        };
    }

    throw new Error('Upload completed but no path returned.');
};

export const uploadFileDirectly = async (
    file: File,
    accessToken: string,
    onProgress?: UploadProgressCallback,
    type?: string,
    artistName?: string,
    trackTitle?: string,
    consent?: boolean
): Promise<UploadCompleteResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    if (type) formData.append('type', type);
    if (artistName) formData.append('artistName', artistName);
    if (trackTitle) formData.append('trackTitle', trackTitle);
    if (consent) formData.append('consent', 'true');

    const response = await axios.post(`${API_URL}/chunk_files/single`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${accessToken}`,
        },
        onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                onProgress(percentCompleted);
            }
        }
    });

    if (response.data && response.data.path) {
        return {
            path: response.data.path,
            status: response.data.status,
            message: response.data.message,
            metaData: {
                duration: response.data.metaData?.duration,
                resolution: response.data.metaData?.resolution,
                hash: response.data.metaData?.hash,
                fingerprint: response.data.metaData?.fingerprint
            }
        };
    }

    throw new Error('Direct upload completed but no path returned.');
};
