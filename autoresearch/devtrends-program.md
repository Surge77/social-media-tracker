# DevTrends Guarded Autoresearch

This is a constrained adaptation of Karpathy's autoresearch loop.

## Rule of the system

- Each track has a narrow allowlist of editable files.
- Evaluators, fixtures, and results formats are read-only.
- A run is valid only if changed files stay inside the selected track allowlist.
- Every run must produce a machine-readable report and a row in `results.tsv`.

## Tracks

### Scoring

- Editable surface: scoring heuristics only
- Fixed evaluator: `scripts/autoresearch-eval-scoring.mjs`
- Fixed fixture corpus: `autoresearch/fixtures/scoring/baseline.json`
- Goal: increase rubric score without breaking deterministic scoring behavior

### Routing

- Editable surface: AI routing policy only
- Fixed evaluator: `scripts/autoresearch-eval-routing.mjs`
- Fixed fixture corpus: `autoresearch/fixtures/routing/baseline.json`
- Goal: improve provider choice quality, fallback behavior, latency fit, and cost fit

## Keep / discard rule

- `keep`: evaluator metric improves and no track guardrails fail
- `discard`: metric is equal or worse
- `crash`: run cannot complete or violates guardrails

## Workflow

1. Pick one track.
2. Make candidate changes only inside that track's editable files.
3. Work on a non-`main` experiment branch.
4. Run the matching loop command.
5. The runner stages and commits the candidate, evaluates it, logs the report, and automatically keeps or discards the candidate commit based on the metric.
