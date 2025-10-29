/**
 * Error handling and retry logic for Supabase operations
 * Provides consistent error handling across all database operations
 */

// Base error class for database operations
export class DatabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

// Error categories for different handling strategies
export enum ErrorCategory {
  NETWORK = 'network',
  DATABASE = 'database',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  RATE_LIMIT = 'rate_limit',
  UNKNOWN = 'unknown'
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Retry configuration
export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableErrors: string[];
}

// Default retry configurations for different operations
export const retryConfigs: Record<string, RetryConfig> = {
  read: {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    retryableErrors: ['NETWORK_ERROR', 'TIMEOUT', '5XX']
  },
  write: {
    maxAttempts: 2,
    baseDelay: 2000,
    maxDelay: 15000,
    backoffMultiplier: 2,
    retryableErrors: ['NETWORK_ERROR', 'TIMEOUT', '5XX']
  },
  search: {
    maxAttempts: 2,
    baseDelay: 500,
    maxDelay: 5000,
    backoffMultiplier: 1.5,
    retryableErrors: ['NETWORK_ERROR', 'TIMEOUT']
  }
};

// Enhanced error class with categorization
export class CategorizedError extends DatabaseError {
  public category: ErrorCategory;
  public severity: ErrorSeverity;
  public retryable: boolean;
  public userMessage: string;

  constructor(
    message: string,
    category: ErrorCategory = ErrorCategory.UNKNOWN,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    code?: string,
    details?: any,
    retryable: boolean = false,
    userMessage?: string
  ) {
    super(message, code, details);
    this.category = category;
    this.severity = severity;
    this.retryable = retryable;
    this.userMessage = userMessage || this.getDefaultUserMessage();
  }

  private getDefaultUserMessage(): string {
    switch (this.category) {
      case ErrorCategory.NETWORK:
        return 'Connection issue. Please check your internet connection and try again.';
      case ErrorCategory.DATABASE:
        return 'Database temporarily unavailable. Please try again in a moment.';
      case ErrorCategory.AUTHENTICATION:
        return 'Please sign in to continue.';
      case ErrorCategory.AUTHORIZATION:
        return 'You don\'t have permission to perform this action.';
      case ErrorCategory.VALIDATION:
        return 'Invalid data provided. Please check your input.';
      case ErrorCategory.RATE_LIMIT:
        return 'Too many requests. Please wait a moment before trying again.';
      default:
        return 'Something went wrong. Please try again.';
    }
  }
}

// Categorize errors based on error details
export function categorizeError(error: any): CategorizedError {
  // Handle DatabaseError instances
  if (error instanceof DatabaseError) {
    const code = error.code || '';
    
    // Network/connection errors
    if (code.includes('NETWORK') || code.includes('CONNECTION') || code.includes('TIMEOUT')) {
      return new CategorizedError(
        error.message,
        ErrorCategory.NETWORK,
        ErrorSeverity.MEDIUM,
        code,
        error.details,
        true,
        'Connection issue. Please check your internet connection and try again.'
      );
    }
    
    // Authentication errors
    if (code.includes('AUTH') || code === 'PGRST301') {
      return new CategorizedError(
        error.message,
        ErrorCategory.AUTHENTICATION,
        ErrorSeverity.HIGH,
        code,
        error.details,
        false,
        'Please sign in to continue.'
      );
    }
    
    // Authorization errors
    if (code.includes('PGRST116') || code.includes('PERMISSION')) {
      return new CategorizedError(
        error.message,
        ErrorCategory.AUTHORIZATION,
        ErrorSeverity.HIGH,
        code,
        error.details,
        false,
        'You don\'t have permission to access this data.'
      );
    }
    
    // Validation errors
    if (code.includes('PGRST102') || code.includes('VALIDATION')) {
      return new CategorizedError(
        error.message,
        ErrorCategory.VALIDATION,
        ErrorSeverity.LOW,
        code,
        error.details,
        false,
        'Invalid data provided. Please check your input.'
      );
    }
    
    // Rate limiting
    if (code.includes('429') || code.includes('RATE_LIMIT')) {
      return new CategorizedError(
        error.message,
        ErrorCategory.RATE_LIMIT,
        ErrorSeverity.MEDIUM,
        code,
        error.details,
        true,
        'Too many requests. Please wait a moment before trying again.'
      );
    }
    
    // Server errors (5xx)
    if (code.startsWith('5') || code.includes('SERVER')) {
      return new CategorizedError(
        error.message,
        ErrorCategory.DATABASE,
        ErrorSeverity.HIGH,
        code,
        error.details,
        true,
        'Database temporarily unavailable. Please try again in a moment.'
      );
    }
    
    // Default database error
    return new CategorizedError(
      error.message,
      ErrorCategory.DATABASE,
      ErrorSeverity.MEDIUM,
      code,
      error.details,
      false
    );
  }
  
  // Handle generic errors
  if (error instanceof Error) {
    return new CategorizedError(
      error.message,
      ErrorCategory.UNKNOWN,
      ErrorSeverity.MEDIUM,
      undefined,
      undefined,
      false
    );
  }
  
  // Handle unknown error types
  return new CategorizedError(
    'An unexpected error occurred',
    ErrorCategory.UNKNOWN,
    ErrorSeverity.MEDIUM,
    undefined,
    error,
    false
  );
}

