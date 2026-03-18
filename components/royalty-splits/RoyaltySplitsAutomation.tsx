"use client";

import { Zap, CheckCircle2, RefreshCw, BarChart3, Layers } from "lucide-react";

const payoutSteps = [
  { step: "01", emoji: "📋", label: "Define Split Agreement", desc: "Set percentages once for every collaborator on a release." },
  { step: "02", emoji: "🚀", label: "Release Goes Live",      desc: "Kratolib distributes music across all platforms automatically." },
  { step: "03", emoji: "💰", label: "Revenue Collected",      desc: "All platform earnings are aggregated in real time." },
  { step: "04", emoji: "⚡", label: "Automatic Split",        desc: "Earnings are split accurately per agreed percentages." },
  { step: "05", emoji: "✅", label: "Payout Delivered",       desc: "Every rights holder receives their share — securely & globally." },
];

const recoupItems = [
  { label: "Investment Recoup Before Profit Share", color: "text-emerald-400" },
  { label: "Label Priority Recovery",               color: "text-indigo-400" },
  { label: "Custom Royalty Waterfalls",             color: "text-amber-400" },
  { label: "Multi-Tier Payment Structures",         color: "text-pink-400" },
];

export default function RoyaltySplitsAutomation() {
  return (
    <>
      {/* ── Automated Payouts ── */}
      <section className="py-24 bg-background relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full opacity-[0.05]"
            style={{ background: "radial-gradient(circle, #10b981 0%, transparent 70%)" }} />
        </div>

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/60 bg-muted/30 text-xs text-muted-foreground mb-4">
              <Zap className="h-3.5 w-3.5 text-emerald-400" />
              Fully Automated
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font_heading mb-4">
              Global Royalty{" "}
              <span className="animated-gradient">Payouts on Autopilot</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm leading-relaxed">
              No spreadsheets. No manual transfers. No reconciliation errors.
              Kratolib automatically distributes earnings to each rights holder based on predefined
              split agreements — securely and globally. Every payout is logged, traceable, and fully transparent.
            </p>
          </div>

          {/* Step pipeline */}
          <div className="flex flex-col lg:flex-row items-stretch gap-4 mb-14">
            {payoutSteps.map(({ step, emoji, label, desc }, i) => (
              <div key={step} className="flex-1 relative">
                {/* Connector line */}
                {i < payoutSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 right-0 translate-x-1/2 z-10">
                    <div className="h-px w-6 bg-border/60" />
                  </div>
                )}
                <div className="h-full group rounded-2xl border border-border/50 bg-muted/20 hover:bg-muted/40 hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-1 p-5 flex flex-col items-center text-center gap-3">
                  <div className="text-2xl group-hover:scale-110 transition-transform duration-300">{emoji}</div>
                  <p className="text-[10px] text-muted-foreground font-mono">{step}</p>
                  <p className="font-semibold text-sm text-foreground leading-snug">{label}</p>
                  <p className="text-muted-foreground text-xs leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Trust line */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground">
            {["Logged", "Traceable", "Transparent", "Globally Secure"].map((t) => (
              <span key={t} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />{t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Advanced Recoupment ── */}
      <section className="py-24 bg-muted/10 relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 right-0 w-[450px] h-[450px] rounded-full opacity-[0.05]"
            style={{ background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)" }} />
        </div>

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/60 bg-muted/30 text-xs text-muted-foreground mb-5">
                <Layers className="h-3.5 w-3.5 text-violet-400" />
                Advanced Payment Structures
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold font_heading mb-4">
                Advanced Recoupment &amp;{" "}
                <span className="animated-gradient">Smart Payment Structures</span>
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-8">
                Built for real music business deals. Configure advanced payout logic including
                recoupment schedules, label priority recovery, and custom royalty waterfalls.
                Perfect for labels, distributors, and professional release financing models.
              </p>
              <ul className="space-y-3">
                {recoupItems.map(({ label, color }) => (
                  <li key={label} className="flex items-center gap-3 text-sm text-foreground">
                    <CheckCircle2 className={`h-4 w-4 shrink-0 ${color}`} />
                    {label}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: Waterfall visual */}
            <div className="space-y-3">
              {[
                { label: "Gross Revenue",             pct: 100, color: "bg-emerald-500",   shade: "bg-emerald-500/10" },
                { label: "Label Recoupment",          pct: 30,  color: "bg-indigo-500",    shade: "bg-indigo-500/10" },
                { label: "Producer & Composer Share", pct: 20,  color: "bg-amber-500",     shade: "bg-amber-500/10" },
                { label: "Featured Artist",           pct: 15,  color: "bg-pink-500",      shade: "bg-pink-500/10" },
                { label: "Primary Artist Net",        pct: 35,  color: "bg-violet-500",    shade: "bg-violet-500/10" },
              ].map(({ label, pct, color, shade }, i) => (
                <div key={label} className={`rounded-2xl border border-border/40 ${shade} p-4`}
                  style={{ marginLeft: `${i * 8}px`, transition: "all 0.3s ease" }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-foreground">{label}</span>
                    <span className="text-xs text-muted-foreground font-mono">{pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted/40">
                    <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              ))}
              <p className="text-[10px] text-muted-foreground pl-2 mt-2">Example waterfall payout structure</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
