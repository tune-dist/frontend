import TestimonialsContent from '@/components/testimonials-page-content'
import { fetchTestimonials } from '@/lib/api/fetch-testimonials.server'
import { createPageMetadata } from '@/lib/site-metadata'

export const metadata = createPageMetadata(
  'Artist Reviews & Testimonials | Independent Musicians | KratoLib',
  'Read testimonials from 1000+ indie artists who successfully distribute music with KratoLib. Real success stories from Indian musicians and music producers.',
)

export default async function TestimonialsPage() {
  const testimonials = await fetchTestimonials()
  return <TestimonialsContent testimonials={testimonials} />
}
