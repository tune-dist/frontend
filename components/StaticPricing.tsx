'use client'

import { motion } from 'framer-motion'
import { Check, X, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Feature {
  name: string;
  values: (string | boolean)[];
  types?: string[];
}

interface Category {
  name: string;
  features: Feature[];
}

const plans = [
  { name: 'Free Starter', price: '₹0/yr', key: 'free' },
  { name: 'Solo Pro', price: '₹999/yr', key: 'solo', isPopular: true },
  { name: 'Growth Label', price: '₹3,999/yr', key: 'growth' },
  { name: 'Business Label', price: '₹6,999/yr', key: 'business' },
  { name: 'Enterprise', price: 'Custom', key: 'enterprise' },
]

const categories: Category[] = [
  {
    name: 'CORE LIMITS',
    features: [
      { name: 'Artists', values: ['1', '1', '5', '10', 'Unlimited'] },
      { name: 'Releases', values: ['2 / year', 'Unlimited', 'Unlimited', 'Unlimited', 'Unlimited'] },
      { name: 'Earnings kept', values: ['80%', '100%', '100%', '100%', '100%'], types: ['badge-orange', 'badge-green', 'badge-green', 'badge-green', 'badge-green'] },
      { name: 'Support response', values: ['7 days', '72 hours', '48 hours', '24 hours', 'Same day'] },
    ]
  },
  {
    name: 'DISTRIBUTION',
    features: [
      { name: '150+ platforms', values: [true, true, true, true, true] },
      { name: 'YouTube Content ID', values: [true, true, true, true, true] },
      { name: 'UGC monetization', values: [true, true, true, true, true] },
      { name: 'CRBT / Caller Tune', values: [true, true, true, true, true] },
      { name: 'Lyrics distribution', values: [false, true, true, true, true] },
    ]
  },
  {
    name: 'ANALYTICS & ARTIST TOOLS',
    features: [
      { name: 'Basic analytics', values: [true, true, true, true, true] },
      { name: 'Advanced analytics', values: [false, true, true, true, true] },
      { name: 'Daily stats & alerts', values: [false, false, false, true, true] },
      { name: 'Verified badge support', values: [false, true, true, true, true] },
      { name: 'YouTube OAC claim', values: [false, true, true, true, true] },
      { name: 'Spotify for Artists claim', values: [false, false, true, true, true] },
      { name: 'Spotify Discovery Mode', values: [false, true, true, true, true] },
    ]
  },
  {
    name: 'MARKETING & RELEASE',
    features: [
      { name: 'Playlist pitching', values: [false, true, true, true, true] },
      { name: 'Playlist promotion', values: [false, false, false, true, true] },
      { name: 'Pre-save links', values: [false, false, true, true, true] },
      { name: 'Fan / smart links', values: [false, false, true, true, true] },
      { name: 'Scheduled release date', values: [false, false, true, true, true] },
      { name: 'Promotional budget access', values: [false, false, true, true, true] },
      { name: 'Sync licensing', values: [false, true, true, true, true] },
      { name: 'Cover song licensing', values: [false, false, false, true, true] },
    ]
  },
  {
    name: 'ROYALTIES & RIGHTS',
    features: [
      { name: 'Royalty splits at source', values: [false, false, true, true, true] },
      { name: 'Split sheet agreements', values: [false, false, true, true, true] },
      { name: 'On-demand payouts', values: [false, false, true, true, true] },
      { name: 'Custom ISRC codes', values: [false, false, true, true, true] },
      { name: 'SoundExchange registration', values: [false, false, true, true, true] },
      { name: 'Mastering integration', values: [false, 'Add-on', true, true, true] },
    ]
  },
  {
    name: 'LABEL & ENTERPRISE TOOLS',
    features: [
      { name: 'Label dashboard', values: [false, false, false, false, true] },
      { name: 'Add artist at ₹499', values: [false, false, false, false, true] },
      { name: 'Dedicated account manager', values: [false, false, false, false, true] },
      { name: 'API & bulk upload', values: [false, false, false, false, true] },
      { name: 'Bulk catalog migration', values: [false, false, false, false, true] },
      { name: 'White-label solutions', values: [false, false, false, false, true] },
      { name: 'Team access controls', values: [false, false, false, false, true] },
    ]
  }
]

export default function StaticPricing() {
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
            Music Distribution Pricing {' '}<br />
            <span className="animated-gradient">
              ₹999/Year with 100% Earnings | Free Starter Plan
            </span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your needs. All plans include global distribution,
            automated royalty collection, and priority support.
          </p>
        </motion.div>

        {/* Pricing Table Container */}
        <motion.div
          className="w-full bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="w-full overflow-x-auto scrollbar-hide">
            <div className="min-w-max md:min-w-[1100px]">
              {/* Table Header */}
              <div className="grid grid-cols-[140px,repeat(5,120px)] md:grid-cols-[280px,repeat(5,1fr)] gap-0 items-stretch border-b border-white/10">
                <div className="p-4 md:p-8 flex items-end sticky left-0 z-20 bg-[#0a0a0a] border-r border-white/10 shadow-[10px_0_20px_-10px_rgba(0,0,0,0.5)]">
                  <p className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-[0.1em] md:tracking-[0.2em]">Comparison Matrix</p>
                </div>
                {plans.map((plan) => (
                  <div
                    key={plan.key}
                    className={`p-4 md:p-8 flex flex-col items-center text-center transition-colors relative ${plan.isPopular ? 'bg-white/[0.03]' : ''}`}
                  >
                    {plan.isPopular && (
                      <div className="absolute top-0 left-0 right-0 h-1 animated-gradient-bg" />
                    )}
                    <div className="h-8 md:h-12 flex flex-col justify-center mb-2 md:mb-4">
                      {plan.isPopular && (
                        <span className="animated-gradient-bg text-white text-[8px] md:text-[10px] uppercase font-black tracking-widest px-2 md:px-3 py-1 rounded-full shadow-lg mb-1 md:mb-2">
                          Most Popular
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm md:text-xl font-bold mb-1 tracking-tight">{plan.name}</h3>
                    <div className="flex items-baseline gap-1 mb-4 md:mb-6">
                      <span className="text-lg md:text-2xl font-bold text-white">{plan.price.split('/')[0]}</span>
                      {plan.price.includes('/') && (
                        <span className="text-muted-foreground text-[10px] md:text-xs uppercase">/{plan.price.split('/')[1]}</span>
                      )}
                    </div>
                    <Link href="/contact" className="w-full mt-auto">
                      <Button
                        variant={plan.isPopular ? "default" : "outline"}
                        className={`w-full h-9 md:h-11 text-xs md:text-sm rounded-xl font-semibold transition-all duration-300 ${plan.isPopular
                          ? 'animated-gradient-bg border-0 text-white hover:scale-105 shadow-[0_0_20px_rgba(132,0,215,0.3)]'
                          : 'hover:bg-white border-white/10 hover:text-black'
                          }`}
                      >
                        Contact Us
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>

              {/* Comparison Rows */}
              <div className="pb-12">
                {categories.map((category) => (
                  <div key={category.name}>
                    <div className="bg-white/[0.02] border-y border-white/5 w-full relative">
                      <div className="sticky left-0 w-[140px] md:w-fit px-4 md:px-8 py-3 md:py-4 bg-[#0a0a0a] z-10 border-r border-white/5 shadow-[10px_0_20px_-10px_rgba(0,0,0,0.5)]">
                        <h4 className="text-[10px] md:text-xs font-black text-white/40 tracking-[0.15em] md:tracking-[0.3em] uppercase truncate md:overflow-visible">{category.name}</h4>
                      </div>
                    </div>
                    {category.features.map((feature, fIdx) => (
                      <div
                        key={feature.name}
                        className="grid grid-cols-[140px,repeat(5,120px)] md:grid-cols-[280px,repeat(5,1fr)] gap-0 group transition-colors hover:bg-white/[0.01]"
                      >
                        <div className="px-4 md:px-8 py-4 flex items-center border-r border-white/5 sticky left-0 z-10 bg-[#0a0a0a] group-hover:bg-[#111] transition-colors shadow-[10px_0_20px_-10px_rgba(0,0,0,0.5)]">
                          <span className="text-[11px] md:text-sm font-medium text-white/70 group-hover:text-white transition-colors leading-tight">
                            {feature.name}
                          </span>
                        </div>
                        {feature.values.map((val, idx) => (
                          <div
                            key={idx}
                            className={`px-2 md:px-4 py-2 flex items-center justify-center text-center border-r border-white/5 last:border-r-0 ${plans[idx].isPopular ? 'bg-purple-700/[0.3]' : ''}`}
                          >
                            {typeof val === 'boolean' ? (
                              <div className={`flex items-center justify-center h-6 w-6 md:h-8 md:w-8 rounded-full ${val ? 'bg-emerald-500/10' : 'bg-white/5'}`}>
                                {val ? (
                                  <Check className="h-3 w-3 md:h-4 md:w-4 text-emerald-500" strokeWidth={3} />
                                ) : (
                                  <X className="h-3 w-3 md:h-4 md:w-4 text-white/10" strokeWidth={3} />
                                )}
                              </div>
                            ) : (
                              <span className={`text-[11px] md:text-sm font-semibold tracking-tight
                                ${feature.types && feature.types[idx] === 'badge-green' ? 'bg-emerald-500/10 text-emerald-500 px-2 md:px-3 py-1 rounded-full border border-emerald-500/20' : ''}
                                ${feature.types && feature.types[idx] === 'badge-orange' ? 'bg-orange-500/10 text-orange-500 px-2 md:px-3 py-1 rounded-full border border-orange-500/20' : ''}
                                ${val === 'Add-on' ? 'text-primary underline underline-offset-4 decoration-primary/30' : 'text-white/80'}
                                ${val === 'Unlimited' ? 'text-white bg-white/10 px-2 md:px-3 py-1 rounded-full' : ''}
                              `}>
                                {val}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Trust Footer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
            <Info className="h-4 w-4 text-primary" />
            All transactions are secure and encrypted. Prices are exclusive of applicable taxes.
          </p>
        </div>
      </div>
    </section>
  )
}
