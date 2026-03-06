'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTheme } from 'next-themes';
import { getThemePrismSwitchStyles } from '@/components/theme-prism-switch-styles';
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
  const styles = getThemePrismSwitchStyles();

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
      <button
        type="button"
        className={styles.placeholderClassName}
        aria-label="Switch theme"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={handleThemeSwitch}
      className={styles.buttonClassName}
      aria-label={`Switch theme, current: ${activeTheme}`}
      title={`Theme: ${activeTheme}`}
    >
      <div className={styles.frameClassName} style={{ perspective: '200px' }}>
        <div
          className={styles.cubeClassName}
          style={{
            transform: `rotateY(${PRISM_ROT[THEMES[activeIndex]]}deg)`,
            transition: 'transform 0.55s cubic-bezier(.34,1.46,.64,1)',
          }}
        >
          {THEMES.map((themeName, index) => (
            <div
              key={themeName}
              className={`${styles.faceClassName} ${FACE_META[themeName].faceClass}`}
              style={{ transform: `rotateY(${index * 120}deg) translateZ(12px)` }}
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
