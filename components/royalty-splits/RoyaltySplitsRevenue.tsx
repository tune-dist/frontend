"use client";

import { ArrowRight, TrendingUp } from "lucide-react";

export default function RoyaltySplitsRevenue() {
  return (
    <section className="py-24 bg-muted/10 relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 right-0 w-[450px] h-[450px] -translate-y-1/2 rounded-full opacity-[0.05]"
          style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 70%)" }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-8">

        {/* Top Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 mb-16 w-full">
          <div className="max-w-3xl">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font_heading mb-6 tracking-tight leading-[1.1]">
              Unified Multi-Platform <br />
              <span className="animated-gradient">Revenue Intelligence</span>
            </h2>
            <p className="text-muted-foreground text-sm sm:text-lg leading-relaxed max-w-2xl">
              A consolidated home to ingest and report metadata from over 150+
              streaming platforms across 200+ global territories.
            </p>
          </div>
          <a href="#" className="flex items-center gap-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors shrink-0">
            View Analytics Live <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        {/* 2 Column Layout */}
        <div className="grid lg:grid-cols-3 gap-6 w-full items-stretch">

          {/* Left: Global Network Analytics Graph (takes 2 cols) */}
          <div className="lg:col-span-2 rounded-3xl border border-border/50 bg-[#121214] p-6 sm:p-8 flex flex-col shadow-2xl relative overflow-hidden">
            <div className="flex items-center gap-4 mb-8">
              <h3 className="font-semibold text-base text-foreground">Global Network Analytics</h3>
              <div className="flex bg-muted/30 p-1 rounded-lg gap-1">
                {["Platform", "Territory", "Total Returns", "Royalties"].map((tab, i) => (
                  <span key={i} className={`text-[10px] font-medium px-3 py-1 rounded-md ${i === 0 ? "bg-muted text-foreground" : "text-muted-foreground"}`}>{tab}</span>
                ))}
              </div>
            </div>

            {/* Chart Placeholder / Mockup */}
            <div className="flex-1 min-h-[250px] flex items-end gap-1 sm:gap-1.5 opacity-60 mt-auto">
              {/* Generate random heights for a bar chart look */}
              {[40, 50, 45, 60, 55, 70, 65, 80, 75, 90, 85, 95, 80, 85, 70, 75, 60, 65, 50, 55, 40, 45, 60, 80, 100, 95, 85, 75, 60, 50, 40, 45, 55, 45, 65, 75, 85].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-gradient-to-t from-emerald-500/20 to-emerald-400 group-hover:from-emerald-400 group-hover:to-emerald-300 transition-all duration-300 rounded-t-sm max-w-[12px]"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>

            {/* Grid overlay */}
            <div className="absolute inset-x-8 bottom-8 top-24 pointer-events-none flex flex-col justify-between opacity-10">
              <div className="w-full h-px bg-white"></div>
              <div className="w-full h-px bg-white"></div>
              <div className="w-full h-px bg-white"></div>
              <div className="w-full h-px bg-white"></div>
              <div className="w-full h-px bg-white"></div>
            </div>
          </div>

          {/* Right: Revenue Channels (purple card) */}
          <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-600 to-indigo-900 p-8 flex flex-col justify-center text-center shadow-[0_0_40px_rgba(99,102,241,0.2)]">
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
            </div>
            <h3 className="font-bold text-xl text-white mb-4">Revenue Channels</h3>
            <p className="text-white/80 text-sm leading-relaxed">
              Streaming, downloads, syncs, CRBT — all revenue channels tracked in one
              unified platform with granular insights and daily updates.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}
