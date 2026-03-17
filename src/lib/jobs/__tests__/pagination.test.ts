import { describe, expect, it } from 'vitest'
import { clampPage, getTotalPages, slicePageItems } from '@/lib/jobs/pagination'

describe('jobs pagination helpers', () => {
  it('computes total pages from item count and page size', () => {
    expect(getTotalPages(0, 12)).toBe(1)
    expect(getTotalPages(24, 12)).toBe(2)
    expect(getTotalPages(25, 12)).toBe(3)
  })

  it('clamps page to valid bounds', () => {
    expect(clampPage(0, 3)).toBe(1)
    expect(clampPage(2, 3)).toBe(2)
    expect(clampPage(9, 3)).toBe(3)
  })

  it('returns the expected slice for a given page', () => {
    expect(slicePageItems([1, 2, 3, 4, 5], 2, 2)).toEqual([3, 4])
  })
})
