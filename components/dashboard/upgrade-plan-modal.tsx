'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { getAllPlans, Plan } from '@/lib/api/plans'
import { useRazorpay } from '@/hooks/useRazorpay'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

interface UpgradePlanModalProps {
    isOpen: boolean
    onClose: () => void
    currentPlanKey?: string
}

export default function UpgradePlanModal({ isOpen, onClose, currentPlanKey = 'free' }: UpgradePlanModalProps) {
    const [plans, setPlans] = useState<Plan[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
    const { initiatePayment, isLoading: paymentLoading } = useRazorpay()
    const { user, refreshUser } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (isOpen && plans.length === 0) {
            const fetchPlans = async () => {
                try {
                    const data = await getAllPlans()
                    // Sort by price and filter out current plan if needed
                    const sortedPlans = data.sort((a, b) => a.pricePerYear - b.pricePerYear)
                    setPlans(sortedPlans)
                } catch (error) {
                    console.error('Failed to fetch plans:', error)
                    toast.error('Failed to load plans')
                } finally {
                    setLoading(false)
                }
            }
            fetchPlans()
        }
    }, [isOpen, plans.length])

    const handleSelectPlan = async (plan: Plan) => {
        // Don't allow selecting current plan
        if (plan.key === currentPlanKey) {
            toast('You are already on this plan')
            return
        }

        // Free plan just needs navigation
        if (plan.pricePerYear === 0) {
            toast('You are already on the free plan')
            return
        }

        setSelectedPlan(plan.key)

        try {
            const result = await initiatePayment(plan.key, {
                name: user?.fullName,
                email: user?.email,
            })

            if (result?.success) {
                toast.success('Payment successful! Your plan has been upgraded.')
                // Refresh user data to get updated plan info
                await refreshUser()
                onClose()
                // Refresh the page to show updated subscription
                router.refresh()
            } else {
                toast.error('Payment was not completed')
            }
        } catch (error) {
            console.error('Payment error:', error)
            toast.error('Payment failed. Please try again.')
        } finally {
            setSelectedPlan(null)
        }
    }

    const isPlanUpgrade = (plan: Plan) => {
        const currentPlanIndex = plans.findIndex(p => p.key === currentPlanKey)
        const targetPlanIndex = plans.findIndex(p => p.key === plan.key)
        return targetPlanIndex > currentPlanIndex
    }

    const getButtonLabel = (plan: Plan) => {
        if (plan.key === currentPlanKey) return 'Current Plan'
        if (plan.pricePerYear === 0) return 'Free'
        if (isPlanUpgrade(plan)) return plan.ctaLabel || 'Upgrade'
        return 'Switch'
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex justify-center items-start overflow-y-auto p-4 sm:p-6 pt-10 sm:pt-20">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="relative w-full max-w-4xl flex flex-col z-50 mb-10 sm:mb-20"
                    >
                        <div className="bg-[#0f172a] border border-border shadow-2xl relative flex flex-col max-h-[calc(100vh-100px)] sm:max-h-[calc(100vh-160px)] overflow-hidden rounded-xl">
                            {/* Header and Close Button */}
                            <div className="p-6 pb-2 shrink-0">
                                <button
                                    onClick={onClose}
                                    disabled={paymentLoading}
                                    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                                >
                                    <X className="h-4 w-4" />
                                    <span className="sr-only">Close</span>
                                </button>

                                <div className="text-center">
                                    <h2 className="text-2xl font-bold tracking-tight mb-2">Upgrade Your Plan</h2>
                                    <p className="text-muted-foreground text-sm">
                                        Choose the plan that fits your needs.
                                    </p>
                                </div>
                            </div>

                            {/* Scrollable Content */}
                            <div className="p-6 pt-4 overflow-y-auto custom-scrollbar">
                                {loading ? (
                                    <div className="flex justify-center py-20">
                                        <Loader2 className="h-8 w-8 animate-spin" />
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-stretch">
                                        {plans.map((plan) => (
                                            <Card
                                                key={plan.key}
                                                className={`flex flex-col transition-all ${plan.key === currentPlanKey
                                                    ? 'border-green-500 border-2 bg-green-500/5'
                                                    : plan.isPopular
                                                        ? 'border-primary border-2 shadow-md relative'
                                                        : 'border-border/50 hover:border-primary/50'
                                                    }`}
                                            >
                                                {plan.isPopular && plan.key !== currentPlanKey && (
                                                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                                                        <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide whitespace-nowrap">
                                                            Popular
                                                        </span>
                                                    </div>
                                                )}
                                                {plan.key === currentPlanKey && (
                                                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                                                        <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide whitespace-nowrap">
                                                            Current
                                                        </span>
                                                    </div>
                                                )}
                                                <CardHeader className="text-center pb-4 pt-6 p-4">
                                                    <CardTitle className="text-lg mb-1">{plan.title}</CardTitle>
                                                    <div className="flex items-baseline justify-center gap-1">
                                                        <span className="text-2xl font-bold">{plan.priceDisplay}</span>
                                                    </div>
                                                    {plan.period && (
                                                        <span className="text-muted-foreground text-xs">{plan.period}</span>
                                                    )}
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
                                                    <Button
                                                        variant={plan.key === currentPlanKey ? 'ghost' : plan.isPopular ? 'default' : 'outline'}
                                                        className="w-full h-8 text-sm"
                                                        size="sm"
                                                        disabled={plan.key === currentPlanKey || plan.pricePerYear === 0 || paymentLoading}
                                                        onClick={() => handleSelectPlan(plan)}
                                                    >
                                                        {selectedPlan === plan.key ? (
                                                            <>
                                                                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                                                Processing...
                                                            </>
                                                        ) : (
                                                            getButtonLabel(plan)
                                                        )}
                                                    </Button>
                                                </CardFooter>
                                            </Card>
                                        ))}
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
