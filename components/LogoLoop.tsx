'use client'

import React from 'react'
import Image from 'next/image'

// Import all platform logos
import AmazonLogo from '@/public/assets/images/platform-img/amazon-logo.png'
import AnghamiLogo from '@/public/assets/images/platform-img/anghami-logo.png'
import AppleMusicLogo from '@/public/assets/images/platform-img/apple-music-logo.png'
import AudibleMagicLogo from '@/public/assets/images/platform-img/audible-magic-logo.png'
import AudiomackLogo from '@/public/assets/images/platform-img/audiomack-logo.png'
import AwaLogo from '@/public/assets/images/platform-img/awa-logo.png'
import BoomplayLogo from '@/public/assets/images/platform-img/boomplay-logo.png'
import DeezerLogo from '@/public/assets/images/platform-img/deezer-logo.png'
import FacebookLogo from '@/public/assets/images/platform-img/facebook-logo.png'
import GaanaLogo from '@/public/assets/images/platform-img/gaana-logo.png'
import IheartLogo from '@/public/assets/images/platform-img/iheart-logo.png'
import InstagramLogo from '@/public/assets/images/platform-img/instagram-logo.png'
import ITunesLogo from '@/public/assets/images/platform-img/itunes-logo.png'
import JaxstaLogo from '@/public/assets/images/platform-img/jaxsta-logo.png'
import JioSaavnLogo from '@/public/assets/images/platform-img/jiosaavan-logo.png'
import JooxLogo from '@/public/assets/images/platform-img/joox-logo.png'
import KkboxLogo from '@/public/assets/images/platform-img/kkbox-logo.png'
import MixcloudLogo from '@/public/assets/images/platform-img/mixcloud-logo.png'
import NapsterLogo from '@/public/assets/images/platform-img/napster-logo.png'
import NeteaseLogo from '@/public/assets/images/platform-img/netease-logo.png'
import PandoraLogo from '@/public/assets/images/platform-img/pandora-logo.png'
import RhythmLogo from '@/public/assets/images/platform-img/rhythm-logo.png'
import SnapchatLogo from '@/public/assets/images/platform-img/snapchat-logo.png'
import SoundcloudLogo from '@/public/assets/images/platform-img/soundcloud-logo.png'
import SpotifyLogo from '@/public/assets/images/platform-img/spotify-logo.png'
import TencentLogo from '@/public/assets/images/platform-img/tencent-logo.png'
import TidalLogo from '@/public/assets/images/platform-img/tidal-logo.png'
import TiktokLogo from '@/public/assets/images/platform-img/tiktok-logo.png'
import WhatsappLogo from '@/public/assets/images/platform-img/whatsapp-logo.png'
import YoutubeMusicLogo from '@/public/assets/images/platform-img/youtube-music-logo.png'

export interface LogoItem {
  src: any;
  alt: string;
}

export interface LogoLoopProps {
  speed?: number;
  className?: string;
  logoHeight?: number;
  gap?: number;
}

const DEFAULT_LOGOS: LogoItem[] = [
  { src: SpotifyLogo, alt: 'Spotify' },
  { src: YoutubeMusicLogo, alt: 'YouTube Music' },
  { src: AppleMusicLogo, alt: 'Apple Music' },
  { src: AmazonLogo, alt: 'Amazon Music' },
  { src: JioSaavnLogo, alt: 'JioSaavn' },
  { src: GaanaLogo, alt: 'Gaana' },
  { src: SoundcloudLogo, alt: 'Soundcloud' },
  { src: TidalLogo, alt: 'Tidal' },
  { src: DeezerLogo, alt: 'Deezer' },
  { src: NapsterLogo, alt: 'Napster' },
  { src: PandoraLogo, alt: 'Pandora' },
  { src: InstagramLogo, alt: 'Instagram' },
  { src: FacebookLogo, alt: 'Facebook' },
  { src: TiktokLogo, alt: 'TikTok' },
  { src: SnapchatLogo, alt: 'Snapchat' },
  { src: WhatsappLogo, alt: 'WhatsApp' },
  { src: AnghamiLogo, alt: 'Anghami' },
  { src: BoomplayLogo, alt: 'Boomplay' },
  { src: AudiomackLogo, alt: 'Audiomack' },
  { src: IheartLogo, alt: 'iHeartRadio' },
  { src: NeteaseLogo, alt: 'NetEase' },
  { src: TencentLogo, alt: 'Tencent' },
  { src: JooxLogo, alt: 'Joox' },
  { src: KkboxLogo, alt: 'KKBox' },
  { src: AwaLogo, alt: 'AWA' },
  { src: MixcloudLogo, alt: 'Mixcloud' },
  { src: JaxstaLogo, alt: 'Jaxsta' },
  { src: RhythmLogo, alt: 'Rhythm' },
  { src: AudibleMagicLogo, alt: 'Audible Magic' },
  { src: ITunesLogo, alt: 'iTunes' },
]

export const LogoLoop: React.FC<LogoLoopProps> = ({
  speed = 40,
  className = '',
  logoHeight = 40,
  gap = 20,
}) => {
  // Duplicate logos to ensure seamless looping
  const duplicatedLogos = [...DEFAULT_LOGOS]

  return (
    <div
      className={`relative w-full overflow-hidden ${className}`}
      style={{
        maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
      }}
    >
      <div className="flex w-max">
        <ul
          className="flex items-center animate-marquee"
          style={{
            gap: `${gap}px`,
            animationDuration: `${speed}s`,
            willChange: 'transform',
          }}
        >
          {duplicatedLogos.map((logo, index) => (
            <li
              key={`${logo.alt}-${index}`}
              className="flex-shrink-0 flex items-center justify-center grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
            >
              <Image
                src={logo.src}
                alt={logo.alt}
                height={logoHeight}
                width={120}
                style={{ width: 'auto', height: logoHeight }}
                className="w-auto"
                priority={index < 6}
              />
            </li>
          ))}
        </ul>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee linear infinite;
        }
      `}</style>
    </div>
  )
}

export default LogoLoop
