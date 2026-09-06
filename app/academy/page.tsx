import MarketingComingSoonPage from '@/components/marketing-coming-soon-page'

export default function AcademyPage() {
  return (
    <MarketingComingSoonPage
      title={
        <>
          <span className="animated-gradient">Music Distribution Academy</span>{' '}
          - Learn to Release, Promote & Earn from Your Music
        </>
      }
      subtitle="Master the music industry with our comprehensive courses and tutorials."
      comingSoonMessage="We are working hard to bring you the best educational content to help you grow your music career. Stay tuned!"
    />
  )
}
