"use client";

import Image from "next/image";
import worldwideIcon from "@/public/assets/images/worldwide-distribution-icon.svg";
import protectionIcon from "@/public/assets/images/protection-icon.svg";
import callerTuneIcon from "@/public/assets/images/caller-tune-icon.svg";
import growthIcon from "@/public/assets/images/gowth-strategy-icon.svg";

const features = [
  {
    image: worldwideIcon,
    title: "Worldwide Distribution",
    desc: "Access 150+ stores globally including Spotify, Apple Music, and Amazon."
  },
  {
    image: protectionIcon,
    title: "100% Artist Protection",
    desc: "Full credit protection and automated rights management for every release."
  },
  {
    image: callerTuneIcon,
    title: "CRBT / Caller Tune",
    desc: "Unique revenue streams through telecom partnerships and caller tunes."
  },
  {
    image: growthIcon,
    title: "Growth Strategy",
    desc: "Dedicated team helping new artists navigate the global music landscape."
  }
];

export default function VelocitySection() {
  return (
    <section className="py-12 md:py-24 bg-muted/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16 w-full">
          <div className="max-w-2xl">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-4 font_heading tracking-tight">
              Ultra Fast Release <span className="animated-gradient">Delivery</span>
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
              Don&apos;t wait weeks to go live. Our AI-driven release engine ensures your music hits stores in record time.
            </p>
          </div>
          <div className="text-5xl md:text-7xl font-black font_heading text-violet-500/20 tracking-tighter shrink-0 pt-4 md:pt-0">
            24-48 HOURS
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {features.map((item, i) => (
            <div
              key={i}
              className="group bg-muted/20 p-8 rounded-2xl transition-all duration-300 hover:bg-muted/40 border border-white/10 border-l-[3px] border-transparent hover:border-violet-400 hover:shadow-xl text-center md:text-left"
            >
              <Image
                src={item.image}
                alt={item.title}
                width={70}
                height={70}
                className="mb-6 group-hover:scale-110 transition-transform object-contain mx-auto md:mx-0"
              />
              <h3 className="font-bold font_heading text-lg sm:text-xl mb-3 leading-snug">{item.title}</h3>
              <p className="text-muted-foreground text-base sm:text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
