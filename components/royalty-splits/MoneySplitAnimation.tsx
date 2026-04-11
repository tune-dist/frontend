"use client";

import { motion, AnimatePresence, useInView } from "framer-motion";
import { IndianRupee, Wallet, User, Briefcase, TrendingUp, ShieldCheck } from "lucide-react";
import { useState, useEffect, useRef } from "react";

const FloatingNode = ({ children, className, delay = 0, isInView }: { children: React.ReactNode; className?: string; delay?: number; isInView: boolean }) => (
  <motion.div
    initial={{ y: 0, opacity: 0 }}
    animate={isInView ? { y: [0, -12, 0], opacity: 1 } : { opacity: 0 }}
    transition={{
      y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay },
      opacity: { duration: 0.8, delay: delay * 0.2 }
    }}
    className={className}
  >
    {children}
  </motion.div>
);

export default function MoneySplitAnimation() {
  const [particles, setParticles] = useState<number[]>([]);
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.3 });

  useEffect(() => {
    // Generate particle sequences
    setParticles([0, 1.2, 2.4, 3.6]);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-4xl mx-auto h-[500px] flex items-center justify-center mt-12 select-none pointer-events-none perspective-1000 overflow-visible"
    >

      {/* 1. Atmospheric Background Glows */}
      <div className="absolute inset-0 z-0 overflow-visible">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/4 w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.1] mix-blend-screen"
          style={{ background: "radial-gradient(circle, #10b981 0%, transparent 70%)" }}
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-3/4 w-[500px] h-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.1] mix-blend-screen"
          style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 70%)" }}
        />
      </div>

      {/* 2. Premium SVG Flow Paths */}
      <svg
        className="absolute inset-0 w-full h-full z-0 overflow-visible drop-shadow-[0_0_15px_rgba(16,185,129,0.2)]"
        viewBox="0 0 800 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="splitGradient" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="rgba(16, 185, 129, 0.05)" />
            <stop offset="50%" stopColor="rgba(16, 185, 129, 0.4)" />
            <stop offset="100%" stopColor="rgba(99, 102, 241, 0.05)" />
          </linearGradient>
        </defs>

        {/* Path 1: Top Branch */}
        <motion.path
          d="M 200 250 L 400 250 Q 480 250 480 120 L 600 120"
          stroke="url(#splitGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="12 24"
          initial={{ pathLength: 0 }}
          animate={isInView ? { pathLength: 1, strokeDashoffset: [0, -72] } : {}}
          transition={{
            pathLength: { duration: 2, ease: "easeInOut" },
            strokeDashoffset: { duration: 2, repeat: Infinity, ease: "linear" }
          }}
        />

        {/* Path 2: Bottom Branch */}
        <motion.path
          d="M 200 250 L 400 250 Q 480 250 480 380 L 600 380"
          stroke="url(#splitGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="12 24"
          initial={{ pathLength: 0 }}
          animate={isInView ? { pathLength: 1, strokeDashoffset: [0, -72] } : {}}
          transition={{
            pathLength: { duration: 2, ease: "easeInOut" },
            strokeDashoffset: { duration: 2, repeat: Infinity, ease: "linear" }
          }}
        />
      </svg>

      {/* 3. Source Node: Elite Card */}
      <FloatingNode isInView={isInView} className="absolute left-[100px] z-20">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-violet-500 rounded-[2rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
          <div className="relative bg-[#0a0a0c]/80 backdrop-blur-3xl border border-white/10 rounded-[1.8rem] p-7 shadow-2xl flex flex-col items-center gap-4">
            <div className="bg-emerald-500/10 rounded-2xl p-4 border border-emerald-500/20 shadow-inner">
              <Wallet className="w-10 h-10 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            </div>
            <div className="text-center">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 opacity-60">Global Revenue</p>
              <h4 className="text-lg font-bold text-white flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-emerald-400" />
                100
              </h4>
            </div>
            <div className="flex gap-1.5">
              <div className="h-1 w-8 rounded-full bg-emerald-500/40" />
              <div className="h-1 w-2 rounded-full bg-white/20" />
              <div className="h-1 w-2 rounded-full bg-white/20" />
            </div>
          </div>
        </div>
      </FloatingNode>

      {/* 4. Elite Flow Particles */}
      {isInView && particles.map((delay, i) => (
        <AnimatePresence key={i}>
          {/* Top Branch Particles */}
          <motion.div
            animate={{
              x: [-200, 0, 70, 200],
              y: [0, 0, -135, -135],
              opacity: [0, 1, 1, 0],
              scale: [0.6, 1, 1, 0.6],
              rotate: [0, 15, -15, 0],
            }}
            transition={{ duration: 4.5, delay, repeat: Infinity, ease: "easeInOut" }}
            className="absolute z-30"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-400 blur-md opacity-40 rounded-full" />
              <div className="relative bg-[#0a0a0c] border border-emerald-400/50 rounded-full p-2.5 shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                <IndianRupee className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
          </motion.div>

          {/* Bottom Branch Particles */}
          <motion.div
            animate={{
              x: [-200, 0, 70, 200],
              y: [0, 0, 125, 125],
              opacity: [0, 1, 1, 0],
              scale: [0.6, 1, 1, 0.6],
              rotate: [0, -15, 15, 0],
            }}
            transition={{ duration: 4.5, delay: delay + 0.6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute z-30"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-violet-400 blur-md opacity-40 rounded-full" />
              <div className="relative bg-[#0a0a0c] border border-violet-400/50 rounded-full p-2.5 shadow-[0_0_20px_rgba(99,102,241,0.4)]">
                <IndianRupee className="w-4 h-4 text-violet-400" />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      ))}

      {/* 5. Recipient Nodes: Elite Cards */}
      <div className="absolute right-[100px] h-full flex flex-col justify-between py-8 z-20">

        {/* Recipient 1: Artist (Top) */}
        <FloatingNode isInView={isInView} delay={0.5}>
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-3xl blur opacity-15" />
            <div className="relative bg-[#0a0a0c]/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 shadow-xl flex items-center gap-5 min-w-[240px]">
              <div className="bg-emerald-500/20 rounded-xl p-3 border border-emerald-500/20">
                <User className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center justify-between gap-12 mb-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Artist Split</p>
                  <span className="text-[10px] font-bold bg-emerald-500 text-black px-1.5 py-0.5 rounded-md">50%</span>
                </div>
                <h5 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <IndianRupee className="w-3 h-3 text-emerald-400" />
                  50
                </h5>
                <p className="text-[9px] text-emerald-400 mt-1 flex items-center gap-1">
                  <ShieldCheck className="w-2.5 h-2.5" /> Secured Payout
                </p>
              </div>
            </div>
          </div>
        </FloatingNode>

        {/* Recipient 2: Label/Producer (Bottom) */}
        <FloatingNode isInView={isInView} delay={1.2}>
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-violet-500 to-violet-400 rounded-3xl blur opacity-15" />
            <div className="relative bg-[#0a0a0c]/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 shadow-xl flex items-center gap-5 min-w-[240px]">
              <div className="bg-violet-500/20 rounded-xl p-3 border border-violet-500/20">
                <Briefcase className="w-6 h-6 text-violet-400" />
              </div>
              <div>
                <div className="flex items-center justify-between gap-12 mb-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Label Share</p>
                  <span className="text-[10px] font-bold bg-violet-500 text-white px-1.5 py-0.5 rounded-md">50%</span>
                </div>
                <h5 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <IndianRupee className="w-3 h-3 text-violet-400" />
                  50
                </h5>
                <p className="text-[9px] text-violet-400 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-2.5 h-2.5" /> High Performance
                </p>
              </div>
            </div>
          </div>
        </FloatingNode>

      </div>

    </div>
  );
}
