'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { DotPattern } from '@/components/ui/dot-pattern'
import { Loading } from '@/components/ui/loading'
import { JobsPulseStrip } from '@/components/jobs/JobsPulseStrip'
import { JobsAISummaryCard } from '@/components/jobs/JobsAISummaryCard'
import { JobsFilterBar } from '@/components/jobs/JobsFilterBar'
import { JobsHighlightsRow } from '@/components/jobs/JobsHighlightsRow'
import { JobOpeningsList } from '@/components/jobs/JobOpeningsList'
import { JobCompaniesExplorer } from '@/components/jobs/JobCompaniesExplorer'
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
import { useJobCompanies, useJobOpenings, type JobsAggregatorFilters } from '@/hooks/useJobsAggregator'
import { cn } from '@/lib/utils'
import { clampPage, getTotalPages, slicePageItems } from '@/lib/jobs/pagination'

const sectionVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

type JobsTab = 'openings' | 'companies' | 'signals'

const defaultFilters: JobsAggregatorFilters = {
  period: '30d',
  remote: 'all',
  technology: '',
  location: '',
  role: '',
  postedWithin: '30d',
}

const OPENINGS_PAGE_SIZE = 12
const COMPANIES_PAGE_SIZE = 8

export function JobsPageClient() {
  const prefersReducedMotion = useReducedMotion()
  const [filters, setFilters] = useState<JobsAggregatorFilters>(defaultFilters)
  const [activeTab, setActiveTab] = useState<JobsTab>('openings')
  const [openingsPage, setOpeningsPage] = useState(1)
  const [companiesPage, setCompaniesPage] = useState(1)
  const { data, rawData, isLoading, isError, error, refetch } = useJobsOverview(filters)
  const openingsQuery = useJobOpenings(filters, { page: openingsPage, pageSize: OPENINGS_PAGE_SIZE })
  const companiesQuery = useJobCompanies(filters)

  const emptyMessage = useMemo(() => {
    if (!filters.technology && !filters.location && !filters.role && filters.remote === 'all') {
      return 'No aggregated jobs data is available yet. Once the multi-source ingestion pipeline populates live openings, this page will switch from market shell to full aggregator.'
    }
    return 'No openings matched the current stack, market, and work-mode filters. Try widening the location, role, or posted-within window.'
  }, [filters.location, filters.remote, filters.role, filters.technology])

  const openingsTotalPages = getTotalPages(openingsQuery.data?.total ?? 0, openingsQuery.data?.pageSize ?? OPENINGS_PAGE_SIZE)
  const companiesTotalPages = getTotalPages(companiesQuery.data?.total ?? 0, COMPANIES_PAGE_SIZE)
  const companyPage = clampPage(companiesPage, companiesTotalPages)
  const pagedCompanies = slicePageItems(companiesQuery.data?.companies ?? [], companyPage, COMPANIES_PAGE_SIZE)

  if (isLoading && openingsQuery.isLoading && !rawData && !openingsQuery.data) {
    return (
      <div className="app-page py-8">
        <div className="flex min-h-[620px] items-center justify-center">
          <Loading size="lg" text="Loading jobs intelligence..." />
        </div>
      </div>
    )
  }

  if (isError && openingsQuery.isError && !rawData && !openingsQuery.data) {
    return (
      <div className="app-page py-8">
        <div className="flex min-h-[620px] items-center justify-center">
          <div className="space-y-4 text-center">
            <p className="text-sm text-destructive">
              {error instanceof Error ? error.message : 'Failed to load jobs intelligence'}
            </p>
            <button
              onClick={() => {
                refetch()
                void openingsQuery.refetch()
                void companiesQuery.refetch()
              }}
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
          onChange={(next) => {
            setOpeningsPage(1)
            setCompaniesPage(1)
            setFilters((current) => ({ ...current, ...(next as Partial<JobsAggregatorFilters>) }))
          }}
        />
      </motion.div>

      <motion.div
        variants={prefersReducedMotion ? {} : sectionVariants}
        initial="hidden"
        animate="visible"
        className="app-section-tight"
      >
        <div className="inline-flex rounded-2xl border border-border/70 bg-background/85 p-1 shadow-sm">
          {([
            ['openings', 'Openings'],
            ['companies', 'Companies'],
            ['signals', 'Signals'],
          ] as Array<[JobsTab, string]>).map(([tab, label]) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'rounded-xl px-4 py-2 text-sm font-medium transition-colors',
                activeTab === tab
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </motion.div>

      {(openingsQuery.isError || companiesQuery.isError) && (
        <div className="app-section-tight">
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            {openingsQuery.error instanceof Error
              ? openingsQuery.error.message
              : companiesQuery.error instanceof Error
                ? companiesQuery.error.message
                : 'Some jobs aggregator data could not be loaded. Falling back to the available market data.'}
          </div>
        </div>
      )}

      {data && (
        <>
          {activeTab === 'openings' && (
            <>
              <motion.div variants={prefersReducedMotion ? {} : sectionVariants} initial="hidden" animate="visible" className="app-section-tight">
                <JobsHighlightsRow highlights={openingsQuery.data?.highlights ?? []} />
              </motion.div>

              <motion.div variants={prefersReducedMotion ? {} : sectionVariants} initial="hidden" animate="visible" className="app-section">
                <JobOpeningsList
                  openings={openingsQuery.data?.openings ?? []}
                  isLoading={openingsQuery.isLoading}
                  page={openingsQuery.data?.page ?? openingsPage}
                  totalPages={openingsTotalPages}
                  onPageChange={(page) => setOpeningsPage(clampPage(page, openingsTotalPages))}
                  total={openingsQuery.data?.total ?? 0}
                />
              </motion.div>

              {!openingsQuery.isLoading && (openingsQuery.data?.openings.length ?? 0) === 0 && (
                <div className="app-section">
                  <JobsEmptyState message={emptyMessage} />
                </div>
              )}
            </>
          )}

          {activeTab === 'companies' && (
            <>
              <motion.div variants={prefersReducedMotion ? {} : sectionVariants} initial="hidden" animate="visible" className="app-section">
                <JobCompaniesExplorer
                  companies={pagedCompanies}
                  isLoading={companiesQuery.isLoading}
                  page={companyPage}
                  totalPages={companiesTotalPages}
                  onPageChange={(page) => setCompaniesPage(clampPage(page, companiesTotalPages))}
                  total={companiesQuery.data?.total ?? 0}
                />
              </motion.div>

              {!companiesQuery.isLoading && (companiesQuery.data?.companies.length ?? 0) === 0 && (
                <div className="app-section">
                  <JobsEmptyState message={emptyMessage} />
                </div>
              )}
            </>
          )}

          {activeTab === 'signals' && (
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
        </>
      )}
    </div>
  )
}
