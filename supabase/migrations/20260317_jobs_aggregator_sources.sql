alter table public.job_listings
  drop constraint if exists job_listings_source_check;

alter table public.job_listings
  add constraint job_listings_source_check check (
    source = any (
      array[
        'hasdata_indeed',
        'serpapi_google_jobs',
        'jsearch',
        'adzuna',
        'remotive',
        'arbeitnow'
      ]::text[]
    )
  );

create table if not exists public.job_listing_sightings (
  id bigint generated always as identity primary key,
  job_listing_id uuid not null references public.job_listings(id) on delete cascade,
  source text not null,
  external_id text not null,
  source_url text,
  posted_at timestamptz,
  payload jsonb not null default '{}'::jsonb,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint job_listing_sightings_source_check check (
    source = any (
      array[
        'hasdata_indeed',
        'serpapi_google_jobs',
        'jsearch',
        'adzuna',
        'remotive',
        'arbeitnow'
      ]::text[]
    )
  ),
  constraint job_listing_sightings_source_external_unique unique (source, external_id)
);

create index if not exists idx_job_listing_sightings_listing_id on public.job_listing_sightings (job_listing_id);
create index if not exists idx_job_listing_sightings_source on public.job_listing_sightings (source);

alter table public.job_listing_sightings enable row level security;
