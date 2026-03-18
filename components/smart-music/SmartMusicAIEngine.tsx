"use client";

import { useState } from "react";
import {
  Bot, FileSearch, Copy, ImageIcon, Zap,
  CheckCircle2, ChevronRight
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
  const [active, setActive] = useState("metadata");
  const activeModule = aiModules.find((m) => m.id === active)!;
  const Icon = activeModule.icon;

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
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/60 bg-muted/30 text-xs text-muted-foreground mb-4">
            <Bot className="h-3.5 w-3.5 text-violet-400" />
            Advanced AI Release Engine
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font_heading mb-4">
            Our AI Helps You{" "}
            <span className="animated-gradient">Release Smarter</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm leading-relaxed">
            Our AI Release Engine optimises every release before it goes live — protecting your
            metadata, artwork, audio quality, and distribution integrity.
          </p>
        </div>

        {/* Interactive tab layout */}
        <div className="grid lg:grid-cols-5 gap-8 items-start">

          {/* Left: Tab list */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            {aiModules.map((mod) => {
              const TabIcon = mod.icon;
              const isActive = mod.id === active;
              return (
                <button
                  key={mod.id}
                  onClick={() => setActive(mod.id)}
                  className={`group w-full text-left flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 ${
                    isActive
                      ? `${mod.bgActive} shadow-lg`
                      : `border-border/50 bg-muted/20 ${mod.borderHover} hover:bg-muted/30`
                  }`}
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border/40 ${mod.iconBg}`}>
                    <TabIcon className={`h-5 w-5 ${mod.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm truncate ${isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"} transition-colors`}>
                      {mod.title}
                    </p>
                  </div>
                  <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${isActive ? `${mod.color} rotate-90` : "text-muted-foreground"}`} />
                </button>
              );
            })}
          </div>

          {/* Right: Detail panel */}
          <div className="lg:col-span-3">
            <div
              key={active}
              className={`rounded-3xl border ${activeModule.bgActive} p-8 h-full backdrop-blur transition-all duration-300`}
              style={{ animation: "fadeSlideIn 0.3s ease" }}
            >
              {/* Icon header */}
              <div className="flex items-center gap-4 mb-6">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border border-border/40 ${activeModule.iconBg}`}>
                  <Icon className={`h-7 w-7 ${activeModule.color}`} />
                </div>
                <div>
                  <h3 className="font-bold text-lg font_heading leading-tight">{activeModule.title}</h3>
                  <p className={`text-xs mt-0.5 ${activeModule.color}`}>AI-Powered Module</p>
                </div>
              </div>

              <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                {activeModule.tagline}
              </p>

              {/* Feature checklist */}
              <ul className="space-y-3">
                {activeModule.features.map((feat) => (
                  <li key={feat} className="flex items-center gap-3">
                    <CheckCircle2 className={`h-4 w-4 shrink-0 ${activeModule.color}`} />
                    <span className="text-sm text-foreground">{feat}</span>
                  </li>
                ))}
              </ul>

              {/* Bottom tag */}
              <div className="mt-8 pt-6 border-t border-border/30">
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  <Bot className="h-3.5 w-3.5" />
                  Powered by Ktarolib AI Release Engine — continuously learning with every release.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
