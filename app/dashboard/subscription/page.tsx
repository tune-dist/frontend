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
    AlertCircle,
    Loader2,
    ArrowUpRight,
    History
} from 'lucide-react'
import { getPlanByKey, Plan } from '@/lib/api/plans'
import { getPaymentHistory, PaymentHistoryItem } from '@/lib/api/payments'
import { useRazorpay } from '@/hooks/useRazorpay'
import Cookies from 'js-cookie'
import UpgradePlanModal from '@/components/dashboard/upgrade-plan-modal'

interface UserInfo {
    plan: string
    planStartDate?: string
    planEndDate?: string
    isSubscriptionActive?: boolean
}

export default function SubscriptionPage() {
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
    const [currentPlan, setCurrentPlan] = useState<Plan | null>(null)
    const [payments, setPayments] = useState<PaymentHistoryItem[]>([])
    const [loading, setLoading] = useState(true)
    const [showUpgradeModal, setShowUpgradeModal] = useState(false)
    const { initiatePayment, isLoading: paymentLoading } = useRazorpay()
    const router = useRouter()

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Get user info from cookie/localStorage
                const userCookie = Cookies.get('user')
                if (userCookie) {
                    const user = JSON.parse(userCookie)
                    setUserInfo({
                        plan: user.plan || 'free',
                        planStartDate: user.planStartDate,
                        planEndDate: user.planEndDate,
                        isSubscriptionActive: user.isSubscriptionActive,
                    })

                    // Fetch current plan details
                    const plan = await getPlanByKey(user.plan || 'free')
                    setCurrentPlan(plan)
                }

                // Fetch payment history
                const history = await getPaymentHistory()
                setPayments(history)
            } catch (error) {
                console.error('Failed to fetch subscription data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    const handleUpgrade = () => {
        // Open upgrade modal
        setShowUpgradeModal(true)
    }

    const formatDate = (dateString?: string) => {
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
                <Card className="mb-8">
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

                            <Button onClick={handleUpgrade} className="flex items-center gap-2">
                                {isFreePlan ? 'Upgrade Plan' : 'Change Plan'}
                                <ArrowUpRight className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Plan Features */}
                        {currentPlan?.features && currentPlan.features.length > 0 && (
                            <div className="mt-6 pt-6 border-t">
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

                {/* Payment History */}
                <Card>
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
                                        <tr className="border-b">
                                            <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Date</th>
                                            <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Plan</th>
                                            <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Amount</th>
                                            <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payments.map((payment) => (
                                            <tr key={payment._id} className="border-b last:border-0">
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
        </div>
    )
}
