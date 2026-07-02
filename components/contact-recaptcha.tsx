'use client';

import { useEffect, useRef } from 'react';

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

type Grecaptcha = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      callback?: (token: string) => void;
      'expired-callback'?: () => void;
    },
  ) => number;
  getResponse: (widgetId?: number) => string;
  reset: (widgetId?: number) => void;
};

function loadRecaptchaScript(): Promise<Grecaptcha> {
  const win = window as Window & {
    grecaptcha?: Grecaptcha;
    ___kratolibRecaptchaOnLoad?: () => void;
  };

  if (win.grecaptcha?.render) {
    return Promise.resolve(win.grecaptcha);
  }

  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src*="recaptcha/api.js"]');
    if (existing) {
      const interval = window.setInterval(() => {
        if (win.grecaptcha?.render) {
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
    script.src = 'https://www.google.com/recaptcha/api.js?onload=___kratolibRecaptchaOnLoad&render=explicit';
    script.async = true;
    script.defer = true;
    script.onerror = () => reject(new Error('Failed to load reCAPTCHA'));
    document.body.appendChild(script);
  });
}

export type ContactRecaptchaHandle = {
  getToken: () => string | null;
  reset: () => void;
};

type ContactRecaptchaProps = {
  onTokenChange?: (token: string | null) => void;
  recaptchaRef?: React.MutableRefObject<ContactRecaptchaHandle | null>;
};

export default function ContactRecaptcha({ onTokenChange, recaptchaRef }: ContactRecaptchaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);
  const grecaptchaRef = useRef<Grecaptcha | null>(null);

  useEffect(() => {
    if (!SITE_KEY || !containerRef.current) return;

    let cancelled = false;

    loadRecaptchaScript()
      .then((grecaptcha) => {
        if (cancelled || !containerRef.current || widgetIdRef.current !== null) return;

        grecaptchaRef.current = grecaptcha;
        widgetIdRef.current = grecaptcha.render(containerRef.current, {
          sitekey: SITE_KEY,
          callback: (token) => onTokenChange?.(token),
          'expired-callback': () => onTokenChange?.(null),
        });
      })
      .catch(() => onTokenChange?.(null));

    return () => {
      cancelled = true;
    };
  }, [onTokenChange]);

  useEffect(() => {
    if (!recaptchaRef) return;

    recaptchaRef.current = {
      getToken: () => {
        if (!grecaptchaRef.current || widgetIdRef.current === null) return null;
        const token = grecaptchaRef.current.getResponse(widgetIdRef.current);
        return token || null;
      },
      reset: () => {
        if (!grecaptchaRef.current || widgetIdRef.current === null) return;
        grecaptchaRef.current.reset(widgetIdRef.current);
        onTokenChange?.(null);
      },
    };

    return () => {
      recaptchaRef.current = null;
    };
  }, [recaptchaRef, onTokenChange]);

  if (!SITE_KEY) return null;

  return <div ref={containerRef} className="flex justify-start" />;
}

export function isRecaptchaConfigured() {
  return Boolean(SITE_KEY);
}
