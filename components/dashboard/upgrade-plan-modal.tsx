'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { getAllPlans, Plan } from '@/lib/api/plans'

interface UpgradePlanModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function UpgradePlanModal({ isOpen, onClose }: UpgradePlanModalProps) {
    const [plans, setPlans] = useState<Plan[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (isOpen && plans.length === 0) {
            const fetchPlans = async () => {
                try {
                    const data = await getAllPlans()
                    setPlans(data.sort((a, b) => a.pricePerYear - b.pricePerYear))
                } catch (error) {
                    console.error('Failed to fetch plans:', error)
                } finally {
                    setLoading(false)
                }
            }
            fetchPlans()
        }
    }, [isOpen, plans.length])

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
                                    <div className="flex justify-center py-20 text-muted-foreground">Loading plans...</div>
                                ) : (
                                    <div className="flex flex-col gap-6 pb-10">
                                        {/* Top Row: 3 Plans */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                                            {plans.slice(0, 3).map((plan) => (
                                                <Card
                                                    key={plan.key}
                                                    className={`flex flex-col transition-all duration-200 hover:border-primary/50 ${plan.isPopular
                                                        ? 'border-primary border-2 shadow-lg scale-[1.02] bg-primary/5'
                                                        : 'border-border/50 bg-card/30'
                                                        }`}
                                                >
                                                    {plan.isPopular && (
                                                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                                                            <span className="bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                                                                Recommended
                                                            </span>
                                                        </div>
                                                    )}
                                                    <CardHeader className="text-center pb-2 pt-6 p-4">
                                                        <CardTitle className="text-lg font-bold">{plan.title}</CardTitle>
                                                        <div className="flex items-baseline justify-center gap-1 mt-1">
                                                            <span className="text-2xl font-black text-primary">{plan.priceDisplay}</span>
                                                        </div>
                                                        {plan.period && (
                                                            <span className="text-muted-foreground text-[10px] uppercase tracking-wider">{plan.period}</span>
                                                        )}
                                                    </CardHeader>
                                                    <CardContent className="flex-grow p-4 pt-2">
                                                        <ul className="space-y-2">
                                                            {plan.features?.map((feature) => (
                                                                <li key={feature} className="flex items-start gap-2">
                                                                    <Check className="h-3 w-3 text-primary flex-shrink-0 mt-0.5" />
                                                                    <span className="text-muted-foreground text-xs leading-tight">{feature}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </CardContent>
                                                    <CardFooter className="p-4 pt-0 mt-auto">
                                                        <Button
                                                            variant={plan.isPopular ? 'default' : 'outline'}
                                                            className="w-full h-9 font-bold transition-all"
                                                            size="sm"
                                                        >
                                                            {plan.ctaLabel || 'Get Started'}
                                                        </Button>
                                                    </CardFooter>
                                                </Card>
                                            ))}
                                        </div>

                                        {/* Bottom Row: Remaining Plans Centered */}
                                        <div className="flex flex-wrap justify-center gap-6 items-stretch">
                                            {plans.slice(3).map((plan) => (
                                                <Card
                                                    key={plan.key}
                                                    className={`flex flex-col w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] transition-all duration-200 hover:border-primary/50 ${plan.isPopular
                                                        ? 'border-primary border-2 shadow-lg bg-primary/5'
                                                        : 'border-border/50 bg-card/30'
                                                        }`}
                                                >
                                                    <CardHeader className="text-center pb-2 pt-6 p-4">
                                                        <CardTitle className="text-lg font-bold">{plan.title}</CardTitle>
                                                        <div className="flex items-baseline justify-center gap-1 mt-1">
                                                            <span className="text-2xl font-black text-primary">{plan.priceDisplay}</span>
                                                        </div>
                                                        {plan.period && (
                                                            <span className="text-muted-foreground text-[10px] uppercase tracking-wider">{plan.period}</span>
                                                        )}
                                                    </CardHeader>
                                                    <CardContent className="flex-grow p-4 pt-2">
                                                        <ul className="space-y-2">
                                                            {plan.features?.map((feature) => (
                                                                <li key={feature} className="flex items-start gap-2">
                                                                    <Check className="h-3 w-3 text-primary flex-shrink-0 mt-0.5" />
                                                                    <span className="text-muted-foreground text-xs leading-tight">{feature}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </CardContent>
                                                    <CardFooter className="p-4 pt-0 mt-auto">
                                                        <Button
                                                            variant={plan.isPopular ? 'default' : 'outline'}
                                                            className="w-full h-9 font-bold transition-all"
                                                            size="sm"
                                                        >
                                                            {plan.ctaLabel || 'Get Started'}
                                                        </Button>
                                                    </CardFooter>
                                                </Card>
                                            ))}
                                        </div>
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
