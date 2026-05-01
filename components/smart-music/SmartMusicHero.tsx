"use client";

import { ArrowRight, Music2, Play, Sparkles } from "lucide-react";

export default function SmartMusicHero() {
  return (
    <section className="relative min-h-auto md:min-h-screen flex items-center justify-center overflow-hidden bg-background pt-20">
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
      <div className="relative w-full mx-auto px-4 sm:px-6 lg:px-8 text-center py-0 md:py-16">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/20 bg-muted/30 text-xs md:text-sm text-muted-foreground mb-8 backdrop-blur mt-5 md:mt-0">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          AI Release Engine & Smart Music Distribution — Ktarolib
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 font_heading tracking-tight">
          Smart Music Distribution <br />
          <span className="animated-gradient">AI-Powered</span><br />
          Release Recommendations & Analytics
        </h1>

        <p className="text-muted-foreground text-base md:text-lg sm:text-xl max-w-2xl mx-auto mb-4 leading-relaxed">
          Ktarolib delivers global music distribution powered by intelligent AI release technology designed to make music releases faster, safer, and more accurate.
        </p>
        <p className="text-muted-foreground text-sm max-w-xl mx-auto mb-10">
          Our platform combines global distribution infrastructure with smart AI release protection, metadata intelligence, and quality validation systems.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <a
            href="/contact"
            className="group inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl animated-gradient-bg text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-xl w-full md:w-auto"
          >
            Free Sign Up
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
          <a
            href="/pricing"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl border border-white/10 bg-muted/30 text-foreground font-semibold text-sm hover:bg-muted/60 transition-colors backdrop-blur w-full md:w-auto"
          >
            <Play className="h-4 w-4 fill-current" />
            View Pricing
          </a>
        </div>


      </div>
    </section>
  );
}
