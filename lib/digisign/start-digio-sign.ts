import type { DigioSignSession } from '@/lib/api/digisign';
import { isDigioSdkSuccess, loadDigioSdk } from '@/lib/digisign/load-digio-sdk';

export function startDigioSign(
  session: DigioSignSession,
): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    void (async () => {
      try {
        const Digio = await loadDigioSdk(session.sdkUrl);
        const digio = new Digio({
          environment: session.environment,
          callback: (response) => {
            if (isDigioSdkSuccess(response)) {
              resolve(response);
              return;
            }
            const message =
              typeof response.message === 'string'
                ? response.message
                : 'Digio signing was not completed';
            reject(new Error(message));
          },
        });
        digio.init();
        digio.submit(session.documentId, session.identifier, session.accessToken);
      } catch (error) {
        reject(error);
      }
    })();
  });
}
