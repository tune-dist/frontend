import MarketingComingSoonPage from '@/components/marketing-coming-soon-page'

export default function GuidesPage() {
  return (
    <MarketingComingSoonPage
      title={
        <>
          <span className="animated-gradient">Music Distribution Guides</span> -
          In-Depth Resources for Independent Artists
        </>
      }
      subtitle="Actionable playbooks for independent artists and record labels."
      comingSoonMessage="Our editorial team is writing amazing articles and industry updates for you. We'll be live very soon!"
    />
  )
}
