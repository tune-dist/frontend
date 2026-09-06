import Cookies from 'js-cookie';
import type { User } from '@/lib/api/auth';
import { config } from '@/lib/config';

export const authCookieOptions = {
  expires: 7,
  sameSite: 'lax' as const,
  path: '/',
} as const;

export function hasAuthToken(): boolean {
  return Boolean(Cookies.get(config.tokenKey));
}

export function getCachedUser(): User | null {
  const raw = Cookies.get('user');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function setAuthUserCookie(user: User): void {
  Cookies.set('user', JSON.stringify(user), authCookieOptions);
}

export function setAuthTokens(accessToken: string, refreshToken?: string): void {
  Cookies.set(config.tokenKey, accessToken, authCookieOptions);
  if (refreshToken) {
    Cookies.set('refresh_token', refreshToken, authCookieOptions);
  }
}

export function clearAuthCookies(): void {
  Cookies.remove(config.tokenKey, { path: '/' });
  Cookies.remove('refresh_token', { path: '/' });
  Cookies.remove('user', { path: '/' });
  // Legacy cookies set before path: '/' was enforced
  Cookies.remove(config.tokenKey, { path: '/auth' });
  Cookies.remove('refresh_token', { path: '/auth' });
  Cookies.remove('user', { path: '/auth' });
}
