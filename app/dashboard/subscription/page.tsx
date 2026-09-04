'use client'

import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    CreditCard,
    Calendar,
    CheckCircle,
    Loader2,
    ArrowUpRight,
    ArrowLeft,
    History,
    XCircle,
    Mail,
    AlertCircle,
    AlertTriangle,
} from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    cancelMainSubscription,
    getPaymentHistory,
    PaymentHistoryItem,
    CancelSubscriptionResponse,
} from '@/lib/api/payments'
import { getAllPlans, Plan, getPlanTotalWithGst, findPlanByKey, resolvePlanTitle } from '@/lib/api/plans'
import { PlanGstNote } from '@/components/plans/plan-gst-note'
import { getUserProfileWithPlan, ProfileWithPlan } from '@/lib/api/users'
import apiClient from '@/lib/api-client'
import { useRazorpay } from '@/hooks/useRazorpay'
import { useAuth } from '@/contexts/AuthContext'
import UpgradePlanModal from '@/components/dashboard/upgrade-plan-modal'
import toast from 'react-hot-toast'

// Inlined API calls — payments.ts is mid-merge and does not currently export these.
// Kept here to keep this resolution scoped to page.tsx; can be promoted to payments.ts
// once that file's merge is resolved.
async function fetchActiveSubscriptions(): Promise<any[]> {
    const response = await apiClient.get<any[]>('/payments/active-subscriptions')
    return response.data
}

async function cancelSubscriptionById(
    subscriptionId?: string,
): Promise<CancelSubscriptionResponse> {
    const response = await apiClient.post<CancelSubscriptionResponse>(
        '/payments/cancel-subscription',
        { subscriptionId },
    )
    return response.data
}

function applyCancelToLocalState(
    result: CancelSubscriptionResponse,
    setProfile: Dispatch<SetStateAction<ProfileWithPlan | null>>,
    setActiveSubscriptions: Dispatch<SetStateAction<any[]>>,
    cancellingType: 'plan' | 'addon',
    selectedSubId?: string,
) {
    if (result.subscriptionStatus) {
        setProfile((prev) =>
            prev
                ? {
                      ...prev,
                      subscriptionStatus: result.subscriptionStatus,
                      isSubscriptionActive: result.isSubscriptionActive ?? false,
                      planEndDate: result.planEndDate ?? prev.planEndDate,
                  }
                : prev,
        )
    }

    setActiveSubscriptions((prev) =>
        prev.map((sub) => {
            if (cancellingType === 'addon' && sub.id === selectedSubId) {
                return { ...sub, status: 'cancelled' }
            }
            if (cancellingType === 'plan' && sub.type === 'subscription') {
                return { ...sub, status: 'cancelled' }
            }
            return sub
        }),
    )
}

const ARTIST_ADDON_PLAN_KEY = 'artist_addon'
const ENTERPRISE_CONTACT_EMAIL = 'sales@iguru.com' // TODO: replace with the real sales inbox

