import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import StaticPricing from '@/components/StaticPricing'
import { createPageMetadata } from '@/lib/site-metadata'

export const metadata = createPageMetadata(
  'Music Distribution Pricing | ₹0-₹6,999/Year | 100% Earnings | KratoLib',
  'Compare KratoLib pricing plans. Free Starter (₹0), Solo Pro (₹999), Growth (₹3,999), Business (₹6,999). 100% earnings on paid plans. No hidden fees. See all features.',
)

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <StaticPricing />
      <Footer />
    </>
  )
}
