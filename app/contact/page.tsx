'use client'

import { motion } from 'framer-motion'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import Contact from '@/components/contact'

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col pt-16">
      <Navbar />
      <div className="flex-grow">
          <Contact />
      </div>
      <Footer />
    </main>
  )
}
