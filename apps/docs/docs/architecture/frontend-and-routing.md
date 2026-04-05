---
title: Frontend and Routing
description: How the App Router frontend is structured and how page-level behavior is organized.
---

# Frontend and Routing

The main product frontend is built with Next.js App Router. Routing and rendering logic is centered in `src/app`, with page-level components and shared UI in `src/components`.

## Core route structure

Important route areas include:

- `src/app/page.tsx` for the landing page
- `src/app/(dashboard)` for the main product surfaces
- `src/app/api` for route handlers
- utility preview routes such as theme and spinner pages used for internal UI work

## Dashboard route group

The dashboard group contains the main product areas:

- ask
- blockchain
- compare
- digest
- jobs
- languages
- methodology
- quiz
- repos
- technologies

Several of those areas also include nested detail pages such as technology, company, role, and location pages.

## Component organization

`src/components` is grouped largely by domain:

- `technologies`
- `compare`
- `jobs`
- `quiz`
- `blockchain`
- `languages`
- `repos`
- `ask`
- `digest`
- `landing`
- `shared`
- `ui`

That mirrors the route structure and makes it easier to track feature ownership.

## Shared frontend patterns

- TanStack Query is used for client-side server state patterns where needed
- Shared display primitives live under `src/components/ui`
- Common badges, labels, and status indicators live under `src/components/shared`
- Hooks under `src/hooks` support domain behaviors such as AI comparison, jobs intelligence, and blockchain views

## Contributor guidance

When changing a page:

1. Start at the route entrypoint in `src/app`
2. Identify the page client or composed domain component
3. Trace server data loading and any matching API handlers
4. Verify whether the page expects precomputed data, live API work, or AI output

## Related pages

- [Feature Surfaces](../product/feature-surfaces.md)
- [API Surface](./api-surface.md)
