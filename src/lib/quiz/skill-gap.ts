import { ROLE_TEMPLATES } from '@/lib/quiz/roadmap-templates'

export interface SkillGapResult {
  roleId: string
  roleName: string
  known: string[]
  gaps: string[]
  gapCount: number
  readinessPercent: number
}

export function computeSkillGap(
  targetRole: string,
  currentSkills: string[]
): SkillGapResult | null {
  const template = ROLE_TEMPLATES[targetRole]
  if (!template) return null

  const required = Array.from(
    new Set(
      template.phases.flatMap(phase =>
        phase.nodes
          .filter(n => n.technologySlug && !n.optional)
          .map(n => n.technologySlug as string)
      )
    )
  )

  const knownSet = new Set(currentSkills)
  const known = required.filter(s => knownSet.has(s))
  const gaps = required.filter(s => !knownSet.has(s))
  const readinessPercent = required.length > 0
    ? Math.round((known.length / required.length) * 100)
    : 100

  return {
    roleId: targetRole,
    roleName: template.role,
    known,
    gaps,
    gapCount: gaps.length,
    readinessPercent,
  }
}
