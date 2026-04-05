import fs from 'node:fs'
import path from 'node:path'

describe('Docusaurus docs app', () => {
  it('exposes a separately named docs site under apps/docs with contributor-first navigation', () => {
    const rootPackageJson = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8')
    ) as {
      scripts?: Record<string, string>
    }

    const docsPackageJson = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'apps/docs/package.json'), 'utf8')
    ) as {
      name?: string
      scripts?: Record<string, string>
    }

    const docsConfigSource = fs.readFileSync(
      path.join(process.cwd(), 'apps/docs/docusaurus.config.ts'),
      'utf8'
    )
    const docsSidebarSource = fs.readFileSync(
      path.join(process.cwd(), 'apps/docs/sidebars.ts'),
      'utf8'
    )
    const docsHomeSource = fs.readFileSync(
      path.join(process.cwd(), 'apps/docs/docs/intro.mdx'),
      'utf8'
    )

    const requiredDocs = [
      'apps/docs/docs/getting-started/local-development.md',
      'apps/docs/docs/getting-started/environment-and-integrations.md',
      'apps/docs/docs/getting-started/database-and-migrations.md',
      'apps/docs/docs/product/what-devtrends-does.md',
      'apps/docs/docs/product/feature-surfaces.md',
      'apps/docs/docs/architecture/system-overview.md',
      'apps/docs/docs/architecture/frontend-and-routing.md',
      'apps/docs/docs/architecture/api-surface.md',
      'apps/docs/docs/architecture/data-ingestion-and-scoring.md',
      'apps/docs/docs/architecture/ai-layer-and-guardrails.md',
      'apps/docs/docs/subsystems/technologies-and-compare.md',
      'apps/docs/docs/subsystems/jobs-and-quiz.md',
      'apps/docs/docs/subsystems/blockchain-languages-repos-and-digest.md',
      'apps/docs/docs/contributor/testing-and-quality.md',
      'apps/docs/docs/contributor/cron-and-operations.md',
      'apps/docs/docs/contributor/docs-workflow.md',
    ]

    expect(rootPackageJson.scripts?.['docs:dev']).toBe('npm run start --prefix apps/docs')
    expect(rootPackageJson.scripts?.['docs:build']).toBe('npm run build --prefix apps/docs')
    expect(rootPackageJson.scripts?.['docs:serve']).toBe('npm run serve --prefix apps/docs')

    expect(docsPackageJson.name).toBe('@devtrends/docs')
    expect(docsPackageJson.scripts?.start).toBeDefined()
    expect(docsConfigSource).toContain("title: 'DevTrends Docs'")
    expect(docsConfigSource).toContain("tagline: 'Contributor documentation for DevTrends'")
    expect(docsConfigSource).toContain("label: 'Contributor Docs'")
    expect(docsSidebarSource).toContain("label: 'Getting Started'")
    expect(docsSidebarSource).toContain("label: 'Architecture'")
    expect(docsSidebarSource).toContain("label: 'Subsystems'")
    expect(docsSidebarSource).toContain("label: 'Contributor Guide'")
    expect(docsHomeSource).toContain('# DevTrends Contributor Docs')
    expect(docsHomeSource).toContain('published contributor layer')

    for (const docPath of requiredDocs) {
      expect(fs.existsSync(path.join(process.cwd(), docPath))).toBe(true)
    }
  })
})
