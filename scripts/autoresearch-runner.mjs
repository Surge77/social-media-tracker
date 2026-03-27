import { runAutoresearchTrack } from '../src/lib/autoresearch/runner.mjs'

function parseArgs(argv) {
  const args = {
    track: null,
    dryRun: false,
    status: 'candidate',
    description: 'manual run',
  }

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]

    if (arg === '--track') {
      args.track = argv[++i] ?? null
      continue
    }

    if (arg === '--dry-run') {
      args.dryRun = true
      continue
    }

    if (arg === '--status') {
      args.status = argv[++i] ?? args.status
      continue
    }

    if (arg === '--description') {
      args.description = argv[++i] ?? args.description
      continue
    }

    throw new Error(`Unknown argument: ${arg}`)
  }

  if (!args.track || !['scoring', 'routing'].includes(args.track)) {
    throw new Error('Usage: node scripts/autoresearch-runner.mjs --track scoring|routing [--dry-run] [--status keep] [--description "note"]')
  }

  return args
}

try {
  const args = parseArgs(process.argv.slice(2))
  const result = await runAutoresearchTrack(args)
  console.log(JSON.stringify(result, null, 2))
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
}
