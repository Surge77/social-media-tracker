// Logging utilities for collector operations
import type { LogEntry, CollectorSource } from '@/types/collector.types'

/**
 * Creates a structured log entry
 */
function createLogEntry(
  level: LogEntry['level'],
  collector: string,
  message: string,
  metadata?: Record<string, any>
): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    level,
    collector,
    message,
    metadata,
  }
}

/**
 * Logs an info message
 */
export function logInfo(
  collector: CollectorSource | string,
  message: string,
  metadata?: Record<string, any>
): void {
  const entry = createLogEntry('info', collector, message, metadata)
  console.log(`[${entry.timestamp}] [INFO] [${entry.collector}] ${entry.message}`, metadata || '')
}

/**
 * Logs a warning message
 */
export function logWarn(
  collector: CollectorSource | string,
  message: string,
  metadata?: Record<string, any>
): void {
  const entry = createLogEntry('warn', collector, message, metadata)
  console.warn(`[${entry.timestamp}] [WARN] [${entry.collector}] ${entry.message}`, metadata || '')
}

/**
 * Logs an error message
 */
export function logError(
  collector: CollectorSource | string,
  message: string,
  metadata?: Record<string, any>
): void {
  const entry = createLogEntry('error', collector, message, metadata)
  console.error(`[${entry.timestamp}] [ERROR] [${entry.collector}] ${entry.message}`, metadata || '')
}

/**
 * Logs collection start
 */
export function logCollectionStart(collector: CollectorSource): void {
  logInfo(collector, 'Starting collection')
}

/**
 * Logs collection completion
 */
export function logCollectionComplete(
  collector: CollectorSource,
  itemsCollected: number,
  duration: number
): void {
  logInfo(collector, 'Collection completed', {
    itemsCollected,
    durationMs: duration,
  })
}

/**
 * Logs collection error
 */
export function logCollectionError(
  collector: CollectorSource,
  error: Error | unknown
): void {
  const errorMessage = error instanceof Error ? error.message : String(error)
  const errorStack = error instanceof Error ? error.stack : undefined
  logError(collector, `Collection failed: ${errorMessage}`, {
    stack: errorStack,
  })
}

/**
 * Logs duplicate item skip
 */
export function logDuplicateSkipped(collector: CollectorSource, url: string): void {
  logInfo(collector, `Duplicate URL skipped: ${url}`)
}

/**
 * Logs item validation failure
 */
export function logValidationError(
  collector: CollectorSource,
  error: string,
  item?: any
): void {
  logWarn(collector, `Item validation failed: ${error}`, { item })
}
