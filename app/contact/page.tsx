import { Suspense } from 'react'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import Contact from '@/components/contact'
import { createPageMetadata } from '@/lib/site-metadata'

export const metadata = createPageMetadata(
  'Contact KratoLib | 24/7 Music Distribution Support | Help',
  'Get in touch with KratoLib support team. 24/7 help for music distribution, pricing, technical issues. Email: info@kratolib.com | Phone: 02717448117',
)

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col pt-16">
      <Navbar />
      <div className="flex-grow">
        <Suspense fallback={null}>
          <Contact />
        </Suspense>
      </div>
      <Footer />
    </main>
  )
}
