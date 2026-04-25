'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, HelpCircle } from 'lucide-react'

const faqs = [
  {
    q: "How long does it take for my music to go live?",
    a: "Typically, it takes 24-48 hours for review by our team and another 3-7 days for DSPs like Spotify and Apple Music to process your upload. We recommend uploading at least 2 weeks before your release date."
  },
  {
    q: "Which platforms do you distribute to?",
    a: "We distribute to over 150+ Digital Service Providers worldwide, including Spotify, Apple Music, YouTube Music, Instagram, TikTok, Amazon Music, and many more."
  },
  {
    q: "When do I get paid?",
    a: "DSP payout cycles vary, but most report royalties 45-60 days after the end of the month. Once we receive your royalties, they are credited to your KratoLib account immediately."
  },
  {
    q: "Do I keep 100% ownership of my music?",
    a: "Yes! You always retain 100% ownership of your master recordings and publishing when distributing through KratoLib."
  },
  {
    q: "How do I handle royalty splits with collaborators?",
    a: "You can easily set up automated royalty splits directly in your dashboard. Just invite your collaborators via email and set their percentage share."
  },
  {
    q: "Do you take a percentage of my royalties?",
    a: "Depending on your plan, we offer 100% royalty retention for our Pro and Label tiers, while our Free tier may have a small commission."
  }
]

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="py-14 md:py-24 bg-background relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-1/3 h-1/2 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-violet-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-4 font_heading text-white">
            Frequently Asked{' '}
            <span className="animated-gradient">Questions</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about distributing your music, tracking royalties,
            and growing your career with KratoLib.
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div
                  className={`group border border-white/10 rounded-2xl transition-all duration-300 ${isOpen ? 'bg-card/40 border-primary/30 ring-1 ring-primary/10' : 'bg-card/10 hover:bg-card/20 hover:border-border/60'
                    }`}
                >
                  <button
                    onClick={() => toggle(index)}
                    className="w-full text-left p-4 sm:p-4 flex items-center justify-between gap-4"
                  >
                    <span className={`text-base transition-colors duration-300 ${isOpen ? 'text-white font-medium' : 'text-muted-foreground group-hover:text-white'
                      }`}>
                      {faq.q}
                    </span>
                    <div className={`p-1.5 rounded-full transition-all duration-300 ${isOpen ? 'bg-primary text-primary-foreground rotate-180' : 'bg-muted/50 text-white shadow-sm'
                      }`}>
                      <ChevronDown className="w-5 h-5" />
                    </div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 pt-2 sm:px-4 sm:pb-4 text-muted-foreground leading-relaxed text-md border-t border-border/10">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )
          })}
        </div>

        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <p className="text-muted-foreground">
            Still have questions? {' '}
            <a href="/contact" className="text-primary font-medium hover:underline transition-all underline-offset-4">
              Get in touch with our team
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  )
}
