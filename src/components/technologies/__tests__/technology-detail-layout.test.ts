import fs from 'node:fs'
import path from 'node:path'

describe('Technology detail page layout', () => {
  it('uses the decision-first hero instead of the old decision header block', () => {
    const filePath = path.join(
      process.cwd(),
      'src/components/technologies/TechnologyDetailClient.tsx'
    )

    const source = fs.readFileSync(filePath, 'utf8')

    expect(source).toContain('DecisionFirstHero')
    expect(source).not.toContain('<DecisionHeader')
  })
})
