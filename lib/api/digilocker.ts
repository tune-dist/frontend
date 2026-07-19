import apiClient from '../api-client';

export interface DigilockerStartResponse {
  sessionId: string;
  redirectUrl: string;
  status: string;
}

export interface DigilockerCallbackResponse {
  sessionId: string;
  status: string;
  name?: string;
  phoneNumber?: string;
  email?: string;
  eaadhaarAvailable?: boolean;
  scope?: string;
}

export interface DigilockerVerifyAadhaarResponse {
  verified: boolean;
  sessionId: string;
  name?: string;
  dateOfBirth?: string;
  gender?: string;
  maskedNumber?: string;
  documentUrl?: string;
}

export interface DigilockerVerifyPanResponse {
  verified: boolean;
  sessionId: string;
  pan?: string;
  name?: string;
  documentUrl?: string;
  uri?: string;
  message?: string;
}

export const startDigilocker = async (): Promise<DigilockerStartResponse> => {
  const response = await apiClient.post<DigilockerStartResponse>('/digilocker/start', {});
  return response.data;
};

export const digilockerCallback = async (payload: {
  code: string;
  state: string;
}): Promise<DigilockerCallbackResponse> => {
  const response = await apiClient.post<DigilockerCallbackResponse>(
    '/digilocker/callback',
    payload,
  );
  return response.data;
};

export const verifyDigilockerAadhaar = async (
  sessionId: string,
): Promise<DigilockerVerifyAadhaarResponse> => {
  const response = await apiClient.post<DigilockerVerifyAadhaarResponse>(
    '/digilocker/verify/aadhaar',
    { sessionId },
  );
  return response.data;
};

export const verifyDigilockerPan = async (
  sessionId: string,
): Promise<DigilockerVerifyPanResponse> => {
  const response = await apiClient.post<DigilockerVerifyPanResponse>('/digilocker/verify/pan', {
    sessionId,
  });
  return response.data;
};

export const revokeDigilockerSession = async (sessionId: string): Promise<void> => {
  await apiClient.post(`/digilocker/${sessionId}/revoke`);
};
