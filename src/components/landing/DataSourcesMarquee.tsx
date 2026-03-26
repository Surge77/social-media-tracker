'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { DATA_SOURCE_LOGOS, type DataSourceLogo } from '@/components/landing/data-source-logos'

const TOP_ROW_LOGOS = DATA_SOURCE_LOGOS.slice(0, 5)
const BOTTOM_ROW_LOGOS = DATA_SOURCE_LOGOS.slice(5)

function LogoMark({ source }: { source: DataSourceLogo }) {
  if (source.kind === 'text') {
    return <span className={cn('select-none leading-none', source.displayClassName)}>{source.label}</span>
  }

  return (
    <Image
      src={source.src}
      alt={source.alt}
      width={source.width}
      height={source.height}
      className={cn('object-contain select-none', source.displayClassName)}
      loading="lazy"
      unoptimized={source.src.startsWith('http')}
      referrerPolicy={source.src.startsWith('http') ? 'no-referrer' : undefined}
    />
  )
}

function LogoItem({ source, index, reduced }: { source: DataSourceLogo; index: number; reduced: boolean }) {
  return (
    <motion.div
      initial={reduced ? {} : { opacity: 0, y: 16 }}
      whileInView={reduced ? {} : { opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={reduced ? {} : {
        type: 'spring',
        stiffness: 100,
        damping: 20,
        delay: index * 0.06,
      }}
      whileHover={reduced ? {} : { scale: 1.12 }}
      className="group flex items-center justify-center px-7 sm:px-10 transition-all duration-300"
    >
      <LogoMark source={source} />
    </motion.div>
  )
}

export default function DataSourcesMarquee() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <section className="relative overflow-hidden bg-[#f8f3e6] py-10 text-[#16110c] shadow-[inset_0_1px_0_rgba(255,255,255,0.18),inset_0_-1px_0_rgba(0,0,0,0.04)] dark:bg-[#17120d] dark:text-[#f1e5d3] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05),inset_0_-1px_0_rgba(255,255,255,0.03)] sm:py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.7),transparent_55%)] dark:bg-[radial-gradient(circle_at_top,rgba(255,248,236,0.08),transparent_58%)]" />

      <motion.p
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
        whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="relative mb-8 text-center font-serif text-[1.55rem] italic tracking-tight text-[#2b2116] dark:text-[#eadac1] sm:text-[1.7rem]"
      >
        Data sourced from
      </motion.p>

      <div className="pointer-events-none absolute left-0 bottom-0 z-10 h-full w-16 bg-gradient-to-r from-[#f8f3e6] to-transparent dark:from-[#17120d] sm:w-28" />
      <div className="pointer-events-none absolute right-0 bottom-0 z-10 h-full w-16 bg-gradient-to-l from-[#f8f3e6] to-transparent dark:from-[#17120d] sm:w-28" />

      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 sm:gap-8">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-6 sm:flex-nowrap sm:gap-x-10">
          {TOP_ROW_LOGOS.map((s, i) => (
            <LogoItem key={s.name} source={s} index={i} reduced={prefersReducedMotion} />
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-6 sm:flex-nowrap sm:gap-x-10">
          {BOTTOM_ROW_LOGOS.map((s, i) => (
            <LogoItem key={s.name} source={s} index={i + TOP_ROW_LOGOS.length} reduced={prefersReducedMotion} />
          ))}
        </div>
      </div>
    </section>
  )
}
