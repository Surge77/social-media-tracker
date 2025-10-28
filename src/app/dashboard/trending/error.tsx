'use client';

import { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function TrendingError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Trending page error:', error);
  }, [error]);

  const getErrorMessage = () => {
    const message = error.message.toLowerCase();
    
    if (message.includes('fetch') || message.includes('network')) {
      return {
        title: 'Connection Error',
        description: 'Unable to load trending data. Please check your internet connection and try again.',
      };
    }
    
    if (message.includes('timeout')) {
      return {
        title: 'Request Timeout',
        description: 'The request took too long to complete. Please try again.',
      };
    }

    if (message.includes('500') || message.includes('server')) {
      return {
        title: 'Server Error',
        description: 'The server encountered an error. This is usually temporary.',
      };
    }

    if (message.includes('429') || message.includes('rate limit')) {
      return {
        title: 'Rate Limited',
        description: 'Too many requests. Please wait a moment before trying again.',
      };
    }

    return {
      title: 'Something went wrong',
      description: 'An unexpected error occurred while loading the trending feed.',
    };
  };

  const { title, description } = getErrorMessage();

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 p-6">
        <div className="max-w-2xl mx-auto mt-20">
          <Alert className="border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle className="text-lg font-semibold">{title}</AlertTitle>
            <AlertDescription className="mt-2 text-base">
              {description}
            </AlertDescription>
          </Alert>

          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <Button 
              onClick={reset}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/'}
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Go Home
            </Button>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <details className="mt-8 p-4 bg-muted rounded-lg">
              <summary className="cursor-pointer font-medium text-sm">
                Error Details (Development)
              </summary>
              <pre className="mt-2 text-xs text-muted-foreground overflow-auto">
                {error.message}
                {error.stack && `\n\n${error.stack}`}
              </pre>
            </details>
          )}
        </div>
      </div>
      
      {/* Empty sidebar space to maintain layout */}
      <div className="w-80 border-l border-border" />
    </div>
  );
}