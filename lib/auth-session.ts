import type { User } from '@/lib/api/auth';

export const AUTH_USER_UPDATED_EVENT = 'auth:user-updated';
export const AUTH_SESSION_EXPIRED_EVENT = 'auth:session-expired';

export function dispatchAuthUserUpdated(user: User): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<User>(AUTH_USER_UPDATED_EVENT, { detail: user }));
}

export function dispatchSessionExpired(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(AUTH_SESSION_EXPIRED_EVENT));
}
