'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Cloud,
  fetchSimpleIcons,
  renderSimpleIcon,
  type ICloud,
  type SimpleIcon,
} from 'react-icon-cloud'

export const cloudProps: Omit<ICloud, 'children'> = {
  containerProps: {
    style: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
    },
  },
  options: {
    reverse: true,
    depth: 1,
    wheelZoom: false,
    imageScale: 2,
    activeCursor: 'default',
    tooltip: 'native',
    initial: [0.1, -0.1],
    clickToFront: 500,
    tooltipDelay: 0,
    outlineColour: '#0000',
    maxSpeed: 0.04,
    minSpeed: 0.02,
  },
}

function renderCustomIcon(icon: SimpleIcon) {
  return renderSimpleIcon({
    icon,
    bgHex: '#0a0a0a',
    fallbackHex: '#f97316',
    minContrastRatio: 2,
    size: 42,
    aProps: {
      href: undefined,
      target: undefined,
      rel: undefined,
      onClick: (e: React.MouseEvent) => e.preventDefault(),
    },
  })
}

type IconData = Awaited<ReturnType<typeof fetchSimpleIcons>>

export const TECH_SLUGS = [
  'typescript', 'react', 'python', 'rust', 'go', 'nodedotjs',
  'nextdotjs', 'vuedotjs', 'angular', 'svelte', 'kubernetes',
  'docker', 'postgresql', 'redis', 'mongodb', 'graphql',
  'amazonaws', 'googlecloud', 'terraform', 'github',
  'linux', 'nginx', 'tailwindcss', 'prisma', 'vercel',
]

export function IconCloud({ slugs = TECH_SLUGS }: { slugs?: string[] }) {
  const [data, setData] = useState<IconData | null>(null)

  useEffect(() => {
    fetchSimpleIcons({ slugs }).then(setData)
  }, [slugs])

  const icons = useMemo(() => {
    if (!data) return null
    return Object.values(data.simpleIcons).map(icon => renderCustomIcon(icon))
  }, [data])

  if (!icons) {
    return (
      <div className="flex h-[320px] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
      </div>
    )
  }

  return <Cloud {...cloudProps}>{icons}</Cloud>
}
