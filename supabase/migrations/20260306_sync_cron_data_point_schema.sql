alter table public.data_points
  drop constraint if exists data_points_source_check;

alter table public.data_points
  add constraint data_points_source_check
  check (
    source = any (
      array[
        'github',
        'hackernews',
        'stackoverflow',
        'npm',
        'pypi',
        'crates',
        'reddit',
        'devto',
        'adzuna',
        'jsearch',
        'remotive',
        'arbeitnow',
        'newsapi',
        'rss',
        'jobs',
        'packages',
        'librariesio',
        'npms',
        'packagist',
        'rubygems',
        'nuget',
        'pubdev',
        'youtube'
      ]::text[]
    )
  );

alter table public.data_points
  drop constraint if exists data_points_metric_check;

alter table public.data_points
  add constraint data_points_metric_check
  check (
    metric = any (
      array[
        'stars',
        'forks',
        'open_issues',
        'contributors',
        'watchers',
        'mentions',
        'upvotes',
        'comments',
        'sentiment',
        'questions',
        'answer_rate',
        'views',
        'downloads',
        'dependents',
        'likes',
        'job_postings',
        'articles',
        'posts',
        'active_contributors',
        'commit_velocity',
        'closed_issues',
        'dependents_count',
        'dependent_repos_count',
        'sourcerank',
        'latest_release_age',
        'quality_score',
        'popularity_score',
        'maintenance_score',
        'yt_video_count',
        'yt_total_views',
        'yt_avg_likes',
        'yt_upload_velocity',
        'yt_top_videos'
      ]::text[]
    )
  );

alter table public.data_points_latest
  add column if not exists metadata jsonb not null default '{}'::jsonb;

update public.data_points_latest
set metadata = '{}'::jsonb
where metadata is null;
