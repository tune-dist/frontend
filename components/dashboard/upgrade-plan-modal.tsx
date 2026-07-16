'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, Loader2, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { getAllPlans, Plan, currencySymbol, derivePeriodLabel } from '@/lib/api/plans'
import { isPublicPricingPlan } from '@/lib/plan-keys'
import { PlanGstNote } from '@/components/plans/plan-gst-note'
import { BillingTypeToggle } from '@/components/plans/billing-type-toggle'
import { useRazorpay } from '@/hooks/useRazorpay'
import { useAuth } from '@/contexts/AuthContext'
import { selectPlan as apiSelectPlan } from '@/lib/api/payments'
import toast from 'react-hot-toast'
import { getErrorMessage } from '@/lib/get-error-message'

interface UpgradePlanModalProps {
    isOpen: boolean
    onClose: () => void
    currentPlanKey?: string
    // When set, show ONLY this single plan as the upgrade target (e.g. immediate next tier)
    targetPlanKey?: string
    title?: string
    subtitle?: string
    // True when the user already has an active Razorpay subscription. If true,
    // selecting a different plan goes through /payments/upgrade-plan (cancels old,
    // creates new). Otherwise we treat it as a fresh subscription via create-order.
    hasActiveSubscription?: boolean
    /** When cancelled, user may renew/re-purchase the same plan before expiry. */
    subscriptionStatus?: 'active' | 'cancelled'
    /** Called after a successful payment so the parent can refetch subscription data. */
    onPaymentSuccess?: () => void | Promise<void>
    /** When true, user must pick a plan — modal cannot be dismissed. */
    requireSelection?: boolean
}

// Helper to normalize keys for comparison
const normalizeKey = (key?: string) => key?.toLowerCase().replace(/_/g, '-') || ''

const ENTERPRISE_PLAN_KEY = 'enterprise'
const isEnterprisePlan = (plan: Plan) => normalizeKey(plan.key) === ENTERPRISE_PLAN_KEY

