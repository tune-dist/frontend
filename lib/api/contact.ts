import apiClient from '../api-client';

export interface ContactData {
  name: string;
  email: string;
  subject: string;
  message: string;
  plan?: string;
}

export const sendContactMessage = async (data: ContactData): Promise<{ message: string }> => {
  const response = await apiClient.post<{ message: string }>('/contact', data);
  return response.data;
};
