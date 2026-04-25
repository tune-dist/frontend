'use client'

import React from 'react'
import Navbar from './navbar'
import Footer from './footer'
import { motion } from 'framer-motion'

interface StaticPageLayoutProps {
  title?: string
  subtitle?: string
  children: React.ReactNode
}

export default function StaticPageLayout({ title, subtitle, children }: StaticPageLayoutProps) {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section for Static Pages */}
      {title && (
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
              className="text-center max-w-3xl mx-auto"
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6 font_heading tracking-tight">
                {title.split(' ').map((word, i) => (
                  <span key={i} className={i === title.split(' ').length - 1 ? "animated-gradient" : ""}>
                    {word}{' '}
                  </span>
                ))}
              </h1>
              {subtitle && (
                <p className="text-xl text-muted-foreground leading-relaxed">
                  {subtitle}
                </p>
              )}
              <div className="mt-8 h-1 w-24 bg-gradient-to-r from-primary to-violet-500 mx-auto rounded-full" />
            </motion.div>
          </div>
        </section>
      )}

      {/* Content Section */}
      <section className="pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full mx-auto prose prose-invert prose-headings:font_heading prose-p:text-muted-foreground prose-p:leading-relaxed"
          >
            {children}
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
