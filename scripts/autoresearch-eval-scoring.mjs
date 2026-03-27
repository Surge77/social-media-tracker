import { evaluateScoringFixtureSet } from '../src/lib/autoresearch/scoring-evaluator.mjs'

const report = await evaluateScoringFixtureSet(process.argv[2])
console.log(JSON.stringify(report, null, 2))
