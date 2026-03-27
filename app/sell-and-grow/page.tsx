import type { Metadata } from "next";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import SellAndGrowHero from "@/components/sell-and-grow/SellAndGrowHero";
import VelocitySection from "@/components/sell-and-grow/VelocitySection";
import GrowthTeamSection from "@/components/sell-and-grow/GrowthTeamSection";
import PipelineSection from "@/components/sell-and-grow/PipelineSection";
import CRBTSection from "@/components/sell-and-grow/CRBTSection";
import CoverageSection from "@/components/sell-and-grow/CoverageSection";
import EnterpriseSolutionsSection from "@/components/sell-and-grow/EnterpriseSolutionsSection";
import SellAndGrowCTA from "@/components/sell-and-grow/SellAndGrowCTA";

export const metadata: Metadata = {
  title: "Distribution & Growth – Kratolib",
  description:
    "Distribute, Sell & Grow Your Music Worldwide. Global Music Distribution Made Simple for Music Artists, Creators, and Independent Labels.",
};

export default function SellAndGrowPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <SellAndGrowHero />
      <VelocitySection />
      <GrowthTeamSection />
      <PipelineSection />
      <CRBTSection />
      <CoverageSection />
      <EnterpriseSolutionsSection />
      <SellAndGrowCTA />
      <Footer />
    </main>
  );
}
