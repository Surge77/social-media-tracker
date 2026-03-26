'use client'

import { useMemo } from 'react'
import {
  Cloud,
  renderSimpleIcon,
  type ICloud,
  type SimpleIcon,
} from 'react-icon-cloud'
import {
  siAngular,
  siDocker,
  siGithub,
  siGooglecloud,
  siGo,
  siGraphql,
  siKubernetes,
  siLinux,
  siMongodb,
  siNextdotjs,
  siNginx,
  siNodedotjs,
  siPostgresql,
  siPrisma,
  siPython,
  siReact,
  siRedis,
  siRust,
  siSvelte,
  siTailwindcss,
  siTerraform,
  siTypescript,
  siVercel,
  siVuedotjs,
} from 'simple-icons'

export const cloudProps: Omit<ICloud, 'children'> = {
  containerProps: {
    style: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      height: '320px',
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

export const TECH_SLUGS = [
  'typescript', 'react', 'python', 'rust', 'go', 'nodedotjs',
  'nextdotjs', 'vuedotjs', 'angular', 'svelte', 'kubernetes',
  'docker', 'postgresql', 'redis', 'mongodb', 'graphql',
  'googlecloud', 'terraform', 'github',
  'linux', 'nginx', 'tailwindcss', 'prisma', 'vercel',
]

const TECH_ICONS_BY_SLUG: Record<string, SimpleIcon> = {
  typescript: siTypescript,
  react: siReact,
  python: siPython,
  rust: siRust,
  go: siGo,
  nodedotjs: siNodedotjs,
  nextdotjs: siNextdotjs,
  vuedotjs: siVuedotjs,
  angular: siAngular,
  svelte: siSvelte,
  kubernetes: siKubernetes,
  docker: siDocker,
  postgresql: siPostgresql,
  redis: siRedis,
  mongodb: siMongodb,
  graphql: siGraphql,
  googlecloud: siGooglecloud,
  terraform: siTerraform,
  github: siGithub,
  linux: siLinux,
  nginx: siNginx,
  tailwindcss: siTailwindcss,
  prisma: siPrisma,
  vercel: siVercel,
}

export function getLocalTechIcons(slugs: string[] = TECH_SLUGS) {
  return slugs
    .map((slug) => TECH_ICONS_BY_SLUG[slug])
    .filter((icon): icon is SimpleIcon => Boolean(icon))
}

export function IconCloud({ slugs = TECH_SLUGS }: { slugs?: string[] }) {
  const icons = useMemo(() => {
    return getLocalTechIcons(slugs).map((icon) => renderCustomIcon(icon))
  }, [slugs])

  return <Cloud {...cloudProps}>{icons}</Cloud>
}
