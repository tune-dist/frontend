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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="relative w-full max-w-7xl max-h-[90vh] flex flex-col z-10"
                    >
                        <div className="bg-background border border-border rounded-lg shadow-lg relative flex flex-col max-h-full overflow-hidden">
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
                                    <p className="text-muted-foreground">
                                        Choose the plan that fits your needs.
                                    </p>
                                </div>
                            </div>

                            {/* Scrollable Content */}
                            <div className="p-6 pt-4 overflow-y-auto custom-scrollbar">
                                {loading ? (
                                    <div className="flex justify-center py-20">Loading plans...</div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-stretch">
                                        {plans.map((plan) => (
                                            <Card
                                                key={plan.key}
                                                className={`flex flex-col ${plan.isPopular
                                                    ? 'border-primary border-2 shadow-md relative'
                                                    : 'border-border/50'
                                                    }`}
                                            >
                                                {plan.isPopular && (
                                                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                                                        <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide whitespace-nowrap">
                                                            Popular
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
                                                        variant={plan.isPopular ? 'default' : 'outline'}
                                                        className="w-full h-8 text-sm"
                                                        size="sm"
                                                    >
                                                        {plan.ctaLabel || 'Upgrade'}
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
