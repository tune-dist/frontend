'use client';

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
export const RECAPTCHA_ACTION = 'contact_submit';

type Grecaptcha = {
  ready: (callback: () => void) => void;
  execute: (siteKey: string, options: { action: string }) => Promise<string>;
};

function loadRecaptchaScript(): Promise<Grecaptcha> {
  const win = window as Window & {
    grecaptcha?: Grecaptcha;
    ___kratolibRecaptchaOnLoad?: () => void;
  };

  if (win.grecaptcha?.execute) {
    return Promise.resolve(win.grecaptcha);
  }

  if (!SITE_KEY) {
    return Promise.reject(new Error('reCAPTCHA is not configured'));
  }

  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src*="recaptcha/api.js"]');
    if (existing) {
      const interval = window.setInterval(() => {
        if (win.grecaptcha?.execute) {
          window.clearInterval(interval);
          resolve(win.grecaptcha);
        }
      }, 100);
      return;
    }

    win.___kratolibRecaptchaOnLoad = () => {
      if (win.grecaptcha) {
        resolve(win.grecaptcha);
        return;
      }
      reject(new Error('reCAPTCHA failed to load'));
    };

    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`;
    script.async = true;
    script.defer = true;
    script.onerror = () => reject(new Error('Failed to load reCAPTCHA'));
    document.body.appendChild(script);
  });
}

export async function executeRecaptcha(action = RECAPTCHA_ACTION): Promise<string> {
  if (!SITE_KEY) {
    throw new Error('reCAPTCHA is not configured');
  }

  const grecaptcha = await loadRecaptchaScript();

  return new Promise((resolve, reject) => {
    grecaptcha.ready(() => {
      grecaptcha
        .execute(SITE_KEY, { action })
        .then(resolve)
        .catch(reject);
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
