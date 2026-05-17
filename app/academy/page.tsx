'use client'

import React from 'react'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'

export default function AcademyPage() {
  const subtitle = "Master the music industry with our comprehensive courses and tutorials."

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 animated-gradient-bg rounded-full blur-3xl opacity-10" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 animated-gradient-bg rounded-full blur-3xl opacity-10" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 font_heading tracking-tight text-white">
              <span className='animated-gradient'>Music Distribution Academy</span> - Learn to Release, Promote & Earn from Your Music
            </h1>
            {subtitle && (
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed mt-4">
                {subtitle}
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <section className="pb-32 pt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-12 max-w-2xl mx-auto backdrop-blur-md"
            >
              <Clock className="w-16 h-16 text-primary mx-auto mb-6 opacity-80" />
              <h2 className="text-3xl font-bold text-white mb-4 font_heading">Coming Soon</h2>
              <p className="text-lg text-muted-foreground">
                We are working hard to bring you the best educational content to help you grow your music career. Stay tuned!
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
