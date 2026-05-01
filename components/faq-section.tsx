'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, HelpCircle } from 'lucide-react'

const faqs = [
  {
    q: "What is Kratolib music distribution and how does it work?",
    a: "Kratolib is a music distribution platform for Indian independent artists that helps you release your songs on 150+ streaming platforms like Spotify, Apple Music, JioSaavn, and YouTube Music. You upload your track once, and Kratolib handles delivery, metadata, and royalty collection while you keep full ownership of your music."
  },
  {
    q: "Is Kratolib free for music distribution in India?",
    a: "Yes, Kratolib offers a free plan that allows artists to distribute up to 2 releases per year at ₹0. You can earn royalties, access YouTube Content ID, and enable CRBT (caller tunes) even on the free plan."
  },
  {
    q: "How can I upload my song to Spotify and other platforms?",
    a: "To upload your song, sign up on Kratolib, add your audio file, cover art, and metadata, then select platforms like Spotify, Apple Music, and JioSaavn. Your music usually goes live within 24–72 hours."
  },
  {
    q: "How do artists earn money from music streaming?",
    a: "Artists earn royalties every time their music is streamed on platforms like Spotify, Apple Music, and YouTube Music. Additional income comes from CRBT (caller tunes), YouTube Content ID, and sync licensing opportunities."
  },
  {
    q: "What is CRBT (Caller Tune) and how can I earn from it?",
    a: "CRBT (Caller Ring Back Tone) is the music callers hear before you pick up a call. With Kratolib, your songs can be set as caller tunes on networks like Jio, Airtel, Vi, and BSNL, helping you earn royalties whenever users activate your song."
  },
  {
    q: "How and when do I receive my music royalties?",
    a: "Kratolib collects royalties from all platforms and credits them monthly to your account. You can withdraw your earnings via UPI or bank transfer in INR, with on-demand payouts available on higher plans."
  },
  {
    q: "Can independent artists release music without a record label?",
    a: "Yes, independent artists can distribute music without a record label using Kratolib. You retain 100% ownership of your songs and control your releases, earnings, and audience growth."
  },
  {
    q: "Which is the best music distributor for Indian artists?",
    a: "Kratolib is one of the best music distributors for Indian artists because it offers INR pricing, CRBT support, 100% royalty earnings on paid plans, and distribution to both global and India-specific platforms like JioSaavn and Gaana."
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
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 font_heading text-white">
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
