import type { User } from '@/lib/api/auth';
import { isReleaseStaff } from '@/lib/permissions';

type PlanUser =
  | Pick<User, 'role' | 'plan' | 'hasPaidPlanAccess' | 'planSelected'>
  | null
  | undefined;

export const STAFF_EFFECTIVE_PLAN_KEY = 'enterprise';

/** super_admin, admin, release_manager — skip artist plan restrictions. */
export function isPlanExemptUser(user: PlanUser): boolean {
  return isReleaseStaff(user);
}

export function resolveEffectivePlanKey(user: PlanUser): string {
  if (isPlanExemptUser(user)) {
    return STAFF_EFFECTIVE_PLAN_KEY;
  }
  return user?.plan || 'free';
}

export function isEffectiveFreePlan(user: PlanUser): boolean {
  return resolveEffectivePlanKey(user) === 'free';
}

export function hasEffectivePaidPlanAccess(user: PlanUser): boolean {
  if (isPlanExemptUser(user)) {
    return true;
  }
  return user?.hasPaidPlanAccess === true;
}
