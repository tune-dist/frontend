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
    userId: string;
    requestType: YouTubeRequestType;
    releaseId: any;
    assetTitle: string;
    albumTrackTitle: string;
    artistId: string;
    upc: string;
    infringingLinks: string[];
    status: YouTubeRequestStatus;
    dailyViews: number;
    expiry: string;
    otherParty: string;
    rejectionReason?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateYouTubeRequestDto {
    requestType: YouTubeRequestType;
    releaseId: string;
    infringingLinks: string[];
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
