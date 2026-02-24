'use client'

import dynamic from 'next/dynamic'

const IconCloud = dynamic(
  () => import('@/components/ui/icon-cloud').then(m => ({ default: m.IconCloud })),
  { ssr: false, loading: () => <div className="h-[320px]" /> },
)

export default function TechCloudSection() {
  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.06),transparent_60%)]" />

      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col items-center gap-10 md:flex-row md:gap-16">

            {/* Text side */}
            <div className="flex-1 text-center md:text-left">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
                100+ technologies
              </p>
              <h2 className="mb-4 text-3xl font-bold leading-tight text-foreground md:text-4xl">
                Every language, framework,{' '}
                <span className="bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 bg-clip-text text-transparent">
                  and tool that matters
                </span>
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                From JavaScript frameworks to systems languages, cloud platforms
                to databases — if developers are talking about it, we're
                tracking it. Scores updated every 24 hours across all signals.
              </p>
              <div className="mt-6 flex flex-wrap gap-2 md:justify-start justify-center">
                {['React', 'Rust', 'TypeScript', 'Go', 'Python', 'Kubernetes'].map(t => (
                  <span
                    key={t}
                    className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary"
                  >
                    {t}
                  </span>
                ))}
                <span className="rounded-full border border-border/40 px-3 py-1 text-xs font-medium text-muted-foreground">
                  +94 more
                </span>
              </div>
            </div>

            {/* Icon cloud */}
            <div className="w-full flex-1 max-w-[380px]">
              <IconCloud />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
