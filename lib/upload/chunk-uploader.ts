import axios from 'axios';

const CHUNK_SIZE = 1024 * 1024; // 1MB
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface UploadProgressCallback {
    (progress: number): void;
}

interface UploadCompleteResponse {
    path: string;
    metaData: {
        duration?: number;
        resolution?: { width: number; height: number }; // Frontend uses 'height' but backend might send 'heigth' typo, we map it.
    }
}

export const uploadFileInChunks = async (
    file: File,
    accessToken: string, // Not strictly used in this codebase's valid auth maybe, but included per Vue.
    onProgress?: UploadProgressCallback
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

        try {
            const response = await axios.post(`${API_URL}/chunk_files/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    // 'Authorization': `Bearer ${accessToken}`, // Uncomment if backend requires it
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Error uploading chunk ${chunkIndex} (Attempt ${retryCount + 1})`, error);
            if (retryCount < maxRetries) {
                // Exponential backoffish
                const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
                await new Promise(resolve => setTimeout(resolve, delay));
                return uploadChunk(chunk, chunkIndex, retryCount + 1);
            }
            throw new Error(`Failed to upload chunk ${chunkIndex} after ${maxRetries} retries.`);
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
    // The backend returns { status: 'chunk_received' } for intermediate
    // And { path: ..., metaData: ... } for the last one.

    if (result && result.path) {
        return {
            path: result.path,
            metaData: {
                duration: result.metaData?.duration,
                resolution: result.metaData?.resolution
            }
        };
    }

    throw new Error('Upload completed but no path returned.');
};

export const uploadFileDirectly = async (
    file: File,
    onProgress?: UploadProgressCallback
): Promise<UploadCompleteResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(`${API_URL}/chunk_files/single`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
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
            metaData: {
                duration: response.data.metaData?.duration,
                resolution: response.data.metaData?.resolution
            }
        };
    }

    throw new Error('Direct upload completed but no path returned.');
};
