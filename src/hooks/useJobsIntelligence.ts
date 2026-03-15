'use client'

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { JobsOverviewResponse as BackendJobsOverviewResponse } from '@/types'

export type JobsPeriod = '7d' | '30d' | '90d' | '1y'
export type RemoteMode = 'all' | 'remote' | 'hybrid' | 'onsite'
export type DemandQuadrant = 'real-growth' | 'hype-risk' | 'underrated' | 'stable-demand'

export interface JobsFilterOption {
  slug: string
  label: string
}

export interface JobsOverviewPulse {
  activeJobs: number
  newJobs: number
  remoteShare: number
  hiringTechCount: number
}

export interface HiringNowEntry {
  technologySlug: string
  technologyName: string
  color?: string | null
  activeJobs: number
  newJobs: number
  companyCount: number
  remoteRatio: number
  trendLabel?: string | null
}

export interface RisingRoleEntry {
  roleSlug: string
  roleLabel: string
  technologySlug: string
  technologyName: string
  activeJobs: number
  growth7d: number
  remoteRatio: number
  companyCount: number
}

export interface RemoteFriendlyStackEntry {
  technologySlug: string
  technologyName: string
  activeJobs: number
  remoteRatio: number
  topRoles: string[]
}

export interface CompanyRadarEntry {
  companySlug: string
  companyName: string
  activeJobs: number
  remoteRatio: number
  topTechnologies: string[]
  topLocations: string[]
}

export interface SkillAdjacencySkill {
  slug: string
  label: string
  cooccurrenceCount: number
  liftScore: number
}

export interface SkillAdjacencyEntry {
  technologySlug: string
  technologyName: string
  skills: SkillAdjacencySkill[]
}

export interface GeoDemandEntry {
  locationSlug: string
  locationLabel: string
  locationType?: string | null
  topTechnology?: string | null
  activeJobs: number
  remoteRatio: number
}

export interface SearchVsHiringPoint {
  technologySlug: string
  technologyName: string
  color?: string | null
  searchVelocity: number
  jobsVelocity: number
  activeJobs: number
  quadrant: DemandQuadrant
}

export interface JobsOverviewData {
  pulse: JobsOverviewPulse
  hiringNow: HiringNowEntry[]
  risingRoles: RisingRoleEntry[]
  remoteFriendlyStacks: RemoteFriendlyStackEntry[]
  companyRadar: CompanyRadarEntry[]
  skillAdjacency: SkillAdjacencyEntry[]
  geoDemand: GeoDemandEntry[]
  searchVsHiring: SearchVsHiringPoint[]
  filters: {
    periods: JobsFilterOption[]
    technologies: JobsFilterOption[]
    roleFamilies: JobsFilterOption[]
    locations: JobsFilterOption[]
  }
  lastUpdated: string | null
}

export interface JobsDashboardFilters {
  period: JobsPeriod
  remote: RemoteMode
  technology: string
  location: string
  role: string
}

