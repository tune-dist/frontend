import apiClient from '../api-client';

export enum VerificationDocumentType {
  PAN = 'pan',
  AADHAR = 'aadhar',
}

export enum VerificationRequestStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
}

export interface VerificationDocument {
  url: string;
  filename: string;
  uploadedAt: string;
}

export interface VerificationUserSummary {
  id?: string;
  fullName?: string;
  email?: string;
}

export interface ProfileVerificationRequest {
  id: string;
  userId: string;
  user?: VerificationUserSummary;
  documentType: VerificationDocumentType;
  document: VerificationDocument;
  status: VerificationRequestStatus;
  rejectionReason?: string;
  processedBy?: VerificationUserSummary;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const getVerificationRequests = async (): Promise<ProfileVerificationRequest[]> => {
  const response = await apiClient.get<ProfileVerificationRequest[]>('/profile-verifications');
  return response.data;
};

export const submitVerificationRequest = async (data: {
  documentType: VerificationDocumentType;
  document: VerificationDocument;
}): Promise<ProfileVerificationRequest> => {
  const response = await apiClient.post<ProfileVerificationRequest>('/profile-verifications', data);
  return response.data;
};

export const updateVerificationStatus = async (
  id: string,
  status: VerificationRequestStatus,
  rejectionReason?: string,
): Promise<ProfileVerificationRequest> => {
  const response = await apiClient.put<ProfileVerificationRequest>(
    `/profile-verifications/${id}/status`,
    { status, rejectionReason },
  );
  return response.data;
};

export function getVerificationStatusLabel(status: VerificationRequestStatus): string {
  switch (status) {
    case VerificationRequestStatus.APPROVED:
      return 'Approved';
    case VerificationRequestStatus.REJECTED:
      return 'Rejected';
    default:
      return 'Pending';
  }
}
