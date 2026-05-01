"use client";

import { Brain, ShieldCheck, BarChart3, RefreshCw, CheckCircle2 } from "lucide-react";

const systemCards = [
  {
    icon: Brain,
    color: "text-purple-400",
    iconBg: "bg-purple-500/10",
    borderHover: "hover:border-purple-500/30",
    title: "Smart Release Protection System",
    subtitle: "Pre-distribution verification across every quality dimension.",
    checks: [
      "Metadata Accuracy",
      "Artwork Compliance",
      "Audio Quality Standards",
      "Duplicate Release Risk",
      "Store Formatting Requirements",
    ],
  },
  {
    icon: ShieldCheck,
    color: "text-emerald-400",
    iconBg: "bg-emerald-500/10",
    borderHover: "hover:border-emerald-500/30",
    title: "Intelligent Distribution Processing",
    subtitle: "Automated intelligence that reduces errors and improves throughput.",
    checks: [
      "Reduce manual errors",
      "Speed up release processing",
      "Improve store approval success",
      "Maintain credit accuracy",
      "Protect release structure",
    ],
  },
  {
    icon: RefreshCw,
    color: "text-cyan-400",
    iconBg: "bg-cyan-500/10",
    borderHover: "hover:border-cyan-500/30",
    title: "Continuous AI Learning System",
    subtitle: "Our AI improves with every release processed.",
    checks: [
      "Each release trains the model",
      "Future releases get faster",
      "Error patterns are remembered",
      "Store rule updates auto-applied",
      "Self-improving quality engine",
    ],
  },
];

export default function SmartMusicTechnology() {
  return (
    <section className="py-14 md:py-24 bg-background relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="absolute top-1/2 right-0 w-[400px] h-[400px] -translate-y-1/2 rounded-full opacity-[0.05]"
          style={{ background: "radial-gradient(circle, #10b981 0%, transparent 70%)" }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/60 bg-muted/30 text-xs text-muted-foreground mb-4">
            <Brain className="h-3.5 w-3.5 text-purple-400" />
            Smart Release Technology System
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 font_heading tracking-tight">
            Intelligent Release{" "}
            <span className="animated-gradient">Technology</span>
          </h2>
          <p className="text-muted-foreground max-w-4xl mx-auto text-base md:text-lg leading-relaxed">
            Ktarolib uses intelligent release processing to improve distribution accuracy and speed —
            combining AI detection, metadata validation, artwork verification, and quality control
            into one unified workflow.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {systemCards.map(({ icon: Icon, color, iconBg, borderHover, title, subtitle, checks }) => (
            <div
              key={title}
              className={`group rounded-2xl border border-white/20 md:border-white/10 bg-muted/20 p-6 transition-all duration-300 ${borderHover} hover:-translate-y-1 hover:shadow-xl hover:bg-muted/30`}
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl border border-border/40 ${iconBg} mb-5`}>
                <Icon className={`h-6 w-6 ${color}`} />
              </div>
              <h3 className="font-bold text-base md:text-lg font_heading mb-2">{title}</h3>
              <p className="text-muted-foreground text-xs md:text-sm mb-5 leading-relaxed">{subtitle}</p>
              <ul className="space-y-2.5">
                {checks.map((c) => (
                  <li key={c} className="flex items-center gap-2.5 text-md text-muted-foreground group-hover:text-foreground/80 transition-colors">
                    <CheckCircle2 className={`h-3.5 w-3.5 shrink-0 ${color}`} />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>


      </div>
    </section>
  );
}
