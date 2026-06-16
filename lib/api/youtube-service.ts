import apiClient from "../api-client";

export enum YouTubeRequestType {
    CLAIM_MONETIZE = 'Claim UGC video : monetize',
    CLAIM_BLOCK = 'Claim UGC video : block',
    TAKEDOWN = 'Takedown video',
    RELEASE_CLAIM = 'Release claim',
}

export enum YouTubeRequestStatus {
    PENDING = 'Pending',
    APPROVED = 'Approved',
    REJECTED = 'Rejected',
}

export interface YouTubeServiceRequest {
    _id: string;
    userId: {
        _id: string;
        fullName: string;
        email: string;
    } | string;
    requestType: YouTubeRequestType;
    releaseId: any;
    trackIndex: number;
    assetTitle: string;
    albumTrackTitle: string;
    songName: string;
    artistId: string;
    upc: string;
    isrc: string;
    infringingLinks: string[];
    status: YouTubeRequestStatus;
    dailyViews: number;
    expiry: string;
    otherParty: string;
    rejectionReason?: string;
    processedBy?: {
        _id: string;
        fullName: string;
        email: string;
    };
    processedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateYouTubeRequestDto {
    releaseId: string;
    trackIndex: number;
    infringingLinks: string[];
    requestType?: YouTubeRequestType;
}

export const getYouTubeRequests = async (): Promise<YouTubeServiceRequest[]> => {
    const response = await apiClient.get<YouTubeServiceRequest[]>("/youtube-service");
    return response.data;
};

export const createYouTubeRequest = async (data: CreateYouTubeRequestDto): Promise<YouTubeServiceRequest> => {
    const response = await apiClient.post<YouTubeServiceRequest>("/youtube-service", data);
    return response.data;
};

export const updateYouTubeRequestStatus = async (
    id: string,
    status: YouTubeRequestStatus | string,
    rejectionReason?: string
): Promise<YouTubeServiceRequest> => {
    const response = await apiClient.put<YouTubeServiceRequest>(`/youtube-service/${id}/status`, {
        status,
        rejectionReason,
    });
    return response.data;
};

export function getStatusLabel(status: YouTubeRequestStatus | string): string {
    if (status === YouTubeRequestStatus.APPROVED) return 'Accepted';
    return status;
}

export function buildYouTubeExportRows(requests: YouTubeServiceRequest[]) {
    const rows: Array<{
        UPC: string;
        ISRC: string;
        'Song Name': string;
        'YouTube URL': string;
        Username: string;
    }> = [];

    for (const request of requests) {
        if (request.status !== YouTubeRequestStatus.APPROVED) continue;

        const username =
            typeof request.userId === 'object' && request.userId
                ? request.userId.fullName
                : 'N/A';
        const songName = request.songName || request.albumTrackTitle;
        const links = request.infringingLinks?.length ? request.infringingLinks : [''];

        for (const link of links) {
            rows.push({
                UPC: request.upc,
                ISRC: request.isrc || 'N/A',
                'Song Name': songName,
                'YouTube URL': link,
                Username: username || 'N/A',
            });
        }
    }

    return rows;
}
