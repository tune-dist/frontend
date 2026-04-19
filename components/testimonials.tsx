'use client'

import { ReactNode } from "react";
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Quote } from 'lucide-react'
import { useEffect, useState } from 'react'
import { testimonialsApi, Testimonial } from '@/lib/api/testimonials'
import { S3Image } from '@/components/ui/s3-image'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'

import TestiCard from './TestiCard'

export default function Testimonials() {
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
    {
      _id: '5',
      name: 'Kirtidan Gadhvi',
      role: 'Legendary Folk Icon & Bhajan Samrat',
      quote: 'KratoLib has made it effortless to bring my devotional and folk music to listeners across the globe. Their platform ensures my songs reach every major streaming service seamlessly, letting me focus on what I do best — creating music that connects with the soul.',
      image: '/assets/images/testi-img/kirtidan-gadhvi.jpg'
    },
    {
      _id: '6',
      name: 'Geeta Jhala',
      role: 'Bollywood Playback Singer & Folk Legend',
      quote: 'Distributing music internationally used to be a complex process. With KratoLib, my traditional Gujarati folk songs now reach audiences on Spotify, Apple Music, and 150+ platforms. The transparency and reliability have made them my preferred distribution partner.',
      image: '/assets/images/testi-img/geeta-jhala.jpg'
    },
    {
      _id: '7',
      name: 'Manu Rabari',
      role: 'Iconic Lyricist, Poet & Folk Vocalist',
      quote: 'As an artist dedicated to preserving our rich folk heritage, I needed a distribution partner who understands the value of authentic music. KratoLib delivers exceptional service, ensuring my work reaches fans worldwide while keeping the process simple and transparent.',
      image: '/assets/images/testi-img/manu-rabari.jpg'
    },
    {
      _id: '8',
      name: 'Dj Kwid',
      role: 'Music Producer',
      quote: 'Kratolib is best',
      image: '/assets/images/testi-img/djkwid-pic.jpg'
    }
  ]

  /*
  const [dynamicTestimonials, setDynamicTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const data = await testimonialsApi.getAll()
        setDynamicTestimonials(data)
      } catch (error) {
        console.error('Failed to fetch testimonials:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchTestimonials()
  }, [])

  if (loading) {
    return (
      <section className="py-20 md:py-32 bg-background relative">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">Loading testimonials...</p>
        </div>
      </section>
    )
  }

  if (dynamicTestimonials.length === 0) {
    return null
  }
  */

  return (
    <section className="py-20 md:py-32 bg-background relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-4 font_heading">
            Loved by{' '}
            <span className="animated-gradient">
              Artists Worldwide
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Trusted by celebrated artists and creators who rely on KratoLib to distribute
            their music globally.
          </p>
        </motion.div>
      </div>

      <div className="relative w-full py-8 cursor-grab active:cursor-grabbing">
        <Swiper
          modules={[Autoplay, Navigation]}
          spaceBetween={25}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 4 },
          }}
          loop={true}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          speed={2000}
          navigation={true}
          className="px-12 testimonials-swiper"
        >
          {staticTestimonials.map((testimonial, idx) => (
            <SwiperSlide key={testimonial._id || idx} className="h-auto">
              <TestiCard testimonial={testimonial} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      <motion.div
        className="text-center mt-5"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <a href="/testimonials" className="animated-gradient-bg px-6 py-3 rounded-lg font-medium">View All Testimonials</a>
      </motion.div>
    </section >
  )
}

