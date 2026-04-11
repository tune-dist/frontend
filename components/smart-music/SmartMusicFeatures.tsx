"use client";

import {
  BarChart3, TrendingUp, Users, MapPin, Layers,
  Music2, Headphones, Mic2, Phone, Shield, CheckCircle2
} from "lucide-react";

const analyticItems = [
  { icon: BarChart3, label: "Streaming Performance", color: "text-blue-400" },
  { icon: TrendingUp, label: "Revenue Trends", color: "text-emerald-400" },
  { icon: Users, label: "Listener Demographics", color: "text-violet-400" },
  { icon: MapPin, label: "Territory Performance", color: "text-rose-400" },
  { icon: Layers, label: "Platform Performance", color: "text-amber-400" },
];

const additionalFeatures = [
  {
    icon: Music2,
    color: "text-pink-400",
    iconBg: "bg-pink-500/10",
    borderHover: "hover:border-pink-500/30",
    title: "AI Cover Art Generator",
    image: "/assets/images/ai-cover-art-generater-thumb.png",
    desc: "Create professional artwork instantly.",
    items: ["AI Generated Artwork", "Professional Quality Output", "Style Suggestions", "Export Ready Files"],
  },
  {
    icon: Headphones,
    color: "text-indigo-400",
    iconBg: "bg-indigo-500/10",
    borderHover: "hover:border-indigo-500/30",
    title: "AI Music Mastering",
    image: "/assets/images/ai-music-mastering-thumb.png",
    desc: "Master your track using AI mastering technology.",
    items: ["Loudness Optimization", "Platform Ready Sound", "Balanced Output", "Fast Processing"],
  },
  {
    icon: Phone,
    color: "text-teal-400",
    iconBg: "bg-teal-500/10",
    borderHover: "hover:border-teal-500/30",
    title: "Telecom CRBT Distribution",
    image: "/assets/images/telecom-crbt-distribution.png",
    desc: "Unlock additional revenue through telecom caller tune distribution.",
    items: ["Caller Tune Availability", "Telecom Revenue Channel", "Regional Market Expansion"],
  },
  {
    icon: Shield,
    color: "text-amber-400",
    iconBg: "bg-amber-500/10",
    borderHover: "hover:border-amber-500/30",
    title: "Credit & Revenue Protection",
    desc: "100% transparent royalty tracking and credit accuracy.",
    image: "/assets/images/credit-and-revenue-protection-thumb.png",
    items: ["Artist Credit Protection", "Contributor Credit Accuracy", "Store Matching Protection", "Transparent Revenue Tracking"],
  },
];

const migrationPoints = [
  "Full Catalog Transfer",
  "No Store Downtime",
  "No Revenue Loss",
  "Metadata Protection",
  "Credit Protection",
];

export default function SmartMusicFeatures() {
  return (
    <>
      {/* ── Analytics ── */}
      <section className="py-24 bg-muted/10 relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-[0.04]"
            style={{ background: "radial-gradient(ellipse, #6366f1 0%, transparent 70%)" }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/60 bg-muted/30 text-xs text-muted-foreground mb-4">
              <BarChart3 className="h-3.5 w-3.5 text-blue-400" />
              Advanced Analytics
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font_heading mb-4">
              Advanced Music{" "}
              <span className="animated-gradient">Analytics System</span>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-sm">
              Track, analyse, and optimise your music performance in real time across every platform and territory.
            </p>
          </div>

          {/* Analytics grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-16">
            {analyticItems.map(({ icon: Icon, label, color }) => (
              <div
                key={label}
                className="group flex flex-col items-center text-center gap-3 p-5 rounded-2xl border border-border/50 bg-muted/20 hover:bg-muted/40 hover:border-border/80 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border/40 bg-muted/40 group-hover:scale-110 transition-transform duration-300">
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <p className="text-sm font-semibold text-foreground leading-snug">{label}</p>
              </div>
            ))}
          </div>

          {/* Migration banner */}
          <div className="rounded-3xl border border-border/50 bg-gradient-to-br from-muted/30 to-muted/10 p-8 flex flex-col lg:flex-row items-center gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Mic2 className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-xl font_heading">Hassle-Free Catalog Migration</h3>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Transfer your entire music catalog safely and easily — no store downtime, no revenue loss,
                full metadata and credit protection guaranteed.
              </p>
            </div>
            <ul className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {migrationPoints.map((p) => (
                <li key={p} className="flex items-center gap-2.5 text-sm text-foreground">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Additional Feature Cards ── */}
      <section className="py-24 bg-background relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div
            className="absolute bottom-0 right-0 w-[450px] h-[450px] rounded-full opacity-[0.05]"
            style={{ background: "radial-gradient(circle, #ec4899 0%, transparent 70%)" }}
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/60 bg-muted/30 text-xs text-muted-foreground mb-4">
              <Layers className="h-3.5 w-3.5 text-pink-400" />
              Platform Tools
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold font_heading mb-4">
              Everything You Need{" "}
              <span className="animated-gradient">in One Platform</span>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-base">
              From AI-generated artwork to automatic mastering and telecom CRBT — you have every tool at your fingertips.
            </p>
          </div>

          <div className="flex flex-col gap-12 md:gap-16">
            {additionalFeatures.map(({ icon: Icon, color, iconBg, borderHover, title, desc, items, image }, index) => {
              const isEven = index % 2 !== 0;
              return (
                <div
                  key={title}
                  className={`group rounded-3xl flex flex-col md:flex-row transition-all duration-300`}
                >
                  {/* Image / Graphic Side */}
                  <div className={`w-full md:w-1/2 min-h-[300px] flex items-center justify-center relative  ${isEven ? 'md:order-last' : ''}`}>
                    {image ? (
                      <img src={image} alt={title} className="relative z-10" />
                    ) : (
                      <div className="relative w-full h-full flex items-center justify-center">
                        <div className={`absolute inset-0 opacity-20 ${iconBg} blur-3xl rounded-full scale-150 transform transition-transform duration-700 group-hover:scale-110`} />
                        <Icon className={`w-32 h-32 ${color} relative z-10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`} />
                      </div>
                    )}
                  </div>

                  {/* Content Side */}
                  <div className="w-full md:w-1/2 p-8 md:p-14 flex flex-col justify-center">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border border-border/40 ${iconBg} mb-6 transition-transform duration-300 group-hover:scale-110`}>
                      <Icon className={`h-6 w-6 ${color}`} />
                    </div>
                    <h3 className="font-bold text-2xl md:text-3xl font_heading mb-4">{title}</h3>
                    <p className="text-muted-foreground text-base md:text-lg mb-8 leading-relaxed max-w-lg">{desc}</p>
                    <ul className="space-y-4">
                      {items.map((item) => (
                        <li key={item} className="flex items-center gap-3 text-sm md:text-base text-foreground font-medium">
                          <CheckCircle2 className={`h-5 w-5 shrink-0 ${color}`} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
