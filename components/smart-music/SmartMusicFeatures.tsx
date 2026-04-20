"use client";

import {
  BarChart3, TrendingUp, Users, MapPin, Layers,
  Music2, Headphones, Mic2, Phone, Shield, CheckCircle2,
  Sparkles, Zap, ShieldCheck
} from "lucide-react";
import { motion } from "framer-motion";

const analyticItems = [
  { icon: BarChart3, label: "Streaming Performance", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", glow: "from-blue-500/20" },
  { icon: TrendingUp, label: "Revenue Trends", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", glow: "from-emerald-500/20" },
  { icon: Users, label: "Listener Demographics", color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20", glow: "from-violet-500/20" },
  { icon: MapPin, label: "Territory Performance", color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20", glow: "from-rose-500/20" },
  { icon: Layers, label: "Platform Performance", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", glow: "from-amber-500/20" },
];

const additionalFeatures = [
  {
    icon: Music2,
    color: "text-pink-400",
    iconBg: "bg-pink-500/10",
    borderHover: "hover:border-pink-500/40",
    glow: "bg-pink-500/5",
    title: "AI Cover Art Generator",
    image: "/assets/images/ai-cover-art-generater-thumb.png",
    desc: "Create high-fidelity, professional artwork instantly using our proprietary Generative AI model.",
    items: ["AI Generated Artwork", "Professional Quality Output", "Style Suggestions", "Export Ready Files"],
  },
  {
    icon: Headphones,
    color: "text-indigo-400",
    iconBg: "bg-indigo-500/10",
    borderHover: "hover:border-indigo-500/40",
    glow: "bg-indigo-500/5",
    title: "AI Music Mastering",
    image: "/assets/images/ai-music-mastering-thumb.png",
    desc: "Master your track using elite AI mastering technology, ensuring your sound is ready for global distribution.",
    items: ["Loudness Optimization", "Platform Ready Sound", "Balanced Output", "Fast Processing"],
  },
  {
    icon: Phone,
    color: "text-teal-400",
    iconBg: "bg-teal-500/10",
    borderHover: "hover:border-teal-500/40",
    glow: "bg-teal-500/5",
    title: "Telecom CRBT Distribution",
    image: "/assets/images/telecom-crbt-distribution.png",
    desc: "Unlock new revenue streams through telecom caller tune distribution across international networks.",
    items: ["Caller Tune Availability", "Telecom Revenue Channel", "Regional Market Expansion"],
  },
  {
    icon: Shield,
    color: "text-amber-400",
    iconBg: "bg-amber-500/10",
    borderHover: "hover:border-amber-500/40",
    glow: "bg-amber-500/5",
    title: "Credit & Revenue Protection",
    desc: "Experience 100% transparent royalty tracking and industrial-grade credit accuracy for all contributors.",
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
      <section className="py-24 relative overflow-hidden bg-[#030303]">
        {/* Ambient background glows */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-[10px] uppercase tracking-widest text-indigo-300 mb-6"
            >
              <Sparkles className="h-3 w-3" />
              Intelligence Core
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-6xl font-bold font_heading mb-6 tracking-tight"
            >
              Advanced Music <span className="animated-gradient">Analytics Engine</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed font-light"
            >
              Precision tools to track, analyze, and scale your music career across every global platform and territory.
            </motion.p>
          </div>

          {/* Analytics Bento Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-16">
            {analyticItems.map(({ icon: Icon, label, color, bg, border, glow }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -5 }}
                className={`group relative p-6 rounded-[2rem] border ${border} bg-white/[0.03] backdrop-blur-md transition-all duration-500 overflow-hidden`}
              >
                {/* Internal radial glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${glow} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                <div className="relative z-10">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${bg} ${border} mb-4 group-hover:scale-110 transition-transform duration-500 shadow-xl`}>
                    <Icon className={`h-6 w-6 ${color}`} />
                  </div>
                  <h4 className="text-sm font-semibold text-white group-hover:text-white/90 transition-colors">{label}</h4>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Elite Migration Portal */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group relative rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 p-8 md:p-12 overflow-hidden"
          >
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />

            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-10">
              <div className="flex-[1.2] text-center lg:text-left">
                <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">Enterprise Safe</span>
                </div>
                <h3 className="font-bold text-3xl md:text-4xl font_heading mb-6 tracking-tight text-white">Hassle-Free <span className="text-indigo-400">Catalog Migration</span></h3>
                <p className="text-muted-foreground text-lg leading-relaxed max-w-xl font-light">
                  Seamlessly transition your entire library without losing a single cent. We guarantee zero downtime and maximum protection for your metadata.
                </p>
              </div>

              <div className="flex-1 w-full lg:w-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {migrationPoints.map((p, i) => (
                    <motion.div
                      key={p}
                      whileHover={{ x: 5 }}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.04] border border-white/5 hover:bg-white/[0.08] hover:border-white/10 transition-all cursor-default"
                    >
                      <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      </div>
                      <span className="text-sm font-medium text-white/80">{p}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Feature Cards - Alternate Design ── */}
      <section className="py-24 bg-[#030303] relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-pink-500/20 bg-pink-500/5 text-xs text-pink-300 mb-6"
            >
              <Zap className="h-3.5 w-3.5" />
              Creative Suite
            </motion.div>
            <h2 className="text-4xl md:text-6xl font-bold font_heading tracking-tight mb-6">
              Empower Your <br />
              <span className="animated-gradient">Creative Workflow</span>
            </h2>
          </div>

          <div className="flex flex-col gap-32">
            {additionalFeatures.map(({ icon: Icon, color, iconBg, borderHover, glow, title, desc, items, image }, index) => {
              const isEven = index % 2 !== 0;
              return (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.7 }}
                  className={`group relative flex flex-col md:flex-row items-center gap-12 lg:gap-20`}
                >
                  {/* Visual Element */}
                  <div className={`w-full md:w-1/2 relative  ${isEven ? 'md:order-last' : ''}`}>
                    <div className={`absolute inset-0 blur-[100px] rounded-full scale-75 opacity-20 transition-opacity duration-700 group-hover:opacity-40 ${glow}`} />
                    <div className={`relative z-10 rounded-[2.5rem] overflow-hidden  p-4 transform transition-transform duration-700 group-hover:scale-[1.02] shadow-2xl`}>
                      {image ? (
                        <img src={image} alt={title} className="w-full h-auto rounded-[1.5rem]" />
                      ) : (
                        <div className="aspect-video flex items-center justify-center bg-zinc-900/50">
                          <Icon className={`w-24 h-24 ${color} opacity-50`} />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Text Content */}
                  <div className="w-full md:w-1/2">
                    <div className={`flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 ${iconBg} mb-8 shadow-inner`}>
                      <Icon className={`h-8 w-8 ${color}`} />
                    </div>
                    <h3 className="font-bold text-3xl md:text-4xl font_heading mb-6 tracking-tight">{title}</h3>
                    <p className="text-muted-foreground text-md md:text-lg mb-10 leading-relaxed font-light">{desc}</p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                      {items.map((item) => (
                        <li key={item} className="flex items-center gap-3 text-sm md:text-base text-white/70 group-hover:text-white transition-colors duration-300">
                          <CheckCircle2 className={`h-5 w-5 shrink-0 ${color}`} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
