import * as React from 'react';
import Link from 'next/link';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const lightweightCTAVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md hover:shadow-lg",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-sm hover:shadow-md",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm hover:shadow-md",
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

export interface LightweightCTAProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof lightweightCTAVariants> {
  href: string;
  children: React.ReactNode;
}

const LightweightCTA = React.forwardRef<HTMLAnchorElement, LightweightCTAProps>(
  ({ className, variant, size, href, children, ...props }, ref) => {
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
      <Link
        ref={ref}
        href={href}
        className={cn(lightweightCTAVariants({ variant, size, className }))}
        aria-label={ariaLabel}
        {...props}
      >
        {children}
      </Link>
    );
  }
);

LightweightCTA.displayName = 'LightweightCTA';

export default LightweightCTA;