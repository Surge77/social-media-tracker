---
title: Technologies and Compare
description: How the main ranking surfaces and comparison flows are assembled.
---

# Technologies and Compare

The technologies surface is the center of the product. It turns stored signal data into ranked lists, detailed drill-down pages, and comparison-oriented decision support.

## Technologies surface

The technologies area includes:

- the main ranking page
- technology detail pages
- filtering and sorting behavior
- chart and badge-based explanation of score breakdowns
- market pulse and supporting contextual summaries

Important code paths include:

- `src/app/(dashboard)/technologies`
- `src/components/technologies`
- `src/lib/server/technology-data.ts`
- `src/app/api/technologies/*`

`technology-data.ts` is especially important because it assembles ranked technologies, historical comparisons, and market pulse outputs used across the UI.

## Compare surface

The compare flow takes the same underlying signal model and turns it into side-by-side decision support. It relies on:

- explicit compare pages
- AI comparison summaries
- supporting API routes for paired or comparative data
- visual breakdowns such as trend charts, radar charts, heatmaps, and scorecards

## What contributors should watch

- Changes to scoring or lifecycle logic ripple into both technologies and compare
- AI summary changes affect perceived product intelligence even when raw data is unchanged
- New dimensions or metrics need both backend support and explanation in the UI

## Related pages

- [Data Ingestion and Scoring](../architecture/data-ingestion-and-scoring.md)
- [AI Layer and Guardrails](../architecture/ai-layer-and-guardrails.md)
