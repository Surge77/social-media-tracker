'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTheme } from 'next-themes';
const THEMES = ['light', 'dark', 'midnight'] as const;
type ThemeName = (typeof THEMES)[number];

const PRISM_ROT: Record<ThemeName, number> = {
  light: 0,
  dark: -120,
  midnight: -240,
};

const FACE_META: Record<ThemeName, { faceClass: string; icon: string }> = {
  light: {
    faceClass: 'bg-[hsl(40_25%_96%)] text-zinc-900 border-black/10',
    icon: '☀',
  },
  dark: {
    faceClass: 'bg-[hsl(0_0%_4%)] text-zinc-100 border-white/15',
    icon: '🌙',
  },
  midnight: {
    faceClass: 'bg-[hsl(222_14%_12%)] text-orange-300 border-white/10',
    icon: '◐',
  },
};

export function ThemePrismSwitch() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeTheme = useMemo(
    () => ((theme ?? resolvedTheme ?? 'midnight') as ThemeName),
    [theme, resolvedTheme]
  );
  const activeIndex = Math.max(THEMES.indexOf(activeTheme), 0);

  const handleThemeSwitch = () => {
    const currentTheme = (theme ?? resolvedTheme ?? 'midnight') as ThemeName;
    const currentIndex = THEMES.indexOf(currentTheme);
    const nextTheme = THEMES[(currentIndex + 1) % THEMES.length];
    setTheme(nextTheme);
  };

  if (!mounted) {
    return (
      <button type="button" className="h-9 w-9 rounded-lg" aria-label="Switch theme" />
    );
  }

  return (
    <button
      type="button"
      onClick={handleThemeSwitch}
      className="h-9 w-9 rounded-lg grid place-items-center shrink-0 align-middle hover:scale-[1.03] active:scale-95 transition-transform"
      aria-label={`Switch theme, current: ${activeTheme}`}
      title={`Theme: ${activeTheme}`}
    >
      <div className="h-6 w-6 cursor-pointer" style={{ perspective: '200px' }}>
        <div
          className="relative h-8 w-8 [transform-style:preserve-3d]"
          style={{
            transform: `rotateY(${PRISM_ROT[THEMES[activeIndex]]}deg)`,
            transition: 'transform 0.55s cubic-bezier(.34,1.46,.64,1)',
          }}
        >
          {THEMES.map((themeName, index) => (
            <div
              key={themeName}
              className={`absolute inset-0 flex items-center justify-center rounded-[7px] border text-base shadow-sm [backface-visibility:hidden] ${FACE_META[themeName].faceClass}`}
              style={{ transform: `rotateY(${index * 120}deg) translateZ(14px)` }}
            >
              {FACE_META[themeName].icon}
            </div>
          ))}
        </div>
      </div>
      <span className="sr-only">Switch theme</span>
    </button>
  );
}
