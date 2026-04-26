"use client";

import { motion } from "framer-motion";
import { Upload, Music, IndianRupee, ArrowRight } from "lucide-react";

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
        icon: IndianRupee,
        title: "Get Your Royalties",
        description:
            "Track your streams, monitor earnings in real-time, and receive payments directly to your account.",
    },
];

export default function HowItWorkStackingCard() {
    return (
        <div className="relative py-14 md:py-24 bg-background overflow-hidden">
            {/* Ambient Background Glowing Effects */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-violet-500/20 rounded-full blur-[120px] opacity-40 pointer-events-none" />
            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[120px] opacity-40 pointer-events-none" />

            <div className="max-w-7xl relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
                {/* Heading */}
                <motion.div
                    className="text-center mb-10 md:mb-20"
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
                    <div className="hidden md:block absolute top-1/2 -translate-y-1/2 left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-transparent via-border to-transparent -z-10" />

                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.2 }}
                                className="group relative flex flex-col focus-within:outline-none"
                            >
                                {/* Step card */}
                                <div className="w-full h-full bg-muted/20 p-8 md:p-10 rounded-[2.5rem] border border-white/10 relative overflow-hidden hover:bg-muted/40 transition-colors shadow-sm hover:shadow-xl hover:border-violet-500/20 text-left">
                                    {/* Giant background number */}
                                    <div className="absolute top-4 right-8 text-8xl md:text-9xl font-black font_heading text-foreground/[0.03] transition-transform duration-500 group-hover:scale-110 pointer-events-none">
                                        {step.number}
                                    </div>

                                    <Icon className="h-12 w-12 text-violet-500 mb-8" />

                                    <h3 className="text-xl md:text-2xl font-bold mb-4 font_heading text-foreground relative z-10">{step.title}</h3>
                                    <p className="text-muted-foreground text-base leading-relaxed relative z-10">{step.description}</p>
                                </div>

                                {/* Arrow (between items, visible on md+) */}
                                {index < steps.length - 1 && (
                                    <div className="hidden md:flex absolute top-1/2 -translate-y-1/2 -right-6 lg:-right-8 items-center justify-center z-20 pointer-events-none">
                                        <motion.div
                                            animate={{ x: [0, 8, 0] }}
                                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                            className="bg-background border border-border shadow-sm rounded-full p-2"
                                        >
                                            <ArrowRight className="w-5 h-5 text-violet-500/80" />
                                        </motion.div>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}