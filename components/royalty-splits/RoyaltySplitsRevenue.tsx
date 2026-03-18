"use client";

import { BarChart3, Globe2, Layers, TrendingUp, Users2, DollarSign } from "lucide-react";

const dimensions = [
  { icon: Layers,     label: "Platforms",         desc: "See earnings broken down by Spotify, Apple Music, YouTube, and 150+ platforms side by side.", color: "text-blue-400",   bg: "bg-blue-500/10",   border: "hover:border-blue-500/30" },
  { icon: Globe2,     label: "Releases",           desc: "Compare performance across singles, albums, and EPs in one unified financial view.", color: "text-cyan-400",    bg: "bg-cyan-500/10",   border: "hover:border-cyan-500/30" },
  { icon: Users2,     label: "Contributors",       desc: "See each collaborator's earned share in real time — no manual spreadsheets required.", color: "text-violet-400", bg: "bg-violet-500/10", border: "hover:border-violet-500/30" },
  { icon: Globe2,     label: "Territories",        desc: "Drill into country-level and region-level revenue to understand your strongest markets.", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "hover:border-emerald-500/30" },
  { icon: TrendingUp, label: "Revenue Channels",   desc: "Streaming, downloads, syncs, CRBT — all revenue channels tracked in one place.", color: "text-amber-400",  bg: "bg-amber-500/10",  border: "hover:border-amber-500/30" },
];

export default function RoyaltySplitsRevenue() {
  return (
    <section className="py-24 bg-muted/10 relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 right-0 w-[450px] h-[450px] -translate-y-1/2 rounded-full opacity-[0.05]"
          style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 70%)" }} />
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/60 bg-muted/30 text-xs text-muted-foreground mb-4">
            <BarChart3 className="h-3.5 w-3.5 text-indigo-400" />
            Unified Revenue Intelligence
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font_heading mb-4">
            Multi-Platform{" "}
            <span className="animated-gradient">Revenue Intelligence</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm leading-relaxed">
            Access real-time earnings data from global streaming and download platforms — all inside
            one centralized dashboard. Make faster, data-driven decisions with live financial insights.
          </p>
        </div>

        {/* Dimension cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-14">
          {dimensions.map(({ icon: Icon, label, desc, color, bg, border }) => (
            <div
              key={label}
              className={`group flex flex-col items-center text-center gap-4 px-5 py-8 rounded-2xl border border-border/50 bg-muted/20 hover:bg-muted/40 transition-all duration-300 ${border} hover:-translate-y-1 hover:shadow-lg`}
            >
              <div className={`flex h-13 w-13 h-12 w-12 items-center justify-center rounded-2xl border border-border/40 ${bg} group-hover:scale-110 transition-transform duration-300`}>
                <Icon className={`h-6 w-6 ${color}`} />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground mb-1">{label}</p>
                <p className="text-muted-foreground text-xs leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Dashboard preview strip */}
        <div className="rounded-3xl border border-border/50 bg-muted/20 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex gap-1.5">
              <span className="h-3 w-3 rounded-full bg-red-400/60" />
              <span className="h-3 w-3 rounded-full bg-yellow-400/60" />
              <span className="h-3 w-3 rounded-full bg-emerald-400/60" />
            </div>
            <span className="text-xs text-muted-foreground font-mono">kratolib — revenue dashboard</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total Earnings", value: "$48,291", change: "+12.4%", color: "text-emerald-400" },
              { label: "Pending Payouts", value: "$6,840",  change: "3 splits",  color: "text-amber-400" },
              { label: "Active Releases", value: "142",     change: "↑ 8 this month", color: "text-blue-400" },
              { label: "Collaborators",   value: "38",      change: "Across 12 labels", color: "text-violet-400" },
            ].map(({ label, value, change, color }) => (
              <div key={label} className="rounded-xl border border-border/40 bg-muted/30 p-4">
                <p className="text-xs text-muted-foreground mb-1">{label}</p>
                <p className={`text-xl font-bold font_heading ${color}`}>{value}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{change}</p>
              </div>
            ))}
          </div>

          {/* Waveform chart mock */}
          <div className="flex items-end gap-1 h-16 opacity-40">
            {[30,55,40,70,60,80,50,90,65,75,45,85,60,70,40,95,55,80,60,75,50,88,65,70,45,92,58].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t animated-gradient-bg transition-all duration-300 hover:opacity-80"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 text-right">Monthly streaming revenue by week</p>
        </div>
      </div>
    </section>
  );
}
