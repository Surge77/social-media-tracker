// Validation utilities for collector data
import { ItemDTOSchema, type ItemDTO } from '@/types/collector.types'
import { ZodError } from 'zod'

/**
 * Validates an ItemDTO object against the schema
 * @param item - The item to validate
 * @returns The validated item
 * @throws ZodError if validation fails
 */
export function validateItemDTO(item: unknown): ItemDTO {
  return ItemDTOSchema.parse(item)
}

/**
 * Safely validates an ItemDTO object, returning null on failure
 * @param item - The item to validate
 * @returns The validated item or null if validation fails
 */
export function safeValidateItemDTO(item: unknown): ItemDTO | null {
  const result = ItemDTOSchema.safeParse(item)
  return result.success ? result.data : null
}

/**
 * Validates an array of ItemDTO objects
 * @param items - The items to validate
 * @returns Array of validated items (invalid items are filtered out)
 */
export function validateItemDTOArray(items: unknown[]): ItemDTO[] {
  return items
    .map(item => safeValidateItemDTO(item))
    .filter((item): item is ItemDTO => item !== null)
}

/**
 * Formats validation errors into a readable string
 * @param error - The Zod error to format
 * @returns A formatted error message
 */
export function formatValidationError(error: ZodError): string {
  return error.errors
    .map(err => `${err.path.join('.')}: ${err.message}`)
    .join(', ')
}
