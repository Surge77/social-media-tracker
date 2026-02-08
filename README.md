# Dev Career Intelligence Platform - Landing Page

> Clean landing page ready for implementing the Developer Career Intelligence Platform from PIVOT_STRATEGY.md

## 📚 Documentation

- **PIVOT_STRATEGY.md** - Complete pivot strategy with 5 focused directions for building the Dev Career Intelligence Platform

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

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

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
├── README.md                  # This file
├── package.json               # Dependencies
├── tailwind.config.ts         # Tailwind configuration
├── next.config.ts             # Next.js configuration
├── tsconfig.json              # TypeScript configuration
└── .env.example               # Environment variables template
```

**Total: ~20 source files** (clean and minimal!)


## 🎯 Next Steps

1. **Review PIVOT_STRATEGY.md** - Choose your implementation direction (DevTrends recommended)
2. **Customize the landing page** - Update hero text, features, and colors
3. **Start building features** - Add dashboard, API routes, and database integration
4. **Deploy** - The landing page is production-ready and can stay as your homepage

## 🎨 Customization

### Update Content
- **Hero section**: Edit `src/components/Hero.tsx`
- **Features**: Edit `src/components/BentoFeatures.tsx`
- **Navigation**: Edit `src/components/Header.tsx`
- **Footer**: Edit `src/components/Footer.tsx`

### Change Colors
Edit `src/app/globals.css` to customize the color scheme:

```css
:root {
  --primary: 16 100% 60%;  /* Orange - change HSL values */
  --secondary: 217 91% 60%; /* Blue */
}
```

### Add New Pages
Create a new page in `src/app/`:

```tsx
// src/app/about/page.tsx
export default function AboutPage() {
  return <div>About page content</div>;
}
```

## 🚢 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project at [vercel.com](https://vercel.com)
3. Deploy automatically

### Other Platforms
```bash
npm run build
npm start
```

## 📝 Notes

- All animations respect `prefers-reduced-motion` for accessibility
- Theme toggle uses smooth wave transition effect
- Fully responsive design works on all devices
- Built with TypeScript for type safety

## 📄 License

MIT

---

**Beautiful landing page ready for your dev career intelligence platform! 🚀**
