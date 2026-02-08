# Dev Career Intelligence Platform - Landing Page

> Clean landing page ready for implementing the Developer Career Intelligence Platform from PIVOT_STRATEGY.md

## 📚 Documentation

Strategic documentation:

- **PIVOT_STRATEGY.md** - Complete pivot strategy with 5 focused directions
- **REFRAMING_STRATEGY.md** - Reframing strategy document
- **QUICK_START.md** - Get started quickly with customization tips

## 🎨 What's Included

This project contains a beautiful, fully functional landing page with:

- Modern hero section with floating icons
- Bento grid features section
- Dark/light theme toggle with smooth wave transition
- Fully responsive design
- Accessibility features
- Smooth animations (respects prefers-reduced-motion)

## 🛠️ Tech Stack

### Frontend
- **Next.js 16.1.5** - React framework with App Router and Turbopack
- **React 19.1.0** - UI library
- **TypeScript 5** - Type safety
- **Tailwind CSS 3.4.17** - Utility-first CSS
- **Framer Motion 12.23.24** - Animation library
- **Next Themes 0.3.0** - Dark mode support
- **Lucide React 0.462.0** - Icon library

### UI Components
- **Radix UI React Slot 1.2.3** - Accessible component primitives
- **CVA 0.7.1** (Class Variance Authority) - Component variants
- **Tailwind Merge 2.6.0** - Smart class merging
- **Tailwindcss Animate 1.0.7** - Animation utilities
- **clsx 2.1.1** - Conditional classnames

## 🚀 Getting Started

### Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

**First time?** Run `npm install` then `npm run dev`

**Want to customize?** Check **QUICK_START.md** for tips.

### Build for Production

```bash
# Create production build
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
/
├── src/
│   ├── app/
│   │   ├── page.tsx           # Landing page
│   │   ├── layout.tsx         # Root layout
│   │   ├── globals.css        # Global styles
│   │   ├── providers.tsx      # Theme provider
│   │   └── favicon.ico        # Favicon
│   ├── components/
│   │   ├── Header.tsx         # Header with navigation
│   │   ├── Hero.tsx           # Hero section
│   │   ├── BentoFeatures.tsx  # Features grid
│   │   ├── Footer.tsx         # Footer
│   │   ├── FloatingIcons.tsx  # Animated icons
│   │   ├── AnimatedCTA.tsx    # Animated button
│   │   ├── SharedTitle.tsx    # Shared title component
│   │   ├── ThemeToggle.tsx    # Theme switcher
│   │   ├── ThemeWaveTransition.tsx  # Theme transition effect
│   │   └── ui/                # UI primitives
│   │       ├── button.tsx
│   │       ├── badge.tsx
│   │       └── card.tsx
│   ├── hooks/
│   │   └── useReducedMotion.ts  # Accessibility hook
│   └── lib/
│       └── utils.ts           # Utility functions
├── PIVOT_STRATEGY.md          # Strategic direction
├── REFRAMING_STRATEGY.md      # Reframing notes
├── QUICK_START.md             # Quick start guide
├── package.json               # Dependencies
├── tailwind.config.ts         # Tailwind configuration
├── next.config.ts             # Next.js configuration
├── tsconfig.json              # TypeScript configuration
└── .env.example               # Environment variables template
```

**Total: ~25 source files** (clean and focused!)


## 🎯 Next Steps

1. Review **PIVOT_STRATEGY.md** for implementation direction
2. Choose your focus (DevTrends recommended)
3. Start building features on top of this landing page
4. The landing page is production-ready and can stay as your homepage

## 🎨 Customization

### Colors
Edit `src/app/globals.css` to customize the color scheme. All colors use HSL format for easy theming.

### Content
- Update hero text in `src/components/Hero.tsx`
- Modify features in `src/components/BentoFeatures.tsx`
- Change navigation in `src/components/Header.tsx`

### Animations
All animations respect `prefers-reduced-motion` for accessibility.

## 📄 License

MIT

---

**Beautiful landing page ready for your dev career intelligence platform! 🚀**
