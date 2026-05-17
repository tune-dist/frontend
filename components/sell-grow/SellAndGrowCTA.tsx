"use client";

import { CheckCircle2, ArrowRight, Play } from "lucide-react";

export default function SellAndGrowCTA() {
  return (
    <section className="py-12 md:py-24 bg-background relative overflow-hidden border-t border-border/30">

      {/* Background glow */}
      <div className="absolute inset-0 bg-violet-500/5 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-violet-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 font_heading tracking-tight">
          Start Your Music Journey <br className="hidden sm:block" />
          With <span className="animated-gradient bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400">Kratolib</span>
        </h2>

        <p className="text-base sm:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
          Release Fast, Earn Properly, Grow Globally. The Digital Maestro awaits your masterpiece.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
          <a
            href="/contact"
            className="group inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl animated-gradient-bg text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-xl min-w-[200px] w-full md:w-auto"
          >
            Get Started Now
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
          <a
            href="/pricing"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl border border-white/10 bg-muted/30 text-foreground font-semibold text-sm hover:bg-white hover:text-black transition-colors backdrop-blur min-w-[200px] w-full md:w-auto"
          >
            <Play className="h-4 w-4 fill-current" />
            View Pricing
          </a>
        </div>

        <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row justify-center items-center gap-6 sm:gap-12 text-muted-foreground">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-violet-500 fill-violet-400/20" />
            <span className="text-sm font-medium text-white">Quality Promise</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-violet-500 fill-violet-400/20" />
            <span className="text-sm font-medium text-white">100% Payout</span>
          </div>
        </div>

      </div>
    </section>
  );
}
