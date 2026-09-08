export type FaqItem = {
  q: string
  a: string
  badge?: string
}

export type FaqCategory = {
  id: string
  title: string
  subTitle: string
  faqs: FaqItem[]
}

export type FaqStat = {
  value: string
  label: string
  color: string
  border: string
  text: string
}

export const faqCategories: FaqCategory[] = [
  {
    id: 'basics',
    title: "The basics",
    subTitle: "Getting started",
    faqs: [
      {
        q: "What is Kratolib and how does music distribution work?",
        a: "Kratolib is an Indian music distribution platform that lets independent artists and labels upload their music once and deliver it to <strong style='color:#fff'>150+ streaming platforms</strong> worldwide — Spotify, Apple Music, JioSaavn, Gaana, YouTube Music, Amazon Music, TikTok, and more.<br/><br/>Unlike signing with a record label, you keep <strong style='color:#fff'>full ownership of your masters</strong> and earn all royalties directly. Kratolib handles everything in between — technical delivery, metadata, ISRC codes, royalty collection, and platform compliance — so you can focus entirely on making music."
      },
      {
        q: "Is Kratolib free to use?",
        badge: "Free plan — always",
        a: "Yes — our <strong style='color:#fff'>Free Starter plan is completely free and always will be.</strong> You get 2 releases/year distributed to 150+ platforms at ₹0. You keep 80% of your earnings, and get YouTube Content ID, CRBT / Caller Tune, and UGC monetization on Meta, TikTok, and YouTube — included at no cost.<br/><br/>When you're ready to grow, paid plans start at just <strong style='color:#fff'>₹999/year</strong> (Solo Pro) for unlimited releases and 100% earnings — less than ₹3 per day."
      },
      {
        q: "How long does it take for my music to go live on Spotify?",
        a: "Most platforms go live within <strong style='color:#fff'>24–72 hours</strong> of submission. We strongly recommend scheduling your release <strong style='color:#fff'>at least 3–4 weeks in advance</strong> — Spotify requires a minimum 3-week lead time for editorial playlist pitching consideration.<br/><br/><div style='display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; font-size: 13px;'><div style='padding: 8px 12px; border-radius: 8px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); color: #94a3b8;'><strong style='color:#fff'>Spotify:</strong> 24–72 hours</div><div style='padding: 8px 12px; border-radius: 8px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); color: #94a3b8;'><strong style='color:#fff'>Apple Music:</strong> 1–3 days</div><div style='padding: 8px 12px; border-radius: 8px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); color: #94a3b8;'><strong style='color:#fff'>JioSaavn:</strong> 48 hours</div><div style='padding: 8px 12px; border-radius: 8px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); color: #94a3b8;'><strong style='color:#fff'>Gaana:</strong> 48 hours</div></div>"
      },
      {
        q: "Do I need a record label to distribute with Kratolib?",
        a: "No. Kratolib is designed specifically for <strong style='color:#fff'>independent artists without a label</strong>. You keep 100% ownership of your masters and earn royalties directly — no label deal, no royalty cuts, no long-term contracts.<br/><br/>Our Business Label plan even lets you act as your own label and manage up to 10 artists under one account — perfect if you're also producing music for others."
      },
      {
        q: "What audio and cover art formats does Kratolib accept?",
        a: "<strong style='color:#fff'>Audio:</strong> WAV (16-bit or 24-bit, 44.1–48 kHz). WAV gives best quality across all platforms.<br/><br/><strong style='color:#fff'>Cover Art:</strong> JPEG or PNG, 1500×1500 to 6000×6000 pixels, square format, RGB color mode. Artwork must not contain streaming platform logos, website URLs, or social media handles — these cause platform rejection."
      }
    ]
  },
  {
    id: 'pricing',
    title: "Choosing the right plan",
    subTitle: "Plans & pricing",
    faqs: [
      {
        q: "Which Kratolib plan is right for me?",
        badge: "Most asked",
        a: "<div style='display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px;'><div style='padding: 20px; border-radius: 16px; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1);'><div style='display: flex; align-items: center; gap: 12px; margin-bottom: 12px;'><span style='padding: 2px 10px; border-radius: 6px; background: rgba(255,255,255,0.05); color: #94a3b8; font-weight: 700; font-size: 12px;'>Free Starter — ₹0</span></div><div style='color: #94a3b8; font-size: 14px; line-height: 1.6;'>Just starting out. 2 releases/year, 80% earnings, 150+ platforms, CRBT & YouTube Content ID included. Best for first-time artists.</div></div><div style='padding: 20px; border-radius: 16px; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1);'><div style='display: flex; align-items: center; gap: 12px; margin-bottom: 12px;'><span style='padding: 2px 10px; border-radius: 6px; background: rgb(30 64 175 / 10%); color: #1e40af; font-weight: 700; font-size: 12px;'>Solo Pro — ₹999/year</span></div><div style='color: #94a3b8; font-size: 14px; line-height: 1.6;'>Active independent artist releasing regularly. Unlimited releases, 100% earnings, playlist pitching, YouTube OAC, lyrics distribution (Musixmatch & Genius), Spotify Discovery Mode, sync licensing. <em>Best value.</em></div></div><div style='padding: 20px; border-radius: 16px; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1);'><div style='display: flex; align-items: center; gap: 12px; margin-bottom: 12px;'><span style='padding: 2px 10px; border-radius: 6px; background: rgb(91 33 182 / 10%); color: #5b21b6; font-weight: 700; font-size: 12px;'>Growth Label — ₹3,999/year</span></div><div style='color: #94a3b8; font-size: 14px; line-height: 1.6;'>Established artist or small collective. Up to 5 artists, royalty splits at source, split sheet agreements, pre-save links, SoundExchange registration, mastering included.</div></div><div style='padding: 20px; border-radius: 16px; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1);'><div style='display: flex; align-items: center; gap: 12px; margin-bottom: 12px;'><span style='padding: 2px 10px; border-radius: 6px; background: rgb(154 52 18 / 10%); color: #fb923c; font-weight: 700; font-size: 12px;'>Business Label — ₹6,999/year</span></div><div style='color: #94a3b8; font-size: 14px; line-height: 1.6;'>Running a mini-label. Up to 10 artists (+₹499 each beyond 10), label dashboard, playlist promotion campaigns, cover song licensing, daily streaming stats & release alerts.</div></div><div style='padding: 20px; border-radius: 16px; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1);'><div style='display: flex; align-items: center; gap: 12px; margin-bottom: 12px;'><span style='padding: 2px 10px; border-radius: 6px; background: rgb(20 184 166 / 10%); color: #2dd4bf; font-weight: 700; font-size: 12px;'>Enterprise — Custom pricing</span></div><div style='color: #94a3b8; font-size: 14px; line-height: 1.6;'>Unlimited artists. Dedicated account manager, API & bulk upload, bulk catalog migration, white-label solutions, advanced team access controls, custom deals.</div></div></div>"
      },
      {
        q: "Are there any hidden fees on Kratolib?",
        badge: "No hidden fees",
        a: "<strong style='color:#fff'>No hidden fees — ever.</strong> What's listed in your plan is exactly what you pay. We don't charge extra for:<br/><br/><ul style='list-style: none; padding-left: 0; margin-bottom: 20px;'><li style='margin-bottom: 8px; display: flex; gap: 12px; align-items: flex-start;'><span style='color: #ef4444;'>—</span> <span>Adding new platforms to existing releases</span></li><li style='margin-bottom: 8px; display: flex; gap: 12px; align-items: flex-start;'><span style='color: #ef4444;'>—</span> <span>Changing your artist name</span></li><li style='margin-bottom: 8px; display: flex; gap: 12px; align-items: flex-start;'><span style='color: #ef4444;'>—</span> <span>Adding featured artists or collaborators</span></li><li style='margin-bottom: 8px; display: flex; gap: 12px; align-items: flex-start;'><span style='color: #ef4444;'>—</span> <span>Analytics dashboard access</span></li><li style='margin-bottom: 8px; display: flex; gap: 12px; align-items: flex-start;'><span style='color: #ef4444;'>—</span> <span>YouTube Content ID</span></li><li style='margin-bottom: 8px; display: flex; gap: 12px; align-items: flex-start;'><span style='color: #ef4444;'>—</span> <span>CRBT / Caller Tune setup</span></li></ul>The only optional add-on cost: ₹499 per extra artist beyond 10 on the Business Label plan. Everything else is included."
      },
      {
        q: "Can I upgrade or downgrade my plan anytime?",
        a: "Yes. <strong style='color:#fff'>Upgrades activate immediately</strong> — no waiting for the next billing cycle. New features are available the moment you upgrade.<br/><br/>Downgrading takes effect at your next renewal date. Your music always stays live during any plan transition, and we give you <strong style='color:#fff'>30 days advance notice</strong> before any account-level change is made."
      },
      {
        q: "If I cancel my subscription, will my music be taken down?",
        a: "On paid plans, your music remains live as long as your subscription is active. If you choose not to renew, we notify you <strong style='color:#fff'>30 days in advance</strong> before any release is taken down — giving you time to renew, export your data, or migrate.<br/><br/>Free Starter plan releases remain live as long as your free account is active. We never take down your music without warning."
      }
    ]
  },
  {
    id: 'royalties',
    title: "Getting paid",
    subTitle: "Royalties & earnings",
    faqs: [
      {
        q: "How much money can I earn from streaming?",
        a: "Rough per-stream royalty estimates for India:<br/><br/><div style='padding: 20px; border-radius: 16px; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); margin-bottom: 20px;'><div style='display: flex; flex-direction: column; gap: 8px;'><div style='display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 8px;'><span style='color: #94a3b8;'>Spotify</span> <strong style='color:#fff'>₹0.25 – ₹0.40</strong></div><div style='display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 8px;'><span style='color: #94a3b8;'>Apple Music</span> <strong style='color:#fff'>₹0.50 – ₹0.80</strong></div><div style='display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 8px;'><span style='color: #94a3b8;'>JioSaavn</span> <strong style='color:#fff'>₹0.05 – ₹0.15</strong></div><div style='display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 8px;'><span style='color: #94a3b8;'>CRBT / Caller Tune</span> <strong style='color:#fff'>₹1.00 – ₹5.00</strong></div></div></div>On all Kratolib paid plans you keep <strong style='color:#fff'>100% of your royalties</strong> — every rupee earned goes directly to you. A traditional label deal would typically take 50–80% of these same earnings."
      },
      {
        q: "How and when do I get paid?",
        a: "Royalties are collected from all platforms and credited to your Kratolib wallet <strong style='color:#fff'>monthly</strong>. Platforms typically report earnings 45–60 days after the streaming month ends.<br/><br/>On <strong style='color:#fff'>Growth Label</strong> and above: <strong style='color:#fff'>on-demand payouts</strong> — withdraw your earnings any time without waiting for the standard cycle.<br/><br/>Payout methods: NEFT/IMPS bank transfer and UPI — all in INR, no forex conversion required."
      },
      {
        q: "What is a royalty split and how does it work?",
        badge: "Growth Label+",
        a: "If you collaborated on a track — with a producer, co-writer, or featured artist — a royalty split automatically divides your streaming income at source before payout, based on agreed percentages.<br/><br/>Example: You and your producer agreed on 60/40 — Kratolib distributes it automatically every payout cycle. No manual transfers, no disputes.<br/><br/>We also provide <strong style='color:#fff'>split sheet agreements</strong> — legal documentation of the agreed percentages for each collaborator. Available from <span style='display: inline-block; padding: 2px 8px; border-radius: 4px; background: rgb(91 33 182 / 10%); color: #5b21b6; font-weight: 700; font-size: 11px;'>Growth Label</span>."
      },
      {
        q: "What is SoundExchange and why does it matter for Indian artists?",
        a: "SoundExchange is a US royalty collection body that collects <strong style='color:#fff'>neighboring rights royalties</strong> — money earned when your recorded music plays on US digital radio platforms like Pandora, SiriusXM, and iHeartRadio.<br/><br/>Most Indian artists miss this income entirely because they're not registered. Kratolib handles your <strong style='color:#fff'>SoundExchange registration automatically</strong> from <span style='display: inline-block; padding: 2px 8px; border-radius: 4px; background: rgb(91 33 182 / 10%); color: #5b21b6; font-weight: 700; font-size: 11px;'>Growth Label</span> onwards — no extra paperwork, no extra fees."
      }
    ]
  },
  {
    id: 'distribution',
    title: "Where your music goes",
    subTitle: "Distribution & platforms",
    faqs: [
      {
        q: "Which platforms does Kratolib distribute to?",
        a: "<strong style='color:#fff'>Global streaming</strong> — Spotify, Apple Music, Amazon Music, YouTube Music, TIDAL, Deezer, Pandora, iHeartRadio, Boomplay, Anghami, KKBOX, Qobuz and more<br/><strong style='color:#fff'>India-specific streaming</strong> — JioSaavn, Gaana, Wynk Music, Hungama, Resso<br/><strong style='color:#fff'>Social & short-video</strong> — TikTok, Instagram/Facebook, YouTube Content ID, Snapchat, CapCut<br/><strong style='color:#fff'>India telecom (CRBT)</strong> — Jio Hello Tune, Airtel Wynk Caller Tune, Vi Music, BSNL<br/><strong style='color:#fff'>Lyrics platforms</strong> — Musixmatch, Genius <span style='display: inline-block; padding: 2px 8px; border-radius: 8px; background: rgb(30 64 175 / 10%); color: #1e40af; font-weight: 700; font-size: 11px; margin-bottom: 8px;'>Solo Pro+</span><br/><br/>Every time we add a new platform partner, your existing releases are automatically delivered at no extra charge."
      },
      {
        q: "What is CRBT / Caller Tune and does Kratolib support it?",
        badge: "All plans incl. free",
        a: "CRBT (Caller Ring Back Tone) — also known as <strong style='color:#fff'>Jio Hello Tune</strong> or <strong style='color:#fff'>Airtel Caller Tune</strong> — is the music a caller hears before you pick up. It is one of the most significant revenue streams unique to India.<br/><br/>Kratolib supports CRBT on <strong style='color:#fff'>every plan including the free plan</strong> — across Jio, Airtel, Vi, and BSNL. Every time someone sets your song as their caller tune, you earn a royalty.<br/><br/>Most international distribution platforms do not offer this feature at all. For many Indian artists, CRBT income rivals or exceeds Spotify streaming income."
      },
      {
        q: "What is YouTube Content ID and do I need it?",
        badge: "All plans incl. free",
        a: "YouTube Content ID automatically detects when someone uses your music in any YouTube video. When your song is detected, you can choose to <strong style='color:#fff'>monetize that video</strong> (earn the ad revenue) or block it entirely.<br/><br/>Without Content ID, anyone can use your music on YouTube and you earn nothing. With it, you earn passively from every video that uses your track — even viral ones with millions of views.<br/><br/>Kratolib includes YouTube Content ID on <strong style='color:#fff'>all plans including free</strong>. It activates automatically within a few days of your release going live."
      },
      {
        q: "How do I get my lyrics on Spotify, Apple Music, and Google Search?",
        badge: "Solo Pro+",
        a: "Kratolib distributes your lyrics to <strong style='color:#fff'>Musixmatch and Genius</strong> from the <span style='display: inline-block; padding: 2px 8px; border-radius: 4px; background: rgb(30 64 175 / 10%); color: #1e40af; font-weight: 700; font-size: 11px;'>Solo Pro</span> plan onwards. Once processed:<br/><br/><ul style='list-style: none; padding-left: 0; margin-bottom: 20px;'><li style='margin-bottom: 8px; display: flex; gap: 12px; align-items: flex-start;'><span style='color: #4ade80;'>✓</span> <span>Line-by-line synced lyrics visible on Spotify while your song plays</span></li><li style='margin-bottom: 8px; display: flex; gap: 12px; align-items: flex-start;'><span style='color: #4ade80;'>✓</span> <span>Full lyrics available on Apple Music</span></li><li style='margin-bottom: 8px; display: flex; gap: 12px; align-items: flex-start;'><span style='color: #4ade80;'>✓</span> <span>Google Search shows your lyrics directly in results</span></li><li style='margin-bottom: 8px; display: flex; gap: 12px; align-items: flex-start;'><span style='color: #4ade80;'>✓</span> <span>Genius page created and attributed to you</span></li></ul>People who search for your lyrics become new listeners — this is one of the most underrated organic discovery tools for artists."
      },
      {
        q: "Can I use my own ISRC codes on Kratolib?",
        badge: "Growth Label+",
        a: "Yes. From the <span style='display: inline-block; padding: 2px 8px; border-radius: 4px; background: rgb(91 33 182 / 10%); color: #5b21b6; font-weight: 700; font-size: 11px;'>Growth Label</span> plan you can bring your own <strong style='color:#fff'>ISRC (International Standard Recording Code)</strong> — the unique identifier that tracks your recording's streams and royalties across every platform globally.<br/><br/>This matters if you've previously released music through another distributor and want to maintain consistent royalty tracking history. If you don't have ISRCs, Kratolib assigns them automatically at no extra cost on all plans."
      }
    ]
  },
  {
    id: 'marketing',
    title: "Growing your audience",
    subTitle: "Marketing & artist tools",
    faqs: [
      {
        q: "What is playlist pitching and how can I get on Spotify editorial playlists?",
        badge: "Solo Pro+",
        a: "Playlist pitching is submitting your upcoming release directly to Spotify's editorial team for playlist consideration. Your release must be scheduled <strong style='color:#fff'>at least 3 weeks in advance</strong> to be eligible.<br/><br/>Kratolib's <span style='display: inline-block; padding: 2px 8px; border-radius: 4px; background: rgb(30 64 175 / 10%); color: #1e40af; font-weight: 700; font-size: 11px;'>Solo Pro</span> and above includes pitching support — we guide you on writing effective pitch notes, choosing mood tags, genre targeting, and release timing to maximize your chances of being accepted.<br/><br/>Getting on a mid-size Spotify editorial playlist (50K+ followers) can mean thousands of new streams overnight and trigger Spotify's algorithm to push your track further to more listeners."
      },
      {
        q: "What is a pre-save link and how does it help my release?",
        badge: "Growth Label+",
        a: "A pre-save link lets fans save your unreleased song to their Spotify or Apple Music library <strong style='color:#fff'>before it drops</strong>. On release day, it automatically appears in their library — giving you an instant spike in day-one saves and streams.<br/><br/>Spotify's algorithm reads day-one save rates as a quality signal and boosts the track to more listeners. Artists running pre-save campaigns consistently see <strong style='color:#fff'>2–5x more first-week streams</strong> compared to releases with no pre-save promotion.<br/><br/>Available as part of Fan Links & Smart Links on the <span style='display: inline-block; padding: 2px 8px; border-radius: 4px; background: rgb(91 33 182 / 10%); color: #5b21b6; font-weight: 700; font-size: 11px;'>Growth Label</span> plan and above."
      },
      {
        q: "What is Spotify Discovery Mode and should I use it?",
        badge: "Solo Pro+",
        a: "Spotify Discovery Mode lets you signal to Spotify's algorithm that you want a specific track promoted in Radio and Autoplay. In exchange, Spotify takes a slightly lower royalty rate on streams generated through that discovery boost.<br/><br/>Best used for catalog tracks you want to revive, or new releases you want to push hard in the first 4–6 weeks. Think of it as organic algorithmic advertising — a small royalty trade for broader promotion. Available on <span style='display: inline-block; padding: 2px 8px; border-radius: 4px; background: rgb(30 64 175 / 10%); color: #1e40af; font-weight: 700; font-size: 11px;'>Solo Pro</span> and above."
      },
      {
        q: "Can I earn from TV, films, and ads through sync licensing?",
        badge: "Solo Pro+",
        a: "Yes. Sync licensing means your music gets placed in visual media — films, OTT series (Netflix, Prime Video, Hotstar), TV ads, YouTube commercials, or video games. A single sync placement can pay <strong style='color:#fff'>₹10,000 to several lakhs</strong> depending on the project's size and reach.<br/><br/>Kratolib pitches your catalog for sync licensing opportunities from the <span style='display: inline-block; padding: 2px 8px; border-radius: 4px; background: rgb(30 64 175 / 10%); color: #1e40af; font-weight: 700; font-size: 11px;'>Solo Pro</span> plan. Cover song licensing (legally releasing your version of an existing song) is available from the <span style='display: inline-block; padding: 2px 8px; border-radius: 4px; background: rgb(154 52 18 / 10%); color: #9a3412; font-weight: 700; font-size: 11px;'>Business Label</span> plan."
      },
      {
        q: "What is YouTube Official Artist Channel (OAC) and how do I get one?",
        badge: "Solo Pro+",
        a: "A YouTube Official Artist Channel (OAC) merges your auto-generated YouTube topic channel with your personal YouTube channel — giving you one unified, verified artist presence with a music note badge.<br/><br/><ul style='list-style: none; padding-left: 0; margin-bottom: 20px;'><li style='margin-bottom: 8px; display: flex; gap: 12px; align-items: flex-start;'><span style='color: #4ade80;'>✓</span> <span>All your music videos, official audio, and live content in one place</span></li><li style='margin-bottom: 8px; display: flex; gap: 12px; align-items: flex-start;'><span style='color: #4ade80;'>✓</span> <span>Music note badge next to your channel name</span></li><li style='margin-bottom: 8px; display: flex; gap: 12px; align-items: flex-start;'><span style='color: #4ade80;'>✓</span> <span>Full access to YouTube for Artists analytics</span></li><li style='margin-bottom: 8px; display: flex; gap: 12px; align-items: flex-start;'><span style='color: #4ade80;'>✓</span> <span>Better search ranking and shelf placement on YouTube</span></li></ul>Kratolib assists with OAC claims on <span style='display: inline-block; padding: 2px 8px; border-radius: 4px; background: rgb(30 64 175 / 10%); color: #1e40af; font-weight: 700; font-size: 11px;'>Solo Pro</span> and above."
      },
      {
        q: "Does Kratolib offer mastering services?",
        a: "Yes. Mastering integration is available as a paid add-on on <span style='display: inline-block; padding: 2px 8px; border-radius: 4px; background: rgb(30 64 175 / 10%); color: #1e40af; font-weight: 700; font-size: 11px;'>Solo Pro</span>, and is <strong style='color:#fff'>fully included</strong> in <span style='display: inline-block; padding: 2px 8px; border-radius: 4px; background: rgb(91 33 182 / 10%); color: #5b21b6; font-weight: 700; font-size: 11px;'>Growth Label</span> and above at no extra charge.<br/><br/>Professional mastering optimizes your track's loudness, clarity, EQ balance, and punch for streaming platforms — ensuring your music sounds competitive and label-quality on every platform it reaches."
      }
    ]
  },
  {
    id: 'labels',
    title: "Managing multiple artists",
    subTitle: "Labels & teams",
    faqs: [
      {
        q: "Can I manage multiple artists under one Kratolib account?",
        a: "Yes — Kratolib is built for this:<br/><br/><div style='display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px;'><div style='padding: 16px; border-radius: 12px; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); display: flex; align-items: center; gap: 16px;'><span style='padding: 4px 12px; border-radius: 6px; background: rgb(91 33 182 / 10%); color: #a78bfa; font-weight: 600; font-size: 13px;'>Growth Label ₹3,999/year</span> <span style='color: #94a3b8;'>— Up to <strong style='color:#fff'>5 artists</strong></span></div><div style='padding: 16px; border-radius: 12px; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); display: flex; align-items: center; gap: 16px;'><span style='padding: 4px 12px; border-radius: 6px; background: rgb(154 52 18 / 10%); color: #fb923c; font-weight: 600; font-size: 13px;'>Business Label ₹6,999/year</span> <span style='color: #94a3b8;'>— Up to <strong style='color:#fff'>10 artists</strong> (+₹499 each beyond 10)</span></div><div style='padding: 16px; border-radius: 12px; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); display: flex; align-items: center; gap: 16px;'><span style='padding: 4px 12px; border-radius: 6px; background: rgb(20 184 166 / 10%); color: #2dd4bf; font-weight: 600; font-size: 13px;'>Enterprise — Custom pricing</span> <span style='color: #94a3b8;'>— <strong style='color:#fff'>Unlimited artists</strong></span></div></div>All artists under your account share your plan's features — royalty splits, analytics, scheduling, and more — managed from one dashboard."
      },
      {
        q: "What is white-label distribution and who is it for?",
        badge: "Enterprise only",
        a: "White-label distribution lets you offer music distribution services under <strong style='color:#fff'>your own brand name</strong> — powered by Kratolib's infrastructure behind the scenes.<br/><br/>Ideal for: recording studios, music academies, artist management companies, or anyone who wants to offer distribution as their own service without building a platform from scratch.<br/><br/>Available exclusively on the <span style='display: inline-block; padding: 2px 8px; border-radius: 4px; background: rgb(20 184 166 / 10%); color: #2dd4bf; font-weight: 700; font-size: 11px;'>Enterprise</span> plan. Contact our sales team for a custom demo and pricing."
      },
      {
        q: "Does Kratolib offer API access and bulk upload for large catalogs?",
        badge: "Enterprise only",
        a: "Yes. The <span style='display: inline-block; padding: 2px 8px; border-radius: 4px; background: rgb(20 184 166 / 10%); color: #2dd4bf; font-weight: 700; font-size: 11px;'>Enterprise</span> plan includes full <strong style='color:#fff'>API access</strong> for automated release management, <strong style='color:#fff'>bulk upload</strong> for distributing large catalogs efficiently, and <strong style='color:#fff'>bulk catalog migration</strong> support if you're moving an existing catalog from another platform.<br/><br/>Our Enterprise team works with you directly to set up the integration and ensure a smooth migration with zero downtime on your releases."
      }
    ]
  },
  {
    id: 'why',
    title: "What makes us different",
    subTitle: "Why Kratolib",
    faqs: [
      {
        q: "Why should I choose Kratolib over other music distributors?",
        badge: "Most asked",
        a: "Kratolib is built specifically for the Indian market — not adapted from a global platform. Here's what that means for you:<br/><br/><div style='display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px;'><div style='padding: 16px; border-radius: 12px; background: rgba(74, 222, 128, 0.05); border: 1px solid rgba(74, 222, 128, 0.1);'><strong style='color:#4ade80'>CRBT on every plan</strong> — Including the free plan. Most international distributors don't offer Caller Tune / Hello Tune support at all — a significant missed income stream for Indian artists.</div><div style='padding: 16px; border-radius: 12px; background: rgba(74, 222, 128, 0.05); border: 1px solid rgba(74, 222, 128, 0.1);'><strong style='color:#4ade80'>INR pricing with no forex surprises</strong> — Starting at ₹999/year. No USD-to-INR conversion fees, no pricing that changes with the dollar rate.</div><div style='padding: 16px; border-radius: 12px; background: rgba(74, 222, 128, 0.05); border: 1px solid rgba(74, 222, 128, 0.1);'><strong style='color:#4ade80'>Guaranteed support response times</strong> — 72h (Solo Pro), 48h (Growth), 24h (Business), same-day (Enterprise). We commit to this in writing.</div><div style='padding: 16px; border-radius: 12px; background: rgba(74, 222, 128, 0.05); border: 1px solid rgba(74, 222, 128, 0.1);'><strong style='color:#4ade80'>100% transparent — zero hidden fees</strong> — No extra charges for adding platforms, changing artist names, analytics access, or Content ID.</div><div style='padding: 16px; border-radius: 12px; background: rgba(74, 222, 128, 0.05); border: 1px solid rgba(74, 222, 128, 0.1);'><strong style='color:#4ade80'>India-first platform list</strong> — JioSaavn, Gaana, Wynk, Hungama, all CRBT networks — delivered automatically alongside global platforms.</div></div>"
      },
      {
        q: "What is the best music distributor for independent artists in India in 2025?",
        badge: "Top SEO query",
        a: "The best distributor depends on where you are in your career:<br/><br/><ul style='list-style: none; padding-left: 0; margin-bottom: 20px;'><li style='margin-bottom: 12px; display: flex; gap: 12px; align-items: flex-start;'><span style='color: #4ade80;'>✓</span> <span><strong>Just starting out?</strong> → <span style='display: inline-block; padding: 2px 8px; border-radius: 4px; background: rgba(255,255,255,0.05); color: #94a3b8; font-weight: 700; font-size: 11px;'>Free Starter ₹0</span> — 150+ platforms, CRBT, YouTube Content ID, always free</span></li><li style='margin-bottom: 12px; display: flex; gap: 12px; align-items: flex-start;'><span style='color: #4ade80;'>✓</span> <span><strong>Releasing regularly?</strong> → <span style='display: inline-block; padding: 2px 8px; border-radius: 4px; background: rgb(30 64 175 / 10%); color: #1e40af; font-weight: 700; font-size: 11px;'>Solo Pro ₹999/year</span> — unlimited releases, 100% earnings, playlist pitching, lyrics, Discovery Mode</span></li><li style='margin-bottom: 12px; display: flex; gap: 12px; align-items: flex-start;'><span style='color: #4ade80;'>✓</span> <span><strong>Collaborating with others?</strong> → <span style='display: inline-block; padding: 2px 8px; border-radius: 4px; background: rgb(91 33 182 / 10%); color: #5b21b6; font-weight: 700; font-size: 11px;'>Growth Label ₹3,999/year</span> — royalty splits, pre-save links, SoundExchange, mastering included</span></li><li style='margin-bottom: 12px; display: flex; gap: 12px; align-items: flex-start;'><span style='color: #4ade80;'>✓</span> <span><strong>Running a label?</strong> → <span style='display: inline-block; padding: 2px 8px; border-radius: 4px; background: rgb(154 52 18 / 10%); color: #9a3412; font-weight: 700; font-size: 11px;'>Business Label ₹6,999/year</span> — up to 10 artists, label dashboard, daily stats, cover licensing</span></li><li style='margin-bottom: 12px; display: flex; gap: 12px; align-items: flex-start;'><span style='color: #4ade80;'>✓</span> <span><strong>Large operation?</strong> → <span style='display: inline-block; padding: 2px 8px; border-radius: 4px; background: rgb(20 184 166 / 10%); color: #2dd4bf; font-weight: 700; font-size: 11px;'>Enterprise</span> — unlimited artists, API, white-label, dedicated manager</span></li></ul><div style='padding: 20px; border-radius: 16px; background: rgba(74, 222, 128, 0.05); border: 1px solid rgba(74, 222, 128, 0.1); color: #4ade80;'><strong>Key differentiator:</strong> Kratolib is the only platform in India that includes CRBT support on all plans — including the free plan — with guaranteed support response times and zero hidden fees.</div>"
      },
      {
        q: "I was using another distributor — how do I migrate to Kratolib?",
        a: "Migrating to Kratolib is straightforward. Here's the process:<br/><br/><ul style='list-style: none; padding-left: 0; margin-bottom: 20px;'><li style='margin-bottom: 8px; display: flex; gap: 12px; align-items: flex-start;'><span style='color: #4ade80;'>✓</span> <span>Sign up for the Kratolib plan that fits your needs</span></li><li style='margin-bottom: 8px; display: flex; gap: 12px; align-items: flex-start;'><span style='color: #4ade80;'>✓</span> <span>Gather your existing ISRC codes from your previous distributor (important for continuity)</span></li><li style='margin-bottom: 8px; display: flex; gap: 12px; align-items: flex-start;'><span style='color: #4ade80;'>✓</span> <span>Upload your catalog to Kratolib using your own ISRCs</span></li><li style='margin-bottom: 8px; display: flex; gap: 12px; align-items: flex-start;'><span style='color: #4ade80;'>✓</span> <span>Contact your previous distributor to take down their version once Kratolib's version is live</span></li><li style='margin-bottom: 8px; display: flex; gap: 12px; align-items: flex-start;'><span style='color: #4ade80;'>✓</span> <span>Our support team is available to guide you through each step</span></li></ul>On the <span style='display: inline-block; padding: 2px 8px; border-radius: 4px; background: rgb(20 184 166 / 10%); color: #2dd4bf; font-weight: 700; font-size: 11px;'>Enterprise</span> plan, we offer full <strong style='color:#fff'>bulk catalog migration</strong> support — our team handles the entire process for large catalogs."
      },
      {
        q: "How reliable is Kratolib's customer support?",
        badge: "Our promise",
        a: "Support reliability is one of the most common pain points artists face with music distribution platforms — and it's something we've built Kratolib around solving. We guarantee specific response times per plan:<br/><br/><div style='padding: 24px; border-radius: 16px; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); margin-bottom: 20px;'><div style='display: flex; flex-direction: column; gap: 12px;'><div style='display: flex; gap: 12px; align-items: center;'><span style='display: inline-block; padding: 2px 8px; border-radius: 4px; background: rgba(255,255,255,0.05); color: #94a3b8; font-weight: 700; font-size: 11px;'>Free Starter</span> <span style='color: #94a3b8;'>— Within 7 days</span></div><div style='display: flex; gap: 12px; align-items: center;'><span style='display: inline-block; padding: 2px 8px; border-radius: 4px; background: rgb(30 64 175 / 10%); color: #1e40af; font-weight: 700; font-size: 11px;'>Solo Pro</span> <span style='color: #94a3b8;'>— Within 72 hours</span></div><div style='display: flex; gap: 12px; align-items: center;'><span style='display: inline-block; padding: 2px 8px; border-radius: 4px; background: rgb(91 33 182 / 10%); color: #5b21b6; font-weight: 700; font-size: 11px;'>Growth Label</span> <span style='color: #94a3b8;'>— Within 48 hours</span></div><div style='display: flex; gap: 12px; align-items: center;'><span style='display: inline-block; padding: 2px 8px; border-radius: 4px; background: rgb(154 52 18 / 10%); color: #fb923c; font-weight: 700; font-size: 11px;'>Business Label</span> <span style='color: #94a3b8;'>— Within 24 hours</span></div><div style='display: flex; gap: 12px; align-items: center;'><span style='display: inline-block; padding: 2px 8px; border-radius: 4px; background: rgb(20 184 166 / 10%); color: #2dd4bf; font-weight: 700; font-size: 11px;'>Enterprise</span> <span style='color: #94a3b8;'>— Same-day priority + dedicated account manager</span></div></div></div>We never close a ticket without resolving it, and we give <strong style='color:#fff'>30 days advance notice</strong> before any account-level change — no surprises, ever."
      }
    ]
  },
  {
    id: 'india',
    title: "For Indian artists",
    subTitle: "India-specific",
    faqs: [
      {
        q: "Apna gaana Jio Hello Tune / Airtel Caller Tune kaise banayein?",
        badge: "Most searched in India",
        a: "Apna gaana Hello Tune ya Caller Tune banane ke liye aapko ek CRBT-enabled distributor chahiye. Kratolib ke saath yeh process simple hai:<br/><br/><ul style='list-style: none; padding-left: 0; margin-bottom: 20px;'><li style='margin-bottom: 8px; display: flex; gap: 8px;'><span style='color: #4ade80;'>✓</span> <span>Kratolib pe sign up karein — <strong style='color:#fff'>free plan bhi kaam karega</strong></span></li><li style='margin-bottom: 8px; display: flex; gap: 8px;'><span style='color: #4ade80;'>✓</span> <span>Apna track WAV ya high-quality MP3 format mein upload karein</span></li><li style='margin-bottom: 8px; display: flex; gap: 8px;'><span style='color: #4ade80;'>✓</span> <span>Distribution settings mein CRBT / Caller Tune option select karein</span></li><li style='margin-bottom: 8px; display: flex; gap: 8px;'><span style='color: #4ade80;'>✓</span> <span>Aapka gaana automatically Jio Hello Tune, Airtel Caller Tune, Vi Music, aur BSNL pe available ho jaata hai</span></li><li style='margin-bottom: 8px; display: flex; gap: 8px;'><span style='color: #4ade80;'>✓</span> <span>Jab bhi koi listener aapka gaana apna caller tune set karta hai — <strong style='color:#fff'>aapko royalty milti hai</strong></span></li></ul><div style='background: rgba(74, 222, 128, 0.1); border: 1px solid rgba(74, 222, 128, 0.2); padding: 16px; border-radius: 12px; color: rgba(255, 255, 255, 0.7); font-size: 14px;'><strong style='color:#fff'>CRBT Kratolib ke sabhi plans mein included hai</strong> — including the free plan. Yeh feature most international distribution platforms offer hi nahi karte.</div>"
      },
      {
        q: "How do I get my song on JioSaavn, Gaana, and Wynk Music?",
        badge: "India-specific",
        a: "You cannot upload directly to JioSaavn, Gaana, or Wynk Music — all platforms require music to come through an approved distributor. With Kratolib:<br/><br/><ul style='list-style: none; padding-left: 0; margin-bottom: 20px;'><li style='margin-bottom: 8px; display: flex; gap: 12px; align-items: flex-start;'><span style='color: #4ade80;'>✓</span> <span>Sign up for any Kratolib plan (including free)</span></li><li style='margin-bottom: 8px; display: flex; gap: 12px; align-items: flex-start;'><span style='color: #4ade80;'>✓</span> <span>Upload your track with cover art and complete metadata</span></li><li style='margin-bottom: 8px; display: flex; gap: 12px; align-items: flex-start;'><span style='color: #4ade80;'>✓</span> <span>Select Indian platforms: JioSaavn, Gaana, Wynk Music, Hungama, Resso</span></li><li style='margin-bottom: 8px; display: flex; gap: 12px; align-items: flex-start;'><span style='color: #4ade80;'>✓</span> <span>Your music goes live within 24–72 hours</span></li><li style='margin-bottom: 8px; display: flex; gap: 12px; align-items: flex-start;'><span style='color: #4ade80;'>✓</span> <span>CRBT / Caller Tune automatically set up on Jio, Airtel, Vi, and BSNL</span></li></ul>All Indian platforms are included in every Kratolib plan at no extra charge."
      },
      {
        q: "Can I release Bollywood covers or regional language music through Kratolib?",
        a: "Yes — Kratolib distributes all genres and all regional languages, including:<br/><br/><div style='padding: 24px; border-radius: 16px; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); margin-bottom: 20px; line-height: 2; color: #94a3b8; font-size: 14px;'>Bollywood · Indie · Hip-Hop · Classical · Folk · Devotional · Punjabi · Tamil · Telugu · Bhojpuri · Marathi · Bengali · Kannada · Gujarati · Odia and more</div>For <strong style='color:#fff'>cover songs</strong> (your version of an existing song), a mechanical license is required. Kratolib handles cover song licensing from the <span style='display: inline-block; padding: 2px 8px; border-radius: 4px; background: rgb(154 52 18 / 10%); color: #fb923c; font-weight: 700; font-size: 11px;'>Business Label</span> plan — we manage the legal licensing so your cover stays live without copyright claims.<br/><br/>For original compositions: just upload and distribute — no additional licensing needed."
      },
      {
        q: "Does Kratolib support UPI and Indian payment methods?",
        a: "Yes — all major Indian payment methods are supported for subscriptions and upgrades:<br/><br/><ul style='list-style: none; padding-left: 0; margin-bottom: 20px;'><li style='margin-bottom: 8px; display: flex; gap: 12px; align-items: flex-start;'><span style='color: #4ade80;'>✓</span> <span><strong>UPI</strong> — GPay, PhonePe, Paytm, BHIM</span></li><li style='margin-bottom: 8px; display: flex; gap: 12px; align-items: flex-start;'><span style='color: #4ade80;'>✓</span> <span><strong>Net Banking</strong> — all major Indian banks</span></li><li style='margin-bottom: 8px; display: flex; gap: 12px; align-items: flex-start;'><span style='color: #4ade80;'>✓</span> <span><strong>Credit / Debit Cards</strong> — Visa, Mastercard, RuPay</span></li><li style='margin-bottom: 8px; display: flex; gap: 12px; align-items: flex-start;'><span style='color: #4ade80;'>✓</span> <span><strong>Wallets</strong> — Paytm, Amazon Pay</span></li></ul>Royalty payouts are processed via NEFT/IMPS bank transfer and UPI — all in INR. No forex conversion, no international transaction fees."
      },
      {
        q: "Kya Kratolib Hindi aur regional language artists ke liye suitable hai?",
        a: "Bilkul. Kratolib India ke liye banaya gaya hai — naa ki ek global platform ka Indian version.<br/><br/><ul style='list-style: none; padding-left: 0; margin-bottom: 20px;'><li style='margin-bottom: 8px; display: flex; gap: 12px; align-items: flex-start;'><span style='color: #4ade80;'>✓</span> <span>INR mein pricing — koi USD conversion nahi</span></li><li style='margin-bottom: 8px; display: flex; gap: 12px; align-items: flex-start;'><span style='color: #4ade80;'>✓</span> <span>CRBT support sabhi plans mein — Jio, Airtel, Vi, BSNL</span></li><li style='margin-bottom: 8px; display: flex; gap: 12px; align-items: flex-start;'><span style='color: #4ade80;'>✓</span> <span>JioSaavn, Gaana, Wynk — India ke top platforms pe automatic delivery</span></li><li style='margin-bottom: 8px; display: flex; gap: 12px; align-items: flex-start;'><span style='color: #4ade80;'>✓</span> <span>Hindi aur regional language metadata fully supported</span></li><li style='margin-bottom: 8px; display: flex; gap: 12px; align-items: flex-start;'><span style='color: #4ade80;'>✓</span> <span>UPI se subscription aur payout — simple aur fast</span></li><li style='margin-bottom: 8px; display: flex; gap: 12px; align-items: flex-start;'><span style='color: #4ade80;'>✓</span> <span>Support team jo Indian artists ki needs samajhti hai</span></li></ul>Chahe aap Punjabi pop release kar rahe ho, Tamil independent music, ya Bhojpuri folk — Kratolib aapke liye hai."
      }
    ]
  }
]

export const faqStats: FaqStat[] = [
  { value: "150+", label: "Platforms worldwide", color: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.1)", text: "text-white/60" },
  { value: "₹999", label: "Starting price / year", color: "rgba(30, 64, 175, 0.1)", border: "rgba(30, 64, 175, 0.2)", text: "text-blue-400" },
  { value: "100%", label: "Earnings on paid plans", color: "rgba(91, 33, 182, 0.1)", border: "rgba(91, 33, 182, 0.2)", text: "text-purple-400" },
  { value: "24h", label: "Min. support response", color: "rgba(20, 184, 166, 0.1)", border: "rgba(20, 184, 166, 0.2)", text: "text-teal-400" }
]
