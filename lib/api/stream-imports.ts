import apiClient from '../api-client';

export type StreamImportFormat = 'long' | 'wide';

export interface StreamImportRecord {
  id: string;
  bulkImportId?: string;
  recordFormat: StreamImportFormat;
  isrc: string;
  dsp: string;
  dataDate?: string;
  playCount?: number;
  songName?: string;
  albumName?: string;
  singer?: string;
  language?: string;
  genre?: string;
  dayLabels?: string[];
  dailyPlays?: Record<string, number>;
  matched: boolean;
  uploadedAt: string;
  createdAt: string;
}

export interface StreamImportListResponse {
  items: StreamImportRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  importFormat: StreamImportFormat;
  dayLabels: string[];
}

export interface StreamImportUploadResponse {
  success: boolean;
  id: string;
  status: 'completed';
  totalRows: number;
  importedRows: number;
  skippedRows: number;
  matchedRows: number;
  unmatchedRows: number;
  batchCount: number;
}

export interface StreamImportRevertResponse {
  revertedImportId: string;
  originalFilename: string;
  removedRecords: number;
  affectedUsers: number;
}

export const PAGE_SIZE = 20;

export const streamImportsApi = {
  list: async (
    page = 1,
    limit = PAGE_SIZE,
    search?: string,
  ): Promise<StreamImportListResponse> => {
    const response = await apiClient.get<StreamImportListResponse>('/admin/stream-imports', {
      params: { page, limit, search: search?.trim() || undefined },
    });
    return response.data;
  },

  upload: async (file: File): Promise<StreamImportUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<StreamImportUploadResponse>(
      '/admin/stream-imports',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return response.data;
  },

  revertLatest: async (): Promise<StreamImportRevertResponse> => {
    const response = await apiClient.post<StreamImportRevertResponse>(
      '/admin/stream-imports/revert-latest',
    );
    return response.data;
  },

  downloadSample: async (): Promise<Blob> => {
    const response = await apiClient.get('/admin/stream-imports/sample/download', {
      responseType: 'blob',
    });
    return response.data;
  },
};
