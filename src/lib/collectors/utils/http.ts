// HTTP request utilities with error handling and retry logic
import { logWarn, logError } from './logger'

/**
 * HTTP request options
 */
export interface HttpRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers?: Record<string, string>
  body?: any
  timeout?: number
  retries?: number
  retryDelay?: number
}

/**
 * HTTP error class with status code
 */
export class HttpError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message)
    this.name = 'HttpError'
  }
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Makes an HTTP request with timeout support
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number
): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new HttpError(`Request timeout after ${timeout}ms`, undefined, undefined)
    }
    throw error
  }
}

/**
 * Makes an HTTP request with retry logic and error handling
 */
export async function httpRequest<T = any>(
  url: string,
  options: HttpRequestOptions = {}
): Promise<T> {
  const {
    method = 'GET',
    headers = {},
    body,
    timeout = 30000,
    retries = 3,
    retryDelay = 1000,
  } = options

  let lastError: Error | undefined

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const requestOptions: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      }

      if (body) {
        requestOptions.body = typeof body === 'string' ? body : JSON.stringify(body)
      }

      const response = await fetchWithTimeout(url, requestOptions, timeout)

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error')
        throw new HttpError(
          `HTTP ${response.status}: ${errorText}`,
          response.status,
          errorText
        )
      }

      const contentType = response.headers.get('content-type')
      if (contentType?.includes('application/json')) {
        return await response.json()
      }

      return (await response.text()) as T
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // Don't retry on client errors (4xx)
      if (error instanceof HttpError && error.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
        throw error
      }

      // Log retry attempts
      if (attempt < retries) {
        const delay = retryDelay * Math.pow(2, attempt) // Exponential backoff
        logWarn('http', `Request failed (attempt ${attempt + 1}/${retries + 1}), retrying in ${delay}ms`, {
          url,
          error: lastError.message,
        })
        await sleep(delay)
      }
    }
  }

  logError('http', `Request failed after ${retries + 1} attempts`, {
    url,
    error: lastError?.message,
  })
  throw lastError
}

/**
 * Makes multiple HTTP requests concurrently with a limit
 */
export async function httpRequestBatch<T = any>(
  urls: string[],
  options: HttpRequestOptions = {},
  concurrencyLimit: number = 5
): Promise<T[]> {
  const results: T[] = []
  const errors: Error[] = []

  for (let i = 0; i < urls.length; i += concurrencyLimit) {
    const batch = urls.slice(i, i + concurrencyLimit)
    const batchPromises = batch.map(url =>
      httpRequest<T>(url, options)
        .then(result => ({ success: true as const, result }))
        .catch(error => ({ success: false as const, error }))
    )

    const batchResults = await Promise.all(batchPromises)

    for (const result of batchResults) {
      if (result.success) {
        results.push(result.result)
      } else {
        errors.push(result.error)
      }
    }
  }

  if (errors.length > 0) {
    logWarn('http', `Batch request completed with ${errors.length} errors out of ${urls.length} requests`)
  }

  return results
}

/**
 * Checks if an error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof HttpError) {
    return !error.statusCode || error.statusCode >= 500
  }
  if (error instanceof Error) {
    return error.message.includes('timeout') ||
           error.message.includes('network') ||
           error.message.includes('ECONNREFUSED') ||
           error.message.includes('ETIMEDOUT')
  }
  return false
}

/**
 * Checks if an error is a rate limit error
 */
export function isRateLimitError(error: unknown): boolean {
  if (error instanceof HttpError) {
    return error.statusCode === 429
  }
  return false
}
