"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function HowItWorkStackingCard() {
    const sectionRef = useRef<HTMLDivElement | null>(null);
    const cardsRef = useRef<HTMLDivElement[]>([]);

    const STACK_GAP = -25; // 🔥 space between stacked cards (px)

    useEffect(() => {
        if (!sectionRef.current) return;

        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top-=120 top",
                    end: "+=300%",
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
                        y: -index * STACK_GAP, // ✅ top spacing applied
                        opacity: 1,
                        scale: 1,
                        duration: 1,
                        ease: "none",
                    }
                );
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className="stack-section">
            <div className="stack-wrapper">
                {["Card One", "Card Two", "Card Three"].map((text, i) => (
                    <div
                        key={i}
                        ref={(el) => {
                            if (el) cardsRef.current[i] = el;
                        }}
                        className="stack-card border-neutral-800 bg-neutral-900 border-2 border-border rounded-2xl"
                        style={{ zIndex: i + 1 }}
                    >
                        {text}
                    </div>
                ))}
            </div>
        </section>
    );
}