import apiClient from "../api-client";
import { getExportableYouTubeLinks } from "../youtube-url";

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
        userCode?: string;
    } | string;
    requestType: YouTubeRequestType;
    releaseId: {
        _id: string;
        title?: string;
        releaseCode?: string;
    } | string;
    trackIndex: number;
    assetTitle: string;
    albumTrackTitle: string;
    songName: string;
    artistId: string;
    upc: string;
    isrc: string;
    releaseCode?: string;
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

export function getUserCodeForExport(request: YouTubeServiceRequest): string {
    if (typeof request.userId === 'object' && request.userId?.userCode) {
        return request.userId.userCode;
    }
    return 'N/A';
}

export function getReleaseIdDisplay(request: YouTubeServiceRequest): string {
    const populatedCode =
        typeof request.releaseId === 'object'
            ? request.releaseId?.releaseCode?.trim()
            : undefined;
    const snapshotCode = request.releaseCode?.trim();

    // Prefer populated release (source of truth) over stale snapshot on the request.
    if (populatedCode) return populatedCode;
    if (snapshotCode) return snapshotCode;
    return '—';
}

export interface YouTubeExportResult {
    rows: Array<{
        'User ID': string;
        'Release ID': string;
        'Song Name': string;
        'YouTube URL': string;
    }>;
    skippedInvalidLinks: number;
    skippedRequestsWithoutLinks: number;
}

export function buildYouTubeExportRows(requests: YouTubeServiceRequest[]): YouTubeExportResult {
    const rows: YouTubeExportResult['rows'] = [];
    let skippedInvalidLinks = 0;
    let skippedRequestsWithoutLinks = 0;

    for (const request of requests) {
        if (request.status !== YouTubeRequestStatus.APPROVED) continue;

        const songName = request.songName || request.albumTrackTitle;
        const rawLinks = request.infringingLinks ?? [];
        const links = getExportableYouTubeLinks(rawLinks);
        skippedInvalidLinks += rawLinks.length - links.length;

        if (links.length === 0) {
            skippedRequestsWithoutLinks += 1;
            continue;
        }

        const userId = getUserCodeForExport(request);
        const releaseId = getReleaseIdDisplay(request);

        for (const link of links) {
            rows.push({
                'User ID': userId,
                'Release ID': releaseId,
                'Song Name': songName,
                'YouTube URL': link,
            });
        }
    }

    return { rows, skippedInvalidLinks, skippedRequestsWithoutLinks };
}
