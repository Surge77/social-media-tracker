'use client'

import { useQuery } from '@tanstack/react-query'
import type { JobCompanySummary, JobMarketHighlight, JobOpeningRecord, JobsCompaniesResponse, JobsOpeningsResponse } from '@/types'
import type { JobsDashboardFilters } from '@/hooks/useJobsIntelligence'

export type JobsPostedWithin = '24h' | '72h' | '7d' | '30d'

export interface JobsAggregatorFilters extends JobsDashboardFilters {
  postedWithin: JobsPostedWithin
}

interface JobsQueryOptions {
  page?: number
  pageSize?: number
}

function buildSearchParams(filters: JobsAggregatorFilters, options?: JobsQueryOptions): URLSearchParams {
  const params = new URLSearchParams()
  if (filters.technology) params.set('technology', filters.technology)
  if (filters.location) params.set('location', filters.location)
  if (filters.role) params.set('role', filters.role)
  if (filters.remote && filters.remote !== 'hybrid') params.set('remote', filters.remote)
  if (filters.postedWithin) params.set('postedWithin', filters.postedWithin)
  if (options?.page) params.set('page', String(options.page))
  if (options?.pageSize) params.set('pageSize', String(options.pageSize))
  return params
}

async function fetchJobOpenings(filters: JobsAggregatorFilters, options?: JobsQueryOptions): Promise<JobsOpeningsResponse> {
  const response = await fetch(`/api/jobs/openings?${buildSearchParams(filters, options).toString()}`)
  if (!response.ok) throw new Error('Failed to fetch job openings')
  return (await response.json()) as JobsOpeningsResponse
}

async function fetchJobCompanies(filters: JobsAggregatorFilters): Promise<JobsCompaniesResponse> {
  const response = await fetch(`/api/jobs/companies/summary?${buildSearchParams(filters).toString()}`)
  if (!response.ok) throw new Error('Failed to fetch job companies')
  return (await response.json()) as JobsCompaniesResponse
}

export function useJobOpenings(filters: JobsAggregatorFilters, options?: JobsQueryOptions) {
  return useQuery({
    queryKey: ['jobs-openings', filters, options],
    queryFn: () => fetchJobOpenings(filters, options),
    staleTime: 10 * 60 * 1000,
  })
}

export function useJobCompanies(filters: JobsAggregatorFilters) {
  return useQuery({
    queryKey: ['jobs-companies', filters],
    queryFn: () => fetchJobCompanies(filters),
    staleTime: 10 * 60 * 1000,
  })
}

export type JobsOpening = JobOpeningRecord
export type JobsHighlight = JobMarketHighlight
export type JobsCompany = JobCompanySummary
