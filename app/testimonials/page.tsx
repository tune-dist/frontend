'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import TestiCard from '@/components/TestiCard'
import { testimonialsApi, Testimonial } from '@/lib/api/testimonials'
import { Loader2 } from 'lucide-react'

export default function TestimonialsPage() {
  const staticTestimonials: Testimonial[] = [
    {
      _id: '1',
      name: 'Kirtidan Gadhvi',
      role: 'Legendary Folk Icon & Bhajan Samrat',
      quote: 'KratoLib has made it effortless to bring my devotional and folk music to listeners across the globe. Their platform ensures my songs reach every major streaming service seamlessly, letting me focus on what I do best — creating music that connects with the soul.',
      image: '/assets/images/testi-img/kirtidan-gadhvi.jpg'
    },
    {
      _id: '2',
      name: 'Geeta Jhala',
      role: 'Bollywood Playback Singer & Folk Legend',
      quote: 'Distributing music internationally used to be a complex process. With KratoLib, my traditional Gujarati folk songs now reach audiences on Spotify, Apple Music, and 150+ platforms. The transparency and reliability have made them my preferred distribution partner.',
      image: '/assets/images/testi-img/geeta-jhala.jpg'
    },
    {
      _id: '3',
      name: 'Manu Rabari',
      role: 'Iconic Lyricist, Poet & Folk Vocalist',
      quote: 'As an artist dedicated to preserving our rich folk heritage, I needed a distribution partner who understands the value of authentic music. KratoLib delivers exceptional service, ensuring my work reaches fans worldwide while keeping the process simple and transparent.',
      image: '/assets/images/testi-img/manu-rabari.jpg'
    },
    {
      _id: '4',
      name: 'Dj Kwid',
      role: 'Music Producer',
      quote: 'Kratolib is best',
      image: '/assets/images/testi-img/djkwid-pic.jpg'
    },
  ]

  /*
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const data = await testimonialsApi.getAll()
        setTestimonials(data)
      } catch (error) {
        console.error('Failed to fetch testimonials:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchTestimonials()
  }, [])
  */

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <section className="py-20 md:py-35 relative overflow-hidden flex-grow">
        {/* Decorative background elements */}
        <div className="absolute top-1/4 right-0 w-full h-1/2 bg-primary/5 blur-[120px] rounded-[100%] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-violet-500/5 blur-[120px] rounded-[100%] pointer-events-none" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="text-center mb-16 pt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font_heading leading-tight">
              Voices of the <br />
              <span className="animated-gradient">Global Community</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              See what artists and creators around the world are saying about their experience with KratoLib.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto pb-20">
            {staticTestimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial._id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <TestiCard testimonial={testimonial} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
