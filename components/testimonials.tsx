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

        <div className="relative w-full max-w-7xl mx-auto py-8 cursor-grab active:cursor-grabbing">
          <Swiper
            modules={[Autoplay, Navigation]}
            spaceBetween={24}
            slidesPerView={1}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            loop={true}
            autoplay={{
              delay: 3500,
              disableOnInteraction: false,
            }}
            navigation={true}
            className="px-12 testimonials-swiper"
          >
            {dynamicTestimonials.map((testimonial, idx) => (
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
      </div>
    </section >
  )
}

