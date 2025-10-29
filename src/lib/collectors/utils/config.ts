// Configuration loading and validation utilities
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { ZodError } from 'zod'
import {
  CollectorConfigSchema,
  RSSConfigSchema,
  type CollectorConfig,
  type RSSConfig,
} from '@/types/collector.types'

/**
 * Formats Zod validation errors into readable messages
 */
function formatZodError(error: ZodError): string {
  return error.errors
    .map(err => {
      const path = err.path.join('.')
      return `  - ${path}: ${err.message}`
    })
    .join('\n')
}

/**
 * Loads and validates the collector configuration
 * @returns The validated collector configuration
 * @throws Error if configuration is invalid or missing
 */
export function loadCollectorConfig(): CollectorConfig {
  const configPath = join(process.cwd(), 'config', 'collector.config.json')
  
  try {
    // Check if file exists
    if (!existsSync(configPath)) {
      throw new Error(
        `Configuration file not found: ${configPath}\n` +
        `Please create this file or copy from the example.\n` +
        `See config/README.md for configuration details.`
      )
    }

    // Read and parse JSON
    const configData = readFileSync(configPath, 'utf-8')
    let config: unknown
    
    try {
      config = JSON.parse(configData)
    } catch (parseError) {
      throw new Error(
        `Invalid JSON in configuration file: ${configPath}\n` +
        `Error: ${parseError instanceof Error ? parseError.message : String(parseError)}\n` +
        `Please check for syntax errors (missing commas, quotes, etc.)`
      )
    }

    // Validate schema
    try {
      return CollectorConfigSchema.parse(config)
    } catch (validationError) {
      if (validationError instanceof ZodError) {
        throw new Error(
          `Invalid collector configuration in ${configPath}:\n` +
          formatZodError(validationError) + '\n' +
          `See config/README.md for valid configuration options.`
        )
      }
      throw validationError
    }
  } catch (error) {
    // Re-throw our formatted errors
    if (error instanceof Error && error.message.includes('configuration')) {
      throw error
    }
    
    // Handle unexpected errors
    throw new Error(
      `Failed to load collector configuration: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}

/**
 * Loads and validates the RSS sources configuration
 * @returns The validated RSS configuration
 * @throws Error if configuration is invalid or missing
 */
export function loadRSSConfig(): RSSConfig {
  const configPath = join(process.cwd(), 'config', 'rss_sources.json')
  
  try {
    // Check if file exists
    if (!existsSync(configPath)) {
      throw new Error(
        `RSS sources configuration file not found: ${configPath}\n` +
        `Please create this file with your RSS feed sources.\n` +
        `See config/README.md for configuration details and examples.`
      )
    }

    // Read and parse JSON
    const configData = readFileSync(configPath, 'utf-8')
    let config: unknown
    
    try {
      config = JSON.parse(configData)
    } catch (parseError) {
      throw new Error(
        `Invalid JSON in RSS sources file: ${configPath}\n` +
        `Error: ${parseError instanceof Error ? parseError.message : String(parseError)}\n` +
        `Please check for syntax errors (missing commas, quotes, etc.)`
      )
    }

    // Validate schema
    try {
      const validatedConfig = RSSConfigSchema.parse(config)
      
      // Additional validation: ensure at least one source
      if (validatedConfig.sources.length === 0) {
        throw new Error(
          `RSS configuration must have at least one source.\n` +
          `Please add RSS feed URLs to ${configPath}\n` +
          `See config/README.md for examples.`
        )
      }
      
      return validatedConfig
    } catch (validationError) {
      if (validationError instanceof ZodError) {
        throw new Error(
          `Invalid RSS sources configuration in ${configPath}:\n` +
          formatZodError(validationError) + '\n' +
          `See config/README.md for valid configuration options.`
        )
      }
      throw validationError
    }
  } catch (error) {
    // Re-throw our formatted errors
    if (error instanceof Error && error.message.includes('configuration')) {
      throw error
    }
    
    // Handle unexpected errors
    throw new Error(
      `Failed to load RSS configuration: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}

/**
 * Gets environment variable or throws error if missing
 * @param key - The environment variable key
 * @param description - Description of the variable for error message
 * @returns The environment variable value
 * @throws Error if environment variable is not set
 */
export function getRequiredEnv(key: string, description: string): string {
  const value = process.env[key]
  if (!value || value.trim() === '') {
    throw new Error(
      `Missing required environment variable: ${key}\n` +
      `Description: ${description}\n` +
      `Please add this variable to your .env file.\n` +
      `See .env.example for reference.`
    )
  }
  return value.trim()
}

/**
 * Gets environment variable with a default value
 * @param key - The environment variable key
 * @param defaultValue - The default value if not set
 * @returns The environment variable value or default
 */
export function getEnvWithDefault(key: string, defaultValue: string): string {
  const value = process.env[key]
  return value && value.trim() !== '' ? value.trim() : defaultValue
}

/**
 * Validates all required environment variables for collectors
 * @param includeNewsAPI - Whether to validate NewsAPI key (default: false)
 * @throws Error if any required environment variables are missing
 */
export function validateCollectorEnvironment(includeNewsAPI: boolean = false): void {
  const required = [
    { key: 'NEXT_PUBLIC_SUPABASE_URL', description: 'Supabase project URL' },
    { key: 'SUPABASE_SERVICE_ROLE_KEY', description: 'Supabase service role key for database writes' },
  ]

  if (includeNewsAPI) {
    required.push({
      key: 'NEWSAPI_KEY',
      description: 'NewsAPI.org API key (get from https://newsapi.org/register)',
    })
  }

  const missing = required.filter(({ key }) => {
    const value = process.env[key]
    return !value || value.trim() === ''
  })

  if (missing.length > 0) {
    const missingList = missing
      .map(({ key, description }) => `  - ${key}: ${description}`)
      .join('\n')
    
    throw new Error(
      `Missing required environment variables:\n` +
      missingList + '\n\n' +
      `Please add these variables to your .env file.\n` +
      `See .env.example for reference and setup instructions.`
    )
  }

  // Validate URL format for Supabase URL
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (supabaseUrl && !supabaseUrl.startsWith('http')) {
    throw new Error(
      `Invalid NEXT_PUBLIC_SUPABASE_URL format: ${supabaseUrl}\n` +
      `URL must start with http:// or https://\n` +
      `Example: https://xxxxx.supabase.co`
    )
  }
}

/**
 * Gets NewsAPI key from environment
 * Supports both NEWSAPI_KEY and NEWS_API_KEY
 * @returns The NewsAPI key
 * @throws Error if not set
 */
export function getNewsAPIKey(): string {
  const key = process.env.NEWSAPI_KEY || process.env.NEWS_API_KEY
  if (!key || key.trim() === '') {
    throw new Error(
      `Missing required environment variable: NEWSAPI_KEY\n` +
      `Description: NewsAPI.org API key for fetching news articles\n` +
      `Get your free API key from: https://newsapi.org/register\n` +
      `Add to .env file: NEWSAPI_KEY=your_api_key_here`
    )
  }
  return key.trim()
}

/**
 * Validates all configuration files and environment variables
 * Provides a comprehensive check before running collectors
 * @param options - Validation options
 * @returns Validation result with warnings
 */
export function validateAllConfiguration(options: {
  checkCollectorConfig?: boolean
  checkRSSConfig?: boolean
  checkNewsAPI?: boolean
} = {}): {
  valid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  // Validate environment variables
  try {
    validateCollectorEnvironment(options.checkNewsAPI)
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error))
  }

  // Validate collector config
  if (options.checkCollectorConfig !== false) {
    try {
      loadCollectorConfig()
    } catch (error) {
      // Collector config is optional, so this is a warning
      warnings.push(
        `Collector configuration not loaded: ${error instanceof Error ? error.message : String(error)}\n` +
        `Using default values for collector settings.`
      )
    }
  }

  // Validate RSS config
  if (options.checkRSSConfig) {
    try {
      loadRSSConfig()
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error))
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Prints validation results to console
 * @param result - Validation result from validateAllConfiguration
 */
export function printValidationResults(result: {
  valid: boolean
  errors: string[]
  warnings: string[]
}): void {
  if (result.errors.length > 0) {
    console.error('\n❌ Configuration Validation Failed\n')
    console.error('Errors:')
    result.errors.forEach(error => {
      console.error(`\n${error}\n`)
    })
  }

  if (result.warnings.length > 0) {
    console.warn('\n⚠️  Configuration Warnings\n')
    result.warnings.forEach(warning => {
      console.warn(`${warning}\n`)
    })
  }

  if (result.valid && result.warnings.length === 0) {
    console.log('\n✅ Configuration validation passed\n')
  }
}
