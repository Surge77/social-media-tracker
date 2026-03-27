import { evaluateRoutingFixtureSet } from '../src/lib/autoresearch/routing-evaluator.mjs'

const report = await evaluateRoutingFixtureSet(process.argv[2])
console.log(JSON.stringify(report, null, 2))
