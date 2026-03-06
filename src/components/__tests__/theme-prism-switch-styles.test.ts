import { describe, expect, it } from 'vitest'
import { getThemePrismSwitchStyles } from '@/components/theme-prism-switch-styles'

describe('getThemePrismSwitchStyles', () => {
  it('uses the same 40px control shell as the mobile header actions', () => {
    const styles = getThemePrismSwitchStyles()

    expect(styles.buttonClassName).toContain('h-10')
    expect(styles.buttonClassName).toContain('w-10')
    expect(styles.buttonClassName).toContain('rounded-xl')
    expect(styles.placeholderClassName).toContain('h-10')
    expect(styles.placeholderClassName).toContain('w-10')
  })

  it('keeps the prism fully contained inside the outer shell', () => {
    const styles = getThemePrismSwitchStyles()

    expect(styles.frameClassName).toContain('h-7')
    expect(styles.frameClassName).toContain('w-7')
    expect(styles.cubeClassName).toContain('h-7')
    expect(styles.cubeClassName).toContain('w-7')
  })
})
