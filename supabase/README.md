# Supabase Database Setup

This directory contains the database schema, migrations, and configuration for the Social Media Tracker application.

## Directory Structure

```
supabase/
├── migrations/           # Database migration files
│   ├── 20241029000001_initial_schema.sql
│   ├── 20241029000002_rls_policies.sql
│   └── 20241029000003_database_functions.sql
├── config.toml          # Supabase local development configuration
└── README.md           # This file
```

## Database Schema

### Tables

- **items**: Core content storage for social media posts
- **users**: User profiles and authentication data
- **bookmarks**: User-item relationships for saved content
- **trending_metrics**: Calculated popularity scores and analytics

### Functions

- **upsert_item()**: Efficiently insert or update content items
- **calculate_trending_score()**: Calculate trending scores with time decay
- **update_trending_metrics()**: Batch update trending calculations
- **search_items()**: Full-text search across content
- **get_trending_items()**: Retrieve trending content by time window

## TypeScript Types

The database schema is reflected in TypeScript types located at:
- `src/types/database.types.ts` - Generated database types
- `src/types/index.ts` - Exported convenience types

### Type Generation

To regenerate TypeScript types from the database schema:

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Start local Supabase (if not already running):
   ```bash
   supabase start
   ```

3. Generate types:
   ```bash
   supabase gen types typescript --local > src/types/database.types.ts
   ```

## Local Development

### Prerequisites

- Docker Desktop (for local Supabase)
- Supabase CLI
- Node.js 18+

### Setup

1. Initialize Supabase (if not already done):
   ```bash
   supabase init
   ```

2. Start local Supabase services:
   ```bash
   supabase start
   ```

3. Apply migrations:
   ```bash
   supabase db reset
   ```

4. Access local services:
   - Studio: http://localhost:54323
   - API: http://localhost:54321
   - Database: postgresql://postgres:postgres@localhost:54322/postgres

### Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

Get the keys from `supabase status` after starting local services.

## Migration Management

### Creating New Migrations

1. Create a new migration file:
   ```bash
   supabase migration new migration_name
   ```

2. Write your SQL changes in the generated file

3. Apply the migration:
   ```bash
   supabase db reset
   ```

### Migration Naming Convention

Use the format: `YYYYMMDDHHMMSS_description.sql`

Example: `20241029000001_initial_schema.sql`

## Security

### Row Level Security (RLS)

All tables have RLS enabled with appropriate policies:

- **items**: Public read access, service role write access
- **users**: Users can only access their own profile
- **bookmarks**: Users can only manage their own bookmarks
- **trending_metrics**: Public read access, service role write access

### Access Patterns

- **Anonymous users**: Can read items and trending metrics
- **Authenticated users**: Can manage bookmarks and profile
- **Service role**: Can perform all operations (used for data collection)

## Performance Considerations

### Indexes

The schema includes optimized indexes for:
- Content search (GIN index on search_vector)
- Trending calculations (composite indexes)
- User bookmarks (user_id, item_id)
- Time-based queries (published_at, created_at)

### Full-Text Search

Items table includes:
- Automatic search vector generation
- English language configuration
- Indexed search across title, excerpt, and author

## Monitoring

### Useful Queries

Check trending metrics:
```sql
SELECT * FROM get_trending_items('24h', 10);
```

Search content:
```sql
SELECT * FROM search_items('javascript', null, 10);
```

View recent items:
```sql
SELECT * FROM items ORDER BY created_at DESC LIMIT 10;
```

## Troubleshooting

### Common Issues

1. **Migration fails**: Check for syntax errors in SQL files
2. **Types out of sync**: Regenerate types after schema changes
3. **RLS blocking queries**: Verify policies match your access patterns
4. **Performance issues**: Check query plans and index usage

### Logs

View Supabase logs:
```bash
supabase logs
```

View specific service logs:
```bash
supabase logs --db
supabase logs --api
```