export default function UpgradePlanModal({ isOpen, onClose, currentPlanKey = 'free', targetPlanKey, title, subtitle, hasActiveSubscription = false, subscriptionStatus, onPaymentSuccess, requireSelection = false }: UpgradePlanModalProps) {
    const [plans, setPlans] = useState<Plan[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
    const [confirmingPlan, setConfirmingPlan] = useState<Plan | null>(null)
    const [isAutoPay, setIsAutoPay] = useState(true)
    const { initiatePayment, isLoading: paymentLoading } = useRazorpay()
    const { user, refreshUser } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (isOpen) {
            const fetchPlans = async () => {
                try {
                    const data = await getAllPlans()

                    // If a specific target plan is provided, show only that one (single-target mode)
                    if (targetPlanKey) {
                        const target = data.find(p => normalizeKey(p.key) === normalizeKey(targetPlanKey))
                        setPlans(target ? [target] : [])
                    } else {
                        // Default mode: show ALL active plans from the database, sorted by price.
                        // The current plan is highlighted (and its CTA disabled) inside the card.
                        const displayPlans = [...data]
                            .filter(p => p.isActive !== false && isPublicPricingPlan(p.key))
                            .sort((a, b) => a.pricePerYear - b.pricePerYear)

                        setPlans(displayPlans)
                    }
                } catch (error) {
                    console.error('Failed to fetch plans:', error)
                    toast.error(getErrorMessage(error, 'Failed to load plans'))
                } finally {
                    setLoading(false)
                }
            }
            fetchPlans()
        }
    }, [isOpen, currentPlanKey, targetPlanKey])

    const isCurrentPlan = (plan: Plan) => {
        if (requireSelection) return false
        return normalizeKey(plan.key) === normalizeKey(currentPlanKey)
    }

    /** Block re-select only while subscription is actively billing — cancelled users can renew. */
    const isCurrentPlanLocked = (plan: Plan) =>
        isCurrentPlan(plan) && hasActiveSubscription && subscriptionStatus !== 'cancelled'

    const isCurrentPlanRenewable = (plan: Plan) =>
        isCurrentPlan(plan) && subscriptionStatus === 'cancelled'

    const currentPlanPrice = (() => {
        const current = plans.find(p => isCurrentPlan(p))
        return current ? current.pricePerYear : 0
    })()

    const isPlanUpgrade = (plan: Plan) => plan.pricePerYear > currentPlanPrice
    const isPlanDowngrade = (plan: Plan) =>
        !isCurrentPlan(plan) && !isEnterprisePlan(plan) && plan.pricePerYear < currentPlanPrice

    const handleSelectPlan = async (plan: Plan) => {
        if (isCurrentPlanLocked(plan)) {
            toast('You are already on this plan')
            return
        }

        // Enterprise → contact sales, no Razorpay flow
        if (isEnterprisePlan(plan)) {
            onClose()
            router.push('/contact')
            return
        }

        // Self-service downgrade is not supported; backend would reject anyway
        if (isPlanDowngrade(plan)) {
            toast('Downgrading is not available self-service. Please contact support.')
            return
        }

        // Free plan — confirm selection (signup) or already on free
        if (plan.pricePerYear === 0) {
            if (requireSelection) {
                setSelectedPlan(plan.key)
                try {
                    await apiSelectPlan(plan.key)
                    toast.success('Free plan activated!')
                    await refreshUser()
                    await onPaymentSuccess?.()
                    onClose()
                } catch (error) {
                    console.error('Plan selection error:', error)
                    toast.error(getErrorMessage(error, 'Failed to select plan'))
                } finally {
                    setSelectedPlan(null)
                }
                return
            }
            if (isCurrentPlan(plan)) {
                toast('You are already on the free plan')
                return
            }
            return
        }

        // Show confirmation screen instead of paying directly
        setConfirmingPlan(plan)
    }

    const proceedToPayment = async () => {
        if (!confirmingPlan) return

        setSelectedPlan(confirmingPlan.key)

        try {
            const result = await initiatePayment(
                confirmingPlan.key,
                {
                    name: user?.fullName,
                    email: user?.email,
                },
                { isUpgrade: hasActiveSubscription, isAutoPay },
            )

            if (result?.success) {
                toast.success('Payment successful! Your plan has been upgraded.')
                await refreshUser()
                await onPaymentSuccess?.()
                setConfirmingPlan(null)
                onClose()
                router.refresh()
            }
        } catch (error) {
            console.error('Payment error:', error)
            toast.error('Payment failed. Please try again.')
        } finally {
            setSelectedPlan(null)
        }
    }

    const getButtonLabel = (plan: Plan) => {
        if (isCurrentPlanRenewable(plan)) return 'Renew Plan'
        if (isCurrentPlanLocked(plan)) return 'Current Plan'
        if (isEnterprisePlan(plan)) return plan.ctaLabel || 'Contact Us'
        if (isPlanDowngrade(plan)) return 'Contact support to downgrade'
        if (plan.pricePerYear === 0) return requireSelection ? (plan.ctaLabel || 'Get Started Free') : 'Free'
        return plan.ctaLabel || 'Upgrade'
    }

    const handleClose = () => {
        if (requireSelection || paymentLoading) return
        onClose()
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="relative z-50 flex w-full max-w-[min(1200px,95vw)] max-h-[min(90vh,calc(100dvh-2rem))] flex-col"
                    >
                        <div className="bg-[#0f172a] border border-border shadow-2xl relative flex flex-col overflow-hidden rounded-xl max-h-full min-h-0" data-lenis-prevent>
                            {/* Header and Close Button */}
                            <div className="p-6 pb-2 shrink-0 border-b border-border/40">
                                {!requireSelection && (
                                    <button
                                        onClick={handleClose}
                                        disabled={paymentLoading}
                                        className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                                    >
                                        <X className="h-4 w-4" />
                                        <span className="sr-only">Close</span>
                                    </button>
                                )}

                                <div className="text-center">
                                    <h2 className="text-2xl font-bold tracking-tight mb-2">{title || (requireSelection ? 'Choose Your Plan' : 'Upgrade Your Plan')}</h2>
                                    <p className="text-muted-foreground text-sm">
                                        {subtitle || (requireSelection ? 'Select a plan to get started. You can begin with the free plan or upgrade for more features.' : 'Choose the plan that fits your needs.')}
                                    </p>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto overscroll-contain p-6 pt-4 min-h-0">
                                {confirmingPlan ? (
                                    <div className="flex flex-col max-w-md mx-auto py-2">
                                        <div className="text-center mb-6">
                                            <h3 className="text-2xl font-bold">Review Upgrade</h3>
                                            <p className="text-sm text-muted-foreground mt-1">Complete your purchase to unlock all features.</p>
                                        </div>
                                        
                                        <div className="w-full bg-card rounded-xl p-5 mb-8 border shadow-sm">
                                            <div className="flex justify-between items-center pb-4 border-b border-border/50">
                                                <div>
                                                    <span className="font-bold text-xl">{confirmingPlan.title}</span>
                                                    {confirmingPlan.period && (
                                                        <span className="text-muted-foreground text-sm ml-2">{confirmingPlan.period}</span>
                                                    )}
                                                </div>
                                                <span className="text-2xl font-black text-primary">{confirmingPlan.priceDisplay}</span>
                                            </div>
                                            <PlanGstNote plan={confirmingPlan} showTotal className="mt-3" />

                                            <div className="mt-5">
                                                <BillingTypeToggle
                                                    isAutoPay={isAutoPay}
                                                    onChange={setIsAutoPay}
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="flex gap-4 w-full">
                                            <Button variant="outline" className="flex-1" onClick={() => setConfirmingPlan(null)} disabled={selectedPlan !== null}>
                                                Back
                                            </Button>
                                            <Button className="flex-1" onClick={proceedToPayment} disabled={selectedPlan !== null}>
                                                {selectedPlan !== null ? (
                                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                                                ) : (
                                                    'Proceed to Payment'
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                ) : loading ? (
                                    <div className="flex justify-center py-20">
                                        <Loader2 className="h-8 w-8 animate-spin" />
                                    </div>
                                ) : plans.length > 0 ? (
                                    <div className="flex flex-wrap justify-center gap-4 items-stretch pb-2">
                                        {plans.map((plan) => {
                                            const current = isCurrentPlan(plan)
                                            const locked = isCurrentPlanLocked(plan)
                                            const renewable = isCurrentPlanRenewable(plan)
                                            return (
                                            <Card
                                                key={plan.key}
                                                className={`flex flex-col w-full sm:w-[260px] shrink-0 transition-all relative ${locked
                                                    ? 'border-primary border-2 shadow-lg shadow-primary/20 bg-primary/5 ring-2 ring-primary/40'
                                                    : renewable
                                                        ? 'border-orange-500/60 border-2 shadow-md bg-orange-500/5'
                                                    : plan.isPopular
                                                        ? 'border-primary border-2 shadow-md border-border/50 hover:border-primary/50'
                                                        : 'border-border/50 hover:border-primary/50'
                                                    }`}
                                            >
                                                {locked && (
                                                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                                                        <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide whitespace-nowrap">
                                                            Current Plan
                                                        </span>
                                                    </div>
                                                )}
                                                {renewable && (
                                                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                                                        <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide whitespace-nowrap">
                                                            Renew Available
                                                        </span>
                                                    </div>
                                                )}
                                                {!locked && !renewable && plan.isPopular && (
                                                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                                                        <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide whitespace-nowrap">
                                                            Popular
                                                        </span>
                                                    </div>
                                                )}
                                                <CardHeader className="text-center pb-4 pt-6 p-4">
                                                    <CardTitle className="text-lg mb-1">{plan.title}</CardTitle>
                                                    <div className="flex items-baseline justify-center gap-1">
                                                        <span className="text-2xl font-bold">
                                                            {plan.priceDisplay?.trim() || `${currencySymbol(plan.currency)}${plan.pricePerYear}`}
                                                        </span>
                                                    </div>
                                                    {(() => {
                                                        const isCustom = plan.priceDisplay?.trim().toLowerCase() === 'custom'
                                                        if (isCustom) return null
                                                        const label = derivePeriodLabel(plan)
                                                        return label ? (
                                                            <span className="text-muted-foreground text-xs">{label}</span>
                                                        ) : null
                                                    })()}
                                                    <PlanGstNote plan={plan} className="mt-1 text-center" />
                                                    <CardDescription className="mt-2 text-xs min-h-[30px]">
                                                        {plan.description}
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent className="flex-grow p-4 pt-0">
                                                    <ul className="space-y-2">
                                                        {plan.features?.map((feature) => (
                                                            <li key={feature} className="flex items-start gap-2">
                                                                <Check className="h-3 w-3 text-primary flex-shrink-0 mt-0.5" />
                                                                <span className="text-muted-foreground text-xs">{feature}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </CardContent>
                                                <CardFooter className="p-4 pt-0 mt-auto">
                                                    {(() => {
                                                        const enterprise = isEnterprisePlan(plan)
                                                        const downgrade = isPlanDowngrade(plan)
                                                        // Hide the action button for downgrade plans — the card stays
                                                        // visible for reference, but self-service downgrade is not allowed.
                                                        if (downgrade) return null
                                                        return (
                                                            <Button
                                                                variant={locked ? 'secondary' : renewable ? 'default' : (plan.isPopular || enterprise ? 'default' : 'outline')}
                                                                className="w-full h-8 text-sm"
                                                                size="sm"
                                                                disabled={paymentLoading || locked}
                                                                onClick={() => handleSelectPlan(plan)}
                                                            >
                                                                {selectedPlan === plan.key ? (
                                                                    <>
                                                                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                                                        Processing...
                                                                    </>
                                                                ) : enterprise && !current ? (
                                                                    <>
                                                                        <Mail className="mr-2 h-3 w-3" />
                                                                        {getButtonLabel(plan)}
                                                                    </>
                                                                ) : (
                                                                    getButtonLabel(plan)
                                                                )}
                                                            </Button>
                                                        )
                                                    })()}
                                                </CardFooter>
                                            </Card>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                                        <p className="text-lg font-medium mb-2">You are on the highest tier plan!</p>
                                        <p className="text-sm">Contact support for custom enterprise solutions.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
