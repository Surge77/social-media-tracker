import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { build } from 'esbuild'

export async function bundleAndImport(entryPath) {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'devtrends-autoresearch-'))
  const outfile = path.join(tempDir, 'bundle.mjs')

  try {
    const result = await build({
      entryPoints: [entryPath],
      bundle: true,
      format: 'esm',
      platform: 'node',
      write: false,
      sourcemap: 'inline',
      absWorkingDir: process.cwd(),
      tsconfig: path.resolve(process.cwd(), 'tsconfig.json'),
    })

    await writeFile(outfile, result.outputFiles[0].text, 'utf8')
    return await import(`${pathToFileURL(outfile).href}?t=${Date.now()}`)
  } finally {
    await rm(tempDir, { recursive: true, force: true })
  }
}
