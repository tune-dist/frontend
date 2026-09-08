import { describe, expect, it } from 'vitest';
import {
  STAFF_EFFECTIVE_PLAN_KEY,
  hasEffectivePaidPlanAccess,
  isEffectiveFreePlan,
  isPlanExemptUser,
  resolveEffectivePlanKey,
} from './plan-access';

describe('plan-access — role before plan', () => {
  it.each([
    ['super_admin', 'super_admin'],
    ['admin', 'admin'],
    ['release_manager', 'release_manager'],
  ])('treats %s as plan-exempt', (_label, role) => {
    expect(isPlanExemptUser({ role })).toBe(true);
  });

  it('staff use enterprise plan key for upload limits', () => {
    expect(
      resolveEffectivePlanKey({ role: 'release_manager', plan: 'free' }),
    ).toBe(STAFF_EFFECTIVE_PLAN_KEY);
  });

  it('staff are not treated as free plan in UI', () => {
    expect(
      isEffectiveFreePlan({ role: 'release_manager', plan: 'free' }),
    ).toBe(false);
  });

  it('staff always have effective paid plan access', () => {
    expect(
      hasEffectivePaidPlanAccess({
        role: 'admin',
        plan: 'free',
        hasPaidPlanAccess: false,
      }),
    ).toBe(true);
  });

  it('artist on free plan stays on free plan rules', () => {
    expect(
      resolveEffectivePlanKey({ role: 'artist', plan: 'free' }),
    ).toBe('free');
    expect(
      isEffectiveFreePlan({ role: 'artist', plan: 'free' }),
    ).toBe(true);
  });
});
