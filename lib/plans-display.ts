import {
  Plan,
  currencySymbol,
  derivePeriodLabel,
  normalizePlanKey,
} from '@/lib/api/plans';

export function resolvePlanPriceDisplay(plan: Plan): string {
  const custom = plan.priceDisplay?.trim();
  if (custom) return custom;
  if (plan.pricePerYear <= 0) return `${currencySymbol(plan.currency)}0`;
  return `${currencySymbol(plan.currency)}${plan.pricePerYear.toLocaleString('en-IN')}`;
}

export function isCustomPricingPlan(plan: Plan): boolean {
  return plan.priceDisplay?.trim().toLowerCase() === 'custom';
}

export function isEnterprisePlan(plan: Plan): boolean {
  return normalizePlanKey(plan.key) === 'enterprise' || isCustomPricingPlan(plan);
}

export function resolveArtistKeepPercent(plan: Plan): number {
  return Math.max(0, Math.min(100, 100 - (plan.royaltyPercent ?? 0)));
}

export function resolveEarningsLabel(plan: Plan): string {
  return `Keep ${resolveArtistKeepPercent(plan)}% of earnings`;
}

export function resolveEarningsBadgeClass(plan: Plan): string {
  const keep = resolveArtistKeepPercent(plan);
  return keep >= 100
    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-200/50'
    : 'bg-orange-500/10 text-orange-600 border-orange-200/50';
}

export function resolvePlanCta(plan: Plan): { label: string; href: string } {
  const contactHref = `/contact?plan=${encodeURIComponent(plan.title)}`;

  if (plan.ctaLabel?.trim()) {
    const label = plan.ctaLabel.trim();
    if (isEnterprisePlan(plan) || label.toLowerCase() === 'contact us') {
      return { label, href: contactHref };
    }
    return { label, href: `/auth?plan=${encodeURIComponent(plan.key)}` };
  }

  if (isEnterprisePlan(plan)) {
    return { label: 'Contact sales', href: `/contact?plan=${encodeURIComponent(plan.title)}` };
  }

  if (plan.pricePerYear <= 0) {
    return { label: 'Get started free', href: `/auth?plan=${encodeURIComponent(plan.key)}` };
  }

  return { label: `Get ${plan.title}`, href: `/auth?plan=${encodeURIComponent(plan.key)}` };
}

export function formatArtistLimit(maxArtists: number): string {
  if (maxArtists >= 9999 || maxArtists <= 0) return 'Unlimited';
  return String(maxArtists);
}

export function formatReleaseLimit(maxPendingReleases: number): string {
  if (maxPendingReleases >= 9999 || maxPendingReleases <= 0) return 'Unlimited';
  return `${maxPendingReleases} / year`;
}

export function resolvePlanPeriodLabel(plan: Plan): string | null {
  return derivePeriodLabel(plan);
}

export function sortActivePlans(plans: Plan[]): Plan[] {
  return [...plans]
    .filter((plan) => plan.isActive !== false)
    .sort((a, b) => a.pricePerYear - b.pricePerYear);
}
