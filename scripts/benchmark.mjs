import puppeteer from 'puppeteer'

const DEFAULT_CONFIG = {
  baseUrl: 'http://127.0.0.1:3000',
  paths: ['/', '/languages', '/repos'],
  runs: 3,
  format: 'table',
  timeoutMs: 60_000,
}

const USAGE = `Usage: node scripts/benchmark.mjs [options]

Options:
  --base-url <url>   Base URL to benchmark (default: ${DEFAULT_CONFIG.baseUrl})
  --paths <paths>    Comma-separated app paths (default: ${DEFAULT_CONFIG.paths.join(',')})
  --runs <count>     Number of runs per path (default: ${DEFAULT_CONFIG.runs})
  --format <type>    table | json (default: ${DEFAULT_CONFIG.format})
  --timeout <ms>     Navigation timeout in milliseconds (default: ${DEFAULT_CONFIG.timeoutMs})
  --dry-run          Print resolved config without launching a browser
  --help             Show this message
`

function parseArgs(argv) {
  const config = { ...DEFAULT_CONFIG }
  let dryRun = false

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]

    if (arg === '--help') {
      return { help: true }
    }

    if (arg === '--dry-run') {
      dryRun = true
      continue
    }

    if (arg === '--base-url') {
      config.baseUrl = readValue(argv, ++index, arg)
      continue
    }

    if (arg === '--paths') {
      config.paths = readValue(argv, ++index, arg)
        .split(',')
        .map((value) => normalizePath(value))
        .filter(Boolean)
      continue
    }

    if (arg === '--runs') {
      config.runs = parsePositiveInteger(readValue(argv, ++index, arg), arg)
      continue
    }

    if (arg === '--format') {
      config.format = readValue(argv, ++index, arg)
      continue
    }

    if (arg === '--timeout') {
      config.timeoutMs = parsePositiveInteger(readValue(argv, ++index, arg), arg)
      continue
    }

    throw new Error(`Unknown argument: ${arg}`)
  }

  if (config.paths.length === 0) {
    throw new Error('At least one path is required.')
  }

  if (!['table', 'json'].includes(config.format)) {
    throw new Error(`Unsupported format "${config.format}". Use "table" or "json".`)
  }

  return { help: false, dryRun, config }
}

function readValue(argv, index, flag) {
  const value = argv[index]

  if (!value || value.startsWith('--')) {
    throw new Error(`Missing value for ${flag}.`)
  }

  return value
}

function normalizePath(value) {
  const trimmed = value.trim()

  if (!trimmed) {
    return ''
  }

  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
}

