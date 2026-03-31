"use client";

import { CheckCircle2, Users, FileSignature, ShieldCheck, Route } from "lucide-react";

const leftCheckmarks = [
  "Team-Level Permissions",
  "Customizable Contracts",
  "Contract-Level Expirations",
  "Stakeholder-Level Approvals"
];

const rightCards = [
  {
    icon: Users,
    title: "Unlimited Payees",
    desc: "Add unlimited collaborators to any percentage split smart contract",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10"
  },
  {
    icon: FileSignature,
    title: "Automated Contracts",
    desc: "Automatically generate contracts and metadata for 100% compliance",
    color: "text-indigo-400",
    bg: "bg-indigo-500/10"
  },
  {
    icon: ShieldCheck,
    title: "Audit Trails",
    desc: "Comprehensive audit trails for internal and external audits",
    color: "text-violet-400",
    bg: "bg-violet-500/10"
  },
  {
    icon: Route,
    title: "Auto Routing",
    desc: "System handles the complex math to route funds with exact efficiency",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10"
  }
];

export default function RoyaltySplitsCollaboration() {
  return (
    <section id="collaboration" className="py-24 bg-background relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full opacity-[0.05]"
          style={{ background: "radial-gradient(circle, #10b981 0%, transparent 70%)" }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left Column */}
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font_heading mb-6 tracking-tight leading-[1.1]">
              Intelligent <span className="animated-gradient">Royalty <br /> Collaboration</span>
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-8 max-w-md">
              Our instantly accessible platform enables frictionless collaboration
              across every stakeholder in the music ecosystem.
            </p>

            <ul className="space-y-4 mb-10">
              {leftCheckmarks.map((label, idx) => (
                <li key={idx} className="flex items-center gap-3 text-sm text-foreground font-medium">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                  {label}
                </li>
              ))}
            </ul>

            <div className="relative p-6 sm:p-8 rounded-2xl border border-border/50 bg-muted/20 hover:border-emerald-500/30 transition-colors">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-400 rounded-l-2xl"></div>
              <p className="text-sm italic text-muted-foreground leading-relaxed pl-2 relative z-10">
                &quot;Assign percentage splits across individual tracks, albums or catalogs, with flexible models that fit your specific lifecycle&quot;
              </p>
            </div>
          </div>

          {/* Right Column (4 grid cards) */}
          <div className="grid sm:grid-cols-2 gap-5">
            {rightCards.map((card, i) => (
              <div
                key={i}
                className="group flex flex-col items-start gap-4 p-6 sm:p-8 rounded-2xl border border-border/50 bg-muted/20 hover:bg-muted/40 transition-all duration-300 hover:border-emerald-500/30 hover:shadow-xl"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl border border-border/40 ${card.bg} group-hover:scale-110 transition-transform duration-300`}>
                  <card.icon className={`h-6 w-6 ${card.color}`} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground mb-2 leading-snug">{card.title}</h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">{card.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
