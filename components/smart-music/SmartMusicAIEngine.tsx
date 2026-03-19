"use client";

import {
  Bot, FileSearch, Copy, ImageIcon, Zap,
  CheckCircle2
} from "lucide-react";

const aiModules = [
  {
    id: "metadata",
    icon: FileSearch,
    color: "text-violet-400",
    borderHover: "hover:border-violet-500/40",
    bgActive: "bg-violet-500/10 border-violet-500/40",
    iconBg: "bg-violet-500/10",
    title: "AI Metadata Smart Intelligence",
    tagline: "Smart metadata that prevents store rejections before they happen.",
    features: [
      "Guides metadata entry step by step",
      "Detects missing required fields",
      "Suggests correct contributor roles",
      "Prevents store rejection errors",
    ],
  },
  {
    id: "duplicate",
    icon: Copy,
    color: "text-rose-400",
    borderHover: "hover:border-rose-500/40",
    bgActive: "bg-rose-500/10 border-rose-500/40",
    iconBg: "bg-rose-500/10",
    title: "AI Duplicate Release Detection",
    tagline: "Intelligent audio similarity scanning to avoid accidental re-uploads.",
    features: [
      "Detects duplicate releases",
      "Audio similarity detection",
      "Prevents accidental re-upload",
      "Avoids store conflicts",
    ],
  },
  {
    id: "artwork",
    icon: ImageIcon,
    color: "text-amber-400",
    borderHover: "hover:border-amber-500/40",
    bgActive: "bg-amber-500/10 border-amber-500/40",
    iconBg: "bg-amber-500/10",
    title: "AI Artwork Compliance Detection",
    tagline: "Automatically checks artwork so it passes platform requirements.",
    features: [
      "Detects resolution issues",
      "Detects border / formatting problems",
      "Detects text placement issues",
      "Suggests artwork improvements",
    ],
  },
  {
    id: "qc",
    icon: Zap,
    color: "text-emerald-400",
    borderHover: "hover:border-emerald-500/40",
    bgActive: "bg-emerald-500/10 border-emerald-500/40",
    iconBg: "bg-emerald-500/10",
    title: "AI Release Quality Control Engine",
    tagline: "Pre-release quality checks to ensure fast store approvals.",
    features: [
      "Pre-checks release before distribution",
      "Reduces rejection chances",
      "Speeds up store approval",
      "Improves release success rate",
    ],
  },
];

export default function SmartMusicAIEngine() {
  return (
    <section className="py-24 bg-muted/10 relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full opacity-[0.05]"
          style={{ background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)" }}
        />
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/60 bg-muted/30 text-sm text-muted-foreground mb-4">
            <Bot className="h-3.5 w-3.5 text-violet-400" />
            Our AI Helps You Release Smarter
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font_heading mb-4">
            Advanced {" "}
            <span className="animated-gradient">AI Release Engine</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-base leading-relaxed">
            Our AI Release Engine helps optimize releases before they go live.
          </p>
        </div>

        {/* AI Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 xl:gap-6">
          {aiModules.map((mod) => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.id}
                className={`rounded-3xl border border-border/50 bg-background/50 hover:bg-muted/20 backdrop-blur p-6 lg:p-5 xl:p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${mod.borderHover}`}
              >
                {/* Header */}
                <div className="flex flex-col items-start gap-4 mb-5">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border border-border/40 ${mod.iconBg}`}>
                    <Icon className={`h-6 w-6 ${mod.color}`} />
                  </div>
                  <h3 className="font-bold text-base font_heading leading-snug text-foreground">
                    {mod.title}
                  </h3>
                </div>

                {/* Checklist */}
                <ul className="space-y-3">
                  {mod.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5">
                      <CheckCircle2 className={`h-4 w-4 shrink-0 mt-0.5 ${mod.color}`} />
                      <span className="text-[13px] text-muted-foreground leading-relaxed">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>


    </section>
  );
}
