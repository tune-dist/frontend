"use client";

import { Sparkles, Timer, ArrowRight, Play } from "lucide-react";

export default function SellAndGrowHero() {
  return (
    <section className="relative flex items-center justify-center overflow-hidden bg-background py-24 !pt-24 md:!pt-[150px]">
      {/* Background orbs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-[0.08] blur-[100px]"
          style={{ background: "radial-gradient(circle, #06b6d4 0%, transparent 70%)" }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-8 grid lg:grid-cols-2 gap-8 lg:gap-24 items-center">

        {/* Texts */}
        <div className="space-y-8 z-10 w-full">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-xs text-indigo-400 font-bold uppercase tracking-widest backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 fill-indigo-400" />
            The Digital Maestro
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-4 font_heading tracking-tight">
            Distribute, <span className="animated-gradient">Sell</span> &amp; Grow Your <span className="animated-gradient">Music</span> Worldwide.
          </h1>

          <p className="text-muted-foreground text-base sm:text-xl max-w-lg leading-relaxed">
            Global Music Distribution Made Simple for Music Artists, Creators, and Independent Labels.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-0 md:pt-4">
            <a
              href="/contact"
              className="group inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl animated-gradient-bg text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-xl"
            >
              Release Now
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href="#growth"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl border border-white/10 bg-muted/30 text-foreground font-semibold text-sm hover:bg-white hover:text-black transition-colors backdrop-blur"
            >
              <Play className="h-4 w-4 fill-current" />
              Explore Growth
            </a>
          </div>
        </div>

        {/* Hero Visual Card */}
        <div className="relative">
          <div className="aspect-[4/3] rounded-[2rem] overflow-hidden relative z-0">
            <div className="absolute inset-0 bg-[url('/assets/images/music-banner1.jpg')] bg-contain bg-center bg-no-repeat transition-all duration-700"></div>
          </div>

          {/* Floating Stats Card */}
          <div className="absolute -bottom-6 -left-4 sm:-left-8 bg-muted/60 backdrop-blur-2xl p-2 md:p-6 rounded-2xl border border-violet-500/40 max-w-[200px] md:max-w-[240px] shadow-2xl z-10 w-full text-foreground hover:bg-violet-700 group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-violet-500/20 flex items-center justify-center shrink-0 group-hover:bg-black/20">
                <Timer className="h-6 w-6 text-violet-400" />
              </div>
              <div>
                <div className="text-lg md:text-2xl font-bold font_heading text-violet-400 group-hover:text-white">24h</div>
                <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest mt-0.5 group-hover:text-white">Velocity Delivery</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
