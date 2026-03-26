'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { LoadingSpinner } from '@/components/ui/loading';

const animatedCTAVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 transform-gpu will-change-transform",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-sm hover:shadow-md",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface AnimatedCTAProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof animatedCTAVariants> {
  href: string;
  children: React.ReactNode;
  delay?: number;
  disabled?: boolean;
}

const AnimatedCTA = React.forwardRef<HTMLAnchorElement, AnimatedCTAProps>(
  ({ className, variant, size, href, children, delay = 150, disabled = false, onClick, ...props }, ref) => {
    const [isNavigating, setIsNavigating] = React.useState(false);
    const prefersReducedMotion = useReducedMotion();
    const router = useRouter();

    // Magnetic physics state
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const magneticX = useSpring(x, { stiffness: 150, damping: 15, mass: 0.1 });
    const magneticY = useSpring(y, { stiffness: 150, damping: 15, mass: 0.1 });

    const handlePointerMove = React.useCallback(
      (e: React.PointerEvent<HTMLDivElement>) => {
        if (prefersReducedMotion || disabled || isNavigating) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        x.set((e.clientX - centerX) * 0.25);
        y.set((e.clientY - centerY) * 0.25);
      },
      [prefersReducedMotion, disabled, isNavigating, x, y]
    );

    const handlePointerLeave = React.useCallback(() => {
      x.set(0);
      y.set(0);
    }, [x, y]);

    const handleClick = React.useCallback(
      (event: React.MouseEvent<HTMLAnchorElement>) => {
        if (disabled) {
          event.preventDefault();
          return;
        }

        // Call any custom onClick handler first
        if (onClick) {
          onClick(event);
        }

        // If the event was prevented by the custom handler, don't proceed
        if (event.defaultPrevented) {
          return;
        }

        // Add loading state and brief delay for micro-interaction
        if (delay > 0) {
          event.preventDefault();
          setIsNavigating(true);

          const isExternalNavigation =
            href.startsWith('http') ||
            href.startsWith('mailto:') ||
            href.startsWith('tel:') ||
            Boolean(props.download);
          
          setTimeout(() => {
            if (isExternalNavigation) {
              window.location.href = href;
              return;
            }

            router.push(href);
          }, delay);
        }
      },
      [disabled, onClick, delay, href, props.download, router]
    );

    const ariaLabel = React.useMemo(() => {
      if (props['aria-label']) {
        return props['aria-label'];
      }
      
      // Generate descriptive aria-label based on href and children
      const destination = href.includes('/dashboard') ? 'dashboard' : 'page';
      const childText = typeof children === 'string' ? children : 'button';
      return `Navigate to ${destination}: ${childText}`;
    }, [props, href, children]);

    return (
      <motion.div
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        style={{ x: magneticX, y: magneticY }}
        whileHover={prefersReducedMotion ? {} : { 
          scale: 1.05,
          boxShadow: "0 15px 35px -5px rgba(0, 0, 0, 0.15), 0 10px 15px -5px rgba(0, 0, 0, 0.08)"
        }}
        whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
        transition={prefersReducedMotion ? {} : { 
          type: "spring", 
          stiffness: 400, 
          damping: 17 
        }}
        className="inline-block relative z-10"
      >
        <Link
          ref={ref}
          href={href}
          onClick={handleClick}
          className={cn(
            animatedCTAVariants({ variant, size, className }),
            {
              'opacity-80 cursor-wait': isNavigating,
              'opacity-50 cursor-not-allowed pointer-events-none': disabled,
            }
          )}
          aria-label={ariaLabel}
          aria-disabled={disabled}
          tabIndex={disabled ? -1 : 0}
          {...props}
        >
          {isNavigating ? (
            <motion.div
              className="inline-flex items-center gap-2.5 whitespace-nowrap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: prefersReducedMotion ? 0.1 : 0.2 }}
            >
              <span className="rounded-full bg-current/10 px-2.5 py-1 font-mono text-[0.65rem] font-bold tracking-[0.22em] text-current/90">
                <LoadingSpinner size="md" className="align-middle" />
              </span>
              <span className="font-semibold text-current/85">Buffering...</span>
            </motion.div>
          ) : (
            <motion.div
              className="inline-flex items-center gap-2 whitespace-nowrap"
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 5 }}
              animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              transition={{ duration: prefersReducedMotion ? 0.1 : 0.3 }}
            >
              {children}
            </motion.div>
          )}
        </Link>
      </motion.div>
    );
  }
);

AnimatedCTA.displayName = 'AnimatedCTA';

export default AnimatedCTA;
