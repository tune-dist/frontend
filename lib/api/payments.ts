import apiClient from '../api-client';

// Types
export interface CreateOrderResponse {
    orderId?: string;
    subscriptionId?: string;
    amount: number;
    currency: string;
    keyId: string;
    planTitle: string;
    receipt: string;
}

export interface VerifyPaymentData {
    razorpay_order_id?: string;
    razorpay_subscription_id?: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

export interface PaymentResult {
    success: boolean;
    message: string;
    planKey?: string;
    planEndDate?: string;
}

export interface PaymentHistoryItem {
    _id: string;
    razorpayOrderId: string;
    razorpayPaymentId?: string;
    planKey: string;
    amount: number;
    currency: string;
    status: string;
    createdAt: string;
}

/**
 * Create a Razorpay order or subscription for a plan purchase.
 *
 * Pass isAutoPay=true (default) for paid plans so the backend creates a recurring
 * Razorpay subscription. Pass isAutoPay=false for the artist add-on so the backend
 * creates a one-time order and attaches the addon to the user's main subscription
 * for the next billing cycle (modern addon flow).
 */
export async function createPaymentOrder(
    planKey: string,
    isAutoPay: boolean = true,
): Promise<CreateOrderResponse> {
    const response = await apiClient.post<CreateOrderResponse>('/payments/create-order', {
        planKey,
        isAutoPay,
    });
    return response.data;
}

/**
 * Upgrade the user's active Razorpay subscription to a higher-tier plan.
 *
 * Returns a NEW subscriptionId to be passed to Razorpay Checkout. On successful
 * payment verification the backend automatically cancels the previous subscription
 * on Razorpay (cancelAtEnd=false, immediate) and re-attaches artist-slot addons
 * to the new subscription so they continue to auto-bill on renewals.
 *
 * Self-service downgrades (target pricePerYear < current pricePerYear) are
 * rejected by the backend with 400 — users must contact support.
 *
 * Precondition: the user must already have an active subscription. For users on
 * the free plan or whose subscription is expired/cancelled, use createPaymentOrder
 * instead — they don't have a "current" subscription to replace.
 */
export async function upgradePlan(planKey: string): Promise<CreateOrderResponse> {
    const response = await apiClient.post<CreateOrderResponse>('/payments/upgrade-plan', {
        planKey,
    });
    return response.data;
}

/**
 * Verify payment after Razorpay checkout completes
 */
export async function verifyPayment(data: VerifyPaymentData): Promise<PaymentResult> {
    const response = await apiClient.post<PaymentResult>('/payments/verify', data);
    return response.data;
}

/**
 * Get payment history for current user
 */
export async function getPaymentHistory(): Promise<PaymentHistoryItem[]> {
    const response = await apiClient.get<PaymentHistoryItem[]>('/payments/history');
    return response.data;
}

/**
 * Get specific payment details
 */
export async function getPaymentById(paymentId: string): Promise<PaymentHistoryItem> {
    const response = await apiClient.get<PaymentHistoryItem>(`/payments/${paymentId}`);
    return response.data;
}

export interface CancelSubscriptionResponse {
    success: boolean;
    message: string;
}

/**
 * Cancel the user's main Razorpay subscription (cancel-at-end). Cascades to
 * deactivate every addon for the user — addons cannot outlive the main plan.
 */
export async function cancelMainSubscription(): Promise<CancelSubscriptionResponse> {
    const response = await apiClient.post<CancelSubscriptionResponse>('/payments/cancel-subscription', {});
    return response.data;
}
