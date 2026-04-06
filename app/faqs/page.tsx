'use client'

import React, { useState } from 'react'
import StaticPageLayout from '@/components/StaticPageLayout'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, MessageSquare, Music, DollarSign, Shield } from 'lucide-react'

const faqCategories = [
  {
    icon: Music,
    title: "Distribution",
    faqs: [
      { q: "How long does it take for my music to go live?", a: "Typically, it takes 24-48 hours for review by our team and another 3-7 days for DSPs like Spotify and Apple Music to process your upload. We recommend uploading at least 2 weeks before your release date." },
      { q: "Which platforms do you distribute to?", a: "We distribute to over 150+ Digital Service Providers worldwide, including Spotify, Apple Music, YouTube Music, Instagram, TikTok, Amazon Music, and many more." },
      { q: "Can I distribute cover songs?", a: "Yes, you can distribute cover songs, but you must have the necessary licenses. KratoLib offers tools to help you obtain these licenses for popular tracks." }
    ]
  },
  {
    icon: DollarSign,
    title: "Royalties & Payments",
    faqs: [
      { q: "When do I get paid?", a: "DSP payout cycles vary, but most report royalties 45-60 days after the end of the month. Once we receive your royalties, they are credited to your KratoLib account immediately." },
      { q: "What is the minimum payout amount?", a: "The minimum payout threshold is $10 USD. Once your balance reaches this amount, you can request a withdrawal via PayPal, Bank Transfer, or Stripe." },
      { q: "Do you take a percentage of my royalties?", a: "Depending on your plan, we offer 100% royalty retention for our Pro and Label tiers, while our Free tier may have a small commission." }
    ]
  },
  {
    icon: Shield,
    title: "Copyright & Legal",
    faqs: [
      { q: "Do I keep 100% ownership of my music?", a: "Yes! You always retain 100% ownership of your master recordings and publishing when distributing through KratoLib." },
      { q: "How do I handle royalty splits with collaborators?", a: "You can easily set up automated royalty splits directly in your dashboard. Just invite your collaborators via email and set their percentage share." }
    ]
  }
]

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<string | null>(null)

  const toggle = (id: string) => {
    setOpenIndex(openIndex === id ? null : id)
  }

  return (
    <StaticPageLayout 
      title="Common Questions" 
      subtitle="Find answers to frequently asked questions about music distribution, royalties, and more."
    >
      <div className="space-y-16">
        {faqCategories.map((category, catIndex) => (
          <div key={catIndex} className="space-y-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <category.icon className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-white font_heading">
                {category.title}
              </h2>
            </div>
            
            <div className="grid gap-4">
              {category.faqs.map((faq, faqIndex) => {
                const id = `${catIndex}-${faqIndex}`
                const isOpen = openIndex === id
                
                return (
                  <div 
                    key={id}
                    className={`border border-border/50 rounded-2xl transition-all duration-300 ${isOpen ? 'bg-card/50 ring-1 ring-primary/20' : 'bg-card/20 hover:bg-card/30'}`}
                  >
                    <button
                      onClick={() => toggle(id)}
                      className="w-full text-left p-6 flex items-center justify-between gap-4"
                    >
                      <span className={`font-semibold text-lg transition-colors ${isOpen ? 'text-primary' : 'text-white'}`}>
                        {faq.q}
                      </span>
                      <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : ''}`} />
                    </button>
                    
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="p-6 pt-0 text-muted-foreground leading-relaxed border-t border-border/20 mx-6">
                            {faq.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-20 text-center">
        <div className="inline-flex items-center gap-4 p-6 rounded-full bg-card/50 border border-border/50 text-muted-foreground">
          <MessageSquare className="w-5 h-5 text-primary" />
          <span>Can't find what you're looking for? <a href="/contact" className="text-primary font-semibold hover:underline">Ask us directly</a>.</span>
        </div>
      </div>
    </StaticPageLayout>
  )
}
