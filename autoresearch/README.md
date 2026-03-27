# DevTrends Autoresearch

This folder adapts the Karpathy `autoresearch` pattern to DevTrends with two guarded tracks:

- `scoring`: optimize ranking heuristics with a fixed committed rubric
- `routing`: optimize AI provider selection with a fixed offline replay suite

The clone of Karpathy's original repo remains ignored at `autoresearch/autoresearch/`.

## Commands

```bash
npm run autoresearch:eval:scoring
npm run autoresearch:eval:routing
npm run autoresearch:loop:scoring -- --dry-run
npm run autoresearch:loop:routing -- --dry-run
```

For a real loop run:

- work on a non-`main` branch such as `autoresearch/scoring-<tag>` or `autoresearch/routing-<tag>`
- keep the worktree limited to that track's allowlisted files
- run `npm run autoresearch:loop:scoring -- --description "candidate note"` or the routing equivalent

The loop will:

1. stage and commit the candidate diff
2. run the fixed evaluator
3. append a row to `autoresearch/results.tsv`
4. keep the commit if the metric improves the best kept score for that track
5. otherwise reset that single candidate commit
