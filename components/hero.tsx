'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowRight, Play } from 'lucide-react'
import Link from 'next/link'
import PlatformCarousel from './platform-carousel'

import FloatingLines from './FloatingLines';
import LogoLoop from './LogoLoop';

export default function Hero() {
  const imageLogos = [
    { src: "https://cdn.prod.website-files.com/66a2518ff5fcac851841fbe7/66af509ce30b267f537d7dbc_jio.webp", alt: "Company 1", href: "https://company1.com" },
    { src: "https://cdn.prod.website-files.com/66a2518ff5fcac851841fbe7/66af509c531437b23665284c_deezer.webp", alt: "Company 1", href: "https://company1.com" },
  ];
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Animated Gradient Background */}
      {/* <div className="absolute inset-0 bg-background">
        <div className="absolute inset-0 animated-gradient-bg opacity-10" />
      </div> */}

      {/* Floating Elements */}
      {/* <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 animated-gradient-bg rounded-full blur-3xl opacity-30"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 animated-gradient-bg rounded-full blur-3xl opacity-30"
          animate={{
            x: [0, -100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div> */}
      <div className="absolute inset-0">
        <FloatingLines
          enabledWaves={["top", "middle", "bottom"]}
          // Array - specify line count per wave; Number - same count for all waves
          lineCount={5}
          // Array - specify line distance per wave; Number - same distance for all waves
          lineDistance={5}
          bendRadius={5}
          bendStrength={-0.5}
          interactive={true}
          parallax={true}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl font-bold mb-6 leading-tight">
            <span className="block">Distribute Your Music.</span>
            <span className="block mt-2">Grow Your Audience.</span>
            <span className="block mt-2 animated-gradient">
              Get Paid.
            </span>
          </h1>

          <motion.p
            className="text-lg sm:text-xl md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            KratoLib empowers independent artists to release their music to
            Spotify, Apple Music, YouTube, and 150+ platforms — all from one
            dashboard.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-24"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link href="/auth">
              <Button size="lg" className="text-lg px-8 py-6 group">
                Start for Free
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 group"
            >
              <Play className="mr-2 h-5 w-5" />
              Learn More
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Platform Carousel - Full Width */}
      <motion.div
        className="absolute bottom-16 left-0 right-0 w-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <p className="text-sm text-muted-foreground mb-6 uppercase tracking-wider text-center">
          Distribute to 150+ platforms including
        </p>
        {/* <PlatformCarousel /> */}
        <LogoLoop
          logos={imageLogos}
          speed={80}
          direction="left"
          logoHeight={60}
          gap={60}
          hoverSpeed={0}
          scaleOnHover
          fadeOut
          fadeOutColor="transparent"
          ariaLabel="Technology partners"
        />
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-foreground/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-foreground/50 rounded-full mt-2" />
        </div>
      </motion.div>
    </section>
  )
}

