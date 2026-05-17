'use client'

import { motion } from 'framer-motion'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import TestiCard from '@/components/TestiCard'
import { Testimonial } from '@/lib/api/testimonials'

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

export default function TestimonialsContent() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <section className="py-20 md:py-35 relative overflow-hidden flex-grow">
        <div className="absolute top-1/4 right-0 w-full h-1/2 bg-primary/5 blur-[120px] rounded-[100%] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-violet-500/5 blur-[120px] rounded-[100%] pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-10 md:mb-16 pt-2 md:pt-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 font_heading tracking-tight">
              1000+ Artist Testimonials <br />
              <span className="animated-gradient">Why Indie Musicians Trust KratoLib</span>
            </h1>
            <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto">
              See what artists and creators around the world are saying about their experience with KratoLib.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto pb-20">
            {staticTestimonials.map((testimonial, index) => (
              <div
                key={testimonial._id || index}
              >
                <TestiCard testimonial={testimonial} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
