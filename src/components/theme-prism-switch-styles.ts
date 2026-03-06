export function getThemePrismSwitchStyles() {
  return {
    placeholderClassName: 'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
    buttonClassName:
      'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform hover:scale-[1.03] active:scale-95',
    frameClassName: 'h-7 w-7',
    cubeClassName: 'relative h-7 w-7 [transform-style:preserve-3d]',
    faceClassName:
      'absolute inset-0 flex items-center justify-center rounded-[8px] border text-sm shadow-sm [backface-visibility:hidden]',
  }
}
