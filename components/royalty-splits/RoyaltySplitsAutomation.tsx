"use client";

import { CheckCircle2, X } from "lucide-react";

const leftFeatures = [
  { label: "No Annual Limits", active: false },
  { label: "No Transaction Minimums", active: false },
  { label: "No Transaction Charges", active: false },
  { label: "100% Accuracy Commitment", active: true },
];

const rightCards = [
  {
    title: "Cross-Contract Recoupment Across Multiple Streams",
    desc: "Cross-platform recoupment logic for any type of deal structure.",
    color: "text-emerald-400",
  },
  {
    title: "Label Priority Recovery",
    desc: "Automated rules ensure recoupment happens at priority levels before profit split.",
    color: "text-indigo-400",
  },
  {
    title: "Custom Royalty Waterfalls",
    desc: "Establish the hierarchy and direction of payment logic with custom models.",
    color: "text-cyan-400",
  },
];

export default function RoyaltySplitsAutomation() {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full opacity-[0.05]"
          style={{ background: "radial-gradient(circle, #10b981 0%, transparent 70%)" }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-8">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">

          {/* Left Column: Automated Payouts */}
          <div className="relative">
            {/* Outline box behind text similar to design */}
            <div className="absolute -inset-x-6 -inset-y-8 border border-border/40 rounded-3xl bg-muted/10 -z-10 hidden sm:block">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500 rounded-l-3xl shadow-[0_0_15px_rgba(6,182,212,0.5)]"></div>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/60 bg-muted/30 text-xs text-muted-foreground mb-6">
              Fully Automated
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font_heading mb-6 tracking-tight leading-[1.1]">
              Fully Automated Global <br />
              Royalty Payouts
            </h2>

            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-10 max-w-md">
              Say goodbye to manual tabulations. Kratolib automates complex payouts
              to any stakeholder across over 120 global currencies.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
              {leftFeatures.map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  {f.active ? (
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                  ) : (
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-red-500 text-[10px] font-bold">
                      <X className="h-3.5 w-3.5 stroke-[3]" />
                    </div>
                  )}
                  <span className={`text-sm font-medium ${f.active ? "text-foreground" : "text-foreground"}`}>
                    {f.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Advanced Recoupment */}
          <div>
            <h3 className="text-2xl font-bold font_heading mb-8">
              Advanced Recoupment &amp; <br /> Smart Payments
            </h3>

            <div className="space-y-4">
              {rightCards.map((card, i) => (
                <div key={i} className="rounded-2xl border border-border/50 bg-muted/20 p-5 sm:p-6 hover:bg-muted/40 transition-colors">
                  <h4 className={`font-semibold text-base mb-2 ${card.color}`}>
                    {card.title}
                  </h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
