import { describe, expect, it } from 'vitest'
import {
  getLanguageCategoryTrackClassName,
  getLanguageLeaderboardInnerClassName,
  getLanguageLeaderboardScrollerClassName,
  getLanguagePodiumCardClassName,
  getLanguagePodiumScrollerClassName,
  getLanguagePodiumShellClassName,
  getLanguageResultsHeaderClassName,
  getLanguageResultsListClassName,
  getLanguageTrendTrackClassName,
} from '@/components/languages/language-layout-styles'

describe('language layout mobile styles', () => {
  it('uses horizontally scrollable tracks for trend and category controls on small screens', () => {
    expect(getLanguageTrendTrackClassName()).toContain('overflow-x-auto')
    expect(getLanguageTrendTrackClassName()).toContain('sm:flex-wrap')
    expect(getLanguageCategoryTrackClassName()).toContain('overflow-x-auto')
    expect(getLanguageCategoryTrackClassName()).toContain('sm:flex-wrap')
  })

  it('keeps the leaderboard horizontally scrollable while preserving the full desktop structure on phones', () => {
    expect(getLanguageLeaderboardScrollerClassName()).toContain('overflow-x-auto')
    expect(getLanguageLeaderboardInnerClassName()).toContain('min-w-[720px]')
    expect(getLanguageResultsHeaderClassName()).toBe('mb-2')
    expect(getLanguageResultsListClassName()).toContain('flex-col')
  })

  it('keeps the podium in a horizontal desktop-style formation on phones', () => {
    expect(getLanguagePodiumScrollerClassName()).toContain('overflow-x-auto')
    expect(getLanguagePodiumShellClassName()).toContain('flex')
    expect(getLanguagePodiumShellClassName()).toContain('min-w-[390px]')
    expect(getLanguagePodiumCardClassName(true)).toContain('w-[8.25rem]')
    expect(getLanguagePodiumCardClassName(true)).toContain('sm:w-[210px]')
    expect(getLanguagePodiumCardClassName(false)).toContain('sm:w-[172px]')
  })
})
