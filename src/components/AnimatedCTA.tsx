'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
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
          
          setTimeout(() => {
            // Use window.location for navigation after delay to ensure smooth transition
            window.location.href = href;
          }, delay);
        }
      },
      [disabled, onClick, delay, href]
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
        whileHover={prefersReducedMotion ? {} : { 
          scale: 1.02,
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
        }}
        whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
        transition={prefersReducedMotion ? {} : { 
          type: "spring", 
          stiffness: 400, 
          damping: 17 
        }}
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
              className="flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: prefersReducedMotion ? 0.1 : 0.2 }}
            >
              <LoadingSpinner size="sm" className="!border-current/20 !border-t-current" />
              <span className="opacity-70">Loading...</span>
            </motion.div>
          ) : (
            <motion.div
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