import { describe, expect, it } from 'vitest'
import {
  getRepoGridClassName,
  getLegendaryCardClassName,
  getRepoCardFooterClassName,
  getRepoFilterTrackClassName,
  getRepoViewToggleClassName,
  getRisingStarsTrackClassName,
} from '@/components/repos/repo-layout-styles'

describe('repo layout mobile styles', () => {
  it('uses horizontally scrollable filter and chip tracks on small screens', () => {
    expect(getRepoFilterTrackClassName()).toContain('overflow-x-auto')
    expect(getRepoFilterTrackClassName()).toContain('sm:flex-wrap')
    expect(getRisingStarsTrackClassName()).toContain('overflow-x-auto')
    expect(getRisingStarsTrackClassName()).toContain('sm:flex-wrap')
  })

  it('keeps mobile control groups full width before collapsing back on larger screens', () => {
    const viewToggle = getRepoViewToggleClassName()

    expect(viewToggle).toContain('w-full')
    expect(viewToggle).toContain('grid-cols-2')
    expect(viewToggle).toContain('sm:w-auto')
  })

  it('uses a real multi-card grid once small screens have enough width', () => {
    const grid = getRepoGridClassName()

    expect(grid).toContain('grid-cols-1')
    expect(grid).toContain('min-[520px]:grid-cols-2')
    expect(grid).toContain('lg:grid-cols-3')
  })

  it('shrinks legendary cards and stacks repo card footers for narrow screens', () => {
    expect(getLegendaryCardClassName()).toContain('w-[min(82vw,16rem)]')
    expect(getLegendaryCardClassName()).toContain('sm:w-[260px]')

    const footer = getRepoCardFooterClassName()
    expect(footer).toContain('flex-col')
    expect(footer).toContain('sm:flex-row')
  })
})
