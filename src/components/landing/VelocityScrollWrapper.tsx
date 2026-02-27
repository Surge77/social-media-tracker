'use client'

import dynamic from 'next/dynamic'

const VelocityScroll = dynamic(() => import('./VelocityScroll'), { ssr: false })

export default function VelocityScrollWrapper() {
  return <VelocityScroll />
}
