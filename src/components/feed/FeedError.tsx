'use client';

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, RefreshCw, WifiOff, Clock, Server, XCircle } from "lucide-react";
import { useState, useEffect } from "react";

export type ErrorType = 'network' | 'server' | 'rate-limit' | 'client' | 'unknown';

interface FeedErrorProps {
  error: Error;
  onRetry?: () => void;
  isRetrying?: boolean;
  retryCount?: number;
  errorType?: ErrorType;
}

const FeedError = ({ error, onRetry, isRetrying = false, retryCount = 0, errorType }: FeedErrorProps) => {
  const [countdown, setCountdown] = useState(60);
  const [canRetryAfterCountdown, setCanRetryAfterCountdown] = useState(false);

  // Countdown timer for rate-limit errors
  useEffect(() => {
    if (errorType === 'rate-limit' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (errorType === 'rate-limit' && countdown === 0) {
      setCanRetryAfterCountdown(true);
    }
  }, [errorType, countdown]);

  const getErrorDetails = () => {
    // If errorType is explicitly provided, use it
    if (errorType) {
      switch (errorType) {
        case 'network':
          return {
            icon: WifiOff,
            title: 'No Internet Connection',
            description: 'Unable to connect to the server. Please check your internet connection.',
            suggestion: 'Check your network settings and try again.',
            canRetry: true,
          };
        case 'server':
          return {
            icon: Server,
            title: 'Server Error',
            description: 'Something went wrong on our end. We\'re working on it.',
            suggestion: 'This is usually temporary. Please try again in a few moments.',
            canRetry: true,
          };
        case 'rate-limit':
          return {
            icon: Clock,
            title: 'Too Many Requests',
            description: 'You\'ve made too many requests. Please wait before trying again.',
            suggestion: countdown > 0 
              ? `Please wait ${countdown} seconds before retrying.`
              : 'You can now retry your request.',
            canRetry: countdown === 0,
          };
        case 'client':
          return {
            icon: XCircle,
            title: 'Invalid Request',
            description: 'The request could not be processed due to invalid parameters.',
            suggestion: 'Please refresh the page and try again.',
            canRetry: false,
          };
        default:
          return {
            icon: AlertTriangle,
            title: 'Something Went Wrong',
            description: 'An unexpected error occurred while loading the feed.',
            suggestion: 'Please try refreshing the page.',
            canRetry: true,
          };
      }
    }

    // Fallback to error message parsing if errorType not provided
    const message = error.message.toLowerCase();
    
    if (message.includes('fetch') || message.includes('network')) {
      return {
        icon: WifiOff,
        title: 'No Internet Connection',
        description: 'Unable to connect to the server. Please check your internet connection.',
        suggestion: 'Check your network settings and try again.',
        canRetry: true,
      };
    }
    
    if (message.includes('timeout')) {
      return {
        icon: Clock,
        title: 'Request Timeout',
        description: 'The request took too long to complete.',
        suggestion: 'The server might be experiencing high load. Please try again.',
        canRetry: true,
      };
    }
    
    if (message.includes('500') || message.includes('server')) {
      return {
        icon: Server,
        title: 'Server Error',
        description: 'Something went wrong on our end. We\'re working on it.',
        suggestion: 'This is usually temporary. Please try again in a few moments.',
        canRetry: true,
      };
    }
    
    if (message.includes('429') || message.includes('rate limit')) {
      return {
        icon: Clock,
        title: 'Too Many Requests',
        description: 'You\'ve made too many requests. Please wait before trying again.',
        suggestion: countdown > 0 
          ? `Please wait ${countdown} seconds before retrying.`
          : 'You can now retry your request.',
        canRetry: countdown === 0,
      };
    }
    
    if (message.includes('404') || message.includes('not found')) {
      return {
        icon: AlertTriangle,
        title: 'Content Not Found',
        description: 'The requested content could not be found.',
        suggestion: 'Try adjusting your filters or search terms.',
        canRetry: false,
      };
    }

    if (message.includes('400') || message.includes('bad request')) {
      return {
        icon: XCircle,
        title: 'Invalid Request',
        description: 'The request could not be processed due to invalid parameters.',
        suggestion: 'Please refresh the page and try again.',
        canRetry: false,
      };
    }
    
    return {
      icon: AlertTriangle,
      title: 'Something Went Wrong',
      description: 'An unexpected error occurred while loading the feed.',
      suggestion: 'Please try refreshing the page.',
      canRetry: true,
    };
  };

  const { icon: Icon, title, description, suggestion, canRetry } = getErrorDetails();

  return (
    <div className="space-y-6">
      <Alert className="border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive">
        <Icon className="h-4 w-4" />
        <AlertTitle className="text-lg font-semibold">{title}</AlertTitle>
        <AlertDescription className="mt-2 space-y-2">
          <p>{description}</p>
          <p className="text-sm text-muted-foreground">{suggestion}</p>
          {retryCount > 0 && (
            <p className="text-xs text-muted-foreground">
              Retry attempts: {retryCount}
            </p>
          )}
        </AlertDescription>
      </Alert>

      {onRetry && (
        <div className="flex justify-center">
          <Button 
            onClick={onRetry}
            disabled={isRetrying || !canRetry || (errorType === 'rate-limit' && !canRetryAfterCountdown)}
            className="flex items-center gap-2"
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
            {isRetrying ? 'Retrying...' : errorType === 'rate-limit' && countdown > 0 ? `Wait ${countdown}s` : 'Try Again'}
          </Button>
        </div>
      )}

      {process.env.NODE_ENV === 'development' && (
        <details className="mt-4 p-4 bg-muted rounded-lg">
          <summary className="cursor-pointer font-medium text-sm text-muted-foreground">
            Error Details (Development)
          </summary>
          <pre className="mt-2 text-xs text-muted-foreground overflow-auto whitespace-pre-wrap">
            {error.message}
            {error.stack && `\n\n${error.stack}`}
          </pre>
        </details>
      )}
    </div>
  );
};

export default FeedError;