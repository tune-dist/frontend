'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useAnimationFrame, useMotionValue } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { useTestimonials } from '@/lib/api/testimonials'
import TestimonialCard from './testimonial-card'

export default function Testimonials() {
  const { testimonials, loading } = useTestimonials()
  const [isPaused, setIsPaused] = useState(false)
  const x = useMotionValue(0)
  const contentRef = useRef<HTMLDivElement>(null)
  const [contentWidth, setContentWidth] = useState(0)

  useEffect(() => {
    const updateWidth = () => {
      if (contentRef.current && contentRef.current.children.length > testimonials.length && testimonials.length > 0) {
        const firstCard = contentRef.current.children[0] as HTMLElement
        const middleCard = contentRef.current.children[testimonials.length] as HTMLElement
        if (firstCard && middleCard) {
          setContentWidth(middleCard.offsetLeft - firstCard.offsetLeft)
        }
      }
    }
    updateWidth()
    const timer = setTimeout(updateWidth, 500)
    window.addEventListener('resize', updateWidth)
    return () => {
      window.removeEventListener('resize', updateWidth)
      clearTimeout(timer)
    }
  }, [testimonials])

  useAnimationFrame((t, delta) => {
    if (isPaused || contentWidth <= 0) return

    const moveBy = -0.5 * (delta / 16)
    let newX = x.get() + moveBy

    if (newX <= -contentWidth) {
      newX += contentWidth
    } else if (newX > 0) {
      newX -= contentWidth
    }
    x.set(newX)
  })

  const handleDrag = (event: unknown, info: { delta: { x: number } }) => {
    if (contentWidth <= 0) return
    let newX = x.get() + info.delta.x
    if (newX <= -contentWidth) newX += contentWidth
    if (newX > 0) newX -= contentWidth
    x.set(newX)
  }

  if (loading) {
    return (
      <section className="py-14 md:py-24 bg-background relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </section>
    )
  }

  if (testimonials.length === 0) {
    return null
  }

  const TestimonialList = () => (
    <>
      {testimonials.map((testimonial) => (
        <div
          key={testimonial._id}
          className="w-[calc(100vw-48px)] sm:w-[350px] md:w-[400px] shrink-0 px-2"
        >
          <TestimonialCard testimonial={testimonial} />
        </div>
      ))}
    </>
  )

  return (
    <section className="py-14 md:py-24 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-4 md:mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 font_heading">
            Loved by{' '}
            <span className="animated-gradient">
              Artists Worldwide
            </span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Trusted by celebrated artists and creators who rely on KratoLib to distribute
            their music globally.
          </p>
        </motion.div>
      </div>

      <div
        className="relative w-full py-8 overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        <motion.div
          ref={contentRef}
          className="flex w-max"
          style={{ x }}
          drag="x"
          onDragStart={() => setIsPaused(true)}
          onDragEnd={() => setIsPaused(false)}
          onDrag={handleDrag}
        >
          <TestimonialList />
          <TestimonialList />
        </motion.div>
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
    </section>
  )
}
