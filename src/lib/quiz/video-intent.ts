/**
 * Video intent engine — determines what *type* of video to show based on quiz context.
 *
 * The problem this solves: showing a "React tutorial" to a user whose Stack Health
 * quiz flagged React as declining is actively misleading. This module makes the
 * video selection context-aware.
 */

export type VideoIntent =
  | 'learn'    // Tutorials, crash courses, getting-started guides
  | 'migrate'  // Migration guides, "moving away from X", alternatives
  | 'compare'  // "X vs Y", "should you learn X", evaluations
  | 'deepen'   // Advanced patterns, best practices, architecture deep dives

export type TechHealthStatus = 'strong' | 'watch' | 'risk'

/**
 * Determine what kind of video to show based on quiz type and tech context.
 */
export function getVideoIntent(context: {
  quizType: 'stack-health' | 'hype-check' | 'decision' | 'learn-next' | 'roadmap'
  techStatus?: TechHealthStatus   // Stack Health: strong / watch / risk
  hypeVerdict?: string            // Hype Check: the verdict string from recommendation.primary.action
  isReplacement?: boolean         // Decision Helper: is this tech the recommended replacement?
}): VideoIntent {
  const { quizType, techStatus, hypeVerdict, isReplacement } = context

  switch (quizType) {
    case 'stack-health':
      if (techStatus === 'risk') return 'migrate'
      if (techStatus === 'watch') return 'compare'
      return 'deepen'

    case 'hype-check': {
      const v = hypeVerdict?.toUpperCase() ?? ''
      if (v.includes('FADING')) return 'migrate'
      if (v.includes('OVERHYPED')) return 'compare'
      if (v.includes('EARLY')) return 'compare'
      return 'learn'  // REAL DEAL
    }

    case 'decision':
      return isReplacement ? 'compare' : 'learn'

    case 'learn-next':
    case 'roadmap':
    default:
      return 'learn'
  }
}

/**
 * Human-readable label for the intent — shown above the video card.
 */
export function getVideoIntentLabel(intent: VideoIntent): string {
  switch (intent) {
    case 'learn':    return 'Start here'
    case 'migrate':  return 'Migration guide'
    case 'compare':  return 'Compare your options'
    case 'deepen':   return 'Level up'
  }
}
