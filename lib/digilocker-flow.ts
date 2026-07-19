import {
  digilockerCallback,
  revokeDigilockerSession,
  startDigilocker,
  verifyDigilockerAadhaar,
  verifyDigilockerPan,
} from './api/digilocker';

export const DIGILOCKER_SESSION_KEY = 'digilockerSessionId';

export function saveDigilockerSessionId(sessionId: string): void {
  sessionStorage.setItem(DIGILOCKER_SESSION_KEY, sessionId);
}

export function readDigilockerSessionId(): string | null {
  return sessionStorage.getItem(DIGILOCKER_SESSION_KEY);
}

export function clearDigilockerSessionId(): void {
  sessionStorage.removeItem(DIGILOCKER_SESSION_KEY);
}

/** Start DigiLocker OAuth and redirect the browser to DigiLocker. */
export async function beginDigilockerVerification(): Promise<void> {
  const started = await startDigilocker();
  saveDigilockerSessionId(started.sessionId);
  window.location.href = started.redirectUrl;
}

/**
 * After DigiLocker redirects back to http://localhost:8080/?code&state,
 * exchange code and fetch Aadhaar + PAN documents.
 */
export async function completeDigilockerVerification(code: string, state: string): Promise<void> {
  await digilockerCallback({ code, state });

  const aadhaarErrors: string[] = [];
  try {
    await verifyDigilockerAadhaar(state);
  } catch (err) {
    aadhaarErrors.push(err instanceof Error ? err.message : 'Aadhaar verification failed');
  }

  try {
    await verifyDigilockerPan(state);
  } catch (err) {
    aadhaarErrors.push(err instanceof Error ? err.message : 'PAN verification failed');
  }

  try {
    await revokeDigilockerSession(state);
  } catch {
    /* revoke is best-effort */
  }

  clearDigilockerSessionId();

  if (aadhaarErrors.length === 2) {
    throw new Error(aadhaarErrors.join('; '));
  }
}
