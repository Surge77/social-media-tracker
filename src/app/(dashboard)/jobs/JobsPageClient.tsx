'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { DotPattern } from '@/components/ui/dot-pattern'
import { Loading } from '@/components/ui/loading'
import { JobsPulseStrip } from '@/components/jobs/JobsPulseStrip'
import { JobsAISummaryCard } from '@/components/jobs/JobsAISummaryCard'
import { JobsFilterBar } from '@/components/jobs/JobsFilterBar'
import { HiringNowSection } from '@/components/jobs/HiringNowSection'
import { RisingRolesSection } from '@/components/jobs/RisingRolesSection'
import { RemoteFriendlyStacksSection } from '@/components/jobs/RemoteFriendlyStacksSection'
import { CompanyRadarSection } from '@/components/jobs/CompanyRadarSection'
import { SkillAdjacencySection } from '@/components/jobs/SkillAdjacencySection'
import { GeoDemandSection } from '@/components/jobs/GeoDemandSection'
import { SearchVsHiringSection } from '@/components/jobs/SearchVsHiringSection'
import { JobsEmptyState } from '@/components/jobs/JobsEmptyState'
import type { JobsDashboardFilters } from '@/hooks/useJobsIntelligence'
import { useJobsOverview } from '@/hooks/useJobsIntelligence'

const sectionVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

const defaultFilters: JobsDashboardFilters = {
  period: '30d',
  remote: 'all',
  technology: '',
  location: '',
  role: '',
}

export function JobsPageClient() {
  const prefersReducedMotion = useReducedMotion()
  const [filters, setFilters] = useState<JobsDashboardFilters>(defaultFilters)
  const { data, rawData, isLoading, isError, error, refetch } = useJobsOverview(filters)

  const emptyMessage = useMemo(() => {
    if (!filters.technology && !filters.location && !filters.role && filters.remote === 'all') {
      return 'No jobs intelligence data is available yet. Once the backend providers populate /api/jobs/overview, this dashboard will light up automatically.'
    }
    return 'No jobs intelligence matches the current filters. Try widening the technology, location, or work-mode constraints.'
  }, [filters.location, filters.remote, filters.role, filters.technology])

  if (isLoading && !rawData) {
    return (
      <div className="app-page py-8">
        <div className="flex min-h-[620px] items-center justify-center">
          <Loading size="lg" text="Loading jobs intelligence..." />
        </div>
      </div>
    )
  }

  if (isError && !rawData) {
    return (
      <div className="app-page py-8">
        <div className="flex min-h-[620px] items-center justify-center">
          <div className="space-y-4 text-center">
            <p className="text-sm text-destructive">
              {error instanceof Error ? error.message : 'Failed to load jobs intelligence'}
            </p>
            <button
              onClick={() => refetch()}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative app-page py-6 sm:py-8 lg:py-10">
      <DotPattern className="mobile-noise-hidden opacity-30" />

      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
        animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? {} : { duration: 0.4 }}
        className="app-section relative"
      >
        <JobsPulseStrip pulse={data?.pulse ?? null} isLoading={isLoading} lastUpdated={rawData?.lastUpdated ?? null} />
      </motion.div>

      <motion.div
        variants={prefersReducedMotion ? {} : sectionVariants}
        initial="hidden"
        animate="visible"
        className="app-section-tight"
      >
        <JobsAISummaryCard />
      </motion.div>

      <motion.div
        variants={prefersReducedMotion ? {} : sectionVariants}
        initial="hidden"
        animate="visible"
        className="app-section-tight"
      >
        <JobsFilterBar
          filters={filters}
          options={rawData?.filters ?? { periods: [], technologies: [], roleFamilies: [], locations: [] }}
          onChange={(next) => setFilters((current) => ({ ...current, ...next }))}
        />
      </motion.div>

      {data && (
        <>
          <motion.div variants={prefersReducedMotion ? {} : sectionVariants} initial="hidden" animate="visible" className="app-section">
            <HiringNowSection entries={data.hiringNow} isLoading={isLoading} />
          </motion.div>

          <motion.div variants={prefersReducedMotion ? {} : sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.18 }} className="app-section-tight">
            <RisingRolesSection entries={data.risingRoles} isLoading={isLoading} />
          </motion.div>

          <motion.div variants={prefersReducedMotion ? {} : sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.18 }} className="app-section-tight">
            <SearchVsHiringSection points={data.searchVsHiring} isLoading={isLoading} />
          </motion.div>

          <motion.div variants={prefersReducedMotion ? {} : sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.18 }} className="app-section-tight">
            <RemoteFriendlyStacksSection entries={data.remoteFriendlyStacks} isLoading={isLoading} />
          </motion.div>

          <motion.div variants={prefersReducedMotion ? {} : sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.18 }} className="app-section-tight">
            <CompanyRadarSection entries={data.companyRadar} isLoading={isLoading} />
          </motion.div>

          <motion.div variants={prefersReducedMotion ? {} : sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.18 }} className="app-section-tight">
            <SkillAdjacencySection entries={data.skillAdjacency} isLoading={isLoading} />
          </motion.div>

          <motion.div variants={prefersReducedMotion ? {} : sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.18 }} className="app-section-tight">
            <GeoDemandSection entries={data.geoDemand} isLoading={isLoading} />
          </motion.div>

          {!isLoading &&
            data.hiringNow.length === 0 &&
            data.risingRoles.length === 0 &&
            data.remoteFriendlyStacks.length === 0 &&
            data.companyRadar.length === 0 &&
            data.skillAdjacency.length === 0 &&
            data.geoDemand.length === 0 &&
            data.searchVsHiring.length === 0 && (
              <div className="app-section">
                <JobsEmptyState message={emptyMessage} />
              </div>
            )}
        </>
      )}
    </div>
  )
}
