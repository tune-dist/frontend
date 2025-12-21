'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Quote } from 'lucide-react'

const testimonials = [
  {
    name: 'Kirtidan Gadhvi',
    role: 'Renowned Gujarati Folk Singer',
    image: '/artists/kirtidan-gadhvi.jpg',
    quote:
      'KratoLib has made it effortless to bring my devotional and folk music to listeners across the globe. Their platform ensures my songs reach every major streaming service seamlessly, letting me focus on what I do best — creating music that connects with the soul.',
  },
  {
    name: 'Geeta Jhala',
    role: 'Celebrated Folk Artist',
    image: '/artists/geeta-jhala.jpg',
    quote:
      'Distributing music internationally used to be a complex process. With KratoLib, my traditional Gujarati folk songs now reach audiences on Spotify, Apple Music, and 150+ platforms. The transparency and reliability have made them my preferred distribution partner.',
  },
  {
    name: 'Manu Rabari',
    role: 'Acclaimed Folk Musician',
    image: '/artists/manu-rabari.jpg',
    quote:
      'As an artist dedicated to preserving our rich folk heritage, I needed a distribution partner who understands the value of authentic music. KratoLib delivers exceptional service, ensuring my work reaches fans worldwide while keeping the process simple and transparent.',
  },
]

export default function Testimonials() {
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
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="h-full border-border/50 hover:border-primary/50 transition-colors duration-300 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <Quote className="h-8 w-8 text-primary/50 mb-4" />
                  <p className="text-muted-foreground mb-6 italic">
                    "{testimonial.quote}"
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

