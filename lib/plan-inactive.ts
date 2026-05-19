// Bridges the axios response interceptor (runs outside React) and a React
// provider that owns the "subscribe to continue" modal. The provider registers
// a handler on mount; the interceptor calls it when the backend returns 403
// with code: 'PLAN_INACTIVE'.

export const PLAN_INACTIVE_CODE = 'PLAN_INACTIVE' as const;

export interface PlanInactivePayload {
    reason?: string;
    message?: string;
}

type Handler = (payload: PlanInactivePayload) => void;

let handler: Handler | null = null;

export const setPlanInactiveHandler = (next: Handler | null) => {
    handler = next;
};

export const triggerPlanInactive = (payload: PlanInactivePayload) => {
    handler?.(payload);
};

// Error tag so call sites can recognise the rejection and skip their own
// error toast — the modal is already telling the user what's wrong.
export class PlanInactiveError extends Error {
    readonly isPlanInactive = true;
    readonly reason?: string;
    constructor(payload: PlanInactivePayload) {
        super(payload.message || 'Subscription required');
        this.name = 'PlanInactiveError';
        this.reason = payload.reason;
    }
}

export const isPlanInactiveError = (err: unknown): err is PlanInactiveError =>
    !!err && typeof err === 'object' && (err as { isPlanInactive?: boolean }).isPlanInactive === true;
