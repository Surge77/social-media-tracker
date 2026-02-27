'use client'

import { ScrollVelocityContainer, ScrollVelocityRow } from '@/components/ui/scroll-based-velocity'

const row1 = ['GitHub Stars', 'Stack Overflow', 'Job Demand', 'npm Downloads', 'Community Sentiment', 'HN Velocity', 'Repo Momentum']
const row2 = ['TypeScript', 'Rust', 'Python', 'Go', 'React', 'Next.js', 'Kubernetes', 'Bun', 'Svelte', 'Zig']

const Dot = () => (
  <span className="mx-4 text-primary/40 text-2xl leading-none select-none">·</span>
)

export default function VelocityScroll() {
  return (
    <section className="relative py-10 overflow-hidden">
      {/* edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />

      <ScrollVelocityContainer className="flex flex-col gap-4">
        {/* Row 1 — data sources, moves right */}
        <ScrollVelocityRow
          baseVelocity={3}
          direction={1}
          className="text-2xl font-semibold tracking-tight text-muted-foreground/50"
        >
          {row1.map((item) => (
            <span key={item} className="inline-flex items-center">
              <span className="whitespace-nowrap">{item}</span>
              <Dot />
            </span>
          ))}
        </ScrollVelocityRow>

        {/* Row 2 — technologies, moves left */}
        <ScrollVelocityRow
          baseVelocity={3}
          direction={-1}
          className="text-2xl font-semibold tracking-tight text-foreground/20"
        >
          {row2.map((item) => (
            <span key={item} className="inline-flex items-center">
              <span className="whitespace-nowrap">{item}</span>
              <Dot />
            </span>
          ))}
        </ScrollVelocityRow>
      </ScrollVelocityContainer>
    </section>
  )
}
