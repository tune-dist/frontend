'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, CreditCard, CheckCircle, XCircle } from 'lucide-react'
import { getPlanByKey, Plan } from '@/lib/api/plans'
import { useRazorpay } from '@/hooks/useRazorpay'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

function CheckoutContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { user, isAuthenticated } = useAuth()
    const { initiatePayment, isLoading: paymentLoading, isScriptLoaded } = useRazorpay()

    const [plan, setPlan] = useState<Plan | null>(null)
    const [loading, setLoading] = useState(true)
    const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success' | 'failed'>('pending')
    const [autoTriggered, setAutoTriggered] = useState(false)

    const planKey = searchParams.get('plan')

    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthenticated && !loading) {
            router.push(`/auth?plan=${planKey}`)
        }
    }, [isAuthenticated, loading, planKey, router])

    // Fetch plan details
    useEffect(() => {
        const fetchPlan = async () => {
            if (!planKey) {
                router.push('/#pricing')
                return
            }

            try {
                const planData = await getPlanByKey(planKey)
                if (!planData) {
                    router.push('/#pricing')
                    return
                }
                setPlan(planData)
            } catch (error) {
                console.error('Failed to fetch plan:', error)
                router.push('/#pricing')
            } finally {
                setLoading(false)
            }
        }

        fetchPlan()
    }, [planKey, router])

    // Auto-trigger payment when script is loaded
    useEffect(() => {
        if (!autoTriggered && isScriptLoaded && plan && !loading && paymentStatus === 'pending') {
            setAutoTriggered(true)
            handlePayment()
        }
    }, [isScriptLoaded, plan, loading, paymentStatus, autoTriggered])

    const handlePayment = async () => {
        if (!plan || paymentLoading) return

        setPaymentStatus('processing')

        try {
            const result = await initiatePayment(plan.key, {
                name: user?.fullName,
                email: user?.email,
            })

            if (result?.success) {
                setPaymentStatus('success')
                // Redirect to dashboard after short delay
                setTimeout(() => {
                    router.push('/dashboard?payment=success')
                }, 2000)
            } else {
                setPaymentStatus('failed')
            }
        } catch (error) {
            console.error('Payment error:', error)
            setPaymentStatus('failed')
        }
    }

    if (loading || !plan) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                    <p className="mt-4 text-muted-foreground">Loading checkout...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl flex items-center justify-center gap-2">
                            {paymentStatus === 'success' ? (
                                <CheckCircle className="h-6 w-6 text-green-500" />
                            ) : paymentStatus === 'failed' ? (
                                <XCircle className="h-6 w-6 text-red-500" />
                            ) : (
                                <CreditCard className="h-6 w-6 text-primary" />
                            )}
                            {paymentStatus === 'success' ? 'Payment Successful!' :
                                paymentStatus === 'failed' ? 'Payment Failed' :
                                    'Complete Your Purchase'}
                        </CardTitle>
                        <CardDescription>
                            {paymentStatus === 'success' ?
                                'Your plan has been upgraded. Redirecting to dashboard...' :
                                paymentStatus === 'failed' ?
                                    'Something went wrong with your payment.' :
                                    `Subscribe to ${plan.title}`}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Plan Summary */}
                        <div className="bg-muted/50 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-semibold">{plan.title}</span>
                                <span className="text-xl font-bold">{plan.priceDisplay}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{plan.description}</p>
                            {plan.period && (
                                <p className="text-xs text-muted-foreground mt-1">Billed {plan.period.replace('/', '')}</p>
                            )}
                        </div>

                        {paymentStatus === 'pending' && !isScriptLoaded && (
                            <div className="text-center">
                                <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                                <p className="mt-2 text-sm text-muted-foreground">Loading payment system...</p>
                            </div>
                        )}

                        {paymentStatus === 'processing' && (
                            <div className="text-center">
                                <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                                <p className="mt-2 text-sm text-muted-foreground">Processing payment...</p>
                            </div>
                        )}

                        {paymentStatus === 'success' && (
                            <div className="text-center">
                                <Loader2 className="h-6 w-6 animate-spin mx-auto text-green-500" />
                                <p className="mt-2 text-sm text-muted-foreground">Redirecting to dashboard...</p>
                            </div>
                        )}

                        {paymentStatus === 'failed' && (
                            <div className="space-y-3">
                                <Button
                                    onClick={handlePayment}
                                    className="w-full"
                                    disabled={paymentLoading}
                                >
                                    {paymentLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        'Try Again'
                                    )}
                                </Button>
                                <Link
                                    href="/#pricing"
                                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full"
                                >
                                    Choose Different Plan
                                </Link>
                            </div>
                        )}

                        {paymentStatus === 'pending' && isScriptLoaded && (
                            <Button
                                onClick={handlePayment}
                                className="w-full"
                                disabled={paymentLoading}
                            >
                                {paymentLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    'Pay Now'
                                )}
                            </Button>
                        )}
                    </CardContent>
                </Card>

                <div className="mt-6 text-center">
                    <Link
                        href="/#pricing"
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                        ← Back to pricing
                    </Link>
                </div>
            </motion.div>
        </div>
    )
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        }>
            <CheckoutContent />
        </Suspense>
    )
}
