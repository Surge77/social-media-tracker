# Quick Start Guide

## 🚀 Get the Landing Page Running

### 1. Install Dependencies

```bash
npm install
```

This will install:
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Framer Motion
- Lucide React (icons)
- next-themes (dark mode)
- And other UI dependencies

### 2. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

You should see a beautiful landing page with:
- ✅ Hero section with animated floating icons
- ✅ Feature cards in a bento grid
- ✅ Dark/light theme toggle with smooth transition
- ✅ Fully responsive design
- ✅ Smooth animations

### 3. Test Theme Toggle

Click the sun/moon icon in the header to switch between dark and light modes. You'll see a smooth circular wipe transition!

## 📝 What's Next?

### Option A: Customize the Landing Page

1. **Change the title and description**
   - Edit `src/components/Hero.tsx`
   - Update the main heading and subtitle

2. **Modify features**
   - Edit `src/components/BentoFeatures.tsx`
   - Change the 6 feature cards to match your product

3. **Update navigation**
   - Edit `src/components/Header.tsx`
   - Change the navigation links

4. **Customize colors**
   - Edit `src/app/globals.css`
   - Modify the CSS variables for colors

### Option B: Start Building Features

Based on **PIVOT_STRATEGY.md**, the recommended direction is **DevTrends** - Developer Career Intelligence Platform.

#### Next Steps for DevTrends:

1. **Set up database** (Supabase recommended)
   ```bash
   npm install @supabase/supabase-js
   ```

2. **Create API routes**
   - `src/app/api/technologies/route.ts`
   - `src/app/api/trends/route.ts`

3. **Build dashboard page**
   - `src/app/dashboard/page.tsx`
   - Technology cards with trend indicators
   - Filters and search

4. **Add data collection**
   - Create collectors for Hacker News, Reddit, etc.
   - Set up cron jobs for automated collection

5. **Implement trend calculation**
   - NLP for technology extraction
   - Trend scoring algorithm
   - Time-series data

See **PIVOT_STRATEGY.md** for complete feature breakdown.

## 🎨 Customization Tips

### Change the Primary Color

Edit `src/app/globals.css`:

```css
:root {
  --primary: 16 100% 60%;  /* Orange - change these HSL values */
}
```

### Add a New Page

1. Create `src/app/about/page.tsx`:
```tsx
export default function AboutPage() {
  return <div>About page content</div>;
}
```

2. Add link in Header:
```tsx
<Link href="/about">About</Link>
```

### Add More Icons

Import from Lucide React:
```tsx
import { Star, Heart, Zap } from 'lucide-react';
```

## 🐛 Troubleshooting

### Port 3000 already in use?

```bash
npm run dev -- -p 3001
```

### Styles not loading?

```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

### TypeScript errors?

```bash
# Regenerate types
npm run build
```

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [Lucide Icons](https://lucide.dev/)

## 🚢 Deploy to Production

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Deploy automatically

### Other Platforms

```bash
# Build for production
npm run build

# Start production server
npm start
```

---

**You're all set! Start customizing and building your dev career intelligence platform! 🎉**
