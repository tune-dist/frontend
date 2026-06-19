'use client';

import { useState, useCallback, useEffect } from 'react';
import { createPaymentOrder, upgradePlan, verifyPayment, CreateOrderResponse, PaymentResult } from '@/lib/api/payments';
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
    order_id?: string;
    subscription_id?: string;
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
    razorpay_order_id?: string;
    razorpay_subscription_id?: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

interface InitiatePaymentOptions {
    /**
     * When true, the user already has an active Razorpay subscription and this
     * is a plan change. The hook routes through /payments/upgrade-plan so the
     * old subscription gets cancelled and addons get re-attached/dropped
     * automatically on verify.
     */
    isUpgrade?: boolean;
    /** true = Razorpay subscription (auto-renew). false = one-time order. Default true. */
    isAutoPay?: boolean;
}

interface UseRazorpayReturn {
    initiatePayment: (
        planKey: string,
        userInfo?: { name?: string; email?: string },
        options?: InitiatePaymentOptions,
    ) => Promise<PaymentResult | null>;
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
                    name: 'Kratolib',
                    description: `${order.planTitle} ${order.checkoutType === 'subscription' ? 'Subscription' : 'Purchase'}`,
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
                        color: '#6366f1',
                    },
                    modal: {
                        ondismiss: () => {
                            reject(new Error('Payment cancelled by user'));
                        },
                    },
                };

                if (order.checkoutType === 'subscription' && order.subscriptionId) {
                    options.subscription_id = order.subscriptionId;
                } else if (order.orderId) {
                    options.order_id = order.orderId;
                } else {
                    reject(new Error('Invalid checkout session from server'));
                    return;
                }

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
        async (
            planKey: string,
            userInfo?: { name?: string; email?: string },
            options?: InitiatePaymentOptions,
        ): Promise<PaymentResult | null> => {
            if (!isScriptLoaded) {
                toast.error('Payment system is loading. Please try again.');
                return null;
            }

            setIsLoading(true);

            try {
                // Step 1: Create order on backend
                // Three branches:
                //   - artist add-on → one-time order, attached to main sub via the
                //     modern addon flow (isAutoPay=false)
                //   - plan change for someone with an existing active subscription
                //     → /payments/upgrade-plan so the old sub is cancelled + addons
                //     are re-attached/dropped on verify
                //   - fresh plan purchase (user on free / expired) → standard
                //     /payments/create-order with isAutoPay=true
                const isAddon = planKey === 'artist_addon';
                const isAutoPay = options?.isAutoPay !== false;
                const order = isAddon
                    ? await createPaymentOrder(planKey, false)
                    : options?.isUpgrade && isAutoPay
                        ? await upgradePlan(planKey)
                        : await createPaymentOrder(planKey, isAutoPay);

                // Step 2: Open Razorpay checkout
                const razorpayResponse = await openCheckout(order, userInfo);

                // Step 3: Verify payment on backend
                const result = await verifyPayment({
                    razorpay_order_id: razorpayResponse.razorpay_order_id,
                    razorpay_subscription_id: razorpayResponse.razorpay_subscription_id,
                    razorpay_payment_id: razorpayResponse.razorpay_payment_id,
                    razorpay_signature: razorpayResponse.razorpay_signature,
                });

                if (!result.success) {
                    toast.error(result.message || 'Payment verification failed');
                }

                return result;
            } catch (error: any) {
                if (error.message === 'Payment cancelled by user') {
                    toast('Payment cancelled', { icon: '❌' });
                } else if (error.response?.data?.code === 'RAZORPAY_PLAN_NOT_CONFIGURED') {
                    toast.error(
                        error.response?.data?.message ||
                            'This plan is not ready for subscription yet. Please contact support.',
                        { duration: 6000 },
                    );
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
