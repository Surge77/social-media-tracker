// src/lib/quiz/roadmap-validation.ts
// Validation logic for roadmap realism and edge cases

import type { UserContext, RoleTemplate, ValidationResult } from './roadmap-engine'
import { getStartingPointLevel } from './roadmap-engine'

/**
 * Validate if the roadmap path is realistic for the user's starting point
 */
export function validateRoadmapRealism(
  startingPoint: UserContext['startingPoint'],
  targetRole: string,
  template: RoleTemplate
): ValidationResult {

  // Check if target role has minimum starting point requirement
  if (template.minimumStartingPoint &&
      getStartingPointLevel(startingPoint) < getStartingPointLevel(template.minimumStartingPoint as UserContext['startingPoint'])) {

    const months = template.estimatedMonths.beginner
    return {
      valid: true,
      severity: 'warning',
      warning: `⚠️ Heads up: This path typically takes ${months}+ months for complete beginners. Consider starting with foundational programming before specializing in ${template.role}.`
    }
  }

  // Check for unrealistic combinations (beginner → highly specialized roles)
  const advancedRoles = ['ai-ml-engineer', 'blockchain-developer', 'data-engineer']
  if (startingPoint === 'absolute-beginner' && advancedRoles.includes(targetRole)) {
    const months = template.estimatedMonths.beginner
    return {
      valid: true,
      severity: 'warning',
      warning: `⚠️ ${template.role} is a specialized role that typically requires ${months}+ months of learning. We recommend starting with fundamentals first, then specializing.`
    }
  }

  // Check for very long timelines
  const expectedMonths = getExpectedMonths(startingPoint, template)
  if (expectedMonths > 18) {
    return {
      valid: true,
      severity: 'info',
      warning: `💡 This is an ambitious path (${expectedMonths}+ months). Break it into smaller milestones to stay motivated.`
    }
  }

  return { valid: true }
}

/**
 * Get expected timeline based on starting point
 */
function getExpectedMonths(
  startingPoint: UserContext['startingPoint'],
  template: RoleTemplate
): number {
  const level = getStartingPointLevel(startingPoint)

  if (level === 0) return template.estimatedMonths.beginner
  if (level <= 2) return template.estimatedMonths.intermediate
  return template.estimatedMonths.advanced
}

/**
 * Validate that user hasn't selected contradictory options
 */
export function validateUserContext(userContext: UserContext): ValidationResult {
  // Check if user selected target role skills in current skills
  // (e.g., selected React but targeting frontend dev from scratch)
  const hasAdvancedSkills = userContext.currentSkills.some(skill =>
    ['react', 'vue', 'angular', 'nextjs', 'typescript'].includes(skill)
  )

  if (hasAdvancedSkills && userContext.startingPoint === 'absolute-beginner') {
    return {
      valid: true,
      severity: 'info',
      warning: `💡 You selected some advanced skills but marked yourself as a beginner. We'll adjust your roadmap to skip what you know.`
    }
  }

  return { valid: true }
}

/**
 * Check if template version is compatible with saved progress
 */
export function validateTemplateCompatibility(
  savedVersion: number,
  currentVersion: number
): ValidationResult {
  if (savedVersion < currentVersion) {
    return {
      valid: true,
      severity: 'info',
      warning: `📝 This roadmap was created with an older template (v${savedVersion}). Some recommendations may have changed. Consider regenerating your roadmap.`
    }
  }

  if (savedVersion > currentVersion) {
    return {
      valid: false,
      severity: 'error',
      warning: `❌ This roadmap was created with a newer template (v${savedVersion}) than what's currently available. Please update the app.`
    }
  }

  return { valid: true }
}

/**
 * Validate that time commitment is realistic for the roadmap
 */
export function validateTimeCommitment(
  timeCommitment: UserContext['timeCommitment'],
  totalWeeks: number
): ValidationResult {
  const hoursPerWeek = getHoursPerWeekFromCommitment(timeCommitment)

  // If full-time but timeline is > 1 year, warn about sustainability
  if (timeCommitment === 'fulltime' && totalWeeks > 52) {
    return {
      valid: true,
      severity: 'warning',
      warning: `⚠️ Maintaining full-time learning pace for ${Math.round(totalWeeks / 4)} months is challenging. Consider building breaks into your schedule.`
    }
  }

  // If part-time (<10hrs) and timeline is < 8 weeks, might be too aggressive
  if (hoursPerWeek < 10 && totalWeeks < 8) {
    return {
      valid: true,
      severity: 'info',
      warning: `💡 This is an aggressive timeline for ${hoursPerWeek} hrs/week. Don't get discouraged if it takes longer.`
    }
  }

  return { valid: true }
}

function getHoursPerWeekFromCommitment(commitment: UserContext['timeCommitment']): number {
  const map: Record<UserContext['timeCommitment'], number> = {
    '5hrs': 5,
    '10hrs': 10,
    '20hrs': 20,
    'fulltime': 40,
  }
  return map[commitment]
}
