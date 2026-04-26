"use client";

import { ShieldCheck, FileCheck2, Eye, Scale } from "lucide-react";

const trustItems = [
  { icon: ShieldCheck, label: "Verifiable", desc: "End-to-end logs of all streaming data and calculations." },
  { icon: FileCheck2, label: "Auditable", desc: "Downloadable records for internal and external audits." },
  { icon: Eye, label: "Transparent", desc: "Real-time data accessible to all collaborators." },
  { icon: Scale, label: "Dispute Resolution", desc: "Immutable proof to prevent and resolve conflicts." },
];

const futureList = [
  { num: "1", title: "Artist-to-Artist", desc: "Direct peer-to-peer splitting for cross-collaboration releases." },
  { num: "2", title: "Label Administration", desc: "Unprecedented visibility for managing artist rosters at scale." },
  { num: "3", title: "Producer & Composer", desc: "Automated beat and sample clearance logic with exact percentage routing." },
  { num: "4", title: "Catalog Level Management", desc: "Flexible solutions for heritage catalogs and fund management." },
];

export default function RoyaltySplitsTransparency() {
  return (
    <>
      {/* ── Transparency ── */}
      <section className="py-12 md:py-24 bg-background relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-[0.04]"
            style={{ background: "radial-gradient(ellipse, #10b981 0%, transparent 70%)" }} />
        </div>

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-6 font_heading tracking-tight">
              Enterprise-Grade <span className="animated-gradient">Transparency</span> <br /> &amp; Financial Trust
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
              Unrivaled transparency built on distributed ledger technology providing
              irrefutable Proof Of Performance for every cent processed.
            </p>
          </div>

          {/* 4 trust pillars */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
            {trustItems.map(({ icon: Icon, label, desc }) => (
              <div
                key={label}
                className="group rounded-2xl border border-white/10 bg-muted/20 hover:bg-muted/40 transition-all duration-300 hover:-translate-y-1 p-6 text-center shadow-lg hover:shadow-xl hover:border-emerald-500/30"
              >
                <div className="flex justify-center mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border/40 bg-background group-hover:bg-emerald-500/10 group-hover:border-emerald-500/30 transition-colors">
                    <Icon className="h-6 w-6 text-emerald-400" />
                  </div>
                </div>
                <h3 className="font-bold text-lg font_heading mb-2">{label}</h3>
                <p className="text-muted-foreground text-base leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Future of Collaboration ── */}
      <section className="py-12 md:py-24 bg-muted/10 relative overflow-hidden music_colobration_sec">
        <div className="relative max-w-7xl mx-auto px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left: List */}
            <div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-8 font_heading tracking-tight">
                Built For The Future Of <br className="hidden sm:block" />
                <span className="animated-gradient">Music Collaboration</span>
              </h2>

              <div className="space-y-6">
                {futureList.map(({ num, title, desc }) => (
                  <div key={num} className="flex gap-4 group">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-sm border border-emerald-500/20 group-hover:bg-emerald-500/20 group-hover:scale-110 transition-all">
                      {num}
                    </div>
                    <div>
                      <h3 className="font-semibold text-base md:text-lg text-foreground mb-1">{title}</h3>
                      <p className="text-muted-foreground text-sm md:text-base leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Image placeholder */}
            {/* <div className="rounded-3xl border border-border/40 bg-muted/20 overflow-hidden shadow-2xl h-[400px] relative group flex items-center justify-center">
              <div className="opacity-40 w-full h-full absolute inset-0 bg-[url('https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent pointer-events-none" />
            </div> */}

          </div>
        </div>
      </section>
    </>
  );
}
