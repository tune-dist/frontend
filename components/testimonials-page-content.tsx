'use client'

import { Loader2 } from 'lucide-react'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import TestimonialCard from '@/components/testimonial-card'
import { useTestimonials } from '@/lib/api/testimonials'

export default function TestimonialsContent() {
  const { testimonials, loading } = useTestimonials()

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <section className="py-20 md:py-35 relative overflow-hidden flex-grow">
        <div className="absolute top-1/4 right-0 w-full h-1/2 bg-primary/5 blur-[120px] rounded-[100%] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-violet-500/5 blur-[120px] rounded-[100%] pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-10 md:mb-16 pt-2 md:pt-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 font_heading tracking-tight">
              Artist Testimonials <br />
              <span className="animated-gradient">Why Indie Musicians Trust KratoLib</span>
            </h1>
            <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto">
              See what artists and creators around the world are saying about their experience with KratoLib.
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : testimonials.length === 0 ? (
            <div className="text-center py-24 text-muted-foreground">
              <p className="text-lg">No testimonials available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto pb-20">
              {testimonials.map((testimonial) => (
                <div key={testimonial._id}>
                  <TestimonialCard testimonial={testimonial} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
