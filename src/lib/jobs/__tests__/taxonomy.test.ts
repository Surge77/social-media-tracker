import { describe, expect, it } from 'vitest'
import {
  extractAdjacentSkills,
  inferRoleFromText,
  slugifyText,
} from '@/lib/jobs/taxonomy'

describe('jobs taxonomy helpers', () => {
  it('infers a canonical role from common hiring language', () => {
    const role = inferRoleFromText('Senior Platform Engineer - Kubernetes and Terraform')
    expect(role.slug).toBe('devops-platform')
  })

  it('extracts adjacent skills from mixed stack descriptions', () => {
    const skills = extractAdjacentSkills('Build React + TypeScript applications deployed on AWS with PostgreSQL')
    expect(skills.map((skill) => skill.slug)).toEqual(
      expect.arrayContaining(['react', 'typescript', 'aws', 'postgresql'])
    )
  })

  it('slugifies company and location labels safely', () => {
    expect(slugifyText('New York, NY')).toBe('new-york-ny')
    expect(slugifyText('  ACME Corp  ')).toBe('acme-corp')
  })
})
