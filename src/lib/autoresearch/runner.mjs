import { appendFile, copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import { execFile } from 'node:child_process'
import path from 'node:path'
import { promisify } from 'node:util'

import { buildTrackRunPlan, getDefaultManifestPath, loadAutoresearchManifest, validateChangedFilesForTrack } from './manifest.mjs'
import { evaluateScoringFixtureSet } from './scoring-evaluator.mjs'
import { evaluateRoutingFixtureSet } from './routing-evaluator.mjs'

const execFileAsync = promisify(execFile)

function buildCommitMessage(track, description) {
  return `autoresearch(${track}): ${description}`
}

async function getRepoChangedFiles() {
  const { stdout } = await execFileAsync('git', ['status', '--porcelain=v1', '--untracked-files=all'], {
    cwd: process.cwd(),
  })

  return stdout
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => line.slice(3).trim().replace(/\\/g, '/'))
    .filter((line) => !line.startsWith('autoresearch/results.tsv') && !line.startsWith('autoresearch/reports/'))
}

async function getCommitHash() {
  const { stdout } = await execFileAsync('git', ['rev-parse', '--short', 'HEAD'], {
    cwd: process.cwd(),
  })

  return stdout.trim()
}

async function getCurrentBranch() {
  const { stdout } = await execFileAsync('git', ['branch', '--show-current'], {
    cwd: process.cwd(),
  })

  return stdout.trim()
}

function timestampSlug() {
  return new Date().toISOString().replace(/[:.]/g, '-')
}

async function ensureResultsFile(manifest) {
  const resultsPath = path.resolve(process.cwd(), manifest.results.file)
  const templatePath = path.resolve(process.cwd(), manifest.results.template)

  try {
    await readFile(resultsPath, 'utf8')
  } catch {
    await mkdir(path.dirname(resultsPath), { recursive: true })
    await copyFile(templatePath, resultsPath)
  }

  return resultsPath
}

async function runEvaluation(track, fixturePath) {
  if (track === 'scoring') {
    return evaluateScoringFixtureSet(path.resolve(process.cwd(), fixturePath))
  }

  return evaluateRoutingFixtureSet(path.resolve(process.cwd(), fixturePath))
}

function isProtectedBranch(branch) {
  return branch === 'main' || branch === 'master'
}

async function readResultsEntries(resultsPath) {
  try {
    const raw = await readFile(resultsPath, 'utf8')
    const lines = raw.split(/\r?\n/).filter(Boolean)

    if (lines.length <= 1) return []

    return lines.slice(1).map((line) => {
      const [commit, track, metric, status, description, reportPath = ''] = line.split('\t')
      return {
        commit,
        track,
        metric: Number(metric),
        status,
        description,
        reportPath,
      }
    })
  } catch {
    return []
  }
}

function createGitOps() {
  return {
    async getBranch() {
      return getCurrentBranch()
    },
    async getChangedFiles() {
      return getRepoChangedFiles()
    },
    async getHeadCommit() {
      return getCommitHash()
    },
    async addFiles(files) {
      await execFileAsync('git', ['add', '--', ...files], { cwd: process.cwd() })
    },
    async commit(message) {
      await execFileAsync('git', ['commit', '-m', message], { cwd: process.cwd() })
    },
    async resetHardToHeadParent() {
      await execFileAsync('git', ['reset', '--hard', 'HEAD~1'], { cwd: process.cwd() })
    },
  }
}

function createLoggingOps(manifest) {
  const resultsPath = path.resolve(process.cwd(), manifest.results.file)
  const reportDir = path.resolve(process.cwd(), manifest.results.reportDir)

  return {
    async bestMetric(track) {
      const entries = await readResultsEntries(resultsPath)
      const kept = entries.filter((entry) => entry.track === track && entry.status === 'keep')

      if (kept.length === 0) return null
      return kept.reduce((max, entry) => Math.max(max, entry.metric), Number.NEGATIVE_INFINITY)
    },
    async writeReport(track, report) {
      await mkdir(reportDir, { recursive: true })
      const reportFilename = `${track}-${timestampSlug()}.json`
      const reportPath = path.join(reportDir, reportFilename)
      await writeFile(reportPath, JSON.stringify(report, null, 2), 'utf8')
      return path.relative(process.cwd(), reportPath).replace(/\\/g, '/')
    },
    async appendResult({ commit, track, metric, status, description, reportPath }) {
      await ensureResultsFile(manifest)
      const row = [
        commit,
        track,
        metric.toFixed(2),
        status,
        description.replace(/\t/g, ' '),
        reportPath ?? '',
      ].join('\t')
      await appendFile(resultsPath, `${row}\n`, 'utf8')
    },
  }
}

export async function runAutoresearchIteration({
  manifest,
  track,
  description,
  git = createGitOps(),
  logging = createLoggingOps(manifest),
  evaluate = (_track, fixturePath) => runEvaluation(_track, fixturePath),
}) {
  const branch = await git.getBranch()
  if (isProtectedBranch(branch)) {
    throw new Error(`Autoresearch iteration requires a non-main branch. Current branch: ${branch}`)
  }

  const changedFiles = await git.getChangedFiles()
  if (changedFiles.length === 0) {
    throw new Error(`No changed files found for ${track}. Create a candidate diff before running the loop.`)
  }

  const blockedFiles = validateChangedFilesForTrack(manifest, track, changedFiles)
  if (blockedFiles.length > 0) {
    throw new Error(`Track ${track} may not edit: ${blockedFiles.join(', ')}`)
  }

  const bestMetric = await logging.bestMetric(track)
  const baseCommit = await git.getHeadCommit()
  await git.addFiles(changedFiles)
  await git.commit(buildCommitMessage(track, description))

  const commit = await git.getHeadCommit()
  let reportPath = ''

  try {
    const report = await evaluate(track, manifest.tracks[track].fixture)
    reportPath = await logging.writeReport(track, report)

    const decision = bestMetric == null || report.metric > bestMetric ? 'keep' : 'discard'

    await logging.appendResult({
      commit,
      track,
      metric: report.metric,
      status: decision,
      description,
      reportPath,
    })

    if (decision === 'discard') {
      await git.resetHardToHeadParent()
    }

    return {
      mode: 'iterate',
      track,
      branch,
      baseCommit,
      commit,
      metric: report.metric,
      previousBestMetric: bestMetric,
      decision,
      reportPath,
      changedFiles,
    }
  } catch (error) {
    await git.resetHardToHeadParent()
    await logging.appendResult({
      commit,
      track,
      metric: 0,
      status: 'crash',
      description: `${description} [crash: ${(error instanceof Error ? error.message : String(error)).replace(/\t/g, ' ')}]`,
      reportPath,
    })
    throw error
  }
}

export async function runAutoresearchTrack({
  track,
  dryRun = false,
  status = 'candidate',
  description = 'manual run',
  manifestPath = getDefaultManifestPath(),
}) {
  const manifest = await loadAutoresearchManifest(manifestPath)
  const plan = buildTrackRunPlan(manifest, track, dryRun)

  if (dryRun) {
    const changedFiles = await getRepoChangedFiles()
    const blockedFiles = validateChangedFilesForTrack(manifest, track, changedFiles)
    return {
      mode: 'dry-run',
      ...plan,
      changedFiles,
      blockedFiles,
    }
  }

  return runAutoresearchIteration({
    manifest,
    track,
    description,
  })
}
