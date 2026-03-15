create extension if not exists pgcrypto;

create table if not exists public.job_listings (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  external_id text not null,
  canonical_hash text not null,
  title text not null,
  company_name text,
  company_slug text,
  job_url text,
  description_text text,
  location_text text,
  location_country text,
  location_region text,
  location_city text,
  is_remote boolean not null default false,
  employment_type text,
  seniority text,
  role_slug text,
  role_label text,
  salary_min numeric,
  salary_max numeric,
  salary_currency text,
  posted_at timestamptz,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint job_listings_source_check check (
    source = any (
      array[
        'hasdata_indeed',
        'serpapi_google_jobs'
      ]::text[]
    )
  ),
  constraint job_listings_source_external_unique unique (source, external_id)
);

create index if not exists idx_job_listings_canonical_hash on public.job_listings (canonical_hash);
create index if not exists idx_job_listings_company_slug on public.job_listings (company_slug);
create index if not exists idx_job_listings_role_slug on public.job_listings (role_slug);
create index if not exists idx_job_listings_is_active on public.job_listings (is_active);
create index if not exists idx_job_listings_posted_at on public.job_listings (posted_at desc);
create index if not exists idx_job_listings_location_country_region_city on public.job_listings (location_country, location_region, location_city);
create index if not exists idx_job_listings_remote on public.job_listings (is_remote);

create table if not exists public.job_listing_technologies (
  id bigint generated always as identity primary key,
  job_listing_id uuid not null references public.job_listings(id) on delete cascade,
  technology_id uuid not null references public.technologies(id) on delete cascade,
  match_type text not null default 'keyword',
  confidence numeric not null default 0.5,
  created_at timestamptz not null default now(),
  constraint job_listing_technologies_unique unique (job_listing_id, technology_id)
);

create index if not exists idx_job_listing_technologies_technology_id on public.job_listing_technologies (technology_id);

create table if not exists public.job_listing_skills (
  id bigint generated always as identity primary key,
  job_listing_id uuid not null references public.job_listings(id) on delete cascade,
  skill_slug text not null,
  skill_label text not null,
  category text,
  confidence numeric not null default 0.5,
  created_at timestamptz not null default now(),
  constraint job_listing_skills_unique unique (job_listing_id, skill_slug)
);

create index if not exists idx_job_listing_skills_skill_slug on public.job_listing_skills (skill_slug);

create table if not exists public.job_market_daily (
  id bigint generated always as identity primary key,
  date date not null,
  technology_id uuid not null references public.technologies(id) on delete cascade,
  active_jobs integer not null default 0,
  new_jobs integer not null default 0,
  remote_jobs integer not null default 0,
  company_count integer not null default 0,
  location_count integer not null default 0,
  avg_salary_min numeric,
  avg_salary_max numeric,
  search_interest numeric,
  search_velocity numeric,
  jobs_velocity numeric,
  jobs_acceleration numeric,
  search_vs_hiring_gap numeric,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint job_market_daily_unique unique (date, technology_id)
);

create index if not exists idx_job_market_daily_date on public.job_market_daily (date desc);
create index if not exists idx_job_market_daily_technology_date on public.job_market_daily (technology_id, date desc);

create table if not exists public.job_role_tech_daily (
  id bigint generated always as identity primary key,
  date date not null,
  role_slug text not null,
  role_label text not null,
  technology_id uuid not null references public.technologies(id) on delete cascade,
  active_jobs integer not null default 0,
  new_jobs integer not null default 0,
  remote_ratio numeric not null default 0,
  company_count integer not null default 0,
  growth_7d numeric not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint job_role_tech_daily_unique unique (date, role_slug, technology_id)
);

create index if not exists idx_job_role_tech_daily_role_date on public.job_role_tech_daily (role_slug, date desc);
create index if not exists idx_job_role_tech_daily_technology_date on public.job_role_tech_daily (technology_id, date desc);

create table if not exists public.job_company_tech_daily (
  id bigint generated always as identity primary key,
  date date not null,
  company_slug text not null,
  company_name text not null,
  technology_id uuid not null references public.technologies(id) on delete cascade,
  active_jobs integer not null default 0,
  remote_ratio numeric not null default 0,
  location_count integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint job_company_tech_daily_unique unique (date, company_slug, technology_id)
);

create index if not exists idx_job_company_tech_daily_company_date on public.job_company_tech_daily (company_slug, date desc);
create index if not exists idx_job_company_tech_daily_technology_date on public.job_company_tech_daily (technology_id, date desc);

create table if not exists public.job_location_tech_daily (
  id bigint generated always as identity primary key,
  date date not null,
  location_slug text not null,
  location_label text not null,
  location_type text not null default 'country',
  technology_id uuid not null references public.technologies(id) on delete cascade,
  active_jobs integer not null default 0,
  remote_ratio numeric not null default 0,
  company_count integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint job_location_tech_daily_unique unique (date, location_slug, location_type, technology_id)
);

create index if not exists idx_job_location_tech_daily_location_date on public.job_location_tech_daily (location_slug, date desc);
create index if not exists idx_job_location_tech_daily_technology_date on public.job_location_tech_daily (technology_id, date desc);

create table if not exists public.job_skill_adjacency_daily (
  id bigint generated always as identity primary key,
  date date not null,
  technology_id uuid not null references public.technologies(id) on delete cascade,
  related_skill_slug text not null,
  related_skill_label text not null,
  cooccurrence_count integer not null default 0,
  lift_score numeric not null default 0,
  remote_ratio numeric not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint job_skill_adjacency_daily_unique unique (date, technology_id, related_skill_slug)
);

create index if not exists idx_job_skill_adjacency_daily_technology_date on public.job_skill_adjacency_daily (technology_id, date desc);

alter table public.job_listings enable row level security;
alter table public.job_listing_technologies enable row level security;
alter table public.job_listing_skills enable row level security;
alter table public.job_market_daily enable row level security;
alter table public.job_role_tech_daily enable row level security;
alter table public.job_company_tech_daily enable row level security;
alter table public.job_location_tech_daily enable row level security;
alter table public.job_skill_adjacency_daily enable row level security;
