'use client'

import { motion } from 'framer-motion'

// Platform logos with CDN links
const platforms = [
    { name: 'JioSaavn', logo: 'https://cdn.prod.website-files.com/66a2518ff5fcac851841fbe7/66af509ce30b267f537d7dbc_jio.webp' },
    { name: 'Deezer', logo: 'https://cdn.prod.website-files.com/66a2518ff5fcac851841fbe7/66af509c531437b23665284c_deezer.webp' },
    { name: 'Spotify', logo: 'https://cdn.prod.website-files.com/66a2518ff5fcac851841fbe7/66af509c1da979ff4ba09e63_spotify.webp' },
    { name: 'Instagram', logo: 'https://cdn.prod.website-files.com/66a2518ff5fcac851841fbe7/66af509c7661e5c27bada11d_instagram.webp' },
    { name: 'Anghami', logo: 'https://cdn.prod.website-files.com/66a2518ff5fcac851841fbe7/66af509ceb7eaac4d19cd557_anghami.webp' },
    { name: 'Apple Music', logo: 'https://cdn.prod.website-files.com/66a2518ff5fcac851841fbe7/66af509cd3076ed98e01769c_apple.webp' },
    { name: 'YouTube Music', logo: 'https://cdn.prod.website-files.com/66a2518ff5fcac851841fbe7/66af509cdba6c4f6a06ce615_youtube.webp' },
    { name: 'Amazon Music', logo: 'https://cdn.prod.website-files.com/66a2518ff5fcac851841fbe7/66af509ce30b267f537d7e28_amazon.webp' },
]

export default function PlatformCarousel() {
    // Duplicate platforms multiple times for seamless infinite scroll
    const duplicatedPlatforms = [...platforms, ...platforms, ...platforms]

    return (
        <div className="w-full overflow-hidden py-6">
            {/* Scrolling container */}
            <motion.div
                className="flex items-center gap-16"
                animate={{
                    x: ['0%', '-33.333%'],
                }}
                transition={{
                    x: {
                        duration: 25,
                        repeat: Infinity,
                        ease: 'linear',
                    },
                }}
            >
                {duplicatedPlatforms.map((platform, index) => (
                    <div
                        key={`${platform.name}-${index}`}
                        className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity duration-300"
                    >
                        <img
                            src={platform.logo}
                            alt={platform.name}
                            loading="lazy"
                            className="h-6 md:h-8 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300"
                        />
                    </div>
                ))}
            </motion.div>
        </div>
    )
}
