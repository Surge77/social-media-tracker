'use client';

import { ThemeProvider } from 'next-themes';
import { ThemeWaveTransition } from '@/components/ThemeWaveTransition';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      {children}
      <ThemeWaveTransition />
    </ThemeProvider>
  );
}
