'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Check } from 'lucide-react'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'

// Define the static plans
const staticPlans = [
  {
    key: 'free',
    title: 'Free',
    priceDisplay: '₹0',
    period: '/year',
    description: 'Perfect for artists just getting started with their first releases.',
    features: [
      'Retain the largest percentage of royalties',
      'Basic global distribution',
      'Migrate your catalog with ease',
      'Standard email support',
    ],
    ctaLabel: 'Get Started',
    isPopular: false,
    href: '/auth?plan=free'
  },
  {
    key: 'pro',
    title: 'Pro',
    priceDisplay: '₹999',
    period: '/year',
    description: 'For growing artists who need unlimited releases and advanced tools.',
    features: [
      'Unlimited releases',
      'Automated royalty splits',
      'YouTube Content ID & OAC',
      'Pre-save and master links',
      'Retain a higher % of royalties',
    ],
    ctaLabel: 'Upgrade to Pro',
    isPopular: true,
    href: '/auth?plan=pro'
  },
  {
    key: 'creator-plus',
    title: 'Creator Plus',
    priceDisplay: '₹3,499',
    period: '/year',
    description: 'For rising stars who need sync opportunities and editorial pitching.',
    features: [
      'Everything in Pro',
      'Sync opportunities (OTT, Movies)',
      'Editorial playlist pitching',
      'Access to artist funding',
      'Keep 95% of your royalties',
    ],
    ctaLabel: 'Go Creator Plus',
    isPopular: false,
    href: '/auth?plan=creator-plus'
  },
  {
    key: 'label-mx',
    title: 'Label MX',
    priceDisplay: '₹9,999',
    period: '/year',
    description: 'Manage a growing roster of artists under one centralized label dashboard.',
    features: [
      'Manage multiple artists seamlessly',
      'Royalty splits at the source',
      'Real-time data & demographic insights',
      'Priority support access',
      'Fast-tracked distribution',
    ],
    ctaLabel: 'Start Your Label',
    isPopular: false,
    href: '/auth?plan=label-mx'
  },
  {
    key: 'enterprise',
    title: 'Enterprise',
    priceDisplay: 'Custom',
    period: '',
    description: 'Tailor-made solutions and white-glove support for large catalogs.',
    features: [
      'Dedicated label manager',
      'Advanced API access',
      'White-glove catalog migration',
      'Volume-based royalty tiering',
      'Customized marketing campaigns',
    ],
    ctaLabel: 'Contact Sales',
    isPopular: false,
    href: '/contact'
  }
]

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <section className="py-20 md:py-35 relative overflow-hidden flex-grow">
        {/* Decorative background elements */}
        <div className="absolute top-1/4 left-0 w-full h-1/2 bg-primary/5 blur-[120px] rounded-[100%] pointer-events-none" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="text-center mb-16 pt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font_heading leading-tight">
              Pricing that scales with your <br />
              <span className="animated-gradient">Music Career</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your needs. Start for free and upgrade as your audience grows.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-[1600px] mx-auto items-stretch pt-6 pb-20">
            {staticPlans.map((plan, index) => (
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
                      <CardDescription className="mt-2 text-sm min-h-[40px]">
                        {plan.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow pt-0">
                      <ul className="space-y-3">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                            <span className="text-muted-foreground text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter className="mt-auto pt-4 pb-6">
                      <Link href={plan.href} className="w-full">
                        <Button
                          variant="default"
                          className="w-full animated-gradient-bg border-0 text-white"
                          size="default"
                        >
                          {plan.ctaLabel}
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
                      <CardDescription className="mt-2 text-sm min-h-[40px]">
                        {plan.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow pt-0">
                      <ul className="space-y-2">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                            <span className="text-muted-foreground text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter className="mt-auto pt-4 pb-6">
                      <Link href={plan.href} className="w-full">
                        <Button
                          variant="outline"
                          className="w-full animated-gradient-bg-hover"
                          size="default"
                        >
                          {plan.ctaLabel}
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
