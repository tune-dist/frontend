import type { User } from '@/lib/api/auth';

export const AUTH_USER_UPDATED_EVENT = 'auth:user-updated';

export function dispatchAuthUserUpdated(user: User): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<User>(AUTH_USER_UPDATED_EVENT, { detail: user }));
}
