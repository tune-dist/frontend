"use client";

import { ArrowRight, DollarSign, Sparkles, Users } from "lucide-react";

const heroStats = [
  { value: "100%", label: "Automated Payouts" },
  { value: "∞", label: "Collaborators" },
  { value: "0", label: "Manual Errors" },
  { value: "Real-Time", label: "Revenue Data" },
];

export default function RoyaltySplitsHero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background pt-20">
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

      <style>{`
        @keyframes rsOrb1 { from { transform: translate(0,0) scale(1); } to { transform: translate(50px,40px) scale(1.2); } }
        @keyframes rsOrb2 { from { transform: translate(0,0) scale(1); } to { transform: translate(-50px,-40px) scale(1.15); } }
        @keyframes rsFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-14px); } }
        @keyframes rsPulse { 0% { transform: scale(0.85); opacity: 0.7; } 100% { transform: scale(1.6); opacity: 0; } }
      `}</style>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center py-16">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/60 bg-muted/30 text-xs text-muted-foreground mb-8 backdrop-blur">
          <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
          Kratolib Royalty Splits
        </div>

        {/* Floating icon */}
        <div className="relative flex justify-center mb-10">
          <span className="absolute inset-0 m-auto h-28 w-28 rounded-full border border-emerald-400/30"
            style={{ animation: "rsPulse 2.2s ease-out infinite" }} />
          <span className="absolute inset-0 m-auto h-28 w-28 rounded-full border border-emerald-400/15"
            style={{ animation: "rsPulse 2.2s ease-out infinite 0.7s" }} />
          <div
            className="relative flex h-28 w-28 items-center justify-center rounded-full border border-border/50 bg-muted/40 backdrop-blur shadow-2xl"
            style={{ animation: "rsFloat 4s ease-in-out infinite" }}
          >
            <DollarSign className="h-12 w-12 text-emerald-400" />
          </div>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-[4.5rem] font-bold font_heading mb-6 leading-[1.05] tracking-tight">
          Next-Generation
          <br />
          <span className="animated-gradient">Royalty Splitting</span>
        </h1>

        <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto mb-4 leading-relaxed">
          Fully automated royalty split infrastructure for artists, labels, producers, and music
          businesses operating in today&apos;s global streaming ecosystem.
        </p>
        <p className="text-muted-foreground text-sm max-w-xl mx-auto mb-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
          <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block" />Eliminate manual accounting</span>
          <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-indigo-400 inline-block" />Remove payment delays</span>
          <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-pink-400 inline-block" />Ensure accurate payouts</span>
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <a
            href="/auth?tab=signup"
            className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-xl animated-gradient-bg text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-xl"
          >
            Start Managing Splits
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
          <a
            href="#collaboration"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-border/60 bg-muted/30 text-foreground font-semibold text-sm hover:bg-muted/60 transition-colors backdrop-blur"
          >
            <Users className="h-4 w-4" />
            See How It Works
          </a>
        </div>

        {/* Inline stats */}
        <div className="rounded-2xl border border-border/50 bg-muted/20 px-8 py-8 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center backdrop-blur">
          {heroStats.map(({ value, label }) => (
            <div key={label} className="group">
              <p className="text-2xl sm:text-3xl font-bold font_heading animated-gradient mb-1 transition-transform group-hover:scale-110 duration-300">{value}</p>
              <p className="text-muted-foreground text-xs">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
