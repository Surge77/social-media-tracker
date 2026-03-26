import { describe, expect, it } from 'vitest'
import { TECH_SLUGS, getLocalTechIcons } from '@/components/ui/icon-cloud'

describe('getLocalTechIcons', () => {
  it('provides a local icon for every landing page technology slug', () => {
    const icons = getLocalTechIcons(TECH_SLUGS)

    expect(icons).toHaveLength(TECH_SLUGS.length)
    expect(icons.map((icon) => icon.slug)).toEqual(TECH_SLUGS)
  })
})