export default function SubscriptionPage() {
    const { user, refreshUser } = useAuth()
    const [profile, setProfile] = useState<ProfileWithPlan | null>(null)
    const [payments, setPayments] = useState<PaymentHistoryItem[]>([])
    const [allPlans, setAllPlans] = useState<Plan[]>([])
    const [activeSubscriptions, setActiveSubscriptions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showUpgradeModal, setShowUpgradeModal] = useState(false)
    const [showCancelDialog, setShowCancelDialog] = useState(false)
    const [selectedSubId, setSelectedSubId] = useState<string | undefined>(undefined)
    const [cancellingType, setCancellingType] = useState<'plan' | 'addon'>('plan')
    const [isCancelling, setIsCancelling] = useState(false)
    const [isPurchasingAddon, setIsPurchasingAddon] = useState(false)
    const { initiatePayment, isLoading: paymentLoading } = useRazorpay()
    const router = useRouter()

    const reloadProfile = useCallback(async () => {
        const [nextProfile, history, plans] = await Promise.all([
            getUserProfileWithPlan(),
            getPaymentHistory().catch((err) => {
                console.error('Failed to fetch payment history:', err)
                return [] as PaymentHistoryItem[]
            }),
            getAllPlans(),
        ])
        setProfile(nextProfile)
        setPayments(history)
        setAllPlans(plans)
        return { profile: nextProfile, history, plans }
    }, [])

    const reloadActiveSubscriptions = useCallback(async () => {
        try {
            const subs = await fetchActiveSubscriptions()
            setActiveSubscriptions(subs)
            return subs
        } catch (err) {
            console.error('Failed to fetch active subscriptions:', err)
            return []
        }
    }, [])

    const reloadAllSubscriptionData = useCallback(async () => {
        await Promise.all([refreshUser(), reloadProfile(), reloadActiveSubscriptions()])
    }, [refreshUser, reloadProfile, reloadActiveSubscriptions])

    useEffect(() => {
        let cancelled = false
        const fetchData = async () => {
            try {
                await Promise.all([reloadProfile(), reloadActiveSubscriptions()])
            } catch (error) {
                console.error('Failed to fetch subscription data:', error)
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        fetchData()
        return () => {
            cancelled = true
        }
    }, [reloadProfile, reloadActiveSubscriptions])

    // Refetch when landing here after payment (?payment=success from checkout/billing)
    useEffect(() => {
        if (typeof window === 'undefined') return
        const params = new URLSearchParams(window.location.search)
        if (params.get('payment') !== 'success') return

        reloadAllSubscriptionData().finally(() => {
            router.replace('/dashboard/subscription')
        })
    }, [reloadAllSubscriptionData, router])

    const handleUpgrade = () => {
        setShowUpgradeModal(true)
    }

    const handleBuyArtistAddon = async () => {
        setIsPurchasingAddon(true)
        try {
            const result = await initiatePayment(ARTIST_ADDON_PLAN_KEY, {
                name: user?.fullName,
                email: user?.email,
            })
            if (result?.success) {
                toast.success('Extra artist slot added to your plan!')
                await reloadAllSubscriptionData()
            }
        } catch (err) {
            console.error('Addon purchase failed:', err)
        } finally {
            setIsPurchasingAddon(false)
        }
    }

    const openCancelDialog = (subscriptionId?: string, type: 'plan' | 'addon' = 'plan') => {
        setSelectedSubId(subscriptionId)
        setCancellingType(type)
        setShowCancelDialog(true)
    }

    const handleConfirmCancel = async () => {
        setIsCancelling(true)
        try {
            const result =
                cancellingType === 'addon'
                    ? await cancelSubscriptionById(selectedSubId)
                    : await cancelMainSubscription()
            if (result?.success) {
                applyCancelToLocalState(
                    result,
                    setProfile,
                    setActiveSubscriptions,
                    cancellingType,
                    selectedSubId,
                )
                toast.success(
                    result.message ||
                        (cancellingType === 'addon'
                            ? 'Add-on cancelled.'
                            : 'Your subscription has been cancelled.'),
                )
                setShowCancelDialog(false)
                setSelectedSubId(undefined)
                // Sync auth + subscriptions in background; profile already updated from response
                void Promise.all([refreshUser(), reloadActiveSubscriptions()])
            } else {
                toast.error(result?.message || 'Cancellation failed.')
            }
        } catch (err: any) {
            console.error('Cancel failed:', err)
            toast.error(
                err?.response?.data?.message ||
                    'Could not cancel. Please try again.',
            )
        } finally {
            setIsCancelling(false)
        }
    }

    const formatDate = (dateString?: string | Date | null) => {
        if (!dateString) return 'N/A'
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
    }

    const formatAmount = (amount: number, currency: string = 'INR') => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency,
            minimumFractionDigits: 0,
        }).format(amount / 100) // Convert from paise
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'captured':
                return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Paid</Badge>
            case 'failed':
                return <Badge variant="destructive">Failed</Badge>
            case 'created':
                return <Badge variant="secondary">Pending</Badge>
            case 'refunded':
                return <Badge className="bg-orange-500/10 text-orange-500">Refunded</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    const activeMapping = profile?.activePlanMapping ?? null
    const planDetails = profile?.planDetails ?? null
    const effective = profile?.effectiveLimits ?? null
    const activeAddons = profile?.activeAddons ?? []

    const planKey = activeMapping?.planKey ?? profile?.plan ?? 'free'
    const matchedPlan = findPlanByKey(allPlans, planKey) ?? null
    const resolvedPlanDetails = planDetails ?? matchedPlan
    const planTitle = resolvePlanTitle(planKey, allPlans, {
        mappingTitle: activeMapping?.planTitle,
        detailsTitle: planDetails?.title ?? matchedPlan?.title,
    })
    const planStartDate = activeMapping?.startDate ?? profile?.planStartDate
    const planEndDate = activeMapping?.endDate ?? profile?.planEndDate
    const isFreePlan = planKey === 'free' || !planKey
    const hasPaidPlanAccess =
        profile?.hasPaidPlanAccess ?? user?.hasPaidPlanAccess === true
    const subscriptionStatus =
        profile?.subscriptionStatus ?? user?.subscriptionStatus ?? 'inactive'
    const isExpired = !isFreePlan && !hasPaidPlanAccess
    const isSubscriptionActive =
        !isFreePlan && hasPaidPlanAccess && subscriptionStatus === 'active'
    const isCancellationPending =
        !isFreePlan && hasPaidPlanAccess && subscriptionStatus === 'cancelled'

    const extraArtistSlots = effective?.extraArtistSlots ?? activeAddons.length
    const baseArtistLimit = resolvedPlanDetails?.limits?.maxArtists ?? 0
    const effectiveArtistLimit = effective?.maxArtists ?? baseArtistLimit + extraArtistSlots
    const planPriceInPaise = Math.round(
        getPlanTotalWithGst(resolvedPlanDetails ?? { pricePerYear: 0 }) * 100,
    )
    const addonEligibility = profile?.addonEligibility ?? user?.addonEligibility
    const addonPriceInr = addonEligibility?.addonPriceInr ?? 499
    const addonPriceWithGstInr = addonEligibility?.addonPriceWithGstInr ?? addonPriceInr
    const addonTotalInPaise =
        addonEligibility?.addonTotalInPaise ?? Math.round(addonPriceWithGstInr * 100)
    const addonsTotalInPaise = extraArtistSlots * addonTotalInPaise
    const billedTotalInPaise = planPriceInPaise + addonsTotalInPaise

    const canBuyArtistAddon =
        profile?.addonEligibility?.canBuyArtistAddon ??
        user?.addonEligibility?.canBuyArtistAddon ??
        false

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex items-center gap-3 mb-8">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.back()}
                        aria-label="Go back"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-3xl font-bold">Subscription</h1>
                </div>

                {/* Current Plan Card */}
                <Card className="mb-8 glass-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            Current Plan
                        </CardTitle>
                        <CardDescription>Manage your subscription and billing</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-2xl font-bold">{planTitle}</h3>
                                    {isExpired ? (
                                        <Badge variant="destructive" className="flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            Expired
                                        </Badge>
                                    ) : isCancellationPending ? (
                                        <Badge
                                            variant="outline"
                                            className="bg-orange-500/10 text-orange-500 border-orange-500/20 flex items-center gap-1"
                                        >
                                            <AlertTriangle className="h-3 w-3" />
                                            Cancelling / Expiring
                                        </Badge>
                                    ) : isSubscriptionActive ? (
                                        <Badge className="bg-green-500/10 text-green-500 flex items-center gap-1">
                                            <CheckCircle className="h-3 w-3" />
                                            Active
                                        </Badge>
                                    ) : null}
                                </div>

                                {!isFreePlan && (
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-4 w-4" />
                                            Started: {formatDate(planStartDate)}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-4 w-4" />
                                            Expires: {formatDate(planEndDate)}
                                        </span>
                                    </div>
                                )}

                                {resolvedPlanDetails && planKey !== 'enterprise' && (
                                    <div className="mt-2">
                                        <p className="text-muted-foreground">
                                            {resolvedPlanDetails.priceDisplay} {resolvedPlanDetails.period}
                                        </p>
                                        <PlanGstNote plan={resolvedPlanDetails} className="mt-1" />
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2">
                                {planKey === 'enterprise' ? (
                                    <Button
                                        onClick={() => {
                                            window.location.href = `mailto:${ENTERPRISE_CONTACT_EMAIL}?subject=Enterprise%20plan%20enquiry`
                                        }}
                                        className="flex items-center gap-2"
                                    >
                                        <Mail className="h-4 w-4" />
                                        Contact Us
                                    </Button>
                                ) : (
                                    <Button onClick={handleUpgrade} className="flex items-center gap-2">
                                        {isFreePlan ? 'Upgrade Plan' : 'Change Plan'}
                                        <ArrowUpRight className="h-4 w-4" />
                                    </Button>
                                )}
                                {!isFreePlan && !isExpired && !isCancellationPending && (
                                    <Button
                                        variant="outline"
                                        onClick={() => openCancelDialog(undefined, 'plan')}
                                        className="flex items-center gap-2 text-destructive border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
                                    >
                                        <XCircle className="h-4 w-4" />
                                        Cancel Subscription
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Plan Features */}
                        {resolvedPlanDetails?.features && resolvedPlanDetails.features.length > 0 && (
                            <div className="mt-6 pt-6 border-t">
                                <h4 className="font-semibold mb-3">Plan Features</h4>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {resolvedPlanDetails.features.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <CheckCircle className="h-4 w-4 text-primary" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Add-ons + bumped artist limit + total billed */}
                        {!isFreePlan && (
                            <div className="mt-6 pt-6 border-t space-y-3">
                                <h4 className="font-semibold">Artist slots & billing</h4>
                                <div className="text-sm text-muted-foreground">
                                    Artist limit:{' '}
                                    <span className="text-foreground font-medium">{effectiveArtistLimit}</span>
                                    {extraArtistSlots > 0 && (
                                        <span className="ml-1">
                                            ({baseArtistLimit} plan + {extraArtistSlots} add-on{extraArtistSlots > 1 ? 's' : ''})
                                        </span>
                                    )}
                                </div>
                                {planKey !== 'enterprise' && (
                                    <div className="text-sm text-muted-foreground">
                                        Plan price:{' '}
                                        <span className="text-foreground">{formatAmount(planPriceInPaise)}</span>
                                        {extraArtistSlots > 0 && (
                                            <>
                                                {' + Add-ons: '}
                                                <span className="text-foreground">
                                                    {formatAmount(addonsTotalInPaise)}
                                                </span>
                                                {' = Total: '}
                                                <span className="text-foreground font-semibold">
                                                    {formatAmount(billedTotalInPaise)}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                )}
                                {canBuyArtistAddon && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={handleBuyArtistAddon}
                                        disabled={isPurchasingAddon || paymentLoading}
                                        className="mt-2"
                                    >
                                        {isPurchasingAddon
                                            ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Processing…
                                                </>
                                            )
                                            : `Add 1 more artist (₹${addonPriceWithGstInr.toFixed(2)} incl. GST)`}
                                    </Button>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Active Addons Section */}
                {activeSubscriptions.some((s) => s.type === 'addon') && (
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-primary" />
                                Active Add-ons
                            </CardTitle>
                            <CardDescription>Manage your extra artist slots and other addons</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {activeSubscriptions
                                    .filter((s) => s.type === 'addon')
                                    .map((sub) => (
                                        <div
                                            key={sub.id}
                                            className="p-4 border border-border rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4 bg-card/30 backdrop-blur-sm transition-all hover:border-primary/20"
                                        >
                                            <div>
                                                <p className="text-xl font-bold capitalize">
                                                    {String(sub.planKey ?? '').replace(/_/g, ' ')}
                                                </p>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    Expires: {formatDate(sub.endDate)}
                                                </p>
                                            </div>
                                            <div>
                                                {sub.isRecurring ? (
                                                    sub.status !== 'cancelled' ? (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-red-500 hover:text-red-600 border-red-200 hover:border-red-300 hover:bg-red-50"
                                                            onClick={() => openCancelDialog(sub.id, 'addon')}
                                                            disabled={isCancelling}
                                                        >
                                                            Cancel Add-on
                                                        </Button>
                                                    ) : (
                                                        <Badge
                                                            variant="outline"
                                                            className="text-orange-500 border-orange-500/20 bg-orange-500/5"
                                                        >
                                                            Cancelling / Expiring
                                                        </Badge>
                                                    )
                                                ) : (
                                                    <Badge
                                                        variant="outline"
                                                        className="text-blue-500 border-blue-500/20 bg-blue-500/5"
                                                    >
                                                        One-time Purchase
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Payment History */}
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <History className="h-5 w-5" />
                            Payment History
                        </CardTitle>
                        <CardDescription>Your past transactions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {payments.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p>No payment history yet</p>
                                {isFreePlan && (
                                    <Button variant="link" onClick={handleUpgrade} className="mt-2">
                                        Upgrade to a paid plan →
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-border/80">
                                            <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Date</th>
                                            <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Plan</th>
                                            <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Amount</th>
                                            <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payments.map((payment) => (
                                            <tr key={payment._id} className="border-b border-border/80 last:border-0">
                                                <td className="py-3 px-2 text-sm">
                                                    {formatDate(payment.createdAt)}
                                                </td>
                                                <td className="py-3 px-2 text-sm capitalize">
                                                    {resolvePlanTitle(payment.planKey, allPlans)}
                                                </td>
                                                <td className="py-3 px-2 text-sm font-medium">
                                                    {formatAmount(payment.amount, payment.currency)}
                                                </td>
                                                <td className="py-3 px-2">
                                                    {getStatusBadge(payment.status)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            {/* Upgrade Plan Modal */}
            <UpgradePlanModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                currentPlanKey={planKey}
                hasActiveSubscription={!isFreePlan && isSubscriptionActive}
                subscriptionStatus={subscriptionStatus === 'cancelled' ? 'cancelled' : subscriptionStatus === 'active' ? 'active' : undefined}
                onPaymentSuccess={reloadAllSubscriptionData}
            />

            {/* Cancel Subscription / Add-on confirmation */}
            <Dialog open={showCancelDialog} onOpenChange={(open) => !isCancelling && setShowCancelDialog(open)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-destructive" />
                            {cancellingType === 'addon' ? 'Cancel add-on?' : 'Cancel subscription?'}
                        </DialogTitle>
                        <DialogDescription>
                            {cancellingType === 'addon' ? (
                                <>
                                    Your <span className="font-semibold">extra artist slot</span> will be cancelled
                                    at the end of the current billing cycle on{' '}
                                    <span className="font-semibold">{formatDate(planEndDate)}</span>. After that
                                    date the slot is removed but your main plan continues.
                                </>
                            ) : (
                                <>
                                    Your <span className="font-semibold">{planTitle}</span> plan will be cancelled
                                    at the end of the current billing cycle on{' '}
                                    <span className="font-semibold">{formatDate(planEndDate)}</span>.
                                    {extraArtistSlots > 0 && (
                                        <>
                                            {' '}All{' '}
                                            <span className="font-semibold">
                                                {extraArtistSlots} artist add-on{extraArtistSlots > 1 ? 's' : ''}
                                            </span>{' '}
                                            will also be cancelled — add-ons cannot remain active without an
                                            underlying plan.
                                        </>
                                    )}{' '}
                                    You will keep access until then. After that date your account will return to
                                    the free tier.
                                </>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowCancelDialog(false)}
                            disabled={isCancelling}
                        >
                            Keep my subscription
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleConfirmCancel}
                            disabled={isCancelling}
                        >
                            {isCancelling ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Cancelling…
                                </>
                            ) : (
                                'Yes, cancel'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