function parsePositiveInteger(value, label) {
  const parsed = Number.parseInt(value, 10)

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${label} must be a positive integer.`)
  }

  return parsed
}

function roundMetric(value) {
  return value == null ? null : Number(value.toFixed(2))
}

function average(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function median(values) {
  const sorted = [...values].sort((left, right) => left - right)
  const midpoint = Math.floor(sorted.length / 2)

  if (sorted.length % 2 === 0) {
    return (sorted[midpoint - 1] + sorted[midpoint]) / 2
  }

  return sorted[midpoint]
}

function summarizeRuns(path, runs) {
  const wallClockMs = runs.map((run) => run.wallClockMs)
  const domContentLoadedMs = runs.map((run) => run.domContentLoadedMs).filter((value) => value != null)
  const loadMs = runs.map((run) => run.loadMs).filter((value) => value != null)
  const firstContentfulPaintMs = runs
    .map((run) => run.firstContentfulPaintMs)
    .filter((value) => value != null)
  const largestContentfulPaintMs = runs
    .map((run) => run.largestContentfulPaintMs)
    .filter((value) => value != null)

  return {
    path,
    runs,
    summary: {
      runs: runs.length,
      wallClockAvgMs: roundMetric(average(wallClockMs)),
      wallClockMedianMs: roundMetric(median(wallClockMs)),
      domContentLoadedAvgMs: domContentLoadedMs.length ? roundMetric(average(domContentLoadedMs)) : null,
      loadAvgMs: loadMs.length ? roundMetric(average(loadMs)) : null,
      firstContentfulPaintAvgMs: firstContentfulPaintMs.length
        ? roundMetric(average(firstContentfulPaintMs))
        : null,
      largestContentfulPaintAvgMs: largestContentfulPaintMs.length
        ? roundMetric(average(largestContentfulPaintMs))
        : null,
    },
  }
}

function printTable(results) {
  const rows = results.map(({ path, summary }) => ({
    path,
    runs: summary.runs,
    wallClockAvgMs: summary.wallClockAvgMs,
    wallClockMedianMs: summary.wallClockMedianMs,
    domContentLoadedAvgMs: summary.domContentLoadedAvgMs,
    loadAvgMs: summary.loadAvgMs,
    firstContentfulPaintAvgMs: summary.firstContentfulPaintAvgMs,
    largestContentfulPaintAvgMs: summary.largestContentfulPaintAvgMs,
  }))

  console.table(rows)
}

async function benchmarkPage(browser, baseUrl, path, timeoutMs) {
  const page = await browser.newPage()

  try {
    await page.evaluateOnNewDocument(() => {
      globalThis.__benchmarkLcpMs = null

      // Capture the latest LCP candidate before the page settles.
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries()
        const lastEntry = entries[entries.length - 1]
        globalThis.__benchmarkLcpMs = lastEntry?.startTime ?? null
      }).observe({ type: 'largest-contentful-paint', buffered: true })
    })

    const startedAt = performance.now()
    await page.goto(new URL(path, baseUrl).toString(), {
      waitUntil: 'networkidle0',
      timeout: timeoutMs,
    })
    const wallClockMs = performance.now() - startedAt

    const metrics = await page.evaluate(() => {
      const navigationEntry = performance.getEntriesByType('navigation')[0]
      const paintEntries = performance.getEntriesByType('paint')
      const firstContentfulPaint = paintEntries.find((entry) => entry.name === 'first-contentful-paint')

      return {
        domContentLoadedMs: navigationEntry?.domContentLoadedEventEnd ?? null,
        loadMs: navigationEntry?.loadEventEnd ?? null,
        firstContentfulPaintMs: firstContentfulPaint?.startTime ?? null,
        largestContentfulPaintMs: globalThis.__benchmarkLcpMs ?? null,
      }
    })

    return {
      wallClockMs: roundMetric(wallClockMs),
      domContentLoadedMs: roundMetric(metrics.domContentLoadedMs),
      loadMs: roundMetric(metrics.loadMs),
      firstContentfulPaintMs: roundMetric(metrics.firstContentfulPaintMs),
      largestContentfulPaintMs: roundMetric(metrics.largestContentfulPaintMs),
    }
  } finally {
    await page.close()
  }
}

async function runBenchmarks(config) {
  const browser = await puppeteer.launch({ headless: true })

  try {
    const results = []

    for (const path of config.paths) {
      const runs = []

      for (let runIndex = 0; runIndex < config.runs; runIndex += 1) {
        runs.push(await benchmarkPage(browser, config.baseUrl, path, config.timeoutMs))
      }

      results.push(summarizeRuns(path, runs))
    }

    return results
  } finally {
    await browser.close()
  }
}

async function main() {
  const parsed = parseArgs(process.argv.slice(2))

  if (parsed.help) {
    console.log(USAGE)
    return
  }

  if (parsed.dryRun) {
    console.log(
      JSON.stringify(
        {
          mode: 'dry-run',
          config: {
            baseUrl: parsed.config.baseUrl,
            paths: parsed.config.paths,
            runs: parsed.config.runs,
            format: parsed.config.format,
          },
        },
        null,
        parsed.config.format === 'json' ? 2 : 0,
      ),
    )
    return
  }

  const results = await runBenchmarks(parsed.config)

  if (parsed.config.format === 'json') {
    console.log(JSON.stringify({ mode: 'benchmark', config: parsed.config, results }, null, 2))
    return
  }

  printTable(results)
}

try {
  await main()
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  console.error('')
  console.error(USAGE)
  process.exitCode = 1
}
