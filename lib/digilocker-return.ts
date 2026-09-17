export const DIGILOCKER_CALLBACK_PATH = '/auth/digilocker/callback';

export function isDigilockerReturnQuery(params: {
  get: (key: string) => string | null;
}): boolean {
  const state = params.get('state');
  if (!state) return false;
  return Boolean(params.get('code') || params.get('error'));
}

export function digilockerCallbackPath(query: string): string {
  if (!query) return DIGILOCKER_CALLBACK_PATH;
  return `${DIGILOCKER_CALLBACK_PATH}?${query}`;
}
