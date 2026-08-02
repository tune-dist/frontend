import apiClient from '../api-client';

export type CampaignDiscountType = 'PERCENTAGE' | 'FIXED';

export interface Campaign {
  _id: string;
  code: string;
  name: string;
  description?: string;
  discountType: CampaignDiscountType;
  discountValue: number;
  startsAt: string;
  expiresAt: string;
  applicablePlans: string[];
  maxUsage?: number;
  usedCount: number;
  maxUsagePerUser: number;
  firstTimeOnly: boolean;
  isActive: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CampaignUsageUser {
  _id: string;
  fullName?: string;
  email?: string;
  userCode?: string;
  plan?: string;
  avatar?: string;
}

export interface CampaignUsagePlan {
  _id: string;
  key?: string;
  title?: string;
  pricePerYear?: number;
}

export interface CampaignUsage {
  _id: string;
  campaignId: string;
  userId: string | CampaignUsageUser;
  planId?: string | CampaignUsagePlan;
  subscriptionId?: string;
  originalAmount?: number;
  discountAmount?: number;
  payableAmount?: number;
  paymentGateway?: string;
  gatewaySubscriptionId?: string;
  createdAt?: string;
}

export type CreateCampaignPayload = {
  code: string;
  name: string;
  description?: string;
  discountType: CampaignDiscountType;
  discountValue: number;
  startsAt: string;
  expiresAt: string;
  applicablePlans: string[];
  maxUsage?: number;
  maxUsagePerUser?: number;
  firstTimeOnly?: boolean;
  isActive?: boolean;
};

export type UpdateCampaignPayload = Partial<CreateCampaignPayload>;

export interface ValidateCampaignPayload {
  code: string;
  amount: number;
  planId: string;
}

export interface ValidateCampaignResult {
  valid: boolean;
  campaign: Campaign;
  originalAmount: number;
  discountAmount: number;
  payableAmount: number;
}

export interface ApplyCampaignPayload {
  code: string;
  originalAmount: number;
  planId: string;
  subscriptionId?: string;
  paymentGateway?: string;
  gatewaySubscriptionId?: string;
}

export const campaignsApi = {
  getAll: async (activeOnly = false): Promise<Campaign[]> => {
    const response = await apiClient.get<Campaign[]>('/campaigns', {
      params: activeOnly ? { activeOnly: true } : undefined,
    });
    return response.data;
  },

  getById: async (id: string): Promise<Campaign> => {
    const response = await apiClient.get<Campaign>(`/campaigns/${id}`);
    return response.data;
  },

  getUsages: async (id: string): Promise<CampaignUsage[]> => {
    const response = await apiClient.get<CampaignUsage[]>(`/campaigns/${id}/usages`);
    return response.data;
  },

  create: async (data: CreateCampaignPayload): Promise<Campaign> => {
    const response = await apiClient.post<Campaign>('/campaigns', data);
    return response.data;
  },

  update: async (id: string, data: UpdateCampaignPayload): Promise<Campaign> => {
    const response = await apiClient.patch<Campaign>(`/campaigns/${id}`, data);
    return response.data;
  },

  deactivate: async (id: string): Promise<{ success: boolean }> => {
    const response = await apiClient.delete<{ success: boolean }>(`/campaigns/${id}`);
    return response.data;
  },

  validate: async (data: ValidateCampaignPayload): Promise<ValidateCampaignResult> => {
    const response = await apiClient.post<ValidateCampaignResult>('/campaigns/validate', data);
    return response.data;
  },

  apply: async (data: ApplyCampaignPayload) => {
    const response = await apiClient.post('/campaigns/apply', data);
    return response.data;
  },
};

export function getCampaignUsageUser(usage: CampaignUsage): CampaignUsageUser | null {
  if (usage.userId && typeof usage.userId === 'object') {
    return usage.userId;
  }
  return null;
}

export function getCampaignUsagePlan(usage: CampaignUsage): CampaignUsagePlan | null {
  if (usage.planId && typeof usage.planId === 'object') {
    return usage.planId;
  }
  return null;
}

export function formatCampaignDiscount(campaign: Pick<Campaign, 'discountType' | 'discountValue'>): string {
  if (campaign.discountType === 'PERCENTAGE') {
    return `${campaign.discountValue}%`;
  }
  return `₹${campaign.discountValue}`;
}
