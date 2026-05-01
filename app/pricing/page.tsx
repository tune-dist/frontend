import type { Metadata } from 'next'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import StaticPricing from '@/components/StaticPricing'

export const metadata: Metadata = {
  title: "Music Distribution Pricing | ₹0-₹6,999/Year | 100% Earnings | KratoLib",
  description: "Compare KratoLib pricing plans. Free Starter (₹0), Solo Pro (₹999), Growth (₹3,999), Business (₹6,999). 100% earnings on paid plans. No hidden fees. See all features.",
  openGraph: {
    title: "Music Distribution Pricing | ₹0-₹6,999/Year | 100% Earnings | KratoLib",
    description: "Compare KratoLib pricing plans. Free Starter (₹0), Solo Pro (₹999), Growth (₹3,999), Business (₹6,999). 100% earnings on paid plans. No hidden fees. See all features.",
  },
  twitter: {
    title: "Music Distribution Pricing | ₹0-₹6,999/Year | 100% Earnings | KratoLib",
    description: "Compare KratoLib pricing plans. Free Starter (₹0), Solo Pro (₹999), Growth (₹3,999), Business (₹6,999). 100% earnings on paid plans. No hidden fees. See all features.",
  },
};


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
