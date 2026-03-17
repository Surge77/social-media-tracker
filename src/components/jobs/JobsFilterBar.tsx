'use client'

import type { JobsDashboardFilters, JobsFilterOption, RemoteMode } from '@/hooks/useJobsIntelligence'
import { cn } from '@/lib/utils'

type FilterState = JobsDashboardFilters & { postedWithin?: string }

interface JobsFilterBarProps {
  filters: FilterState
  options: {
    periods: JobsFilterOption[]
    technologies: JobsFilterOption[]
    roleFamilies: JobsFilterOption[]
    locations: JobsFilterOption[]
  }
  onChange: (next: Partial<FilterState>) => void
}

const REMOTE_OPTIONS: Array<{ value: RemoteMode; label: string }> = [
  { value: 'all', label: 'All modes' },
  { value: 'remote', label: 'Remote-heavy' },
  { value: 'hybrid', label: 'Hybrid mix' },
  { value: 'onsite', label: 'Mostly on-site' },
]

const POSTED_WITHIN_OPTIONS = [
  { value: '24h', label: '24h' },
  { value: '72h', label: '72h' },
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
] as const

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: JobsFilterOption[]
  onChange: (value: string) => void
}) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-2xl border bg-background px-3 py-2.5 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
      >
        <option value="">All</option>
        {options.map((option) => (
          <option key={option.slug} value={option.slug}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export function JobsFilterBar({ filters, options, onChange }: JobsFilterBarProps) {
  return (
    <div className="rounded-[28px] border border-border/70 bg-background/90 p-4 shadow-sm backdrop-blur-xl">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Time window
            </span>
            <div className="app-chip-scroll rounded-2xl border border-border/70 bg-muted/20 p-1">
              {options.periods.map((period) => (
                <button
                  key={period.slug}
                  onClick={() => onChange({ period: period.slug as JobsDashboardFilters['period'] })}
                  className={cn(
                    'shrink-0 rounded-xl px-3 py-2 text-xs font-medium transition-colors',
                    filters.period === period.slug
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-transparent text-muted-foreground hover:bg-background hover:text-foreground'
                  )}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Work mode
            </span>
            <div className="app-chip-scroll rounded-2xl border border-border/70 bg-muted/20 p-1">
              {REMOTE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onChange({ remote: option.value })}
                  className={cn(
                    'shrink-0 rounded-xl px-3 py-2 text-xs font-medium transition-colors',
                    filters.remote === option.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-transparent text-muted-foreground hover:bg-background hover:text-foreground'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Posted within
            </span>
            <div className="app-chip-scroll rounded-2xl border border-border/70 bg-muted/20 p-1">
              {POSTED_WITHIN_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onChange({ postedWithin: option.value })}
                  className={cn(
                    'shrink-0 rounded-xl px-3 py-2 text-xs font-medium transition-colors',
                    filters.postedWithin === option.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-transparent text-muted-foreground hover:bg-background hover:text-foreground'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <SelectField
            label="Role family"
            value={filters.role}
            options={options.roleFamilies}
            onChange={(role) => onChange({ role })}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <SelectField
            label="Hiring stack"
            value={filters.technology}
            options={options.technologies}
            onChange={(technology) => onChange({ technology })}
          />
          <SelectField
            label="Location"
            value={filters.location}
            options={options.locations}
            onChange={(location) => onChange({ location })}
          />
        </div>
      </div>
    </div>
  )
}
