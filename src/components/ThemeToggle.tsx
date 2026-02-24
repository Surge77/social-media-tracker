'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

// Custom event for theme toggle with coordinates
export const THEME_TOGGLE_EVENT = 'theme-toggle-click';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    const currentTheme = resolvedTheme === 'dark' ? 'dark' : 'light';

    // Dispatch custom event with click coordinates and current theme
    window.dispatchEvent(
      new CustomEvent(THEME_TOGGLE_EVENT, {
        detail: { x, y, currentTheme },
      })
    );

    // Change theme immediately
    setTheme(currentTheme === 'dark' ? 'light' : 'dark');
  };

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9">
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleThemeToggle}
      className="h-9 w-9"
    >
      {resolvedTheme === 'dark' ? (
        <Sun className="h-4 w-4 transition-all text-yellow-400" />
      ) : (
        <Moon className="h-4 w-4 transition-all text-slate-700" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
