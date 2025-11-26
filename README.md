# TuneFlow - Music Distribution Landing Page

A modern, responsive landing page for TuneFlow, a music distribution web application built with Next.js, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Modern Design**: Clean, minimal aesthetic with dark theme and vibrant purple accents
- **Fully Responsive**: Mobile-first design that works on all devices
- **Smooth Animations**: Framer Motion powered scroll animations
- **Reusable Components**: Modular component architecture using Shadcn UI patterns
- **TypeScript**: Full type safety throughout the application

## 📦 Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Framer Motion** (animations)
- **Lucide React** (icons)
- **Shadcn UI** (component patterns)

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ installed
- npm, yarn, or pnpm package manager

### Installation

1. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

2. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## 📁 Project Structure

```
frontend/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Main landing page
│   └── globals.css         # Global styles and Tailwind config
├── components/
│   ├── ui/                 # Reusable UI components
│   │   ├── button.tsx
│   │   └── card.tsx
│   ├── navbar.tsx          # Navigation bar
│   ├── hero.tsx            # Hero section
│   ├── features.tsx        # Features section
│   ├── how-it-works.tsx    # How it works section
│   ├── testimonials.tsx    # Testimonials section
│   ├── pricing.tsx         # Pricing section
│   └── footer.tsx          # Footer component
├── lib/
│   └── utils.ts            # Utility functions (cn helper)
└── public/                 # Static assets
```

## 🎨 Sections

1. **Navbar**: Fixed navigation with logo, links, and CTA button
2. **Hero**: Eye-catching hero section with animated gradient background
3. **Features**: 4 feature cards showcasing platform capabilities
4. **How It Works**: 3-step process visualization
5. **Testimonials**: Social proof with artist testimonials
6. **Pricing**: Three pricing tiers (Free, Pro, Enterprise)
7. **Footer**: Links and copyright information

## 🎯 Customization

### Colors

Edit the color scheme in `app/globals.css` under the `:root` selector:

```css
--primary: 280 100% 65%; /* Purple accent color */
```

### Content

- Update text content directly in component files
- Replace placeholder testimonials with real data
- Modify pricing plans in `components/pricing.tsx`

### Animations

Adjust animation timing and effects in component files using Framer Motion props.

## 📱 Responsive Breakpoints

- **Mobile**: Default (< 768px)
- **Tablet**: md (768px+)
- **Desktop**: lg (1024px+)

## 🚢 Build for Production

```bash
npm run build
npm start
```

## 📝 License

This project is private and proprietary.

## 🤝 Contributing

This is a private project. For changes, please contact the project maintainer.

