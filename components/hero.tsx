'use client'

import { motion } from 'framer-motion'
import { useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight, Play, Music2, Music, Youtube, Instagram, DollarSign, Copyright, Diamond } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

import LogoLoop from './LogoLoop';

import YoutubeCircleIcon from "@/public/assets/images/youtube-circle-logo.png";
import SpotifyCircleIcon from "@/public/assets/images/spotify-circle-logo.png";
import InstagramCircleIcon from "@/public/assets/images/instagram-circle-logo.png";
import AmazonMusicCircleIcon from "@/public/assets/images/amazon-music-circle-logo.png";
import AppleMusicCircleIcon from "@/public/assets/images/apple-music-circle-icon.png";
import TiktokCircleIcon from "@/public/assets/images/tiktok-circle-logo.png";
import JioSaavnCircleIcon from "@/public/assets/images/jiosavan-circle-icon.png";
import FacebookCircleIcon from "@/public/assets/images/facebook-circle-logo.png";
import GannaCircleIcon from "@/public/assets/images/ganna-circle-logo.png";
import SnapCircleIcon from "@/public/assets/images/snap-circle-logo.png";

// --- Orbital Animation Components ---

const Orbit = ({ radius, speed, delay = 0, children }: { radius: number, speed: number, delay?: number, children: React.ReactNode }) => (
  <motion.div
    className="absolute rounded-full border border-white/10 z-30"
    style={{
      width: radius * 2,
      height: radius * 2,
    }}
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{
      duration: 2.5,
      delay,
      ease: [0.16, 1, 0.3, 1],
      rotate: { duration: speed, repeat: Infinity, ease: "linear" }
    }}
  >
    <motion.div
      className="w-full h-full"
      animate={{ rotate: 360 }}
      transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
    >
      {children}
    </motion.div>
  </motion.div>
);

const OrbitIcon = ({ angle, radius, color, icon: Icon, size = 48, orbitSpeed, delay = 0, alt = '' }: { angle: number, radius: number, color: string, icon: any, size?: number, orbitSpeed: number, delay?: number, alt?: string }) => {
  const x = radius * Math.cos((angle * Math.PI) / 180);
  const y = radius * Math.sin((angle * Math.PI) / 180);

  return (
    <motion.div
      className="absolute flex items-center justify-center rounded-full shadow-lg border border-white/20"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        left: `calc(50% + ${x}px - ${size / 2}px)`,
        top: `calc(50% + ${y}px - ${size / 2}px)`,
      }}
      initial={{ x: -x, y: -y, scale: 0, opacity: 0 }}
      animate={{ x: 0, y: 0, scale: 1, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 40,
        damping: 20,
        mass: 1.2,
        delay,
        rotate: { duration: orbitSpeed, repeat: Infinity, ease: "linear" }
      }}
    >
      <motion.div
        className="w-full h-full flex items-center justify-center"
        animate={{ rotate: -360 }} // Counter-rotate to stay upright
        transition={{ duration: orbitSpeed, repeat: Infinity, ease: "linear" }}
      >
        {typeof Icon === 'string' || (typeof Icon === 'object' && Icon?.src) ? (
          <Image
            src={Icon}
            alt={alt}
            className="w-full h-full object-contain"
          />
        ) : (
          <Icon className="text-white w-1/2 h-1/2" />
        )}
      </motion.div>
    </motion.div>
  );
};

