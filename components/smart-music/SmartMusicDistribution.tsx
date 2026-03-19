"use client";

import { Globe2, Wifi, Download, Smartphone, Radio } from "lucide-react";

const distributionItems = [
  { icon: Globe2, label: "Global Streaming Platforms", desc: "Spotify, Apple Music, Amazon, YouTube, Tidal & 140+ more" },
  { icon: Download, label: "Digital Download Stores", desc: "iTunes, Beatport, and worldwide digital retailers" },
  { icon: Radio, label: "Regional Music Platforms", desc: "Localized platforms for Asia, MENA, LatAm & beyond" },
  { icon: Smartphone, label: "Telecom CRBT Distribution", desc: "Caller tune revenue across major telecom networks" },
  { icon: Wifi, label: "Social Platform Delivery", desc: "TikTok, Instagram Reels, YouTube Shorts & more" },
];

export default function SmartMusicDistribution() {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-[0.05]"
          style={{ background: "radial-gradient(circle, #06b6d4 0%, transparent 70%)" }}
        />
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left Side: Header */}
          <div className="text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/60 bg-muted/30 text-sm text-muted-foreground mb-4">
              <Globe2 className="h-3.5 w-3.5 text-cyan-400" />
              Global Reach
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font_heading mb-4">
              Global Music{" "}
              <span className="animated-gradient">Distribution Network</span>
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-lg">
              Distribute your music across 150+ major streaming platforms and digital music services worldwide.
            </p>
          </div>

          {/* Right Side: 5 platform boxes infographic */}
          <div className="flex items-center justify-center gap-2 sm:gap-6 w-full max-w-xl mx-auto lg:mx-0">
            {/* Left Column (2 boxes) */}
            <div className="flex flex-col gap-2 sm:gap-4 w-1/3">
              {[distributionItems[0], distributionItems[2]].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="group flex flex-col items-center justify-center text-center gap-2 sm:gap-3 px-2 py-5 sm:px-4 sm:py-6 rounded-2xl border border-border/50 bg-muted/20 hover:bg-muted/40 hover:border-cyan-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl border border-border/50 bg-muted/40 group-hover:bg-cyan-500/10 group-hover:border-cyan-500/40 transition-colors group-hover:scale-110 duration-300">
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-cyan-400" />
                  </div>
                  <p className="font-normal text-[14px] sm:text-sm text-foreground leading-snug">{label}</p>
                </div>
              ))}
            </div>

            {/* Center Column (1 box) */}
            <div className="flex flex-col gap-2 sm:gap-4 relative z-10 w-1/3">
              {[distributionItems[4]].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="relative group flex flex-col items-center justify-center text-center gap-2 sm:gap-3 px-2 py-6 sm:px-4 sm:py-8 rounded-2xl border border-cyan-500/40 bg-background shadow-xl shadow-cyan-500/20 hover:border-cyan-400 transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-2xl pointer-events-none" />
                  <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl border border-cyan-500/40 bg-cyan-500/10 group-hover:bg-cyan-500/20 transition-colors group-hover:scale-110 duration-300 z-10">
                    <Icon className="h-6 w-6 sm:h-7 sm:w-7 text-cyan-400" />
                  </div>
                  <p className="font-normal text-[14px] sm:text-sm text-foreground leading-snug z-10">{label}</p>
                </div>
              ))}
            </div>

            {/* Right Column (2 boxes) */}
            <div className="flex flex-col gap-2 sm:gap-4 w-1/3">
              {[distributionItems[1], distributionItems[3]].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="group flex flex-col items-center justify-center text-center gap-2 sm:gap-3 px-2 py-5 sm:px-4 sm:py-6 rounded-2xl border border-border/50 bg-muted/20 hover:bg-muted/40 hover:border-cyan-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl border border-border/50 bg-muted/40 group-hover:bg-cyan-500/10 group-hover:border-cyan-500/40 transition-colors group-hover:scale-110 duration-300">
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-cyan-400" />
                  </div>
                  <p className="font-normal text-[14px] sm:text-sm text-foreground leading-snug">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
