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
 * Create a Razorpay order for plan purchase
 */
export async function createPaymentOrder(planKey?: string, isAutoPay: boolean = true, isAddon?: boolean, addonType?: string): Promise<CreateOrderResponse> {
    const response = await apiClient.post<CreateOrderResponse>('/payments/create-order', {
        planKey,
        isAutoPay,
        isAddon,
        addonType,
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

/**
 * Cancel active subscription
 */
export async function cancelSubscription(subscriptionId?: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<{ success: boolean; message: string }>('/payments/cancel-subscription', {
        subscriptionId
    });
    return response.data;
}

/**
 * Get all active subscriptions for current user
 */
export async function getActiveSubscriptions(): Promise<any[]> {
    const response = await apiClient.get<any[]>('/payments/active-subscriptions');
    return response.data;
}
