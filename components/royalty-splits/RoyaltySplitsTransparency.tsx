"use client";

import { ShieldCheck, CheckCircle2, Music2, Building2, Mic2, LayoutGrid, ArrowRight } from "lucide-react";

const trustItems = [
  { label: "Verifiable", desc: "Every calculation can be independently traced back to source platform data." },
  { label: "Auditable", desc: "Full logs are kept for every split calculation, approval, and payout event." },
  { label: "Transparent", desc: "Each collaborator sees exactly what they are owed and why — no hidden deductions." },
  { label: "Dispute-Resistant", desc: "Signed split agreements are immutable and serve as the single source of truth." },
];

const futureUseCases = [
  { icon: Music2, label: "Artist-to-Artist Collaborations" },
  { icon: Building2, label: "Label & Distribution Deals" },
  { icon: Mic2, label: "Producer & Composer Revenue Shares" },
  { icon: LayoutGrid, label: "Catalog-Level Royalty Management" },
];

export default function RoyaltySplitsTransparency() {
  return (
    <>
      {/* ── Transparency ── */}
      <section className="py-24 bg-background relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-[0.04]"
            style={{ background: "radial-gradient(ellipse, #10b981 0%, transparent 70%)" }} />
        </div>

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/60 bg-muted/30 text-xs text-muted-foreground mb-4">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              Enterprise-Grade Trust
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font_heading mb-4">
              Complete Financial{" "}
              <span className="animated-gradient">Transparency</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm leading-relaxed">
              Every royalty calculation is verifiable, auditable, and dispute-resistant.
              Strengthen long-term collaboration between artists, labels, and partners through
              complete financial clarity.
            </p>
          </div>

          {/* 4 trust pillars */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
            {trustItems.map(({ label, desc }) => (
              <div
                key={label}
                className="group rounded-2xl border border-border/50 bg-muted/20 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-1 p-6 text-center"
              >
                <div className="flex justify-center mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border/40 bg-muted/40 group-hover:bg-emerald-500/15 group-hover:border-emerald-500/30 transition-colors">
                    <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                  </div>
                </div>
                <h3 className="font-bold text-sm font_heading mb-2">{label}</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Future of Collaboration ── */}
      <section className="py-24 bg-muted/10 relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute bottom-0 right-0 w-[450px] h-[450px] rounded-full opacity-[0.05]"
            style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 70%)" }} />
        </div>

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold font_heading mb-4">
              Built For The Future Of{" "}
              <span className="animated-gradient">Music Collaboration</span>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-sm leading-relaxed">
              Supports every kind of music business relationship — from solo artist to global
              catalog management.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {futureUseCases.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex flex-col items-center justify-center group rounded-2xl border border-border/50 bg-muted/20 hover:bg-muted/40 hover:border-indigo-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl p-6"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border/40 bg-muted/40 group-hover:bg-indigo-500/10 group-hover:border-indigo-500/30 transition-colors mb-4">
                  <Icon className="h-5 w-5 text-indigo-400" />
                </div>
                <h3 className="font-semibold text-base mb-2 leading-snug">{label}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
