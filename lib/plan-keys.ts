/** Not shown on pricing pages or UpgradePlanModal — checkout-only via add-on flow. */
export const ARTIST_ADDON_PLAN_KEY = 'artist_addon';

export const HIDDEN_PRICING_PLAN_KEYS = new Set([ARTIST_ADDON_PLAN_KEY]);

export function isPublicPricingPlan(planKey: string): boolean {
  return !HIDDEN_PRICING_PLAN_KEYS.has(planKey);
}
