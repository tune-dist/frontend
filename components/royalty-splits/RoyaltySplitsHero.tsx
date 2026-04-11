"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import MoneySplitAnimation from "./MoneySplitAnimation";

export default function RoyaltySplitsHero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-background pt-20">
      {/* Background orbs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-40 -left-32 w-[650px] h-[650px] rounded-full opacity-[0.07]"
          style={{ background: "radial-gradient(circle, #10b981 0%, transparent 70%)", animation: "rsOrb1 12s ease-in-out infinite alternate" }}
        />
        <div
          className="absolute -bottom-40 -right-32 w-[550px] h-[550px] rounded-full opacity-[0.07]"
          style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 70%)", animation: "rsOrb2 14s ease-in-out infinite alternate" }}
        />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: "linear-gradient(#10b981 1px, transparent 1px), linear-gradient(to right, #10b981 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center py-16">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/40 bg-primary/10 text-xs text-primary mb-8 backdrop-blur shadow-[0_0_15px_rgba(99,102,241,0.2)]">
          <Sparkles className="h-3.5 w-3.5 fill-primary" />
          Automated Royalty Split Payouts
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-[4rem] font-semibold font_heading mb-6">
          Next-Generation <br className="hidden sm:block" />
          <span className="animated-gradient bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-400">Royalty Splitting</span> For The <br className="hidden sm:block" />
          Modern Music Industry
        </h1>

        <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Kratolib delivers a powerful, fully automated royalty split infrastructure
          designed for artists, labels, producers, and music businesses operating
          in today&apos;s global streaming ecosystem.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <a
            href="/auth?tab=signup"
            className="group inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl animated-gradient-bg text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-xl min-w-[220px]"
          >
            Start managing splits smarter
          </a>
          <a
            href="/demo"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#202022] hover:bg-[#2a2a2c] text-white font-semibold text-sm transition-colors border border-white/5 min-w-[220px]"
          >
            Start with Kratolib
          </a>
        </div>



        <MoneySplitAnimation />
      </div>
    </section>
  );
}
