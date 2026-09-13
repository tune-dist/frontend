export interface DigioGateway {
  init: () => void;
  submit: (documentId: string, identifier: string, accessToken?: string) => void;
}

export interface DigioSdkOptions {
  environment: 'sandbox' | 'production';
  callback: (response: Record<string, unknown>) => void;
}

interface DigioWindow extends Window {
  Digio?: new (options: DigioSdkOptions) => DigioGateway;
}

function getDigioConstructor(): (new (options: DigioSdkOptions) => DigioGateway) | undefined {
  return (window as DigioWindow).Digio;
}

export function loadDigioSdk(sdkUrl: string): Promise<new (options: DigioSdkOptions) => DigioGateway> {
  const existing = getDigioConstructor();
  if (existing) {
    return Promise.resolve(existing);
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = sdkUrl;
    script.async = true;
    script.onload = () => {
      const ctor = getDigioConstructor();
      if (!ctor) {
        reject(new Error('Digio SDK loaded but window.Digio is missing'));
        return;
      }
      resolve(ctor);
    };
    script.onerror = () => {
      reject(new Error('Failed to load the Digio signing SDK'));
    };
    document.body.appendChild(script);
  });
}

export function isDigioSdkSuccess(response: Record<string, unknown>): boolean {
  return !('error_code' in response);
}
