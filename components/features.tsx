'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Globe, TrendingUp, BarChart3, Upload } from 'lucide-react'
import SpotlightCard from './SpotlightCard';
import Image from 'next/image';

const features = [
  {
    icon: Globe,
    title: 'Global Music Distribution',
    description:
      'Reach listeners worldwide across 150+ streaming platforms including Spotify, Apple Music, YouTube Music, and more.',
    image: '/assets/images/global-music-distribution-thumb.png'
  },
  {
    icon: TrendingUp,
    title: 'Real-Time Royalty Tracking',
    description:
      'Monitor your earnings in real-time with transparent reporting and instant payouts to your account.',
    image: '/assets/images/real-time-royalty-tracking-thumb.jpg'
  },
  {
    icon: BarChart3,
    title: 'Artist-Friendly Analytics',
    description:
      'Deep insights into your audience, streaming trends, and geographic distribution to grow your fanbase.',
    image: '/assets/images/artist-friendly-analytics-thumb.jpg'
  },
  {
    icon: Upload,
    title: 'Easy Upload & Release Tools',
    description:
      'Upload your tracks, set release dates, and manage your catalog all from one intuitive dashboard.',
    image: '/assets/images/easy-upload-and-release-tools.jpg'
  },
]


export default function Features() {
  return (
    <section
      id="features"
      className="py-14 md:py-24 bg-background relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-10 md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-4 font_heading">
            Everything You Need to{' '}
            <span className="animated-gradient">
              Succeed
            </span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful tools designed for independent artists to distribute, track,
            and grow their music career.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 lg:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: index * 0.2 }}
              >
                <SpotlightCard
                  className="custom-spotlight-card bg-[#07080c] !p-2 h-full border-white/10"
                  spotlightColor="rgba(132, 0, 255, 0.5)"
                >
                  <Card className="h-auto md:h-[520px] bg-transparent border-0">
                    <CardHeader className='pb-4'>
                      <CardTitle className="text-xl md:text-2xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base mb-2">
                        {feature.description}
                      </CardDescription>
                      <Image
                        src={feature.image}
                        alt={feature.title}
                        width={600}
                        height={400}
                        className="w-full h-auto mt-6 rounded-xl border border-border/20 group-hover:scale-[1.02] transition-transform duration-500 relative md:absolute left-0 bottom-0"
                      />
                    </CardContent>
                  </Card>
                </SpotlightCard>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

