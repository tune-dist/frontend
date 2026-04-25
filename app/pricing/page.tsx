'use client'

import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import StaticPricing from '@/components/StaticPricing'

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-grow pt-10">
        <StaticPricing />
      </div>
      <Footer />
    </main>
  )
}
