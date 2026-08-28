import apiClient from '../api-client';

export interface StreamingTrendPoint {
  day: number;
  date: string;
  plays: number;
}

export type TrendPeriod = 'weekly' | 'monthly' | 'custom';
export type DashboardTrendPeriod = TrendPeriod | 'all_time';

export const MIN_TREND_DATE = '2026-01-01';

export interface StreamingTrendsResponse {
  period: TrendPeriod;
  startDate: string;
  endDate: string;
  dsp: string;
  label: string;
  dataPoints: StreamingTrendPoint[];
  totalPlays: number;
}

export interface BreakdownItem {
  label: string;
  count: number;
  percentage: number;
}

export interface BreakdownResponse {
  dimension: 'language' | 'genre' | 'country';
  items: BreakdownItem[];
  total: number;
}

export type BreakdownDimension = BreakdownResponse['dimension'];
export type SupportedDspFilter = 'total' | 'spotify' | 'applemusic' | 'amazon' | 'gaana' | 'jiosaavn' | 'facebook';

export interface TrendQueryParams {
  period: TrendPeriod;
  dsp?: SupportedDspFilter;
  startDate?: string;
  endDate?: string;
}

export function getTodayDateKey(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function resolveTrendQueryParams(filters: {
  period: DashboardTrendPeriod;
  dsp?: SupportedDspFilter;
  startDate?: string;
  endDate?: string;
}): TrendQueryParams {
  const dsp = filters.dsp ?? 'total';

  if (filters.period === 'all_time') {
    return {
      period: 'custom',
      dsp,
      startDate: MIN_TREND_DATE,
      endDate: getTodayDateKey(),
    };
  }

  if (filters.period === 'custom') {
    return {
      period: 'custom',
      dsp,
      startDate: filters.startDate,
      endDate: filters.endDate,
    };
  }

  return {
    period: filters.period,
    dsp,
  };
}

export function getDashboardTrendCacheKey(filters: {
  period: DashboardTrendPeriod;
  startDate: string;
  endDate: string;
}) {
  if (filters.period === 'all_time') {
    return {
      period: 'all_time' as const,
      startDate: MIN_TREND_DATE,
      endDate: getTodayDateKey(),
    };
  }

  if (filters.period === 'custom') {
    return {
      period: 'custom' as const,
      startDate: filters.startDate,
      endDate: filters.endDate,
    };
  }

  return {
    period: filters.period,
    startDate: filters.startDate,
    endDate: filters.endDate,
  };
}

export const getStreamingTrends = async ({
  period,
  dsp = 'total',
  startDate,
  endDate,
}: TrendQueryParams): Promise<StreamingTrendsResponse> => {
  const response = await apiClient.get<StreamingTrendsResponse>('/analytics/streaming-trends', {
    params: {
      period,
      dsp,
      ...(period === 'custom' ? { startDate, endDate } : {}),
    },
  });
  return response.data;
};

export const getBreakdown = async (
  dimension: BreakdownDimension,
  limit = 7,
): Promise<BreakdownResponse> => {
  const response = await apiClient.get<BreakdownResponse>('/analytics/breakdown', {
    params: { dimension, limit },
  });
  return response.data;
};
