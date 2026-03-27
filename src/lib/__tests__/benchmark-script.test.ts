import { execFileSync } from 'node:child_process'
import path from 'node:path'

const benchmarkScript = path.resolve(process.cwd(), 'scripts', 'benchmark.mjs')

describe('benchmark script', () => {
  it('prints usage instructions', () => {
    const output = execFileSync(process.execPath, [benchmarkScript, '--help'], {
      encoding: 'utf8',
    })

    expect(output).toContain('Usage: node scripts/benchmark.mjs')
    expect(output).toContain('--base-url')
    expect(output).toContain('--paths')
  })

  it('supports a dry-run JSON mode for planned benchmarks', () => {
    const output = execFileSync(
      process.execPath,
      [
        benchmarkScript,
        '--dry-run',
        '--format',
        'json',
        '--base-url',
        'http://127.0.0.1:3000',
        '--paths',
        '/,/languages',
        '--runs',
        '2',
      ],
      { encoding: 'utf8' },
    )

    expect(JSON.parse(output)).toEqual({
      mode: 'dry-run',
      config: {
        baseUrl: 'http://127.0.0.1:3000',
        paths: ['/', '/languages'],
        runs: 2,
        format: 'json',
      },
    })
  })
})