async function fetchOverview(): Promise<JobsOverviewData> {
  const response = await fetch('/api/jobs/overview')
  if (!response.ok) throw new Error('Failed to fetch jobs overview')
  const payload = (await response.json()) as BackendJobsOverviewResponse

  return {
    pulse: {
      activeJobs: payload.pulse.totalActiveJobs,
      newJobs: payload.hiringNow.reduce((sum, entry) => sum + Math.max(0, Math.round(entry.freshnessScore)), 0),
      remoteShare: payload.pulse.remoteShare / 100,
      hiringTechCount: payload.pulse.technologiesWithDemand,
    },
    hiringNow: payload.hiringNow.map((entry) => ({
      technologySlug: entry.slug,
      technologyName: entry.name,
      color: entry.color,
      activeJobs: entry.activeJobs,
      newJobs: Math.max(0, Math.round(entry.freshnessScore)),
      companyCount: entry.companyCount,
      remoteRatio: entry.remoteShare / 100,
      trendLabel: `${Math.max(0, Math.round(entry.freshnessScore))} fresh-signal points`,
    })),
    risingRoles: payload.risingRoles.map((entry) => ({
      ...entry,
      remoteRatio: entry.remoteRatio / 100,
    })),
    remoteFriendlyStacks: payload.remoteFriendlyStacks.map((entry) => ({
      technologySlug: entry.technologySlug,
      technologyName: entry.technologyName,
      activeJobs: entry.activeJobs,
      remoteRatio: entry.remoteRatio / 100,
      topRoles: payload.risingRoles
        .filter((role) => role.technologySlug === entry.technologySlug)
        .map((role) => role.roleLabel)
        .slice(0, 3),
    })),
    companyRadar: payload.companyRadar.map((entry) => ({
      companySlug: entry.companySlug,
      companyName: entry.companyName,
      activeJobs: entry.activeJobs,
      remoteRatio: entry.remoteRatio / 100,
      topTechnologies: entry.topTechnologies.map((technology) => technology.name),
      topLocations: [],
    })),
    skillAdjacency: payload.skillAdjacency.reduce<SkillAdjacencyEntry[]>((acc, entry) => {
      const existing = acc.find((item) => item.technologySlug === entry.technologySlug)
      const skill = {
        slug: entry.relatedSkillSlug,
        label: entry.relatedSkillLabel,
        cooccurrenceCount: entry.cooccurrenceCount,
        liftScore: entry.liftScore,
      }
      if (existing) {
        existing.skills.push(skill)
      } else {
        acc.push({
          technologySlug: entry.technologySlug,
          technologyName: entry.technologyName,
          skills: [skill],
        })
      }
      return acc
    }, []),
    geoDemand: payload.geoDemand.map((entry) => ({
      locationSlug: entry.locationSlug,
      locationLabel: entry.locationLabel,
      locationType: entry.locationType,
      topTechnology: entry.technologyName,
      activeJobs: entry.activeJobs,
      remoteRatio: entry.remoteRatio / 100,
    })),
    searchVsHiring: payload.searchVsHiring.map((entry) => ({
      technologySlug: entry.technologySlug,
      technologyName: entry.technologyName,
      color: entry.technologyColor,
      searchVelocity: entry.searchVelocity,
      jobsVelocity: entry.jobsVelocity,
      activeJobs: entry.activeJobs,
      quadrant: entry.quadrant,
    })),
    filters: {
      periods: payload.filters.periods.map((period) => ({ slug: period, label: period.toUpperCase() })),
      technologies: payload.filters.technologies.map((technology) => ({ slug: technology.slug, label: technology.name })),
      roleFamilies: payload.filters.roles.map((role) => ({ slug: role.slug, label: role.label })),
      locations: payload.filters.locations.map((location) => ({ slug: location.slug, label: location.label })),
    },
    lastUpdated: payload.lastUpdated,
  }
}

function matchesRemote(remoteMode: RemoteMode, ratio: number | null | undefined): boolean {
  if (remoteMode === 'all') return true
  const safeRatio = ratio ?? 0
  if (remoteMode === 'remote') return safeRatio >= 0.7
  if (remoteMode === 'hybrid') return safeRatio >= 0.35 && safeRatio < 0.7
  return safeRatio < 0.35
}

export function useJobsOverview(filters: JobsDashboardFilters) {
  const query = useQuery({
    queryKey: ['jobs-overview'],
    queryFn: fetchOverview,
    staleTime: 30 * 60 * 1000,
    gcTime: 2 * 60 * 60 * 1000,
  })

  const filteredData = useMemo(() => {
    const data = query.data
    if (!data) return null

    const technologyFilter = filters.technology
    const locationFilter = filters.location
    const roleFilter = filters.role
    const remoteFilter = filters.remote

    return {
      ...data,
      hiringNow: data.hiringNow.filter((entry) => (
        (!technologyFilter || entry.technologySlug === technologyFilter) &&
        matchesRemote(remoteFilter, entry.remoteRatio)
      )),
      risingRoles: data.risingRoles.filter((entry) => (
        (!technologyFilter || entry.technologySlug === technologyFilter) &&
        (!roleFilter || entry.roleSlug === roleFilter) &&
        matchesRemote(remoteFilter, entry.remoteRatio)
      )),
      remoteFriendlyStacks: data.remoteFriendlyStacks.filter((entry) => (
        (!technologyFilter || entry.technologySlug === technologyFilter) &&
        matchesRemote(remoteFilter, entry.remoteRatio)
      )),
      companyRadar: data.companyRadar.filter((entry) => (
        (!technologyFilter || entry.topTechnologies.some((tech) => tech === technologyFilter || tech.toLowerCase() === technologyFilter.toLowerCase())) &&
        (!locationFilter || entry.topLocations.some((location) => location.toLowerCase().includes(locationFilter.toLowerCase()))) &&
        matchesRemote(remoteFilter, entry.remoteRatio)
      )),
      skillAdjacency: data.skillAdjacency.filter((entry) => !technologyFilter || entry.technologySlug === technologyFilter),
      geoDemand: data.geoDemand.filter((entry) => (
        (!locationFilter || entry.locationSlug === locationFilter) &&
        matchesRemote(remoteFilter, entry.remoteRatio)
      )),
      searchVsHiring: data.searchVsHiring.filter((entry) => !technologyFilter || entry.technologySlug === technologyFilter),
    }
  }, [filters.location, filters.remote, filters.role, filters.technology, query.data])

  return {
    data: filteredData,
    rawData: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}
