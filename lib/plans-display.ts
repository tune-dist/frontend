import {
  Plan,
  currencySymbol,
  derivePeriodLabel,
  normalizePlanKey,
} from '@/lib/api/plans';

export function resolvePlanPriceDisplay(plan: Plan): string {
  const raw = plan.priceDisplay?.trim();
  const isCustomLabel = raw?.toLowerCase() === 'custom';
  // Stale "Custom" label should not override a real paid price from admin.
  if (raw && !isCustomLabel) return raw;
  if (plan.pricePerYear <= 0) {
    return isCustomLabel ? 'Custom' : `${currencySymbol(plan.currency)}0`;
  }
  return `${currencySymbol(plan.currency)}${plan.pricePerYear.toLocaleString('en-IN')}`;
}

/** Unpaid custom-quote plans (contact sales). Paid Enterprise is a normal plan. */
export function isCustomPricingPlan(plan: Plan): boolean {
  if (plan.pricePerYear > 0) return false;
  return (
    plan.priceDisplay?.trim().toLowerCase() === 'custom' ||
    normalizePlanKey(plan.key) === 'enterprise'
  );
}

/** Contact-sales UX — only when Enterprise/custom is still unpaid. */
export function isEnterprisePlan(plan: Plan): boolean {
  return isCustomPricingPlan(plan);
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
    const contactLike = /contact\s*(us|sales)?/i.test(label);
    if (isEnterprisePlan(plan) || (contactLike && plan.pricePerYear <= 0)) {
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

/** Compact homepage line, e.g. "1 artist · 2 releases/year". */
export function resolvePlanLimitsSummary(plan: Plan): string {
  const maxArtists = plan.limits?.maxArtists ?? 0;
  const maxReleases = plan.limits?.maxPendingReleases ?? 0;
  const unlimitedArtists = maxArtists >= 9999 || maxArtists <= 0;

  if (unlimitedArtists) {
    return 'Unlimited artists';
  }

  const artistLabel = `${maxArtists} artist${maxArtists === 1 ? '' : 's'}`;
  const releaseLabel =
    maxReleases >= 9999 || maxReleases <= 0
      ? 'Unlimited releases'
      : `${maxReleases} releases/year`;

  return `${artistLabel} · ${releaseLabel}`;
}

export function resolveSupportBadgeLabel(plan: Plan): string {
  const raw = plan.supportResponse?.trim();
  if (!raw) return 'Standard support';
  if (/support/i.test(raw)) return raw;
  if (/same.?day|priority/i.test(raw)) {
    return raw.toLowerCase().includes('support') ? raw : 'Same-day priority support';
  }
  return `Support within ${raw}`;
}

export function resolvePlanPeriodLabel(plan: Plan): string | null {
  const raw = plan.period?.trim();
  // Ignore stale custom-quote leftovers like " pricing"
  if (raw && !/^pricing$/i.test(raw)) return raw;
  return derivePeriodLabel(plan);
}

/** Respect API order; sort by displayOrder when present (backend source of truth). */
export function sortActivePlans(plans: Plan[]): Plan[] {
  return [...plans]
    .filter((plan) => plan.isActive !== false)
    .sort((a, b) => {
      const orderA = a.displayOrder ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.displayOrder ?? Number.MAX_SAFE_INTEGER;
      if (orderA !== orderB) return orderA - orderB;
      return a.pricePerYear - b.pricePerYear;
    });
}
