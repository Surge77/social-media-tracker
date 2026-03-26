import fs from 'node:fs'
import path from 'node:path'

describe('AnimatedCTA navigation', () => {
  it('uses App Router navigation for internal transitions instead of forcing a hard reload', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'src/components/AnimatedCTA.tsx'),
      'utf8'
    )

    expect(source).toContain("import { useRouter } from 'next/navigation'")
    expect(source).toContain('router.push(href)')
    expect(source).toContain('const isExternalNavigation =')
    expect(source).toContain('window.location.href = href')
  })
})
