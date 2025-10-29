# Scripts Directory

This directory contains utility scripts for database setup, testing, and data collection.

## Overview

The database is configured for anonymous (public) read access to content tables, removing the need for user authentication while maintaining security through Row Level Security (RLS) policies.

## Scripts

### Configuration and Validation

#### `validate-config.ts`
Validates all configuration files and environment variables before running collectors:
```bash
# Validate basic configuration
npx tsx scripts/validate-config.ts

# Validate all configurations including NewsAPI and RSS
npx tsx scripts/validate-config.ts --all

# Validate with verbose output
npx tsx scripts/validate-config.ts --all --verbose
```

**Options:**
- `--newsapi` - Validate NewsAPI configuration (requires NEWSAPI_KEY)
- `--rss` - Validate RSS sources configuration
- `--all` - Validate all configurations
- `--verbose, -v` - Show detailed validation information
- `--help, -h` - Show help message

**Exit Codes:**
- `0` - All validations passed
- `1` - Validation failed (errors found)
- `2` - Validation passed with warnings

**Use this script before running collectors to ensure everything is configured correctly.**

### Data Collection Scripts

#### `collect-all.ts`
Unified collection orchestrator that runs all collectors in sequence:
```bash
# Run all collectors
npx tsx scripts/collect-all.ts

# Run specific collectors
npx tsx scripts/collect-all.ts --collectors hn,rss

# Dry run (collect but don't store)
npx tsx scripts/collect-all.ts --dry-run

# Stop on first error
npx tsx scripts/collect-all.ts --stop-on-error
```

**Options:**
- `--collectors <list>` - Comma-separated list of collectors (hn, rss, newsapi)
- `--dry-run` - Collect but don't store in database
- `--stop-on-error` - Stop execution if any collector fails
- `--no-config` - Don't use collector.config.json (use defaults)
- `--help, -h` - Show help message

#### `collect-hn.ts`
Hacker News collector script:
```bash
# Default settings
npx tsx scripts/collect-hn.ts

# Custom settings
npx tsx scripts/collect-hn.ts --max-stories 50 --concurrent 10

# Dry run
npx tsx scripts/collect-hn.ts --dry-run
```

**Options:**
- `--max-stories <number>` - Maximum number of stories (default: 30)
- `--concurrent <number>` - Concurrent requests (default: 5)
- `--dry-run` - Collect but don't store
- `--help, -h` - Show help message

#### `collect-rss.ts`
RSS feed collector script:
```bash
# Default settings
npx tsx scripts/collect-rss.ts

# Custom settings
npx tsx scripts/collect-rss.ts --max-items 30 --max-age 48

# Dry run
npx tsx scripts/collect-rss.ts --dry-run
```

**Options:**
- `--max-items <number>` - Maximum items per feed (default: 20)
- `--max-age <number>` - Maximum age in hours (default: 24)
- `--timeout <number>` - Request timeout in ms (default: 15000)
- `--dry-run` - Collect but don't store
- `--help, -h` - Show help message

**Note:** Requires `config/rss_sources.json` to be configured.

#### `collect-newsapi.ts`
NewsAPI collector script:
```bash
# Default settings
npx tsx scripts/collect-newsapi.ts

# Custom settings
npx tsx scripts/collect-newsapi.ts --country gb --category business

# Dry run
npx tsx scripts/collect-newsapi.ts --dry-run
```

**Options:**
- `--country <code>` - Country code (default: us)
- `--category <name>` - Category (default: technology)
- `--page-size <number>` - Number of articles (default: 50, max: 100)
- `--dry-run` - Collect but don't store
- `--help, -h` - Show help message

**Note:** Requires `NEWSAPI_KEY` environment variable.

### Database Setup Scripts

#### `setup-public-access.sql`
Raw SQL script that can be executed in the Supabase SQL editor to:
- Remove user-specific tables (users, bookmarks)
- Enable Row Level Security on content tables
- Create public read policies for anonymous access
- Grant necessary permissions to the anonymous role

### `setup-database-security.js`
Node.js script that programmatically applies the security configuration:
```bash
npm run db:setup-security
```

### `test-public-access.js`
Test script to verify that public read access is working correctly:
```bash
npm run db:test-access
```

## Configuration Applied

### Tables with Public Read Access
- `items` - Social media content items
- `trending_metrics` - Popularity and trending data

### Removed Tables
- `users` - No longer needed (no authentication)
- `bookmarks` - No longer needed (no user-specific features)

### Security Policies
- Anonymous users can read all items and trending metrics
- No write access for anonymous users
- Row Level Security enabled on all content tables

## Usage

1. **Automatic Setup**: Run the setup script to apply all security policies:
   ```bash
   npm run db:setup-security
   ```

2. **Manual Setup**: Copy and paste the contents of `setup-public-access.sql` into the Supabase SQL editor

3. **Verify Setup**: Test that public access is working:
   ```bash
   npm run db:test-access
   ```

## Environment Variables Required

Make sure these environment variables are set in your `.env` file:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Anonymous/public key for read access
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for admin operations (setup only)

## Security Notes

- Anonymous users have read-only access to content tables
- No user authentication or authorization is required
- All data is publicly accessible for content consumption
- Write operations should be handled through secure API endpoints or admin interfaces