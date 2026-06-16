import apiClient from '../api-client';

export interface PlanLimits {
  maxPendingReleases: number;
  maxArtists: number;
  maxStorageGB: number;
  allowConcurrent: boolean;
  allowedFormats: string[];
}

export type BillingPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

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

  // Razorpay billing cycle (used when creating the matching Razorpay plan)
  billingPeriod?: BillingPeriod;
  interval?: number;
  currency?: string;

  // Display fields
  description?: string;
  priceDisplay?: string;
  period?: string;
  features?: string[];
  ctaLabel?: string;
  isPopular?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Derive the Mongo `key` from a plan title. Mirrors the backend rule:
// lowercase, spaces -> underscores, strip anything outside [a-z0-9_].
export function derivePlanKey(title: string): string {
  return (title || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

// Pick a display symbol for a currency code. Unknown codes fall back to the
// raw 3-letter code with a trailing space ("AUD "). Missing currency defaults
// to ₹ so legacy plans without the field keep their existing display.
export function currencySymbol(currency?: string): string {
  if (!currency) return '₹';
  return CURRENCY_SYMBOLS[currency.toUpperCase()] ?? `${currency} `;
}

const PERIOD_SHORT: Record<string, string> = {
  daily: '/day',
  weekly: '/wk',
  monthly: '/mo',
  yearly: '/yr',
};
const PERIOD_PLURAL: Record<string, string> = {
  daily: 'days',
  weekly: 'weeks',
  monthly: 'months',
  yearly: 'years',
};

// Compact period label for a plan card. billingPeriod is the source of truth
// (it's what Razorpay actually charges), so we derive from it first — that
// avoids a stale stored `period: "/year"` showing on a plan whose billingPeriod
// was later changed to monthly. Falls back to the legacy display `period`
// only when billingPeriod is absent (pre-migration plans). Returns null when
// neither is available so the caller can skip rendering the line.
export function derivePeriodLabel(plan: Plan): string | null {
  if (plan.billingPeriod) {
    const interval = plan.interval ?? 1;
    if (interval === 1) return PERIOD_SHORT[plan.billingPeriod] ?? `/${plan.billingPeriod}`;
    return `every ${interval} ${PERIOD_PLURAL[plan.billingPeriod] ?? plan.billingPeriod}`;
  }
  if (plan.period?.trim()) return plan.period;
  return null;
}

export interface PlanLimitsMap {
  artistLimit: number; // Maps to limits.maxArtists
  allowConcurrent: boolean; // Maps to limits.allowConcurrent
  allowedFormats: string[]; // Maps to limits.allowedFormats
}

// Cache for plans
let plansCache: Plan[] | null = null;
let plansCacheTimestamp = 0;
let plansFetchPromise: Promise<Plan[]> | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Cache for plan limits map
let planLimitsMapCache: Record<string, PlanLimitsMap> | null = null;

/**
 * Get all active plans from the API
 * Uses caching to minimize API calls
 */
export async function getAllPlans(forceRefresh = false): Promise<Plan[]> {
  const now = Date.now();

  if (!forceRefresh && plansCache && now - plansCacheTimestamp < CACHE_DURATION) {
    return plansCache;
  }

  if (plansFetchPromise) {
    return plansFetchPromise;
  }

  plansFetchPromise = (async () => {
    try {
      const response = await apiClient.get<Plan[]>('/plans');
      plansCache = response.data;
      plansCacheTimestamp = Date.now();
      planLimitsMapCache = null;
      return plansCache;
    } catch (error) {
      if (plansCache) {
        console.warn('Failed to fetch plans, using cached data:', error);
        return plansCache;
      }
      throw error;
    } finally {
      plansFetchPromise = null;
    }
  })();

  return plansFetchPromise;
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
 * Admin: Update a plan
 */
export async function adminUpdatePlan(key: string, updates: Partial<Plan>): Promise<Plan> {
  const response = await apiClient.put<Plan>(`/admin/plans/${key}`, updates);
  clearPlansCache();
  return response.data;
}

/**
 * Admin: Create a new plan
 */
export async function adminCreatePlan(planData: Partial<Plan>): Promise<Plan> {
  const response = await apiClient.post<Plan>('/admin/plans', planData);
  clearPlansCache();
  return response.data;
}

/**
 * Admin: Soft-delete a plan. Backend flips isActive to false; the plan is
 * hidden from public/admin GET /plans and from new subscription/upgrade flows.
 * Existing subscribers on this plan are not affected automatically.
 */
export async function adminDeletePlan(key: string): Promise<{ message: string }> {
  const response = await apiClient.delete<{ message: string }>(`/admin/plans/${key}`);
  clearPlansCache();
  return response.data;
}



/**
 * Clear the plans cache (useful for testing or forced refresh)
 */
export function clearPlansCache(): void {
  plansCache = null;
  planLimitsMapCache = null;
  plansCacheTimestamp = 0;
  plansFetchPromise = null;
}

