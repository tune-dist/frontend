'use client'

import { useEffect, useState } from 'react'
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
    History
} from 'lucide-react'
import { getPlanByKey, Plan } from '@/lib/api/plans'
import { getPaymentHistory, PaymentHistoryItem, cancelSubscription, getActiveSubscriptions } from '@/lib/api/payments'
import { toast } from 'react-hot-toast'
import { useRazorpay } from '@/hooks/useRazorpay'
import { useAuth } from '@/contexts/AuthContext'
import Cookies from 'js-cookie'
import UpgradePlanModal from '@/components/dashboard/upgrade-plan-modal'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { AlertCircle, AlertTriangle } from 'lucide-react'

interface UserInfo {
    plan: string
    planStartDate?: string
    planEndDate?: string | null
    isSubscriptionActive?: boolean
    subscriptionStatus?: string
}

export default function SubscriptionPage() {
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
    const [currentPlan, setCurrentPlan] = useState<Plan | null>(null)
    const [payments, setPayments] = useState<PaymentHistoryItem[]>([])
    const [activeSubscriptions, setActiveSubscriptions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showUpgradeModal, setShowUpgradeModal] = useState(false)
    const [showCancelDialog, setShowCancelDialog] = useState(false)
    const [selectedSubId, setSelectedSubId] = useState<string | undefined>(undefined)
    const [cancellingType, setCancellingType] = useState<'plan' | 'addon'>('plan')
    const [cancelling, setCancelling] = useState(false)
    const { initiatePayment, isLoading: paymentLoading } = useRazorpay()
    const { user: authUser, refreshUser } = useAuth()
    const router = useRouter()

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (authUser) {
                    setUserInfo({
                        plan: authUser.plan || 'free',
                        planStartDate: authUser.planStartDate,
                        planEndDate: authUser.planEndDate,
                        isSubscriptionActive: authUser.isSubscriptionActive,
                        subscriptionStatus: authUser.subscriptionStatus,
                    })

                    // Fetch current plan details
                    const plan = await getPlanByKey(authUser.plan || 'free')
                    setCurrentPlan(plan)
                }

                // Fetch payment history
                const history = await getPaymentHistory()
                setPayments(history)

                // Fetch active subscriptions (including addons)
                const subs = await getActiveSubscriptions();
                setActiveSubscriptions(subs);
            } catch (error) {
                console.error('Failed to fetch subscription data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [authUser])

    const handleUpgrade = () => {
        // Open upgrade modal
        setShowUpgradeModal(true)
    }

    const openCancelDialog = (subscriptionId?: string, type: 'plan' | 'addon' = 'plan') => {
        setSelectedSubId(subscriptionId)
        setCancellingType(type)
        setShowCancelDialog(true)
    }

    const handleCancelSubscription = async () => {
        setCancelling(true)
        try {
            const result = await cancelSubscription(selectedSubId)
            if (result.success) {
                toast.success(result.message || 'Subscription cancelled successfully')
                await refreshUser()
                
                // Refresh subscriptions list
                const subs = await getActiveSubscriptions();
                setActiveSubscriptions(subs);
                
                setShowCancelDialog(false)
                setSelectedSubId(undefined)
            } else {
                toast.error(result.message || 'Failed to cancel subscription')
            }
        } catch (error: any) {
            console.error('Failed to cancel subscription:', error)
            toast.error(error.response?.data?.message || 'Failed to cancel subscription')
        } finally {
            setCancelling(false)
        }
    }

    const formatDate = (dateString?: string | null) => {
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

    const isFreePlan = userInfo?.plan === 'free'
    const isExpired = userInfo?.planEndDate && new Date(userInfo.planEndDate) < new Date()

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-3xl font-bold mb-8">Subscription</h1>

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
                                    <h3 className="text-2xl font-bold">{currentPlan?.title || userInfo?.plan}</h3>
                                    {isExpired ? (
                                        <Badge variant="destructive" className="flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            Expired
                                        </Badge>
                                    ) : !isFreePlan && userInfo?.subscriptionStatus === 'cancelled' ? (
                                        <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20 flex items-center gap-1">
                                            <AlertTriangle className="h-3 w-3" />
                                            Cancelling / Expiring
                                        </Badge>
                                    ) : !isFreePlan && userInfo?.isSubscriptionActive ? (
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
                                            Started: {formatDate(userInfo?.planStartDate)}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-4 w-4" />
                                            Expires: {formatDate(userInfo?.planEndDate)}
                                        </span>
                                    </div>
                                )}

                                {currentPlan && (
                                    <p className="text-muted-foreground mt-2">
                                        {currentPlan.priceDisplay} {currentPlan.period}
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2">
                                {userInfo?.plan !== 'free' && userInfo?.isSubscriptionActive && userInfo?.subscriptionStatus !== 'cancelled' && (
                                    <Button 
                                        variant="outline" 
                                        onClick={() => openCancelDialog(undefined, 'plan')}
                                        className="text-red-500 hover:text-red-600 border-red-200 hover:border-red-300 hover:bg-red-50"
                                    >
                                        Cancel Subscription
                                    </Button>
                                )}
                                {userInfo?.plan !== 'enterprise' && (
                                    <Button onClick={handleUpgrade} className="flex items-center gap-2">
                                        {isFreePlan ? 'Upgrade Plan' : 'Change Plan'}
                                        <ArrowUpRight className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Plan Features */}
                        {currentPlan?.features && currentPlan.features.length > 0 && (
                            <div className="mt-6 pt-6 border-t border-border/80">
                                <h4 className="font-semibold mb-3">Plan Features</h4>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {currentPlan.features.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <CheckCircle className="h-4 w-4 text-primary" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </CardContent>
                </Card>
                
                {/* Active Addons Section */}
                {activeSubscriptions.some(s => s.type === 'addon') && (
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
                                {activeSubscriptions.filter(s => s.type === 'addon').map((sub) => (
                                    <div key={sub.id} className="p-4 border border-border rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4 bg-card/30 backdrop-blur-sm transition-all hover:border-primary/20">
                                        <div>
                                            <p className="text-xl font-bold capitalize">
                                                {sub.planKey.replace(/_/g, ' ')}
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
                                                    disabled={cancelling}
                                                >
                                                    Cancel Add-on
                                                </Button>
                                                ) : (
                                                    <Badge variant="outline" className="text-orange-500 border-orange-500/20 bg-orange-500/5">
                                                        Cancelling / Expiring
                                                    </Badge>
                                                )
                                            ) : (
                                                <Badge variant="outline" className="text-blue-500 border-blue-500/20 bg-blue-500/5">
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
                                                    {payment.planKey.replace('_', ' ')}
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
                currentPlanKey={userInfo?.plan || 'free'}
            />

            {/* Cancellation Confirmation Dialog */}
            <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <DialogContent className="sm:max-w-[425px] border-border/50 bg-card/95 backdrop-blur-md">                    
                    <DialogHeader>
                        <DialogTitle className="text-2xl flex items-center gap-2">
                            <AlertTriangle className="h-6 w-6 text-red-500" />
                            Confirm Cancellation
                        </DialogTitle>
                        <DialogDescription className="text-base pt-2">
                            Are you sure you want to cancel your <span className="text-foreground font-bold">{cancellingType === 'plan' ? currentPlan?.title : 'Extra Artist Slot'}</span>?
                            <br /><br />
                            <span className="text-foreground font-medium">You will still have access to all your features until the end of your current billing cycle.</span>
                            <br /><br />
                            After that, {cancellingType === 'plan' ? 'your account will revert to the Free plan.' : 'this extra artist slot will be removed.'}
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="mt-6 gap-2 sm:flex-row flex-col">
                        <Button
                            variant="outline"
                            onClick={() => setShowCancelDialog(false)}
                            disabled={cancelling}
                            className="w-full sm:w-auto"
                        >
                            Keep Subscription
                        </Button>
                        <Button 
                            variant="destructive" 
                            onClick={() => handleCancelSubscription()}
                            disabled={cancelling}
                            className="bg-red-500 hover:bg-red-600 w-full sm:w-auto shadow-lg shadow-red-500/20"
                        >
                            {cancelling ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Cancelling...
                                </>
                            ) : (
                                'Yes, Cancel Subscription'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
