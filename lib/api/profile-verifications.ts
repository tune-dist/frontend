import apiClient from '../api-client';
import type { IdentityDocumentDetails } from '../verification-details';

export enum VerificationDocumentType {
  PAN = 'pan',
  AADHAR = 'aadhar',
}

export enum VerificationRequestStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
}

export enum VerificationSource {
  OCR = 'ocr',
  DIGILOCKER = 'digilocker',
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
  extractedDetails?: IdentityDocumentDetails;
  verificationSource?: VerificationSource;
  ocrError?: string;
  digilockerAuthUrl?: string;
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

export type IdentityValidationStatus = 'approved' | 'rejected' | 'warned';

export interface IdentityValidationIssue {
  code: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface IdentityValidationResponse {
  status: IdentityValidationStatus;
  issues: IdentityValidationIssue[];
  extractedDetails?: IdentityDocumentDetails;
}

export const validateIdentityDocument = async (
  documentType: VerificationDocumentType,
  file: File,
  existingDetails?: IdentityDocumentDetails,
): Promise<IdentityValidationResponse> => {
  const formData = new FormData();
  formData.append('document', file);
  formData.append('documentType', documentType);
  if (existingDetails) {
    formData.append('existingDetails', JSON.stringify(existingDetails));
  }

  const response = await apiClient.post<IdentityValidationResponse>(
    '/profile-verifications/validate',
    formData,
  );
  return response.data;
};

export const submitVerificationRequest = async (data: {
  documentType: VerificationDocumentType;
  document: VerificationDocument;
  extractedDetails?: IdentityDocumentDetails;
}): Promise<ProfileVerificationRequest> => {
  const response = await apiClient.post<ProfileVerificationRequest>('/profile-verifications', data);
  return response.data;
};

export const getDigilockerAuthUrl = async (
  documentType: VerificationDocumentType,
): Promise<string> => {
  const response = await apiClient.get<{ url: string }>(
    '/profile-verifications/digilocker/auth-url',
    { params: { documentType } },
  );
  return response.data.url;
};

export const completeDigilockerCallback = async (data: {
  code: string;
  state: string;
}): Promise<ProfileVerificationRequest> => {
  const response = await apiClient.post<ProfileVerificationRequest>(
    '/profile-verifications/digilocker/callback',
    data,
  );
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