// Retry logic with exponential backoff
export async function withRetry<T>(
  operation: () => Promise<T>,
  config: RetryConfig = retryConfigs.read,
  operationName: string = 'operation'
): Promise<T> {
  let lastError: CategorizedError;
  
  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = categorizeError(error);
      
      // Don't retry if error is not retryable
      if (!lastError.retryable) {
        throw lastError;
      }
      
      // Don't retry if we've reached max attempts
      if (attempt === config.maxAttempts) {
        throw lastError;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1),
        config.maxDelay
      );
      
      // Add jitter to prevent thundering herd
      const jitteredDelay = delay + Math.random() * 1000;
      
      console.warn(
        `${operationName} failed (attempt ${attempt}/${config.maxAttempts}). Retrying in ${Math.round(jitteredDelay)}ms...`,
        { error: lastError.message, code: lastError.code }
      );
      
      await new Promise(resolve => setTimeout(resolve, jitteredDelay));
    }
  }
  
  throw lastError!;
}

// Circuit breaker pattern for preventing cascading failures
class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  
  constructor(
    private failureThreshold: number = 5,
    private recoveryTimeout: number = 60000 // 1 minute
  ) {}
  
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
        this.state = 'half-open';
      } else {
        throw new CategorizedError(
          'Circuit breaker is open',
          ErrorCategory.DATABASE,
          ErrorSeverity.HIGH,
          'CIRCUIT_BREAKER_OPEN',
          undefined,
          true,
          'Service temporarily unavailable. Please try again later.'
        );
      }
    }
    
    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  private onSuccess() {
    this.failures = 0;
    this.state = 'closed';
  }
  
  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.failureThreshold) {
      this.state = 'open';
    }
  }
  
  getState() {
    return {
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime
    };
  }
}

// Global circuit breaker instances
export const circuitBreakers = {
  database: new CircuitBreaker(5, 60000),
  search: new CircuitBreaker(3, 30000),
  trending: new CircuitBreaker(3, 30000)
};

// Wrapper function that combines retry logic with circuit breaker
export async function executeWithResilience<T>(
  operation: () => Promise<T>,
  operationName: string,
  circuitBreakerKey: keyof typeof circuitBreakers = 'database',
  retryConfigKey: keyof typeof retryConfigs = 'read'
): Promise<T> {
  const circuitBreaker = circuitBreakers[circuitBreakerKey];
  const retryConfig = retryConfigs[retryConfigKey];
  
  return circuitBreaker.execute(() =>
    withRetry(operation, retryConfig, operationName)
  );
}

// Error logging utility
export function logError(error: CategorizedError, context?: Record<string, any>) {
  const logData = {
    message: error.message,
    category: error.category,
    severity: error.severity,
    code: error.code,
    details: error.details,
    retryable: error.retryable,
    timestamp: new Date().toISOString(),
    context
  };
  
  // In production, this would send to a logging service
  if (error.severity === ErrorSeverity.CRITICAL || error.severity === ErrorSeverity.HIGH) {
    console.error('Database Error:', logData);
  } else {
    console.warn('Database Warning:', logData);
  }
}