'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, ChevronDown, Info, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { getAllPlans, Plan } from '@/lib/api/plans'
import { PlanGstNote } from '@/components/plans/plan-gst-note'
import {
  formatArtistLimit,
  formatReleaseLimit,
  resolveArtistKeepPercent,
  resolvePlanCta,
  resolvePlanPeriodLabel,
  resolvePlanPriceDisplay,
  resolveSupportBadgeLabel,
  sortActivePlans,
} from '@/lib/plans-display'

interface ComparisonRow {
  name: string
  values: (string | boolean)[]
  valueTypes?: ('badge-green' | 'badge-orange' | 'pill' | 'check')[]
}

interface ComparisonCategory {
  name: string
  rows: ComparisonRow[]
}

function buildGridStyle(planCount: number, labelWidth: number) {
  return {
    gridTemplateColumns: `${labelWidth}px repeat(${planCount}, minmax(130px, 1fr))`,
  }
}

function collectUniqueFeatures(plans: Plan[]): string[] {
  const seen = new Set<string>()
  const ordered: string[] = []

  for (const plan of plans) {
    for (const feature of plan.features ?? []) {
      const label = feature.trim()
      const key = label.toLowerCase()
      if (!label || seen.has(key)) continue
      seen.add(key)
      ordered.push(label)
    }
  }

  return ordered
}

function buildCategories(plans: Plan[]): ComparisonCategory[] {
  const categories: ComparisonCategory[] = [
    {
      name: 'CORE LIMITS',
      rows: [
        {
          name: 'Artists',
          values: plans.map((plan) => formatArtistLimit(plan.limits.maxArtists)),
          valueTypes: plans.map(() => 'pill' as const),
        },
        {
          name: 'Releases',
          values: plans.map((plan) => formatReleaseLimit(plan.limits.maxPendingReleases)),
          valueTypes: plans.map(() => 'pill' as const),
        },
        {
          name: 'Earnings kept',
          values: plans.map((plan) => `${resolveArtistKeepPercent(plan)}%`),
          valueTypes: plans.map((plan) =>
            resolveArtistKeepPercent(plan) >= 100 ? 'badge-green' : 'badge-orange',
          ),
        },
        {
          name: 'Support response',
          values: plans.map((plan) => resolveSupportBadgeLabel(plan)),
          valueTypes: plans.map(() => 'pill' as const),
        },
      ],
    },
  ]

  const featureLabels = collectUniqueFeatures(plans)
  if (featureLabels.length > 0) {
    categories.push({
      name: 'INCLUDED FEATURES',
      rows: featureLabels.map((label) => ({
        name: label,
        values: plans.map((plan) =>
          (plan.features ?? []).some((feature) => feature.trim().toLowerCase() === label.toLowerCase()),
        ),
        valueTypes: plans.map(() => 'check' as const),
      })),
    })
  }

  return categories
}

