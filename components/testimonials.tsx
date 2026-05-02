'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, useAnimationFrame, useMotionValue } from 'framer-motion'
import { testimonialsApi, Testimonial } from '@/lib/api/testimonials'
import { S3Image } from '@/components/ui/s3-image'
import TestiCard from './TestiCard'

import KirtidanGadhviImg from '@/public/assets/images/testi-img/kirtidan-gadhvi.jpg'
import GeetaJhalaImg from '@/public/assets/images/testi-img/geeta-jhala.jpg'
import ManuRabariImg from '@/public/assets/images/testi-img/manu-rabari.jpg'
import DjKwidImg from '@/public/assets/images/testi-img/djkwid-pic.jpg'
import GauravDholaImg from '@/public/assets/images/testi-img/gaurav-dhola-pic.jpg'
import TwinklePatelImg from '@/public/assets/images/testi-img/twinkle-patel-pic.jpg'
import PratishthaWaghelaImg from '@/public/assets/images/testi-img/pratishtha-waghela-pic.jpg'
import HerryNakumImg from '@/public/assets/images/testi-img/herry-nakum-pic.jpg'
import VivekRaoImg from '@/public/assets/images/testi-img/vivek-rao-pic.jpg'
import KishanRavalImg from '@/public/assets/images/testi-img/kishan-raval-pic.jpg'
import SunilThakorImg from '@/public/assets/images/testi-img/sunil-thakor-pic.jpg'
import MeetJainImg from '@/public/assets/images/testi-img/meet-jain-pic.jpg'

export default function Testimonials() {
  const staticTestimonials: Testimonial[] = [
    {
      _id: '1',
      name: 'Kirtidan Gadhvi',
      role: 'Legendary Folk Icon & Bhajan Samrat',
      quote: 'KratoLib has made it effortless to bring my devotional and folk music to listeners across the globe. Their platform ensures my songs reach every major streaming service seamlessly, letting me focus on what I do best — creating music that connects with the soul.',
      image: KirtidanGadhviImg.src
    },
    {
      _id: '2',
      name: 'Geeta Jhala',
      role: 'Bollywood Playback Singer & Folk Legend',
      quote: 'Distributing music internationally used to be a complex process. With KratoLib, my traditional Gujarati folk songs now reach audiences on Spotify, Apple Music, and 150+ platforms. The transparency and reliability have made them my preferred distribution partner.',
      image: GeetaJhalaImg.src
    },
    {
      _id: '3',
      name: 'Manu Rabari',
      role: 'Iconic Lyricist, Poet & Folk Vocalist',
      quote: 'As an artist dedicated to preserving our rich folk heritage, I needed a distribution partner who understands the value of authentic music. KratoLib delivers exceptional service, ensuring my work reaches fans worldwide while keeping the process simple and transparent.',
      image: ManuRabariImg.src
    },
    {
      _id: '4',
      name: 'Dj Kwid',
      role: 'Music Producer',
      quote: 'KratoLib has helped me take my sound to a global audience with ease. Their fast delivery, smooth release process, and professional support allow me to focus completely on creating quality music.',
      image: DjKwidImg.src
    },
    {
      _id: '5',
      name: 'Gaurav Dhola',
      role: 'Singer & Music Composer',
      quote: 'As both a singer and composer, I value platforms that respect creativity and efficiency. KratoLib has given me the confidence that every release reaches listeners worldwide without complications.',
      image: GauravDholaImg.src
    },
    {
      _id: '6',
      name: 'Twinkle Patel',
      role: 'Music Label Owner & Actor',
      quote: 'Managing music releases requires trust and consistency. KratoLib has been a dependable partner, making digital distribution simple, transparent, and effective for every project.',
      image: TwinklePatelImg.src
    },
    {
      _id: '7',
      name: 'Pratishtha Waghela',
      role: 'Singer & Writer',
      quote: 'For an artist, every song carries emotion and meaning. KratoLib ensures my music reaches the right audience globally while making the release journey smooth and stress-free.',
      image: PratishthaWaghelaImg.src
    },
    {
      _id: '8',
      name: 'Herry Nakum',
      role: 'Singer',
      quote: 'KratoLib has made music distribution easy and reliable for me. Their professional system ensures my songs are available on all major platforms, helping me grow my audience every day.',
      image: HerryNakumImg.src
    },
    {
      _id: '9',
      name: 'Vivek Rao',
      role: 'Singer & Music Composer',
      quote: 'KratoLib understands the needs of modern artists. Their quick support, easy uploads, and wide platform reach make them an ideal partner for every independent musician.',
      image: VivekRaoImg.src
    },
    {
      _id: '10',
      name: 'Kishan Raval',
      role: 'Singer & Music Composer',
      quote: 'Releasing music should be exciting, not stressful. KratoLib has simplified the entire process for me and helped my songs connect with listeners across the world.',
      image: KishanRavalImg.src
    },
    {
      _id: '11',
      name: 'Sunil Thakor',
      role: 'Label Owner & Music Composer',
      quote: 'As a label owner, I need a distributor I can trust. KratoLib delivers professionalism, timely releases, and complete transparency, making them a valuable partner for our catalog.',
      image: SunilThakorImg.src
    },
    {
      _id: '12',
      name: 'Meet Jain',
      role: 'Singer',
      quote: 'KratoLib has provided me with the perfect platform to share my music globally. Their easy process and strong network of streaming platforms have helped my songs reach more listeners than ever before.',
      image: MeetJainImg.src
    },
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
  const [isPaused, setIsPaused] = useState(false);
  const x = useMotionValue(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentWidth, setContentWidth] = useState(0);

  useEffect(() => {
    const updateWidth = () => {
      if (contentRef.current && contentRef.current.children.length > staticTestimonials.length) {
        const firstCard = contentRef.current.children[0] as HTMLElement;
        const middleCard = contentRef.current.children[staticTestimonials.length] as HTMLElement;
        if (firstCard && middleCard) {
          setContentWidth(middleCard.offsetLeft - firstCard.offsetLeft);
        }
      }
    };
    updateWidth();
    const timer = setTimeout(updateWidth, 500);
    window.addEventListener('resize', updateWidth);
    return () => {
      window.removeEventListener('resize', updateWidth);
      clearTimeout(timer);
    };
  }, []);

  useAnimationFrame((t, delta) => {
    if (isPaused) return;

    const moveBy = -0.5 * (delta / 16);
    let newX = x.get() + moveBy;

    if (newX <= -contentWidth) {
      newX += contentWidth;
    } else if (newX > 0) {
      newX -= contentWidth;
    }
    x.set(newX);
  });

  const handleDrag = (event: any, info: any) => {
    let newX = x.get() + info.delta.x;
    if (newX <= -contentWidth) newX += contentWidth;
    if (newX > 0) newX -= contentWidth;
    x.set(newX);
  };

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
          className="flex gap-4 w-max"
          style={{ x }}
          drag="x"
          onDragStart={() => setIsPaused(true)}
          onDragEnd={() => setIsPaused(false)}
          onDrag={handleDrag}
        >
          {/* Render cards twice for a seamless infinite loop */}
          {[...staticTestimonials].map((testimonial, idx) => (
            <div
              key={idx}
              className="w-[280px] sm:w-[350px] md:w-[400px] shrink-0"
            >
              <TestiCard testimonial={testimonial} />
            </div>
          ))}
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
    </section >
  )
}

