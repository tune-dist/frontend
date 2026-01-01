import apiClient from '../api-client';

// Types
export interface CreateOrderResponse {
    orderId: string;
    amount: number;
    currency: string;
    keyId: string;
    planTitle: string;
    receipt: string;
}

export interface VerifyPaymentData {
    razorpay_order_id: string;
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
export async function createPaymentOrder(planKey: string): Promise<CreateOrderResponse> {
    const response = await apiClient.post<CreateOrderResponse>('/payments/create-order', {
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
