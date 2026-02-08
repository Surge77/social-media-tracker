'use client';

import { useEffect, useState, useRef } from 'react';
import { THEME_TOGGLE_EVENT } from './ThemeToggle';

export function ThemeWaveTransition() {
  const [isAnimating, setIsAnimating] = useState(false);
  const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 });
  const [oldTheme, setOldTheme] = useState<string>('dark');
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
  }, []);

  useEffect(() => {
    const handleToggleClick = (e: Event) => {
      if (!mounted.current) return;
      
      const customEvent = e as CustomEvent<{ x: number; y: number; currentTheme: string }>;
      setClickPosition(customEvent.detail);
      setOldTheme(customEvent.detail.currentTheme || 'dark');
      setIsAnimating(true);
      
      // Reset animation after it completes
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 600);

      return () => clearTimeout(timer);
    };

    window.addEventListener(THEME_TOGGLE_EVENT, handleToggleClick);
    return () => window.removeEventListener(THEME_TOGGLE_EVENT, handleToggleClick);
  }, []);

  if (!isAnimating) return null;
  
  // Calculate the maximum radius needed to cover the entire screen from click point
  const maxRadius = Math.sqrt(
    Math.pow(Math.max(clickPosition.x, window.innerWidth - clickPosition.x), 2) +
    Math.pow(Math.max(clickPosition.y, window.innerHeight - clickPosition.y), 2)
  );

  // Show the OLD theme color that will be "wiped away"
  const overlayColor = oldTheme === 'dark' ? 'hsl(0 0% 3%)' : 'hsl(0 0% 100%)';

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div
        className="absolute inset-0"
        style={{
          background: overlayColor,
          clipPath: `circle(${maxRadius * 2}px at ${clickPosition.x}px ${clickPosition.y}px)`,
          animation: `circle-shrink 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards`,
        }}
      />
      
      <style jsx>{`
        @keyframes circle-shrink {
          0% {
            clip-path: circle(${maxRadius * 2}px at ${clickPosition.x}px ${clickPosition.y}px);
          }
          100% {
            clip-path: circle(0px at ${clickPosition.x}px ${clickPosition.y}px);
          }
        }
      `}</style>
    </div>
  );
}
