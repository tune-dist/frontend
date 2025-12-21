'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Globe, TrendingUp, BarChart3, Upload } from 'lucide-react'

const features = [
  {
    icon: Globe,
    title: 'Global Music Distribution',
    description:
      'Reach listeners worldwide across 150+ streaming platforms including Spotify, Apple Music, YouTube Music, and more.',
  },
  {
    icon: TrendingUp,
    title: 'Real-Time Royalty Tracking',
    description:
      'Monitor your earnings in real-time with transparent reporting and instant payouts to your account.',
  },
  {
    icon: BarChart3,
    title: 'Artist-Friendly Analytics',
    description:
      'Deep insights into your audience, streaming trends, and geographic distribution to grow your fanbase.',
  },
  {
    icon: Upload,
    title: 'Easy Upload & Release Tools',
    description:
      'Upload your tracks, set release dates, and manage your catalog all from one intuitive dashboard.',
  },
]

export default function Features() {
  return (
    <section
      id="features"
      className="py-20 md:py-32 bg-background relative"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Everything You Need to{' '}
            <span className="animated-gradient">
              Succeed
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful tools designed for independent artists to distribute, track,
            and grow their music career.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full border-border/50 hover:border-primary/50 transition-colors duration-300 bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

