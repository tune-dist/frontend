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
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/60 bg-muted/30 text-xs text-muted-foreground mb-4">
            <Globe2 className="h-3.5 w-3.5 text-cyan-400" />
            Global Reach
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font_heading mb-4">
            Global Music{" "}
            <span className="animated-gradient">Distribution Network</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm leading-relaxed">
            Distribute your music across 150+ major streaming platforms and digital music services
            worldwide with a single upload.
          </p>
        </div>

        {/* 5 platform boxes — full-width grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {distributionItems.map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="group flex flex-col items-center text-center gap-4 px-6 py-10 rounded-2xl border border-border/50 bg-muted/20 hover:bg-muted/40 hover:border-cyan-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border/50 bg-muted/40 group-hover:bg-cyan-500/10 group-hover:border-cyan-500/40 transition-colors group-hover:scale-110 duration-300">
                <Icon className="h-7 w-7 text-cyan-400" />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground mb-1 leading-snug">{label}</p>
                <p className="text-muted-foreground text-xs leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
