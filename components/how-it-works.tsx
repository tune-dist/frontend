'use client'

import { motion } from 'framer-motion'
import { Upload, Music, DollarSign } from 'lucide-react'

const steps = [
  {
    number: '01',
    icon: Upload,
    title: 'Upload Your Track',
    description:
      'Simply upload your music files, artwork, and metadata. Our platform supports all major audio formats.',
  },
  {
    number: '02',
    icon: Music,
    title: 'Choose Your Platforms',
    description:
      'Select from 100+ streaming platforms where you want your music distributed. Set release dates and territories.',
  },
  {
    number: '03',
    icon: DollarSign,
    title: 'Get Your Royalties',
    description:
      'Track your streams, monitor earnings in real-time, and receive payments directly to your account.',
  },
]

export default function HowItWorks() {
  return (
    <section className="py-20 md:py-32 bg-muted/30 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            How It{' '}
            <span className="animated-gradient">
              Works
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get your music out there in three simple steps.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative">
          {/* Connection Line for Desktop */}
          <div className="hidden md:block absolute top-24 left-0 right-0 h-0.5 animated-gradient-bg opacity-30" />

          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <motion.div
                key={step.number}
                className="relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <div className="flex flex-col items-center text-center">
                  {/* Step Number */}
                  <div className="relative mb-6 w-24 h-24 flex items-center justify-center">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
                    <div className="relative w-20 h-20 rounded-full animated-gradient-bg flex items-center justify-center border-4 border-background shadow-lg z-10">
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute -top-3 -right-3 text-3xl font-bold animated-gradient opacity-80 z-20">
                      {step.number}
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground max-w-xs mx-auto">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

