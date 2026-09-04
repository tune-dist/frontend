'use client'

import { Suspense } from 'react'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import Contact from '@/components/contact'

export default function ContactContent() {
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
