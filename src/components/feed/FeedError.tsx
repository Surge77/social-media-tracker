'use client';

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, RefreshCw, WifiOff, Clock, Server } from "lucide-react";

interface FeedErrorProps {
  error: Error;
  onRetry?: () => void;
  isRetrying?: boolean;
  retryCount?: number;
}

const FeedError = ({ error, onRetry, isRetrying = false, retryCount = 0 }: FeedErrorProps) => {
  const getErrorDetails = () => {
    const message = error.message.toLowerCase();
    
    if (message.includes('fetch') || message.includes('network')) {
      return {
        icon: WifiOff,
        title: 'Connection Error',
        description: 'Unable to connect to the server. Please check your internet connection.',
        suggestion: 'Try refreshing the page or check your network settings.',
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
        description: 'The server encountered an error while processing your request.',
        suggestion: 'This is usually temporary. Please try again in a few moments.',
        canRetry: true,
      };
    }
    
    if (message.includes('429') || message.includes('rate limit')) {
      return {
        icon: Clock,
        title: 'Rate Limited',
        description: 'Too many requests have been made. Please wait before trying again.',
        suggestion: 'Wait a minute before refreshing to avoid being rate limited.',
        canRetry: true,
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
    
    return {
      icon: AlertTriangle,
      title: 'Something went wrong',
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

      {canRetry && onRetry && (
        <div className="flex justify-center">
          <Button 
            onClick={onRetry}
            disabled={isRetrying}
            className="flex items-center gap-2"
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
            {isRetrying ? 'Retrying...' : 'Try Again'}
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