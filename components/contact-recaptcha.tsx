'use client';

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
export const RECAPTCHA_ACTION = 'contact_submit';

const LOAD_TIMEOUT_MS = 15_000;
const ONLOAD_CALLBACK = '___kratolibRecaptchaOnLoad';

type Grecaptcha = {
  ready: (callback: () => void) => void;
  execute: (siteKey: string, options: { action: string }) => Promise<string>;
};

type RecaptchaWindow = Window & {
  grecaptcha?: Grecaptcha;
  ___kratolibRecaptchaOnLoad?: () => void;
};

function getGrecaptcha(): Grecaptcha | undefined {
  return (window as RecaptchaWindow).grecaptcha;
}

function loadRecaptchaScript(): Promise<Grecaptcha> {
  const existing = getGrecaptcha();
  if (existing?.execute) {
    return Promise.resolve(existing);
  }

  if (!SITE_KEY) {
    return Promise.reject(new Error('reCAPTCHA is not configured'));
  }

  return new Promise((resolve, reject) => {
    const win = window as RecaptchaWindow;
    let settled = false;
    let timeoutId = 0;
    let pollId = 0;

    const finish = (error?: Error) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      window.clearInterval(pollId);
      if (win.___kratolibRecaptchaOnLoad === onLoad) {
        delete win.___kratolibRecaptchaOnLoad;
      }
      if (error) {
        reject(error);
        return;
      }
      const grecaptcha = getGrecaptcha();
      if (grecaptcha?.execute) {
        resolve(grecaptcha);
        return;
      }
      reject(new Error('reCAPTCHA failed to load'));
    };

    const onLoad = () => finish();

    timeoutId = window.setTimeout(() => {
      finish(new Error('reCAPTCHA timed out. Please refresh and try again.'));
    }, LOAD_TIMEOUT_MS);

    pollId = window.setInterval(() => {
      if (getGrecaptcha()?.execute) {
        finish();
      }
    }, 100);

    if (document.querySelector('script[src*="recaptcha/api.js"]')) {
      return;
    }

    win.___kratolibRecaptchaOnLoad = onLoad;

    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(
      SITE_KEY,
    )}&onload=${ONLOAD_CALLBACK}`;
    script.async = true;
    script.defer = true;
    script.onerror = () => finish(new Error('Failed to load reCAPTCHA'));
    document.body.appendChild(script);
  });
}

export async function executeRecaptcha(action = RECAPTCHA_ACTION): Promise<string> {
  if (!SITE_KEY) {
    throw new Error('reCAPTCHA is not configured');
  }

  const siteKey = SITE_KEY;
  const grecaptcha = await loadRecaptchaScript();

  return new Promise((resolve, reject) => {
    grecaptcha.ready(() => {
      grecaptcha.execute(siteKey, { action }).then(resolve).catch(reject);
    });
  });
}

export function isRecaptchaConfigured() {
  return Boolean(SITE_KEY);
}

export function ContactRecaptchaNotice() {
  if (!SITE_KEY) return null;

  return (
    <p className="text-xs text-muted-foreground">
      This site is protected by reCAPTCHA and the Google{' '}
      <a
        href="https://policies.google.com/privacy"
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-foreground"
      >
        Privacy Policy
      </a>{' '}
      and{' '}
      <a
        href="https://policies.google.com/terms"
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-foreground"
      >
        Terms of Service
      </a>{' '}
      apply.
    </p>
  );
}
