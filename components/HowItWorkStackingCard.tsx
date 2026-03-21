"use client";

import { motion } from "framer-motion";
import { Upload, Music, DollarSign, ArrowRight } from "lucide-react";

const steps = [
    {
        number: "01",
        icon: Upload,
        title: "Upload Your Track",
        description:
            "Simply upload your music files, artwork, and metadata. Our platform supports all major audio formats.",
    },
    {
        number: "02",
        icon: Music,
        title: "Choose Your Platforms",
        description:
            "Select from 100+ streaming platforms where you want your music distributed. Set release dates and territories.",
    },
    {
        number: "03",
        icon: DollarSign,
        title: "Get Your Royalties",
        description:
            "Track your streams, monitor earnings in real-time, and receive payments directly to your account.",
    },
];

export default function HowItWorkStackingCard() {
    return (
        <section className="relative py-24 md:py-32 bg-background overflow-hidden">
            {/* Ambient Background Glowing Effects */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-violet-500/20 rounded-full blur-[120px] opacity-40 pointer-events-none" />
            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[120px] opacity-40 pointer-events-none" />

            <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
                {/* Heading */}
                <motion.div
                    className="text-center mb-20"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-4 font_heading">
                        How It{" "}
                        <span className="animated-gradient">Works</span>
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Get your music out there in three simple steps.
                    </p>
                </motion.div>

                {/* Grid Layout replacing the Stacking mechanism */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
                    {/* Connecting Line visible only on desktop */}
                    <div className="hidden md:block absolute top-[6.5rem] left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-transparent via-border to-transparent -z-10" />

                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.2 }}
                                className="group relative flex flex-col items-center text-center focus-within:outline-none"
                            >
                                {/* Step card */}
                                <div className="w-full h-full relative bg-card/40 backdrop-blur-sm border border-border/50 rounded-3xl p-8 hover:border-violet-500/40 transition-colors duration-500 overflow-hidden">
                                    {/* Subtle hover gradient inside card */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                    {/* Icon Container */}
                                    <div className="relative mb-8 mt-2 w-24 h-24 mx-auto flex items-center justify-center">
                                        <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl group-hover:bg-violet-500/30 transition-colors duration-500" />
                                        <div className="relative w-20 h-20 rounded-2xl bg-background border border-border/50 flex items-center justify-center shadow-lg group-hover:border-violet-500/50 group-hover:scale-110 transition-all duration-500 z-10">
                                            <Icon className="h-8 w-8 text-foreground group-hover:text-violet-400 transition-colors duration-500" />
                                        </div>
                                        <div className="absolute -top-4 -right-2 text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-foreground/5 to-foreground/0 z-20 select-none group-hover:from-violet-500/20 group-hover:to-cyan-500/20 transition-all duration-500">
                                            {step.number}
                                        </div>
                                    </div>

                                    {/* Text */}
                                    <h3 className="text-xl font-semibold text-foreground mb-4">
                                        {step.title}
                                    </h3>
                                    <p className="text-muted-foreground leading-relaxed text-sm lg:text-base">
                                        {step.description}
                                    </p>
                                </div>

                                {/* Arrow (between items, visible on md+) */}
                                {index < steps.length - 1 && (
                                    <div className="hidden md:flex absolute top-[5.5rem] -right-6 lg:-right-8 w-12 h-12 items-center justify-center text-muted-foreground/30 z-0">
                                        <ArrowRight className="w-6 h-6" />
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}