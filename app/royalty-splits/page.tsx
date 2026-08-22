import type { Metadata } from "next";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import RoyaltySplitsHero from "@/components/royalty-splits/RoyaltySplitsHero";
import RoyaltySplitsCollaboration from "@/components/royalty-splits/RoyaltySplitsCollaboration";
import RoyaltySplitsRevenue from "@/components/royalty-splits/RoyaltySplitsRevenue";
import RoyaltySplitsAutomation from "@/components/royalty-splits/RoyaltySplitsAutomation";
import RoyaltySplitsTransparency from "@/components/royalty-splits/RoyaltySplitsTransparency";
import RoyaltySplitsCTA from "@/components/royalty-splits/RoyaltySplitsCTA";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata: Metadata = createPageMetadata(
  "Royalty Splits | Automatic Payments to Collaborators | KratoLib",
  "Learn how royalty splits work. Automatic payments to band members and collaborators. Step-by-step guide, examples, split sheet template. Manage splits easily.",
);

export default function RoyaltySplitsPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <RoyaltySplitsHero />
      <RoyaltySplitsCollaboration />
      <RoyaltySplitsRevenue />
      <RoyaltySplitsAutomation />
      <RoyaltySplitsTransparency />
      <RoyaltySplitsCTA />
      <Footer />
    </main>
  );
}
