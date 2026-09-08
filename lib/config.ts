export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const tokenKey = 'tuneflow_token';

function envFlag(value: string | undefined): boolean {
  return value === 'true' || value === '1';
}

export const config = {
  apiUrl: API_URL,
  tokenKey,
  skipPhoneVerification: envFlag(process.env.NEXT_PUBLIC_SKIP_PHONE_VERIFICATION),
};

