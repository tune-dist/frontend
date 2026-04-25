'use client'

import { motion } from 'framer-motion'
import { Check, X, Minus, Dot, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

const plans = [
  {
    name: 'FREE STARTER',
    price: '₹0',
    period: '/ year',
    details: '1 artist · 2 releases/year',
    earnings: 'Keep 80% of earnings',
    earningsColor: 'bg-orange-500/10 text-orange-600 border-orange-200/50',
    support: 'Support within 7 days',
    sections: [
      {
        title: 'DISTRIBUTION',
        items: [
          { label: '150+ platform distribution', type: 'included' },
          { label: 'UGC monetization (Meta, TikTok, YouTube)', type: 'included' },
          { label: 'YouTube Content ID', type: 'included' },
          { label: 'CRBT / Caller Tune', type: 'included' },
          { label: 'Lyrics distribution', type: 'excluded' },
        ]
      },
      {
        title: 'ANALYTICS & MARKETING',
        items: [
          { label: 'Basic analytics', type: 'included' },
          { label: 'Basic marketing tools', type: 'included' },
          { label: 'Advanced analytics', type: 'excluded' },
          { label: 'Playlist pitching', type: 'excluded' },
          { label: 'Pre-save links', type: 'excluded' },
        ]
      },
      {
        title: 'ROYALTIES',
        items: [
          { label: 'Royalty splits', type: 'excluded' },
          { label: 'SoundExchange registration', type: 'excluded' },
          { label: 'On-demand payouts', type: 'excluded' },
        ]
      }
    ],
    buttonText: 'Get started free',
    buttonLink: '/auth/register'
  },
  {
    name: 'SOLO PRO',
    price: '₹999',
    period: '/ year',
    details: '1 artist · unlimited releases',
    earnings: 'Keep 100% of earnings',
    earningsColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-200/50',
    support: 'Support within 72 hours',
    isPopular: true,
    sections: [
      {
        title: 'DISTRIBUTION',
        items: [
          { label: '150+ platform distribution', type: 'included' },
          { label: 'UGC monetization (Meta, TikTok, YouTube)', type: 'included' },
          { label: 'YouTube Content ID', type: 'included' },
          { label: 'CRBT / Caller Tune', type: 'included' },
          { label: 'Lyrics distribution (Musixmatch, Genius)', type: 'included' },
        ]
      },
      {
        title: 'ANALYTICS & MARKETING',
        items: [
          { label: 'Advanced analytics dashboard', type: 'included' },
          { label: 'Playlist pitching & promotion', type: 'included' },
          { label: 'Spotify Discovery Mode', type: 'included' },
          { label: 'YouTube OAC claim', type: 'included' },
          { label: 'Verified artist badge support', type: 'included' },
          { label: 'Early access to new features', type: 'included' },
          { label: 'Pre-save links', type: 'excluded' },
          { label: 'Fan / smart links', type: 'excluded' },
        ]
      },
      {
        title: 'ROYALTIES & RIGHTS',
        items: [
          { label: 'Sync licensing (TV, Film, Ads, Games)', type: 'included' },
          { label: 'Mastering integration (add-on)', type: 'addon' },
          { label: 'Royalty splits', type: 'excluded' },
          { label: 'SoundExchange registration', type: 'excluded' },
        ]
      }
    ],
    buttonText: 'Get Solo Pro',
    buttonLink: '/auth/register'
  },
  {
    name: 'GROWTH LABEL',
    price: '₹3,999',
    period: '/ year',
    details: '5 artists · unlimited releases',
    earnings: 'Keep 100% of earnings',
    earningsColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-200/50',
    support: 'Support within 48 hours',
    sections: [
      {
        title: 'DISTRIBUTION',
        items: [
          { label: 'Everything in Solo Pro', type: 'inherited' },
          { label: 'Spotify for Artists claim support', type: 'included' },
        ]
      },
      {
        title: 'MARKETING & RELEASE TOOLS',
        items: [
          { label: 'Pre-save links (Spotify, Apple Music)', type: 'included' },
          { label: 'Fan links / smart links', type: 'included' },
          { label: 'Scheduled release dates', type: 'included' },
          { label: 'Custom ISRC codes', type: 'included' },
          { label: 'Promotional budget access', type: 'included' },
        ]
      },
      {
        title: 'ROYALTIES & RIGHTS',
        items: [
          { label: 'Royalty splits at source', type: 'included' },
          { label: 'Split sheet agreements', type: 'included' },
          { label: 'SoundExchange / neighboring rights', type: 'included' },
          { label: 'On-demand royalty payouts', type: 'included' },
          { label: 'Mastering integration (included)', type: 'included' },
        ]
      }
    ],
    buttonText: 'Get Growth',
    buttonLink: '/auth/register'
  },
  {
    name: 'BUSINESS LABEL',
    price: '₹6,999',
    period: '/ year',
    details: '10 artists · unlimited releases',
    earnings: 'Keep 100% of earnings',
    earningsColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-200/50',
    support: 'Support within 24 hours',
    sections: [
      {
        title: 'EVERYTHING IN GROWTH, PLUS:',
        items: [
          { label: 'All Growth Label features', type: 'inherited' },
        ]
      },
      {
        title: 'LABEL TOOLS',
        items: [
          { label: 'Premium label dashboard', type: 'included' },
          { label: 'Add artists at ₹499 each', type: 'included' },
          { label: 'Playlist promotion campaigns', type: 'included' },
          { label: 'Marketing budget access', type: 'included' },
          { label: 'Cover song licensing support', type: 'included' },
          { label: 'Daily streaming stats & alerts', type: 'included' },
        ]
      }
    ],
    buttonText: 'Get Business',
    buttonLink: '/auth/register'
  },
  {
    name: 'ENTERPRISE',
    price: 'Custom',
    period: ' pricing',
    details: 'Unlimited artists',
    earnings: 'Keep 100% of earnings',
    earningsColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-200/50',
    support: 'Same-day priority support',
    sections: [
      {
        title: 'EVERYTHING IN BUSINESS, PLUS:',
        items: [
          { label: 'All Business Label features', type: 'inherited' },
        ]
      },
      {
        title: 'ENTERPRISE TOOLS',
        items: [
          { label: 'Dedicated account manager', type: 'included' },
          { label: 'API & bulk upload access', type: 'included' },
          { label: 'Bulk catalog migration', type: 'included' },
          { label: 'White-label solutions', type: 'included' },
          { label: 'Advanced team access controls', type: 'included' },
          { label: 'Custom deals & pricing', type: 'included' },
          { label: 'Priority placement support', type: 'included' },
        ]
      }
    ],
    buttonText: 'Contact sales',
    buttonLink: '/contact'
  }
]

export default function StaticPricing2() {
  return (
    <section id="pricing" className="py-20 md:py-32 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-4 font_heading">
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

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-6 mb-12 text-sm font-semibold text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Check className="h-4 w-4 text-emerald-500" />
            <span>Included</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Minus className="h-4 w-4 text-rose-500" />
            <span>Not included</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />
            <span>Add-on / upgrade</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
            <span>Inherited from prev plan</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 items-stretch">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative flex h-full"
            >
              <Card className={`w-full flex flex-col bg-card border-white/10 hover:border-white/20 transition-all duration-300 ${plan.isPopular ? 'border border-violet-500/90 shadow-xl shadow-violet-500/20 hover:border-violet-500/90' : ''}`}>
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
                    <p className="text-[11px] text-muted-foreground font-medium italic">
                      {plan.details}
                    </p>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6 flex-grow">
                  <div className="space-y-2">
                    <div className={`px-4 py-1.5 rounded-full text-center text-[11px] font-bold border ${plan.earningsColor}`}>
                      {plan.earnings}
                    </div>
                    <div className="px-4 py-1.5 rounded-full text-center text-[11px] font-bold bg-white/5 text-muted-foreground border border-white/5">
                      {plan.support}
                    </div>
                  </div>

                  <div className="space-y-6">
                    {plan.sections.map((section) => (
                      <div key={section.title} className="space-y-3">
                        <h4 className="text-[10px] font-black text-muted-foreground tracking-widest uppercase pb-1 border-b border-white/5">
                          {section.title}
                        </h4>
                        <ul className="space-y-2.5">
                          {section.items.map((item) => (
                            <li key={item.label} className="flex items-start gap-2.5 group">
                              {item.type === 'included' && <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />}
                              {item.type === 'excluded' && <Minus className="h-3.5 w-3.5 text-rose-500/30 shrink-0 mt-0.5" />}
                              {item.type === 'addon' && <div className="h-2 w-2 rounded-full bg-blue-400 shrink-0 mt-1.5 mx-0.5" />}
                              {item.type === 'inherited' && <div className="h-2 w-2 rounded-full bg-slate-400 shrink-0 mt-1.5 mx-0.5" />}
                              <span className={`text-[12px] font-medium leading-tight ${item.type === 'excluded' ? 'text-muted-foreground/40' : 'text-muted-foreground group-hover:text-foreground transition-colors'}`}>
                                {item.label}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </CardContent>

                <CardFooter className="pt-6">
                  <Link href={plan.buttonLink} className="w-full">
                    <Button
                      variant={plan.isPopular ? "default" : "outline"}
                      className={`w-full rounded-xl text-sm font-bold h-12 transition-all duration-300 ${plan.isPopular ? 'animated-gradient-bg border-0 text-white' : 'bg-white/5 hover:bg-white/10 border-white/5 hover:bg-white hover:text-black'}`}
                    >
                      {plan.buttonText}
                      <motion.span
                        className="ml-2"
                        initial={{ x: 0 }}
                        whileHover={{ x: 3 }}
                      >
                        →
                      </motion.span>
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
