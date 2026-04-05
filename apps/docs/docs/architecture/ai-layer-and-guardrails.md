---
title: AI Layer and Guardrails
description: Provider routing, fallback behavior, and AI safety boundaries in DevTrends.
---

# AI Layer and Guardrails

DevTrends uses AI across several product surfaces, but it does not treat all prompts as the same workload. The AI layer routes different use cases to different providers and applies fallback logic when preferred providers are unavailable.

## Main AI use cases

The routing table in `src/lib/ai/router.ts` covers use cases such as:

- batch insight generation
- technology comparison
- chat
- digest generation
- anomaly explanation
- recommendation
- roadmap summary
- stack analysis

## Provider strategy

The routing behavior is use-case aware:

- chat prefers low-latency providers
- comparison and structured analysis lean Gemini-first
- digest and batch work allow slower but more capable fallback chains
- fallback order is explicit, not implicit

That lets the product optimize for:

- latency
- structure quality
- cost
- availability

## AI module surface

The AI implementation is split across `src/lib/ai`, including modules for:

- provider creation
- key management
- middleware
- retry and resilience
- cost tracking
- telemetry
- quality monitoring
- feedback analysis
- safety and token budgeting

This is important because AI behavior in the repo is operational, not just prompt text.

## Product surfaces that depend on AI

- Ask AI
- comparison insight generation
- digest generation
- recommendation routes
- anomaly explanations
- quiz-related roadmap and summary experiences

## Guardrail mindset

Contributors should assume AI features must be:

- resilient to provider failure
- explicit about fallbacks
- cost-aware
- safe against malformed or weak outputs

If you change an AI route, also inspect the supporting provider and resilience modules rather than only changing prompt text.

## Related pages

- [API Surface](./api-surface.md)
- [Jobs and Quiz](../subsystems/jobs-and-quiz.md)
- [Testing and Quality](../contributor/testing-and-quality.md)
