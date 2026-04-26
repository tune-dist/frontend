"use client";

import { SignalHigh, TrendingUp, ArrowRight } from "lucide-react";

export default function CRBTSection() {
  return (
    <section className="py-12 sm:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">

        <div className="bg-muted/20 backdrop-blur-2xl rounded-[3rem] p-6 sm:p-16 md:p-24 relative overflow-hidden flex flex-col md:flex-row items-center gap-16 border-t border-l border-violet-500/10 shadow-2xl">

          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 sm:w-96 sm:h-96 bg-violet-500/10 blur-[100px] pointer-events-none" />

          {/* Left Side Content */}
          <div className="flex-1 space-y-4 md:space-y-8 z-10">
            <div className="inline-block bg-violet-500/10 border border-violet-500/20 text-violet-400 px-5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest backdrop-blur shadow-[0_0_15px_rgba(6,182,212,0.15)]">
              Revenue Maximizer
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold font_heading tracking-tight">
              CRBT &amp; Caller Tune <br />
              <span className="animated-gradient">Distribution</span>
            </h2>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl">
              Unlock the hidden revenue of telecom. We distribute your signature hooks
              as caller tunes across global mobile networks, capturing a massive regional
              market others miss.
            </p>

            {/* <div className="pt-4">
              <button className="group inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl animated-gradient-bg text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-xl">
                Learn About CRBT
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div> */}
          </div>

          {/* Right Side Cards */}
          <div className="flex-1 grid grid-cols-2 gap-4 w-full z-10">
            <div className="bg-background/80 backdrop-blur-3xl border border-white/10 p-4 md:p-8 rounded-[2rem] text-center shadow-lg hover:-translate-y-1 transition-transform">
              <div className="flex justify-center mb-4">
                <SignalHigh className="h-10 w-10 text-indigo-400 drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
              </div>
              <div className="font-bold text-3xl font_heading tracking-tight mb-1 text-foreground">200+</div>
              <div className="text-xs md:text-sm text-muted-foreground font-semibold uppercase tracking-widest">Telecom Networks</div>
            </div>

            <div className="bg-background/80 backdrop-blur-3xl border border-white/10 p-4 md:p-8 rounded-[2rem] text-center shadow-lg mt-8 lg:mt-12 hover:-translate-y-1 transition-transform">
              <div className="flex justify-center mb-4">
                <TrendingUp className="h-10 w-10 text-indigo-400 drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
              </div>
              <div className="font-bold text-3xl font_heading tracking-tight mb-1 text-foreground">35%</div>
              <div className="text-xs md:text-sm text-muted-foreground font-semibold uppercase tracking-widest">Revenue Boost</div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
