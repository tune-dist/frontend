"use client";

import { motion, AnimatePresence, useInView } from "framer-motion";
import { IndianRupee, Wallet, User, Briefcase, TrendingUp, ShieldCheck } from "lucide-react";
import { useState, useEffect, useRef } from "react";

/* ─── Floating wrapper ─────────────────────────────────────────────────────── */
const FloatingNode = ({
  children,
  className,
  delay = 0,
  isInView,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  isInView: boolean;
}) => (
  <motion.div
    initial={{ y: 0, opacity: 0 }}
    animate={isInView ? { y: [0, -8, 0], opacity: 1 } : { opacity: 0 }}
    transition={{
      y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay },
      opacity: { duration: 0.8, delay: delay * 0.2 },
    }}
    className={className}
  >
    {children}
  </motion.div>
);

/* ─── Reusable recipient card ──────────────────────────────────────────────── */
function RecipientCard({
  icon: Icon,
  label,
  pct,
  sub,
  SubIcon,
  color,
}: {
  icon: React.ElementType;
  label: string;
  pct: string;
  sub: string;
  SubIcon: React.ElementType;
  color: "emerald" | "violet";
}) {
  const palette = {
    emerald: {
      glow: "from-emerald-500 to-emerald-400",
      bg: "bg-emerald-500/20",
      border: "border-emerald-500/20",
      icon: "text-emerald-400",
      text: "text-emerald-400",
    },
    violet: {
      glow: "from-violet-500 to-violet-400",
      bg: "bg-violet-500/20",
      border: "border-violet-500/20",
      icon: "text-violet-400",
      text: "text-violet-400",
    },
  }[color];

  return (
    <div className="relative group w-full">
      <div className={`absolute -inset-1 bg-gradient-to-r ${palette.glow} rounded-3xl blur opacity-15`} />
      <div className="relative bg-[#0a0a0c]/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 sm:p-5 shadow-xl flex items-center gap-4 sm:gap-5">
        <div className={`shrink-0 ${palette.bg} rounded-xl p-2.5 sm:p-3 border ${palette.border}`}>
          <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${palette.icon}`} />
        </div>
        <div className="min-w-0">
          <p className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
            {label}
          </p>
          <h5 className={`text-sm font-bold text-white flex items-center gap-1`}>
            <IndianRupee className={`w-3 h-3 ${palette.icon}`} />
            {pct}
          </h5>
          <p className={`text-[9px] ${palette.text} mt-1 flex items-center gap-1`}>
            <SubIcon className="w-2.5 h-2.5" /> {sub}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Source card ──────────────────────────────────────────────────────────── */
function SourceCard() {
  return (
    <div className="relative group">
      <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-violet-500 rounded-[2rem] blur opacity-25 transition duration-1000" />
      <div className="relative bg-[#0a0a0c]/80 backdrop-blur-3xl border border-white/10 rounded-[1.5rem] sm:rounded-[1.8rem] p-5 sm:p-7 shadow-2xl flex flex-col items-center gap-3 sm:gap-4">
        <div className="bg-emerald-500/10 rounded-2xl p-3 sm:p-4 border border-emerald-500/20 shadow-inner">
          <Wallet className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
        </div>
        <div className="text-center">
          <p className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 opacity-60">
            Global Revenue
          </p>
          <h4 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <IndianRupee className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
            100%
          </h4>
        </div>
        <div className="flex gap-1.5">
          <div className="h-1 w-8 rounded-full bg-emerald-500/40" />
          <div className="h-1 w-2 rounded-full bg-white/20" />
          <div className="h-1 w-2 rounded-full bg-white/20" />
        </div>
      </div>
    </div>
  );
}

/* ─── Mobile layout (vertical stack) ──────────────────────────────────────── */
function MobileLayout({ isInView }: { isInView: boolean }) {
  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-xs mx-auto">
      {/* Source */}
      <FloatingNode isInView={isInView} delay={0}>
        <SourceCard />
      </FloatingNode>

      {/* Connector */}
      <motion.div
        className="flex flex-col items-center gap-1"
        initial={{ opacity: 0, scaleY: 0 }}
        animate={isInView ? { opacity: 1, scaleY: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.4 }}
        style={{ transformOrigin: "top" }}
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="w-0.5 h-3 rounded-full bg-gradient-to-b from-emerald-400 to-violet-400"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </motion.div>

      {/* Recipients */}
      <div className="flex flex-col gap-3 w-full">
        <FloatingNode isInView={isInView} delay={0.6}>
          <RecipientCard
            icon={User}
            label="Artist Split"
            pct="50%"
            sub="Secured Payout"
            SubIcon={ShieldCheck}
            color="emerald"
          />
        </FloatingNode>
        <FloatingNode isInView={isInView} delay={1.2}>
          <RecipientCard
            icon={Briefcase}
            label="Label Share"
            pct="50%"
            sub="High Performance"
            SubIcon={TrendingUp}
            color="violet"
          />
        </FloatingNode>
      </div>
    </div>
  );
}

/* ─── Desktop layout (horizontal flow with SVG + particles) ────────────────── */
function DesktopLayout({ isInView, particles }: { isInView: boolean; particles: number[] }) {
  return (
    <div className="relative w-full max-w-4xl mx-auto h-[500px] flex items-center justify-center">
      {/* Atmospheric glows */}
      <div className="absolute inset-0 z-0">
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

      {/* SVG flow paths */}
      <svg
        className="absolute inset-0 w-full h-full z-0 overflow-visible drop-shadow-[0_0_15px_rgba(16,185,129,0.2)]"
        viewBox="0 0 800 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="splitGradientDesktop" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="rgba(16, 185, 129, 0.05)" />
            <stop offset="50%" stopColor="rgba(16, 185, 129, 0.4)" />
            <stop offset="100%" stopColor="rgba(99, 102, 241, 0.05)" />
          </linearGradient>
        </defs>
        <motion.path
          d="M 200 250 L 400 250 Q 480 250 480 120 L 600 120"
          stroke="url(#splitGradientDesktop)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="12 24"
          initial={{ pathLength: 0 }}
          animate={isInView ? { pathLength: 1, strokeDashoffset: [0, -72] } : {}}
          transition={{
            pathLength: { duration: 2, ease: "easeInOut" },
            strokeDashoffset: { duration: 2, repeat: Infinity, ease: "linear" },
          }}
        />
        <motion.path
          d="M 200 250 L 400 250 Q 480 250 480 380 L 600 380"
          stroke="url(#splitGradientDesktop)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="12 24"
          initial={{ pathLength: 0 }}
          animate={isInView ? { pathLength: 1, strokeDashoffset: [0, -72] } : {}}
          transition={{
            pathLength: { duration: 2, ease: "easeInOut" },
            strokeDashoffset: { duration: 2, repeat: Infinity, ease: "linear" },
          }}
        />
      </svg>

      {/* Source node */}
      <FloatingNode isInView={isInView} className="absolute left-[80px] xl:left-[100px] z-20">
        <SourceCard />
      </FloatingNode>

      {/* Particles */}
      {isInView &&
        particles.map((delay, i) => (
          <AnimatePresence key={i}>
            <motion.div
              animate={{ x: [-200, 0, 70, 200], y: [0, 0, -130, -130], opacity: [0, 1, 1, 0], scale: [0.6, 1, 1, 0.6] }}
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
            <motion.div
              animate={{ x: [-200, 0, 70, 200], y: [0, 0, 130, 130], opacity: [0, 1, 1, 0], scale: [0.6, 1, 1, 0.6] }}
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

      {/* Recipient nodes */}
      <div className="absolute right-[80px] xl:right-[100px] w-auto h-full z-20 pointer-events-none">
        <div className="absolute right-0 top-[120px] -translate-y-1/2 pointer-events-auto min-w-[200px] lg:min-w-[240px]">
          <FloatingNode isInView={isInView} delay={0.5}>
            <RecipientCard icon={User} label="Artist Split" pct="50%" sub="Secured Payout" SubIcon={ShieldCheck} color="emerald" />
          </FloatingNode>
        </div>
        <div className="absolute right-0 top-[380px] -translate-y-1/2 pointer-events-auto min-w-[200px] lg:min-w-[240px]">
          <FloatingNode isInView={isInView} delay={1.2}>
            <RecipientCard icon={Briefcase} label="Label Share" pct="50%" sub="High Performance" SubIcon={TrendingUp} color="violet" />
          </FloatingNode>
        </div>
      </div>
    </div>
  );
}

/* ─── Main export ──────────────────────────────────────────────────────────── */
export default function MoneySplitAnimation() {
  const [particles, setParticles] = useState<number[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.3 });

  useEffect(() => {
    setParticles([0, 1.2, 2.4, 3.6]);
    setMounted(true);
    
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile(); // Initial check
    
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full mt-10 sm:mt-12 select-none pointer-events-none overflow-visible"
    >
      {!mounted ? (
        // SSR Fallback: Render both, hide via CSS to prevent layout shift before hydration
        <>
          <div className="md:hidden px-4">
            <MobileLayout isInView={isInView} />
          </div>
          <div className="hidden md:block">
            <DesktopLayout isInView={isInView} particles={particles} />
          </div>
        </>
      ) : isMobile ? (
        // Client Mobile: Render ONLY the mobile layout
        <div className="px-4">
          <MobileLayout isInView={isInView} />
        </div>
      ) : (
        // Client Desktop: Render ONLY the desktop layout
        <div>
          <DesktopLayout isInView={isInView} particles={particles} />
        </div>
      )}
    </div>
  );
}
