# DevTrends SEO Domain Fix

## Problem

The live site is deployed on `https://www.devtrends.pro`, but the app was still advertising `devtrends.dev` in core SEO signals:

- `metadataBase` in `src/app/layout.tsx`
- `robots.txt` sitemap URL in `src/app/robots.ts`
- sitemap URLs in `src/app/sitemap.ts`
- no code-level redirects from the legacy `.dev` domain to the `.pro` domain

This creates mixed canonical signals. Search engines can treat the `.dev` and `.pro` hosts as duplicate versions of the same site, which weakens branded ranking for queries like `devtrends`.

## Why It Matters

Search ranking for a branded query depends on clear ownership and clear canonical signals. If Google sees:

- one domain serving the site,
- another domain listed in the sitemap,
- and no permanent redirect from the old domain,

it has to decide which host is primary. That slows consolidation and can split ranking signals across both domains.

## Code Changes Required

The canonical production host should be `https://www.devtrends.pro`.

Required code changes:

1. Set one shared canonical site URL.
2. Use that URL in app metadata, `robots.txt`, and `sitemap.xml`.
3. Add permanent redirects from:
   - `devtrends.dev`
   - `www.devtrends.dev`
   - `devtrends.pro`
   to `https://www.devtrends.pro`
4. Add canonical metadata to important indexable pages.

## Non-Code Actions Required

Code changes are necessary, but they are not sufficient on their own.

After deployment:

1. Add both `https://www.devtrends.pro` and the legacy `.dev` domain in Google Search Console.
2. Submit the new sitemap from `https://www.devtrends.pro/sitemap.xml`.
3. Use URL Inspection to request indexing for:
   - homepage
   - `/technologies`
   - `/jobs`
   - several high-value technology detail pages
4. Keep the legacy `.dev` domain permanently redirected.
5. Replace placeholder social links with real DevTrends brand profiles.
6. Build real branded mentions and backlinks so Google can connect the name `DevTrends` to this site.

## Verification Checklist

After deployment, verify:

- `https://www.devtrends.pro/robots.txt` points to `https://www.devtrends.pro/sitemap.xml`
- `https://www.devtrends.pro/sitemap.xml` contains only `https://www.devtrends.pro/...` URLs
- `https://www.devtrends.dev/` redirects permanently to `https://www.devtrends.pro/`
- important pages emit canonical URLs on the `.pro` host

## Expected Outcome

These changes will not make the site rank instantly, but they remove the main technical SEO blocker for branded search. Once the domain signals are consistent, Google can consolidate authority on the `.pro` domain and the site has a much better chance of ranking higher for `devtrends`.
