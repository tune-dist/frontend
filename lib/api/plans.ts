import apiClient from '../api-client';

export interface PlanLimits {
  maxPendingReleases: number;
  maxArtists: number;
  maxStorageGB: number;
  allowConcurrent: boolean;
  allowedFormats: string[];
}

export interface Plan {
  _id: string;
  key: string;
  title: string;
  pricePerYear: number;
  royaltyPercent: number;
  limits: PlanLimits;
  fieldRules: Record<string, any>;
  version: number;
  enforceFrom?: Date;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PlanLimitsMap {
  artistLimit: number; // Maps to limits.maxArtists
  allowConcurrent: boolean; // Maps to limits.allowConcurrent
  allowedFormats: string[]; // Maps to limits.allowedFormats
}

// Cache for plans
let plansCache: Plan[] | null = null;
let plansCacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Cache for plan limits map
let planLimitsMapCache: Record<string, PlanLimitsMap> | null = null;

/**
 * Get all active plans from the API
 * Uses caching to minimize API calls
 */
export async function getAllPlans(forceRefresh = false): Promise<Plan[]> {
  const now = Date.now();

  // Return cached data if available and not expired
  if (!forceRefresh && plansCache && (now - plansCacheTimestamp) < CACHE_DURATION) {
    return plansCache;
  }

  try {
    const response = await apiClient.get<Plan[]>('/plans');
    plansCache = response.data;
    plansCacheTimestamp = now;
    return plansCache;
  } catch (error) {
    // If we have cached data, return it even if expired
    if (plansCache) {
      console.warn('Failed to fetch plans, using cached data:', error);
      return plansCache;
    }
    throw error;
  }
}

/**
 * Get a plan by key
 * Uses caching to minimize API calls
 */
export async function getPlanByKey(key: string, forceRefresh = false): Promise<Plan | null> {
  const plans = await getAllPlans(forceRefresh);
  return plans.find(p => p.key === key) || null;
}

/**
 * Get plan limits map (converted format for frontend compatibility)
 * Maps backend plan structure to frontend format:
 * - limits.maxArtists -> artistLimit
 * - limits.allowConcurrent -> allowConcurrent
 * - limits.allowedFormats -> allowedFormats
 */
export async function getPlanLimitsMap(forceRefresh = false): Promise<Record<string, PlanLimitsMap>> {
  const now = Date.now();

  // Return cached map if available and not expired
  if (!forceRefresh && planLimitsMapCache && (now - plansCacheTimestamp) < CACHE_DURATION) {
    return planLimitsMapCache;
  }

  const plans = await getAllPlans(forceRefresh);

  // Convert plans to limits map format
  const map: Record<string, PlanLimitsMap> = {};
  for (const plan of plans) {
    map[plan.key] = {
      artistLimit: plan.limits.maxArtists,
      allowConcurrent: plan.limits?.allowConcurrent ?? false,
      allowedFormats: plan.limits?.allowedFormats ?? ['single'],
    };
  }

  planLimitsMapCache = map;
  return map;
}

/**
 * Get plan limits for a specific plan key
 * Returns the same format as the old PLAN_LIMITS constant
 */
export async function getPlanLimits(planKey: string, forceRefresh = false): Promise<PlanLimitsMap> {
  const map = await getPlanLimitsMap(forceRefresh);
  return map[planKey] || {
    artistLimit: 1,
    allowConcurrent: false,
    allowedFormats: ['single'],
  };
}

/**
 * Get field rules for a specific plan key
 * Returns the fieldRules object from the plan
 */
export async function getPlanFieldRules(planKey: string, forceRefresh = false): Promise<Record<string, any>> {
  const plan = await getPlanByKey(planKey, forceRefresh);
  return plan?.fieldRules || {};
}

/**
 * Clear the plans cache (useful for testing or forced refresh)
 */
export function clearPlansCache(): void {
  plansCache = null;
  planLimitsMapCache = null;
  plansCacheTimestamp = 0;
}

