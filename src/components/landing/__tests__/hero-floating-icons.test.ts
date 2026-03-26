import { describe, expect, it } from 'vitest'
import fs from 'fs'
import path from 'path'

describe('Hero floating icons', () => {
  it('keeps the floating icon layer mounted above the background and outside mobile-noise-hidden', () => {
    const heroSource = fs.readFileSync(
      path.join(process.cwd(), 'src/components/landing/HeroNew.tsx'),
      'utf8'
    )

    expect(heroSource).toContain('pointer-events-none absolute inset-0 z-10')
    expect(heroSource).toContain('<FloatingIcons />')
    expect(heroSource).not.toContain('mobile-noise-hidden">\r\n        <FloatingIcons />')
    expect(heroSource).not.toContain('mobile-noise-hidden">\n        <FloatingIcons />')
    expect(heroSource).toContain('app-page relative z-20')
  })
})
