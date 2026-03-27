"use client";

import { UploadCloud, Globe2, Banknote } from "lucide-react";

const steps = [
  {
    num: "01",
    icon: UploadCloud,
    title: "Upload Your Music",
    desc: "Studio-quality metadata management, credit tracking, and automatic formatting for all platforms."
  },
  {
    num: "02",
    icon: Globe2,
    title: "Global Distribution",
    desc: "Instant push to streaming services, social platforms, and regional telecom networks worldwide."
  },
  {
    num: "03",
    icon: Banknote,
    title: "Earn Revenue",
    desc: "Transparent reporting dashboard with real-time analytics and direct payout options."
  }
];

export default function PipelineSection() {
  return (
    <section className="py-24 sm:py-32 bg-muted/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">

        <div className="text-center mb-16 lg:mb-20">
          <h2 className="text-4xl sm:text-5xl font-bold font_heading mb-6 tracking-tight">The <span className="animated-gradient">Ktarolib </span>Pipeline</h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-base sm:text-lg">
            Three steps to global domination. Simple, transparent, and powerful.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="bg-muted/20 p-10 rounded-[2.5rem] border border-border/40 relative group overflow-hidden hover:bg-muted/40 transition-colors shadow-sm hover:shadow-xl hover:border-violet-500/20"
            >
              {/* Giant background number */}
              <div className="absolute top-4 right-8 text-8xl md:text-9xl font-black font_heading text-foreground/[0.03] transition-transform duration-500 group-hover:scale-110 pointer-events-none">
                {step.num}
              </div>

              <step.icon className="h-12 w-12 text-violet-500 mb-8" />

              <h3 className="text-2xl font-bold mb-4 font_heading text-foreground relative z-10">{step.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed relative z-10">{step.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
