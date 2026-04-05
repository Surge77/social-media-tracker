---
title: Blockchain, Languages, Repos, and Digest
description: The supporting ecosystem views that extend DevTrends beyond framework rankings.
---

# Blockchain, Languages, Repos, and Digest

These subsystems broaden the product beyond mainstream technology rankings and jobs data. They give DevTrends adjacent ecosystem visibility and recurring narrative output.

## Blockchain

The blockchain surface includes views for:

- chain TVL and ecosystem health
- fees and gas
- stablecoins
- bridges
- hacks
- smart contract language signals

It relies on:

- `src/app/(dashboard)/blockchain`
- `src/components/blockchain`
- `src/lib/blockchain`
- `src/app/api/blockchain/*`

This part of the product uses a domain-specific signal model that differs from general web technology rankings.

## Languages

The languages area gives a higher-level programming language view that complements the technology catalog. It is useful for macro trends, ecosystem context, and route-level comparisons that are less framework-specific.

## Repositories

The repositories area focuses on discovery:

- trending repositories
- notable or "legendary" repositories
- repository cards and table views

This subsystem helps users connect trend signals to concrete projects and ecosystems.

## Digest

The digest subsystem turns change over time into summary output. It includes generation, latest digest retrieval, and digest listing flows under the AI and dashboard layers.

## Contributor guidance

These areas are adjacent but not secondary. They each depend on dedicated data routes and UI components, so changes should be validated independently even when the main technologies surface is stable.

## Related pages

- [Feature Surfaces](../product/feature-surfaces.md)
- [API Surface](../architecture/api-surface.md)
