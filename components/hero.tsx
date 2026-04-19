'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowRight, Play } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

import LogoLoop from './LogoLoop';
import heroBanner from '@/public/assets/images/hero-banner-thumb.png';

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


      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center w-full min-h-[70vh] pb-24 md:pb-32 pt-20 lg:pt-0">
          {/* Left Side: Text */}
          <motion.div
            className="text-left flex flex-col justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[50px] font-semibold mb-6 leading-tight">
              <span className="block font_heading">Distribute Your Music.</span>
              <span className="mt-2 font_heading">Grow Your Audience.</span> {' '}
              <span className="mt-2 animated-gradient font_heading">
                Get Paid.
              </span>
            </h1>

            <motion.p
              className="text-lg sm:text-lg md:text-lg text-muted-foreground mb-8 max-w-xl leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              KratoLib empowers independent artists to release their music to
              Spotify, Apple Music, YouTube, and 150+ platforms — all from one
              dashboard.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-start items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Link href="/contact">
                <Button className="text-sm px-6 py-6 group animated-gradient-bg text-white border-0">
                  Start for Free
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/features">
                <Button
                  variant="outline"
                  className="text-sm px-6 py-6 group hover:bg-white hover:text-black transition-colors"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Learn More
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Side: Image */}
          <motion.div
            className="relative flex justify-center items-center w-full mt-12 lg:mt-0"
            initial={{ opacity: 0, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <div className="relative w-full max-w-[500px] aspect-square flex items-center justify-center">
              {/* Optional Subtle Glow Behind Image */}
              {/* <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full pointer-events-none" /> */}
              <motion.div
                className="relative w-full h-full"
              // animate={{ y: [0, -15, 0] }}
              // transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              >
                <Image
                  src={heroBanner}
                  alt="Distribute Your Music Globally"
                  fill
                  priority
                  className="object-contain relative z-10 drop-shadow-2xl"
                />
              </motion.div>
            </div>
          </motion.div>
        </div>
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
        <LogoLoop
          logos={imageLogos}
          speed={80}
          direction="left"
          logoHeight={40}
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
      <div className='hero_bg_gredient'></div>
    </section>
  )
}

