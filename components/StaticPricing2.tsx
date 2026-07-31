'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { getAllPlans, Plan } from '@/lib/api/plans'
import {
  resolveEarningsBadgeClass,
  resolveEarningsLabel,
  resolvePlanCta,
  resolvePlanLimitsSummary,
  resolvePlanPeriodLabel,
  resolvePlanPriceDisplay,
  resolveSupportBadgeLabel,
  sortActivePlans,
} from '@/lib/plans-display'

type PricingCardPlan = {
  key: string
  name: string
  price: string
  period: string
  details: string
  earnings: string
  earningsColor: string
  support: string
  isPopular?: boolean
  buttonText: string
}

function mapPlanToCard(plan: Plan): PricingCardPlan {
  const periodLabel = resolvePlanPeriodLabel(plan)
  const cta = resolvePlanCta(plan)

  return {
    key: plan.key,
    name: plan.title,
    price: resolvePlanPriceDisplay(plan),
    period: periodLabel || '/yr',
    details: resolvePlanLimitsSummary(plan),
    earnings: resolveEarningsLabel(plan),
    earningsColor: resolveEarningsBadgeClass(plan),
    support: resolveSupportBadgeLabel(plan),
    isPopular: plan.isPopular,
    buttonText: cta.label,
  }
}

export default function StaticPricing2() {
  const [plans, setPlans] = useState<PricingCardPlan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const fetchPlans = async () => {
      try {
        const data = await getAllPlans()
        if (!cancelled) setPlans(sortActivePlans(data).map(mapPlanToCard))
      } catch (error) {
        console.error('Failed to fetch plans:', error)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchPlans()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section id="pricing" className="py-14 md:py-24 bg-background relative overflow-hidden">
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
            <span className="animated-gradient">Pricing</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your needs. All plans include distribution
            and royalty collection.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-3 text-sm">Loading plans...</p>
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p>No plans available right now. Please check back soon.</p>
          </div>
        ) : (
          <div className="flex xl:grid xl:grid-cols-5 gap-6 overflow-x-auto pb-8 pt-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {plans.map((plan, index) => (
              <PricingCardItem key={plan.key} plan={plan} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function PricingCardItem({ plan, index }: { plan: PricingCardPlan; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative flex h-full min-w-[280px] sm:min-w-[320px] max-w-[85vw] shrink-0 snap-center xl:min-w-0 xl:max-w-none xl:shrink"
    >
      <Card
        className={`w-full flex flex-col bg-card border-white/10 hover:border-white/20 transition-all duration-300 ${
          plan.isPopular
            ? 'border border-violet-500/90 shadow-xl shadow-violet-500/20 hover:border-violet-500/90'
            : ''
        }`}
      >
        {plan.isPopular && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 animated-gradient-bg text-white text-[10px] font-bold rounded-full uppercase z-20">
            Most popular
          </div>
        )}

        <CardHeader className="pb-4">
          <div className="space-y-1">
            <CardTitle className="text-xs font-bold text-muted-foreground tracking-widest uppercase">
              {plan.name}
            </CardTitle>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold">{plan.price}</span>
              <span className="text-muted-foreground text-sm font-medium">{plan.period}</span>
            </div>
            <p className="text-[11px] text-muted-foreground font-medium italic">{plan.details}</p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 flex-grow">
          <div className="space-y-2">
            <div
              className={`px-4 py-1.5 rounded-full text-center text-[11px] font-bold border ${plan.earningsColor}`}
            >
              {plan.earnings}
            </div>
            <div className="px-4 py-1.5 rounded-full text-center text-[11px] font-bold bg-white/5 text-muted-foreground border border-white/5">
              {plan.support}
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-6">
          <Link href="/pricing" className="w-full">
            <Button
              variant={plan.isPopular ? 'default' : 'outline'}
              className={`w-full rounded-xl text-sm font-bold h-12 transition-all duration-300 ${
                plan.isPopular
                  ? 'animated-gradient-bg border-0 text-white'
                  : 'bg-white/5 hover:bg-white/10 border-white/5 hover:bg-white hover:text-black'
              }`}
            >
              {plan.buttonText}
              <motion.span className="ml-2" initial={{ x: 0 }} whileHover={{ x: 3 }}>
                →
              </motion.span>
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
