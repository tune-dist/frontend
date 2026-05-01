import type { Metadata } from 'next'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'KratoLib - Music Distribution Free | Keep 100% | ₹999/Year',
  description: 'KratoLib - Free music distribution for Indian indie artists. Upload to Spotify, Apple Music, JioSaavn, YouTube. Keep 100% earnings. 24/7 support. Start free today!',
  openGraph: {
    title: 'KratoLib - Music Distribution Free | Keep 100% | ₹999/Year',
    description: 'KratoLib - Free music distribution for Indian indie artists. Upload to Spotify, Apple Music, JioSaavn, YouTube. Keep 100% earnings. 24/7 support. Start free today!',
  },
  twitter: {
    title: 'KratoLib - Music Distribution Free | Keep 100% | ₹999/Year',
    description: 'KratoLib - Free music distribution for Indian indie artists. Upload to Spotify, Apple Music, JioSaavn, YouTube. Keep 100% earnings. 24/7 support. Start free today!',
  },
}

import Navbar from '@/components/navbar'
import Hero from '@/components/hero'
import Features from '@/components/features'
import HowItWorks from '@/components/how-it-works'
import Testimonials from '@/components/testimonials'
import StaticPricing2 from '@/components/StaticPricing2'
import Contact from '@/components/contact'
import FaqSection from '@/components/faq-section'
import Footer from '@/components/footer'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Testimonials />
      <StaticPricing2 />
      <FaqSection />
      <Suspense fallback={<div className="min-h-[600px] w-full" />}>
        <Contact />
      </Suspense>
      <Footer />
    </main>
  )
}

