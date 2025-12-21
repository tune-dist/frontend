'use client';

import { useState, useCallback, useEffect } from 'react';
import { createPaymentOrder, verifyPayment, CreateOrderResponse, PaymentResult } from '@/lib/api/payments';
import toast from 'react-hot-toast';

// Razorpay script URL
const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

// Razorpay types
declare global {
    interface Window {
        Razorpay: any;
    }
}

interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    order_id: string;
    handler: (response: RazorpayResponse) => void;
    prefill?: {
        name?: string;
        email?: string;
        contact?: string;
    };
    notes?: Record<string, string>;
    theme?: {
        color?: string;
    };
    modal?: {
        ondismiss?: () => void;
    };
}

interface RazorpayResponse {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

interface UseRazorpayReturn {
    initiatePayment: (planKey: string, userInfo?: { name?: string; email?: string }) => Promise<PaymentResult | null>;
    isLoading: boolean;
    isScriptLoaded: boolean;
}

/**
 * Load Razorpay checkout script
 */
function loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
        // Check if already loaded
        if (window.Razorpay) {
            resolve(true);
            return;
        }

        // Check if script tag already exists
        const existingScript = document.getElementById('razorpay-script');
        if (existingScript) {
            existingScript.addEventListener('load', () => resolve(true));
            existingScript.addEventListener('error', () => resolve(false));
            return;
        }

        // Create and append script
        const script = document.createElement('script');
        script.id = 'razorpay-script';
        script.src = RAZORPAY_SCRIPT_URL;
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
}

/**
 * Custom hook for Razorpay payment integration
 */
export function useRazorpay(): UseRazorpayReturn {
    const [isLoading, setIsLoading] = useState(false);
    const [isScriptLoaded, setIsScriptLoaded] = useState(false);

    // Load Razorpay script on mount
    useEffect(() => {
        loadRazorpayScript().then((loaded) => {
            setIsScriptLoaded(loaded);
            if (!loaded) {
                console.error('Failed to load Razorpay script');
            }
        });
    }, []);

    /**
     * Open Razorpay checkout modal
     */
    const openCheckout = useCallback(
        (order: CreateOrderResponse, userInfo?: { name?: string; email?: string }): Promise<RazorpayResponse> => {
            return new Promise((resolve, reject) => {
                if (!window.Razorpay) {
                    reject(new Error('Razorpay script not loaded'));
                    return;
                }

                const options: RazorpayOptions = {
                    key: order.keyId,
                    amount: order.amount,
                    currency: order.currency,
                    name: 'TuneFlow',
                    description: `${order.planTitle} Subscription`,
                    order_id: order.orderId,
                    handler: (response: RazorpayResponse) => {
                        resolve(response);
                    },
                    prefill: {
                        name: userInfo?.name,
                        email: userInfo?.email,
                    },
                    notes: {
                        receipt: order.receipt,
                    },
                    theme: {
                        color: '#6366f1', // Indigo-500 matching TuneFlow theme
                    },
                    modal: {
                        ondismiss: () => {
                            reject(new Error('Payment cancelled by user'));
                        },
                    },
                };

                const razorpay = new window.Razorpay(options);
                razorpay.open();
            });
        },
        []
    );

    /**
     * Initiate payment flow for a plan
     */
    const initiatePayment = useCallback(
        async (planKey: string, userInfo?: { name?: string; email?: string }): Promise<PaymentResult | null> => {
            if (!isScriptLoaded) {
                toast.error('Payment system is loading. Please try again.');
                return null;
            }

            setIsLoading(true);

            try {
                // Step 1: Create order on backend
                const order = await createPaymentOrder(planKey);

                // Step 2: Open Razorpay checkout
                const razorpayResponse = await openCheckout(order, userInfo);

                // Step 3: Verify payment on backend
                const result = await verifyPayment({
                    razorpay_order_id: razorpayResponse.razorpay_order_id,
                    razorpay_payment_id: razorpayResponse.razorpay_payment_id,
                    razorpay_signature: razorpayResponse.razorpay_signature,
                });

                if (result.success) {
                    toast.success('Payment successful! Your plan has been upgraded.');
                } else {
                    toast.error(result.message || 'Payment verification failed');
                }

                return result;
            } catch (error: any) {
                if (error.message === 'Payment cancelled by user') {
                    toast('Payment cancelled', { icon: '❌' });
                } else {
                    console.error('Payment error:', error);
                    toast.error(error.response?.data?.message || error.message || 'Payment failed');
                }
                return null;
            } finally {
                setIsLoading(false);
            }
        },
        [isScriptLoaded, openCheckout]
    );

    return {
        initiatePayment,
        isLoading,
        isScriptLoaded,
    };
}
