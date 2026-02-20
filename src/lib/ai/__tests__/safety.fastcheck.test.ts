import fc from 'fast-check'
import { describe, expect, test } from 'vitest'
import { sanitizeUserInput } from '@/lib/ai/safety'

describe('sanitizeUserInput property tests', () => {
  test('never returns a longer string than input for non-flagged results', () => {
    fc.assert(
      fc.property(fc.string(), (input) => {
        const result = sanitizeUserInput(input)

        if (!result.flagged) {
          expect(result.sanitized.length).toBeLessThanOrEqual(input.length)
        }
      })
    )
  })

  test('always flags inputs longer than 2000 chars', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 2001, maxLength: 5000 }),
        (input) => {
          const result = sanitizeUserInput(input)
          expect(result.flagged).toBe(true)
          expect(result.reason).toBe('input_too_long')
          expect(result.sanitized.length).toBe(2000)
        }
      )
    )
  })
})
