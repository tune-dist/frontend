export const PLAN_LIMITS: Record<string, { artistLimit: number; allowConcurrent: boolean; allowedFormats: string[] }> = {
    free: { artistLimit: 1, allowConcurrent: false, allowedFormats: ['single'] },
    solo: { artistLimit: 1, allowConcurrent: true, allowedFormats: ['single'] },
    creator_plus: { artistLimit: 5, allowConcurrent: true, allowedFormats: ['single', 'ep', 'album'] },
    label_mx: { artistLimit: 10, allowConcurrent: true, allowedFormats: ['single', 'ep', 'album'] },
    enterprise: { artistLimit: Infinity, allowConcurrent: true, allowedFormats: ['single', 'ep', 'album'] },
};
