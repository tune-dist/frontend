import apiClient from '../api-client';

export interface ContactData {
  name: string;
  email: string;
  subject: string;
  message: string;
  plan?: string;
  recaptchaToken: string;
}

export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  plan?: string;
  createdAt: string;
}

export interface ContactInquiryListResponse {
  items: ContactInquiry[];
  total: number;
  page: number;
  limit: number;
}

export const sendContactMessage = async (data: ContactData): Promise<{ message: string }> => {
  const response = await apiClient.post<{ message: string }>('/contact', data);
  return response.data;
};

export const contactApi = {
  getInquiries: async (page = 1, limit = 50): Promise<ContactInquiryListResponse> => {
    const response = await apiClient.get<ContactInquiryListResponse>('/contact', {
      params: { page, limit },
    });
    return response.data;
  },
};
