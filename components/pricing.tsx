'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Loader2 } from 'lucide-react'
import { getAllPlans, Plan } from '@/lib/api/plans'
import { PlanGstNote } from '@/components/plans/plan-gst-note'
import { useRazorpay } from '@/hooks/useRazorpay'
import Cookies from 'js-cookie'
import ElectricBorder from '@/components/ElectricBorder'

export default function Pricing() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [processingPlan, setProcessingPlan] = useState<string | null>(null)
  const { initiatePayment, isLoading: paymentLoading } = useRazorpay()
  const router = useRouter()

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await getAllPlans()
        // Sort by price ascending
        setPlans(data.sort((a, b) => a.pricePerYear - b.pricePerYear))
      } catch (error) {
        console.error('Failed to fetch plans:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchPlans()
  }, [])

  const handlePlanSelect = async (plan: Plan) => {
    // Check if user is logged in
    const token = Cookies.get('token')

    if (!token) {
      // Redirect to auth page with plan info
      router.push(`/auth?plan=${plan.key}`)
      return
    }

    // Free plan - no payment needed
    if (plan.pricePerYear === 0) {
      // User already has free plan by default, redirect to dashboard
      router.push('/dashboard')
      return
    }

    // Paid plan - initiate payment
    setProcessingPlan(plan.key)
    try {
      const result = await initiatePayment(plan.key)

      if (result?.success) {
        // Refresh the page or redirect to dashboard
        router.push('/dashboard?payment=success')
      }
    } finally {
      setProcessingPlan(null)
    }
  }

  if (loading) {
    return (
      <section className="py-20 md:py-32 bg-background relative">
        <div className="container mx-auto px-4 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-2 text-muted-foreground">Loading pricing...</p>
        </div>
      </section>
    )
  }

  return (
    <section
      id="pricing"
      className="py-20 md:py-35 bg-background relative"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 font_heading">
            Simple, Transparent{' '}
            <span className="animated-gradient">
              Pricing
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your needs. All plans include distribution
            and royalty collection.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-[1600px] mx-auto items-stretch pt-6">
          {plans.map((plan, index) => {
            const isProcessing = processingPlan === plan.key || (paymentLoading && processingPlan === plan.key)

            return (
              <motion.div
                key={plan.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative flex"
              >
                {plan.isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <span className="animated-gradient-bg text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg whitespace-nowrap">
                      Most Popular
                    </span>
                  </div>
                )}
                {plan.isPopular ? (
                  <Card className="w-full flex flex-col border border-violet-500/90 shadow-xl shadow-violet-500/20 bg-background/80 relative z-[5]">
                    <CardHeader className="text-center pb-6 pt-6">
                      <CardTitle className="text-xl mb-2">{plan.title}</CardTitle>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-3xl font-bold">{plan.priceDisplay}</span>
                        {plan.period && (
                          <span className="text-muted-foreground text-sm">{plan.period}</span>
                        )}
                      </div>
                      <PlanGstNote plan={plan} className="text-center mt-1" />
                      <CardDescription className="mt-2 text-sm min-h-[40px]">
                        {plan.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow pt-0">
                      <ul className="space-y-3">
                        {plan.features?.map((feature) => (
                          <li key={feature} className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                            <span className="text-muted-foreground text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter className="mt-auto pt-4">
                      <Link href={`/contact?plan=${encodeURIComponent(plan.title)}`} className="w-full">
                        <Button
                          variant="default"
                          className="w-full animated-gradient-bg border-0 text-white"
                          size="default"
                        >
                          Contact Us
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ) : (
                  <Card className="w-full flex flex-col border-border/50 hover:border-border/80 transition-colors">
                    <CardHeader className="text-center pb-6 pt-6">
                      <CardTitle className="text-xl mb-2">{plan.title}</CardTitle>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-3xl font-bold">{plan.priceDisplay}</span>
                        {plan.period && (
                          <span className="text-muted-foreground text-sm">{plan.period}</span>
                        )}
                      </div>
                      <PlanGstNote plan={plan} className="text-center mt-1" />
                      <CardDescription className="mt-2 text-sm min-h-[40px]">
                        {plan.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow pt-0">
                      <ul className="space-y-2">
                        {plan.features?.map((feature) => (
                          <li key={feature} className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                            <span className="text-muted-foreground text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter className="mt-auto pt-4">
                      <Link href={`/contact?plan=${encodeURIComponent(plan.title)}`} className="w-full">
                        <Button
                          variant="outline"
                          className="w-full animated-gradient-bg-hover"
                          size="default"
                        >
                          Contact Us
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
