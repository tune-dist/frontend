"use client";

import { ArrowRight, Music2, Play, Sparkles } from "lucide-react";

export default function SmartMusicHero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background pt-20">
      {/* ── Animated BG orbs ── */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full opacity-[0.07]"
          style={{
            background: "radial-gradient(circle, #be51c5 0%, transparent 70%)",
            animation: "heroOrb1 12s ease-in-out infinite alternate",
          }}
        />
        <div
          className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full opacity-[0.07]"
          style={{
            background: "radial-gradient(circle, #06b6d4 0%, transparent 70%)",
            animation: "heroOrb2 14s ease-in-out infinite alternate",
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full opacity-[0.04]"
          style={{ background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)" }}
        />
        {/* grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(#be51c5 1px, transparent 1px), linear-gradient(to right, #be51c5 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      <style>{`
        @keyframes heroOrb1 { from { transform: translate(0,0) scale(1); } to { transform: translate(60px,40px) scale(1.2); } }
        @keyframes heroOrb2 { from { transform: translate(0,0) scale(1); } to { transform: translate(-60px,-40px) scale(1.15); } }
        @keyframes floatIcon { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-14px); } }
        @keyframes pulseRing {
          0%   { transform: scale(0.85); opacity: 0.7; }
          100% { transform: scale(1.6);  opacity: 0; }
        }
        @keyframes waveBar {
          0%,100% { transform: scaleY(0.25); }
          50%     { transform: scaleY(1); }
        }
        @keyframes tickerScroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      {/* ── Main content ── */}
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center py-16">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/60 bg-muted/30 text-xs text-muted-foreground mb-8 backdrop-blur">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          AI Release Engine &amp; Smart Music Distribution
        </div>

        {/* Floating icon */}
        <div className="relative flex justify-center mb-10">
          <span className="absolute inset-0 m-auto h-28 w-28 rounded-full border border-primary/30"
            style={{ animation: "pulseRing 2.2s ease-out infinite" }} />
          <span className="absolute inset-0 m-auto h-28 w-28 rounded-full border border-primary/15"
            style={{ animation: "pulseRing 2.2s ease-out infinite 0.7s" }} />
          <div
            className="relative flex h-28 w-28 items-center justify-center rounded-full border border-border/50 bg-muted/40 backdrop-blur shadow-2xl"
            style={{ animation: "floatIcon 4s ease-in-out infinite" }}
          >
            <Music2 className="h-12 w-12 text-primary" />
          </div>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-[4.5rem] font-bold font_heading mb-6 leading-[1.05] tracking-tight">
          Next Generation
          <br />
          <span className="animated-gradient">Music Distribution</span>
        </h1>

        <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto mb-4 leading-relaxed">
          Ktarolib delivers global music distribution powered by intelligent AI release technology —
          making releases faster, safer, and more accurate.
        </p>
        <p className="text-muted-foreground text-sm max-w-xl mx-auto mb-10">
          Our platform combines global distribution infrastructure with smart AI release protection,
          metadata intelligence, and quality validation systems.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <a
            href="/auth?tab=signup"
            className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-xl animated-gradient-bg text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-xl"
          >
            Free Sign Up
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
          <a
            href="#pricing"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-border/60 bg-muted/30 text-foreground font-semibold text-sm hover:bg-muted/60 transition-colors backdrop-blur"
          >
            <Play className="h-4 w-4 fill-current" />
            View Pricing
          </a>
        </div>

        {/* Animated waveform bar */}
        <div className="flex items-end justify-center gap-1 h-14 opacity-20 mb-8">
          {[4, 7, 10, 6, 9, 13, 8, 5, 11, 7, 4, 9, 6, 10, 5, 8, 12, 7, 4, 9, 6, 11, 5, 8, 4, 7, 10].map((h, i) => (
            <span
              key={i}
              className="w-1.5 rounded-full animated-gradient-bg"
              style={{
                height: `${h * 4}px`,
                animation: `waveBar ${0.7 + (i % 6) * 0.18}s ease-in-out infinite`,
                animationDelay: `${i * 0.04}s`,
              }}
            />
          ))}
        </div>


      </div>
    </section>
  );
}
