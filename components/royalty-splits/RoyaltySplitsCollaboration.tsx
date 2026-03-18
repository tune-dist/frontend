"use client";

import { useState } from "react";
import { Users, Mic2, Music2, PenLine, FileMusic, Building2, Star, CheckCircle2 } from "lucide-react";

const collaborators = [
  { icon: Star,      id: "primary",   label: "Primary Artists",   desc: "The main recording artist(s) on the release. Define their ownership percentage and ensure they receive the majority of streaming revenue." },
  { icon: Mic2,      id: "featured",  label: "Featured Artists",  desc: "Guest or featured contributors on a track. Set precise percentage allocations that auto-apply across all relevant platforms." },
  { icon: Music2,    id: "producers", label: "Producers",         desc: "Beat-makers, studio producers and beat leasing partners. Assign backend royalty shares that calculate automatically after release." },
  { icon: PenLine,   id: "composers", label: "Composers",         desc: "Melody and musical composition authors. Track their publishing splits alongside master recording shares in one unified view." },
  { icon: FileMusic, id: "lyricists", label: "Lyricists",         desc: "Songwriting contributors responsible for lyrics. Ensure fair publishing royalty allocation with zero manual reconciliation." },
  { icon: Building2, id: "labels",    label: "Labels & Partners", desc: "Record labels, distribution partners, and financing entities. Configure label recoupment, priority recovery, and waterfall payouts." },
];

export default function RoyaltySplitsCollaboration() {
  const [active, setActive] = useState("primary");
  const activeItem = collaborators.find((c) => c.id === active)!;
  const ActiveIcon = activeItem.icon;

  return (
    <section id="collaboration" className="py-24 bg-background relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full opacity-[0.05]"
          style={{ background: "radial-gradient(circle, #10b981 0%, transparent 70%)" }} />
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/60 bg-muted/30 text-xs text-muted-foreground mb-4">
            <Users className="h-3.5 w-3.5 text-emerald-400" />
            Intelligent Royalty Collaboration
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font_heading mb-4">
            Built For Real{" "}
            <span className="animated-gradient">Music Workflows</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm leading-relaxed">
            Define royalty ownership with precision. Add unlimited collaborators and assign percentage
            splits once — Kratolib automatically handles calculations, tracking, and payouts across
            the entire release lifecycle.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 items-start">
          {/* Left: role selector */}
          <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3">
            {collaborators.map(({ icon: Icon, id, label }) => {
              const isActive = id === active;
              return (
                <button
                  key={id}
                  onClick={() => setActive(id)}
                  className={`group flex flex-col items-center text-center gap-3 p-4 rounded-2xl border transition-all duration-300 ${
                    isActive
                      ? "border-emerald-500/50 bg-emerald-500/10 shadow-lg"
                      : "border-border/50 bg-muted/20 hover:bg-muted/40 hover:border-emerald-500/20"
                  }`}
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-colors ${
                    isActive ? "border-emerald-500/40 bg-emerald-500/15" : "border-border/40 bg-muted/40 group-hover:bg-emerald-500/10"
                  }`}>
                    <Icon className={`h-5 w-5 ${isActive ? "text-emerald-400" : "text-muted-foreground group-hover:text-emerald-400"} transition-colors`} />
                  </div>
                  <span className={`text-xs font-semibold leading-snug ${isActive ? "text-foreground" : "text-muted-foreground"} transition-colors`}>
                    {label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right: detail panel */}
          <div className="lg:col-span-3">
            <div
              key={active}
              className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-8 h-full"
              style={{ animation: "fadeSlideIn 0.3s ease" }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/15">
                  <ActiveIcon className="h-7 w-7 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-bold text-lg font_heading">{activeItem.label}</h3>
                  <p className="text-xs text-emerald-400">Collaborator Role</p>
                </div>
              </div>

              <p className="text-muted-foreground text-sm leading-relaxed mb-6">{activeItem.desc}</p>

              <ul className="space-y-2.5">
                {["Assign percentage split once", "Auto-calculations across all releases", "Real-time payout tracking", "Full audit trail per collaborator"].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-foreground">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mt-8 pt-6 border-t border-border/30">
                <p className="text-xs text-muted-foreground">
                  Scales from single releases to large multi-artist catalogs automatically.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </section>
  );
}
