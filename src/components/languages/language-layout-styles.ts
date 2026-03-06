export function getLanguageTrendTrackClassName() {
  return 'flex gap-1 overflow-x-auto pb-1 pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:overflow-visible sm:pb-0 sm:pr-0'
}

export function getLanguageCategoryTrackClassName() {
  return 'flex gap-2 overflow-x-auto pb-1 pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:overflow-visible sm:pb-0 sm:pr-0'
}

export function getLanguageLeaderboardScrollerClassName() {
  return 'overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden'
}

export function getLanguageLeaderboardInnerClassName() {
  return 'min-w-[720px]'
}

export function getLanguageResultsHeaderClassName() {
  return 'mb-2'
}

export function getLanguageResultsListClassName() {
  return 'flex flex-col gap-2'
}

export function getLanguagePodiumScrollerClassName() {
  return 'overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden'
}

export function getLanguagePodiumShellClassName() {
  return 'mx-auto flex min-w-[390px] items-end justify-center gap-2 sm:min-w-0 sm:gap-5'
}

export function getLanguagePodiumCardClassName(isFirst: boolean) {
  return isFirst
    ? 'w-[8.25rem] shrink-0 sm:w-[210px]'
    : 'w-[6.75rem] shrink-0 sm:w-[172px]'
}
