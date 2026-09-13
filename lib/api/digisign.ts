import apiClient from '../api-client';

export type B2bDocumentStatus =
  | 'pending'
  | 'signing'
  | 'signed'
  | 'failed'
  | 'expired';

export interface B2bDocumentFile {
  url: string;
  filename: string;
  uploadedAt?: string;
}

export interface B2bDocumentUserSummary {
  id?: string;
  fullName?: string;
  email?: string;
}

export interface B2bDocument {
  id: string;
  userId: string;
  user?: B2bDocumentUserSummary | null;
  title: string;
  documentType: string;
  status: B2bDocumentStatus;
  sourceDocument: B2bDocumentFile;
  signedDocument?: B2bDocumentFile;
  signerName?: string;
  signerLabel?: string;
  signedAt?: string;
  expiresAt?: string;
  failureReason?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DigioSignSession {
  documentId: string;
  identifier: string;
  environment: 'sandbox' | 'production';
  sdkUrl: string;
  accessToken?: string;
}

export const getB2bDocuments = async (): Promise<B2bDocument[]> => {
  const response = await apiClient.get<B2bDocument[]>('/digisign');
  return response.data;
};

export const createB2bDocument = async (data: {
  userId: string;
  title: string;
  signerLabel?: string;
  file?: File | null;
}): Promise<B2bDocument> => {
  const formData = new FormData();
  formData.append('userId', data.userId);
  formData.append('title', data.title);
  if (data.signerLabel?.trim()) {
    formData.append('signerLabel', data.signerLabel.trim());
  }
  if (data.file) {
    formData.append('file', data.file);
  }

  const response = await apiClient.post<B2bDocument>('/digisign', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const createDefaultB2bDocument = async (): Promise<B2bDocument> => {
  const response = await apiClient.post<B2bDocument>('/digisign/from-default');
  return response.data;
};

export const startB2bDocumentSign = async (
  id: string,
): Promise<DigioSignSession> => {
  const response = await apiClient.post<DigioSignSession>(`/digisign/${id}/sign`);
  return response.data;
};

export const syncB2bDocument = async (id: string): Promise<B2bDocument> => {
  const response = await apiClient.post<B2bDocument>(`/digisign/${id}/sync`);
  return response.data;
};

export function getB2bDocumentStatusLabel(status: B2bDocumentStatus): string {
  if (status === 'pending') return 'Pending';
  if (status === 'signing') return 'Signing';
  if (status === 'signed') return 'Signed';
  if (status === 'failed') return 'Failed';
  return 'Expired';
}

export function getB2bDocumentStatusColor(status: B2bDocumentStatus): string {
  if (status === 'signed') return 'bg-green-500/10 text-green-500';
  if (status === 'pending') return 'bg-amber-500/10 text-amber-500';
  if (status === 'signing') return 'bg-blue-500/10 text-blue-500';
  return 'bg-red-500/10 text-red-500';
}
