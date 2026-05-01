"use client";

import Image from "next/image";
import uploadIcon from "@/public/assets/images/upload-music-icon.svg";
import networkIcon from "@/public/assets/images/global-network-icon.svg";
import earnIcon from "@/public/assets/images/earn-revenue-icon.svg";

const steps = [
  {
    num: "01",
    image: uploadIcon,
    title: "Upload Your Music",
    desc: "Studio-quality metadata management, credit tracking, and automatic formatting for all platforms."
  },
  {
    num: "02",
    image: networkIcon,
    title: "Global Distribution",
    desc: "Instant push to streaming services, social platforms, and regional telecom networks worldwide."
  },
  {
    num: "03",
    image: earnIcon,
    title: "Earn Revenue",
    desc: "Transparent reporting dashboard with real-time analytics and direct payout options."
  }
];

export default function PipelineSection() {
  return (
    <section className="py-12 md:py-24 bg-muted/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">

        <div className="text-center mb-10 lg:mb-20">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 font_heading tracking-tight">The <span className="animated-gradient">Ktarolib </span>Pipeline</h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-base sm:text-lg">
            Three steps to global domination. Simple, transparent, and powerful.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="bg-muted/20 p-10 rounded-[2.5rem] border border-white/10 relative group overflow-hidden hover:bg-muted/40 transition-colors shadow-sm hover:shadow-xl hover:border-violet-500/40"
            >
              {/* Giant background number */}
              <div className="absolute top-4 right-8 text-8xl md:text-9xl font-black font_heading text-foreground/[0.03] transition-transform duration-500 group-hover:scale-110 pointer-events-none">
                {step.num}
              </div>

              <Image
                src={step.image}
                alt={step.title}
                width={100}
                height={100}
                className="mb-8 object-contain"
              />

              <h3 className="text-2xl font-bold mb-4 font_heading text-foreground relative z-10">{step.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed relative z-10">{step.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
