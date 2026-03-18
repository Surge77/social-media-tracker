import fs from 'node:fs'
import path from 'node:path'

describe('DecisionFirstHero component', () => {
  it('renders the decision-first information architecture', () => {
    const componentPath = path.join(
      process.cwd(),
      'src/components/technologies/DecisionFirstHero.tsx'
    )

    const source = fs.readFileSync(componentPath, 'utf8')

    expect(source).toContain('Verdict')
    expect(source).toContain('Best For')
    expect(source).toContain('Not Ideal For')
    expect(source).toContain('Why This Is Moving')
    expect(source).toContain('What To Do Next')
  })
})
