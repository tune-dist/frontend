'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Quote } from 'lucide-react'

const testimonials = [
  {
    name: 'Alex Rivera',
    role: 'Independent Producer',
    image: '👤',
    quote:
      'TuneFlow changed my career. I went from struggling to get my music heard to reaching thousands of listeners worldwide. The analytics are incredible!',
  },
  {
    name: 'Maya Chen',
    role: 'Singer-Songwriter',
    image: '👤',
    quote:
      'The easiest distribution platform I\'ve used. Upload, distribute, and get paid — it\'s that simple. My royalties arrive on time, every time.',
  },
  {
    name: 'Jordan Taylor',
    role: 'Electronic Artist',
    image: '👤',
    quote:
      'Finally, a platform that actually cares about independent artists. The real-time tracking and transparent reporting help me make informed decisions.',
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
            Join thousands of independent artists who trust TuneFlow to distribute
            their music.
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
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-2xl">
                      {testimonial.image}
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