export default function PricingPlansSection() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const fetchPlans = async () => {
      try {
        const data = await getAllPlans()
        if (!cancelled) setPlans(sortActivePlans(data))
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

  const categories = useMemo(() => buildCategories(plans), [plans])
  const gridStyle = useMemo(() => buildGridStyle(plans.length, 240), [plans.length])

  return (
    <section id="pricing" className="py-14 md:py-24 bg-background relative overflow-hidden isolate">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center mb-8 md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 font_heading tracking-tight">
            Music Distribution Pricing <br />
            <span className="animated-gradient">₹999/Year with 100% Earnings | Free Starter Plan</span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your needs. All plans include global distribution,
            automated royalty collection, and priority support.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-3 text-sm">Loading pricing...</p>
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p>No plans available right now. Please check back soon.</p>
          </div>
        ) : (
          <>
            {/* ── Mobile & Tablet accordion — shown below lg ── */}
            <MobilePricingAccordion plans={plans} allFeatures={collectUniqueFeatures(plans)} />

            {/* ── Desktop comparison table — shown on lg and above ── */}
            <motion.div
              className="hidden lg:block w-full bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="w-full overflow-x-auto scrollbar-hide">
                <div style={{ minWidth: 240 + plans.length * 130 }}>
                  {/* Plan headers */}
                  <div className="grid border-b border-white/10" style={gridStyle}>
                    <div className="p-5 md:p-8 flex items-end sticky left-0 z-20 bg-[#0a0a0a] border-r border-white/10">
                      <p className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-[0.15em] md:tracking-[0.2em]">
                        Compare plans
                      </p>
                    </div>
                    {plans.map((plan) => (
                      <PlanHeaderCell key={plan.key} plan={plan} />
                    ))}
                  </div>

                  {/* Comparison rows */}
                  <div className="pb-8">
                    {categories.map((category) => (
                      <div key={category.name}>
                        <div className="grid bg-white/[0.02] border-y border-white/5" style={gridStyle}>
                          <div className="sticky left-0 z-10 bg-[#0a0a0a] px-5 md:px-8 py-3 md:py-4 border-r border-white/5">
                            <h4 className="text-[10px] md:text-xs font-black text-white/40 tracking-[0.15em] md:tracking-[0.25em] uppercase">
                              {category.name}
                            </h4>
                          </div>
                          {plans.map((plan) => (
                            <div
                              key={`${category.name}-${plan.key}-spacer`}
                              className={plan.isPopular ? 'bg-violet-500/[0.04]' : ''}
                            />
                          ))}
                        </div>

                        {category.rows.map((row) => (
                          <div
                            key={row.name}
                            className="grid group transition-colors hover:bg-white/[0.015] border-b border-white/[0.03] last:border-b-0"
                            style={gridStyle}
                          >
                            <div className="px-5 md:px-8 py-3.5 md:py-4 flex items-center border-r border-white/5 sticky left-0 z-10 bg-[#0a0a0a] group-hover:bg-[#111] transition-colors">
                              <span className="text-[11px] md:text-sm font-medium text-white/70 group-hover:text-white transition-colors leading-snug">
                                {row.name}
                              </span>
                            </div>
                            {row.values.map((value, idx) => (
                              <ValueCell
                                key={`${row.name}-${plans[idx].key}`}
                                value={value}
                                valueType={row.valueTypes?.[idx]}
                                isPopular={plans[idx].isPopular}
                              />
                            ))}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
            <Info className="h-4 w-4 text-primary" />
            All transactions are secure and encrypted. Prices are exclusive of applicable taxes unless noted.
          </p>
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────
// Mobile & Tablet accordion (below lg)
// ─────────────────────────────────────────────────────────
function MobilePricingAccordion({ plans, allFeatures }: { plans: Plan[]; allFeatures: string[] }) {
  const defaultOpen = plans.findIndex((p) => p.isPopular)
  const [openIndex, setOpenIndex] = useState(defaultOpen >= 0 ? defaultOpen : 0)
  const toggle = (i: number) => setOpenIndex((prev) => (prev === i ? -1 : i))

  return (
    <div className="block lg:hidden pt-2 space-y-3">
      {plans.map((plan, index) => {
        const isOpen = openIndex === index
        const cta = resolvePlanCta(plan)
        const isPopular = plan.isPopular
        const artists = formatArtistLimit(plan.limits?.maxArtists ?? 0)
        const releases = formatReleaseLimit(plan.limits?.maxPendingReleases ?? 0)
        const earningsKept = `${resolveArtistKeepPercent(plan)}%`
        const isFullEarnings = resolveArtistKeepPercent(plan) >= 100
        const support = resolveSupportBadgeLabel(plan)
        // Build a Set of this plan's features for O(1) lookup
        const planFeatureSet = new Set(
          (plan.features ?? []).map((f) => f.trim().toLowerCase())
        )

        return (
          <motion.div
            key={plan.key}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.07 }}
            className={`rounded-2xl border overflow-hidden transition-shadow duration-300 ${isPopular
                ? 'border-violet-500/70 shadow-lg shadow-violet-500/15'
                : 'border-white/10'
              }`}
          >
            {/* ── Header (always visible) ── */}
            <button
              onClick={() => toggle(index)}
              aria-expanded={isOpen}
              className={`w-full flex items-center justify-between gap-3 px-4 py-4 text-left transition-colors ${isOpen
                  ? isPopular
                    ? 'bg-violet-500/[0.08]'
                    : 'bg-white/[0.04]'
                  : 'bg-[#0a0a0a] hover:bg-white/[0.03]'
                }`}
            >
              <div className="flex flex-col gap-0.5 min-w-0">
                {/* Plan name + popular badge */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-base tracking-tight leading-tight">
                    {plan.title}
                  </span>
                  {isPopular && (
                    <span className="animated-gradient-bg text-white text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full whitespace-nowrap">
                      Most Popular
                    </span>
                  )}
                </div>
                {/* Price */}
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className={`font-bold text-xl leading-none ${isPopular ? 'text-violet-400' : 'text-white'}`}>
                    {resolvePlanPriceDisplay(plan)}
                  </span>
                  {resolvePlanPeriodLabel(plan) && (
                    <span className="text-white/40 text-xs">{resolvePlanPeriodLabel(plan)}</span>
                  )}
                </div>
              </div>

              {/* Animated chevron */}
              <ChevronDown
                className={`h-5 w-5 flex-shrink-0 text-white/40 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''
                  }`}
              />
            </button>

            {/* ── Expandable body ── */}
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[1200px] opacity-100' : 'max-h-0 opacity-0'
                }`}
            >
              <div className="bg-[#0d0d0d] px-4 pb-5 pt-3 space-y-4">
                {/* Description */}
                {plan.description && (
                  <p className="text-sm text-white/50">{plan.description}</p>
                )}

                {/* GST note */}
                <PlanGstNote plan={plan} className="mt-0" />

                {/* Core limits */}
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] divide-y divide-white/[0.05] overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-2.5">
                    <span className="text-xs text-white/50 font-medium">Artists</span>
                    <span className="text-xs font-bold text-white/80 bg-white/10 px-2.5 py-0.5 rounded-full">{artists}</span>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2.5">
                    <span className="text-xs text-white/50 font-medium">Releases</span>
                    <span className="text-xs font-bold text-white/80 bg-white/10 px-2.5 py-0.5 rounded-full">{releases}</span>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2.5">
                    <span className="text-xs text-white/50 font-medium">Earnings kept</span>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${isFullEarnings
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                      }`}>{earningsKept}</span>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2.5">
                    <span className="text-xs text-white/50 font-medium">Support</span>
                    <span className="text-xs font-bold text-white/80 bg-white/10 px-2.5 py-0.5 rounded-full">{support}</span>
                  </div>
                </div>

                {/* Included features — full cross-plan checklist matching desktop table */}
                {allFeatures.length > 0 && (
                  <div>
                    <p className="text-[10px] font-black text-white/40 tracking-[0.15em] uppercase mb-3">
                      Included Features
                    </p>
                    <ul className="space-y-2.5">
                      {allFeatures.filter((feature) =>
                        planFeatureSet.has(feature.trim().toLowerCase())
                      ).map((feature) => (
                        <li key={feature} className="flex items-start gap-2.5">
                          <div className="flex-shrink-0 mt-0.5 flex items-center justify-center h-5 w-5 rounded-full bg-emerald-500/10">
                            <Check className="h-3 w-3 text-emerald-500" strokeWidth={3} />
                          </div>
                          <span className="text-sm leading-tight text-white/75">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* CTA */}
                <div className="pt-1">
                  <Link href={cta.href} className="w-full">
                    <Button
                      variant={isPopular ? 'default' : 'outline'}
                      className={`w-full h-11 rounded-xl font-bold text-sm transition-all duration-300 ${isPopular
                          ? 'animated-gradient-bg border-0 text-white shadow-[0_0_16px_rgba(132,0,215,0.25)]'
                          : 'hover:bg-white border-white/10 hover:text-black'
                        }`}
                    >
                      {cta.label}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

function PlanHeaderCell({ plan }: { plan: Plan }) {
  const cta = resolvePlanCta(plan)
  const periodLabel = resolvePlanPeriodLabel(plan)

  return (
    <div
      className={`p-5 md:p-6 flex flex-col items-center text-center relative min-h-[260px] ${plan.isPopular ? 'bg-violet-500/[0.06]' : ''}`}
    >
      {plan.isPopular && (
        <>
          <div className="absolute top-0 inset-x-0 h-0.5 animated-gradient-bg" />
          <span className="animated-gradient-bg text-white text-[9px] md:text-[10px] uppercase font-black tracking-widest px-2.5 py-0.5 rounded-full shadow-lg mb-3 mt-1">
            Most Popular
          </span>
        </>
      )}

      <h3 className="text-sm md:text-lg font-bold mb-1 tracking-tight leading-tight">{plan.title}</h3>

      <div className="flex items-baseline justify-center gap-1 mb-1">
        <span className="text-xl md:text-2xl font-bold text-white">{resolvePlanPriceDisplay(plan)}</span>
        {periodLabel && (
          <span className="text-muted-foreground text-[10px] md:text-xs">{periodLabel}</span>
        )}
      </div>

      <PlanGstNote plan={plan} className="text-center mb-2" />

      {plan.description && (
        <p className="text-[10px] md:text-xs text-muted-foreground mb-4 line-clamp-2 min-h-[2rem]">
          {plan.description}
        </p>
      )}

      <Link href={cta.href} className="w-full mt-auto">
        <Button
          variant={plan.isPopular ? 'default' : 'outline'}
          className={`w-full h-9 md:h-10 text-xs md:text-sm rounded-xl font-semibold transition-all duration-300 ${plan.isPopular
              ? 'animated-gradient-bg border-0 text-white shadow-[0_0_16px_rgba(132,0,215,0.25)]'
              : 'hover:bg-white border-white/10 hover:text-black'
            }`}
        >
          {cta.label}
        </Button>
      </Link>
    </div>
  )
}

function ValueCell({
  value,
  valueType,
  isPopular,
}: {
  value: string | boolean
  valueType?: 'badge-green' | 'badge-orange' | 'pill' | 'check'
  isPopular?: boolean
}) {
  return (
    <div
      className={`px-3 md:px-4 py-3.5 md:py-4 flex items-center justify-center text-center border-r border-white/[0.03] last:border-r-0 ${isPopular ? 'bg-violet-500/[0.04]' : ''
        }`}
    >
      {typeof value === 'boolean' || valueType === 'check' ? (
        <div
          className={`flex items-center justify-center h-7 w-7 md:h-8 md:w-8 rounded-full ${value ? 'bg-emerald-500/10' : 'bg-white/5'
            }`}
        >
          {value ? (
            <Check className="h-3.5 w-3.5 md:h-4 md:w-4 text-emerald-500" strokeWidth={3} />
          ) : (
            <X className="h-3.5 w-3.5 md:h-4 md:w-4 text-white/15" strokeWidth={3} />
          )}
        </div>
      ) : (
        <span
          className={`text-[11px] md:text-sm font-semibold tracking-tight whitespace-nowrap
            ${valueType === 'badge-green' ? 'bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20' : ''}
            ${valueType === 'badge-orange' ? 'bg-orange-500/10 text-orange-400 px-2.5 py-1 rounded-full border border-orange-500/20' : ''}
            ${valueType === 'pill' && value === 'Unlimited' ? 'text-white bg-white/10 px-2.5 py-1 rounded-full' : ''}
            ${valueType === 'pill' && value !== 'Unlimited' ? 'text-white/85' : ''}
          `}
        >
          {value}
        </span>
      )}
    </div>
  )
}
