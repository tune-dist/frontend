"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { motion } from "framer-motion";
import { Upload, Music, DollarSign } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

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
    const sectionRef = useRef<HTMLDivElement | null>(null);
    const cardsRef = useRef<HTMLDivElement[]>([]);

    const STACK_GAP = -25; // space between stacked cards
    const CARD_DELAY = 2; // ⏳ scroll-based delay (≈ 3s feel)

    useEffect(() => {
        if (!sectionRef.current) return;

        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top top", // prevents header overlap
                    end: "+=300%", // enough scroll for delays
                    scrub: true,
                    pin: true,
                },
            });

            cardsRef.current.forEach((card, index) => {
                tl.fromTo(
                    card,
                    {
                        y: 150,
                        opacity: 0,
                        scale: 0.96,
                    },
                    {
                        y: -index * STACK_GAP,
                        opacity: 1,
                        scale: 1,
                        duration: 1,
                        ease: "none",
                    },
                    index * CARD_DELAY // ✅ delay between cards
                );
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={sectionRef}
            className="stack-section relative min-h-screen pt-32"
        >
            {/* Heading */}
            <motion.div
                className="text-center mb-10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
            >
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                    How It{" "}
                    <span className="animated-gradient">Works</span>
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Get your music out there in three simple steps.
                </p>
            </motion.div>

            {/* Cards */}
            <div className="stack-wrapper relative flex justify-center">
                {steps.map((step, i) => {
                    const Icon = step.icon;
                    return (
                        <div
                            key={i}
                            ref={(el) => {
                                if (el) cardsRef.current[i] = el;
                            }}
                            className="stack-card absolute border-2 border-neutral-800 bg-neutral-900 rounded-2xl p-8 md:p-12"
                            style={{ zIndex: i + 1 }}
                        >
                            <div className="flex flex-col items-center text-center gap-4">
                                {/* Icon */}
                                <div className="relative mb-2 w-24 h-24 flex items-center justify-center">
                                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
                                    <div className="relative w-20 h-20 rounded-full animated-gradient-bg flex items-center justify-center border-4 border-background shadow-lg z-10">
                                        <Icon className="h-8 w-8 text-white" />
                                    </div>
                                    <div className="absolute -top-3 -right-3 text-3xl font-bold animated-gradient opacity-80 z-20">
                                        {step.number}
                                    </div>
                                </div>

                                {/* Text */}
                                <h3 className="text-2xl font-bold text-white">
                                    {step.title}
                                </h3>
                                <p className="text-muted-foreground max-w-lg font-medium text-lg">
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}