const OrbitalAnimation = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay was prevented — silently ignore
      });
    }
  }, []);

  return (
    <div className="relative w-full aspect-square flex items-center justify-center max-w-[500px] mx-auto scale-75 sm:scale-90 lg:scale-100">
      {/* Central Logo */}
      <motion.div
        className="relative z-20 w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-transparent flex items-center justify-center shadow-[0_0_50px_rgba(132,0,215,0.6)] overflow-hidden"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* <Music2 className="text-white w-1/2 h-1/2" /> */}
        {/* <img src="/logo.png" alt="" className='w-full h-full object-contain p-4' /> */}
        <video
          ref={videoRef}
          src="/assets/images/globe-krato-hero.MP4"
          autoPlay
          loop
          muted
          playsInline
          disablePictureInPicture
          disableRemotePlayback
          className="w-full h-full object-cover scale-[1.28] pointer-events-none"
        />
        {/* Subtle glow rings */}
        <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-ping opacity-20" />
      </motion.div>

      {/* Orbit 1: Inner */}
      <Orbit radius={80} speed={40} delay={0.6}>
        <OrbitIcon angle={90} radius={80} color="#ffb700ff" icon={SnapCircleIcon} size={40} orbitSpeed={40} delay={0.9} alt="Snapchat music distribution" />
        <OrbitIcon angle={270} radius={80} color="#e03607ff" icon={GannaCircleIcon} size={40} orbitSpeed={40} delay={0.9} alt="Gaana music streaming platform" />
      </Orbit>

      {/* Orbit 2: Middle */}
      <Orbit radius={140} speed={60} delay={1.2}>
        <OrbitIcon angle={0} radius={140} color="#FC3C44" icon={AppleMusicCircleIcon} size={50} orbitSpeed={60} delay={1.5} alt="Apple Music distribution" />
        <OrbitIcon angle={120} radius={140} color="#000000" icon={TiktokCircleIcon} size={50} orbitSpeed={60} delay={1.5} alt="TikTok music distribution" />
        <OrbitIcon angle={240} radius={140} color="#10B981" icon={JioSaavnCircleIcon} size={50} orbitSpeed={60} delay={1.5} alt="JioSaavn music streaming" />
      </Orbit>

      {/* Orbit 3: Outer */}
      <Orbit radius={210} speed={90} delay={1.8}>
        <OrbitIcon angle={0} radius={210} color="#FF0000" icon={YoutubeCircleIcon} size={65} orbitSpeed={90} delay={2.1} alt="YouTube Music distribution" />
        <OrbitIcon angle={72} radius={210} color="#E4405F" icon={InstagramCircleIcon} size={65} orbitSpeed={90} delay={2.1} alt="Instagram music distribution" />
        <OrbitIcon angle={144} radius={210} color="#1DB954" icon={SpotifyCircleIcon} size={65} orbitSpeed={90} delay={2.1} alt="Spotify music distribution" />
        <OrbitIcon angle={216} radius={210} color="#00A8E1" icon={FacebookCircleIcon} size={65} orbitSpeed={90} delay={2.1} alt="Facebook music distribution" />
        <OrbitIcon angle={288} radius={210} color="#000" icon={AmazonMusicCircleIcon} size={65} orbitSpeed={90} delay={2.1} alt="Amazon Music distribution" />
      </Orbit>
    </div>
  );
};

export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex-col md:flex-row flex items-center justify-center overflow-hidden"
    >
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-8 items-center w-full min-h-[70vh] pb-16 md:pb-32 pt-24 lg:pt-0">
          {/* Left Side: Text */}
          <motion.div
            className="text-left flex flex-col justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl sm:text-3xl md:text-6xl lg:text-[50px] font-semibold mb-6 leading-tight">
              <span className="block font_heading">Distribute Your Music.</span>
              <span className="mt-2 font_heading">Grow Your Audience.</span> {' '}
              <span className="mt-2 animated-gradient font_heading">
                Get Paid.
              </span>
            </h1>

            <motion.p
              className="text-base sm:text-base md:text-lg text-muted-foreground mb-8 max-w-xl leading-relaxed"
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
              <Link href="/contact" className=' w-full sm:w-auto'>
                <Button className="text-sm w-full sm:w-auto px-6 py-6 group animated-gradient-bg text-white border-0">
                  Start for Free
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/features" className=' w-full sm:w-auto'>
                <Button
                  variant="outline"
                  className="text-sm w-full sm:w-auto px-6 py-6 group hover:bg-white hover:text-black transition-colors"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Learn More
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            className="relative flex justify-center items-center w-full mt-6 lg:mt-0"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <OrbitalAnimation />
          </motion.div>
        </div>
      </div>

      {/* Platform Carousel - Full Width */}
      <motion.div
        className="relative md:absolute bottom-0 md:bottom-16 left-0 right-0 w-screen overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <p className="text-sm text-muted-foreground mb-6 uppercase tracking-wider text-center">
          Distribute to 150+ platforms including
        </p>
        <LogoLoop
          speed={80}
          logoHeight={20}
          gap={45}
        />
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer scroll_indicator"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Link href="#features">
          <div className="w-6 h-10 border-2 border-foreground/30 rounded-full flex justify-center hover:border-primary/50 transition-colors">
            <div className="w-1 h-3 bg-foreground/50 rounded-full mt-2" />
          </div>
        </Link>
      </motion.div>
      <div className='hero_bg_gredient'></div>
    </section>
  )
}
