import { describe, expect, it } from 'vitest'
import { getHeroQuizPromptClassName } from '@/components/landing/hero-styles'

describe('getHeroQuizPromptClassName', () => {
  it('centers the secondary quiz prompt on small screens', () => {
    const className = getHeroQuizPromptClassName()

    expect(className).toContain('mx-auto')
    expect(className).toContain('justify-center')
    expect(className).toContain('text-center')
    expect(className).toContain('max-w-[18rem]')
  })

  it('allows the prompt to relax back to inline sizing on larger screens', () => {
    const className = getHeroQuizPromptClassName()

    expect(className).toContain('sm:max-w-none')
    expect(className).toContain('sm:w-auto')
  })
})
