import type { Metadata } from 'next'
import TestimonialsContent from '@/components/TestimonialsContent'

export const metadata: Metadata = {
  title: 'Artist Reviews & Testimonials | Independent Musicians | KratoLib',
  description: 'Read testimonials from 1000+ indie artists who successfully distribute music with KratoLib. Real success stories from Indian musicians and music producers.',
  openGraph: {
    title: 'Artist Reviews & Testimonials | Independent Musicians | KratoLib',
    description: 'Read testimonials from 1000+ indie artists who successfully distribute music with KratoLib. Real success stories from Indian musicians and music producers.',
  },
  twitter: {
    title: 'Artist Reviews & Testimonials | Independent Musicians | KratoLib',
    description: 'Read testimonials from 1000+ indie artists who successfully distribute music with KratoLib. Real success stories from Indian musicians and music producers.',
  },
}

export default function TestimonialsPage() {
  return <TestimonialsContent />
}
