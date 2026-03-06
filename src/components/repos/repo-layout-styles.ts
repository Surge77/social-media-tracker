export function getRepoFilterTrackClassName() {
  return 'flex gap-1.5 overflow-x-auto pb-1 pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:overflow-visible sm:pb-0 sm:pr-0'
}

export function getRisingStarsTrackClassName() {
  return 'flex gap-2 overflow-x-auto pb-1 pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:overflow-visible sm:pb-0 sm:pr-0'
}

export function getRepoViewToggleClassName() {
  return 'grid w-full grid-cols-2 items-center rounded-xl border border-border/60 bg-muted/20 p-1 sm:inline-flex sm:w-auto'
}

export function getRepoCardFooterClassName() {
  return 'mt-auto flex flex-col gap-2 border-t border-border/50 pt-3 sm:flex-row sm:items-center sm:justify-between'
}

export function getRepoGridClassName() {
  return 'grid grid-cols-1 gap-3 min-[520px]:grid-cols-2 sm:gap-4 lg:grid-cols-3'
}

export function getLegendaryCardClassName() {
  return 'group relative flex w-[min(82vw,16rem)] shrink-0 snap-start flex-col gap-3 overflow-hidden rounded-2xl border border-border/60 bg-card/30 p-4 backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:border-yellow-500/40 hover:bg-card hover:shadow-[0_12px_30px_-10px_rgba(234,179,8,0.2)] sm:w-[260px] sm:p-5'
}
