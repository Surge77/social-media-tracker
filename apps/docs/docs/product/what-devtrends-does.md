---
title: What DevTrends Does
description: Product framing, user problems, and the signal model behind DevTrends.
---

# What DevTrends Does

Developers make learning and career decisions with incomplete information. One source shows GitHub growth, another shows hiring demand, and another shows community attention. DevTrends combines those signals into one product.

## Core product question

The product is built to answer questions like:

- Which technologies are gaining durable traction instead of short-term hype?
- Which stacks show real hiring demand?
- Which ecosystems are cooling, stable, or accelerating?
- What should a developer learn next based on goals and current skills?

## Signal model

DevTrends does not rely on a single source. It combines:

- engineering activity
- community buzz
- job demand
- package and ecosystem signals
- blockchain-specific usage metrics where relevant
- AI-generated summaries layered on top of stored signals

The result is a product that is closer to a decision-support system than a static trends website.

## Major product capabilities

| Capability | What it gives the user |
| --- | --- |
| Technology rankings | A score-driven view of what is rising, stable, or cooling |
| Compare flows | Side-by-side framing for technology choices |
| Jobs intelligence | Hiring demand, role, company, and location context |
| Quiz flows | Guided decision tools for learning direction and roadmap generation |
| Ask AI | Conversational answers grounded in the platform's data model |
| Blockchain views | Chain, bridge, fees, and protocol health signals |
| Languages and repos | Adjacent ecosystem discovery beyond frameworks alone |
| Digest generation | A periodic summary of what changed |

## Product shape in the repo

The main product lives in the root Next.js app, especially under:

- `src/app/(dashboard)`
- `src/components`
- `src/lib`

The docs app exists separately because product UI and long-form documentation have different jobs.

## Related pages

- [Feature Surfaces](./feature-surfaces.md)
- [System Overview](../architecture/system-overview.md)
