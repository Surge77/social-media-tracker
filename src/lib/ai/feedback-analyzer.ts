/**
 * Feedback Analysis System
 * Aggregates feedback patterns and identifies quality issues
 */

import { SupabaseClient } from '@supabase/supabase-js'

export interface FeedbackStats {
  totalFeedback: number
  positiveCount: number
  negativeCount: number
  positiveRate: number
  avgRating: number
  trendDirection: 'improving' | 'declining' | 'stable'
}

export interface InsightPerformance {
  insightId: string
  technologySlug: string
  technologyName: string
  feedbackCount: number
  positiveRate: number
  avgRating: number
  lastGenerated: string
  useCase: string
}

export interface FeedbackTrend {
  date: string
  positiveRate: number
  avgRating: number
  feedbackCount: number
}

export interface FeedbackAnalysis {
  overall: FeedbackStats
  lowPerformers: InsightPerformance[]
  topPerformers: InsightPerformance[]
  trends: FeedbackTrend[]
  issuePatterns: {
    commonComplaints: string[]
    improvementSuggestions: string[]
  }
}

/**
 * Analyze feedback data and identify patterns
 */
export async function analyzeFeedback(
  supabase: SupabaseClient,
  days = 30
): Promise<FeedbackAnalysis> {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  const startDateStr = startDate.toISOString().split('T')[0]

  // Get all feedback from the period
  const { data: feedback } = await supabase
    .from('insight_feedback')
    .select(`
      id,
      insight_id,
      rating,
      helpful,
      comment,
      created_at,
      ai_insights (
        technology_id,
        use_case,
        generated_at,
        technologies (
          slug,
          name
        )
      )
    `)
    .gte('created_at', startDateStr)
    .order('created_at', { ascending: false })

  if (!feedback || feedback.length === 0) {
    return {
      overall: {
        totalFeedback: 0,
        positiveCount: 0,
        negativeCount: 0,
        positiveRate: 0,
        avgRating: 0,
        trendDirection: 'stable'
      },
      lowPerformers: [],
      topPerformers: [],
      trends: [],
      issuePatterns: {
        commonComplaints: [],
        improvementSuggestions: []
      }
    }
  }

  // Calculate overall stats
  const positiveCount = feedback.filter(f => f.helpful === true).length
  const negativeCount = feedback.filter(f => f.helpful === false).length
  const ratings = feedback.filter(f => f.rating !== null).map(f => f.rating!)
  const avgRating = ratings.length > 0
    ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
    : 0

  // Calculate trend direction (compare first half vs second half)
  const midpoint = Math.floor(feedback.length / 2)
  const recentFeedback = feedback.slice(0, midpoint)
  const olderFeedback = feedback.slice(midpoint)

  const recentPositiveRate = recentFeedback.filter(f => f.helpful === true).length / recentFeedback.length
  const olderPositiveRate = olderFeedback.filter(f => f.helpful === true).length / olderFeedback.length

  let trendDirection: 'improving' | 'declining' | 'stable' = 'stable'
  if (recentPositiveRate > olderPositiveRate + 0.1) trendDirection = 'improving'
  if (recentPositiveRate < olderPositiveRate - 0.1) trendDirection = 'declining'

  // Group by insight to find performers
  const insightMap = new Map<string, {
    insightId: string
    slug: string
    name: string
    useCase: string
    lastGenerated: string
    feedback: typeof feedback
  }>()

  feedback.forEach(f => {
    if (!f.ai_insights) return

    // Handle both array and single object from Supabase join
    const insightData = Array.isArray(f.ai_insights) ? f.ai_insights[0] : f.ai_insights
    if (!insightData) return

    const tech = Array.isArray(insightData.technologies)
      ? insightData.technologies[0]
      : insightData.technologies

    if (!tech) return

    const key = f.insight_id
    if (!insightMap.has(key)) {
      insightMap.set(key, {
        insightId: f.insight_id,
        slug: tech.slug,
        name: tech.name,
        useCase: insightData.use_case || 'unknown',
        lastGenerated: insightData.generated_at,
        feedback: []
      })
    }
    insightMap.get(key)!.feedback.push(f)
  })

  // Calculate performance for each insight
  const performances: InsightPerformance[] = Array.from(insightMap.values())
    .map(insight => {
      const positive = insight.feedback.filter(f => f.helpful === true).length
      const total = insight.feedback.length
      const ratings = insight.feedback.filter(f => f.rating !== null).map(f => f.rating!)
      const avgRating = ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
        : 0

      return {
        insightId: insight.insightId,
        technologySlug: insight.slug,
        technologyName: insight.name,
        feedbackCount: total,
        positiveRate: total > 0 ? positive / total : 0,
        avgRating,
        lastGenerated: insight.lastGenerated,
        useCase: insight.useCase
      }
    })
    .filter(p => p.feedbackCount >= 3) // Only include insights with meaningful feedback

  // Sort to find top and low performers
  const sortedByRate = [...performances].sort((a, b) => b.positiveRate - a.positiveRate)
  const topPerformers = sortedByRate.slice(0, 10)
  const lowPerformers = sortedByRate.slice(-10).reverse()

  // Calculate daily trends
  const trendMap = new Map<string, { positive: number; total: number; ratings: number[] }>()

  feedback.forEach(f => {
    const date = f.created_at.split('T')[0]
    if (!trendMap.has(date)) {
      trendMap.set(date, { positive: 0, total: 0, ratings: [] })
    }
    const trend = trendMap.get(date)!
    trend.total++
    if (f.helpful === true) trend.positive++
    if (f.rating !== null) trend.ratings.push(f.rating)
  })

  const trends: FeedbackTrend[] = Array.from(trendMap.entries())
    .map(([date, data]) => ({
      date,
      positiveRate: data.total > 0 ? data.positive / data.total : 0,
      avgRating: data.ratings.length > 0
        ? data.ratings.reduce((sum, r) => sum + r, 0) / data.ratings.length
        : 0,
      feedbackCount: data.total
    }))
    .sort((a, b) => a.date.localeCompare(b.date))

  // Analyze comments for patterns
  const negativeComments = feedback
    .filter(f => f.helpful === false && f.comment)
    .map(f => f.comment!)

  // Simple keyword extraction (in production, use NLP)
  const keywords = extractKeywords(negativeComments)
  const commonComplaints = keywords.slice(0, 5)

  return {
    overall: {
      totalFeedback: feedback.length,
      positiveCount,
      negativeCount,
      positiveRate: feedback.length > 0 ? positiveCount / feedback.length : 0,
      avgRating,
      trendDirection
    },
    lowPerformers,
    topPerformers,
    trends,
    issuePatterns: {
      commonComplaints,
      improvementSuggestions: []
    }
  }
}

/**
 * Simple keyword extraction from comments
 */
function extractKeywords(comments: string[]): string[] {
  const wordFreq = new Map<string, number>()
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which', 'who', 'when', 'where', 'why', 'how', 'not', 'too', 'very', 'so', 'just', 'more', 'also', 'than', 'about'])

  comments.forEach(comment => {
    const words = comment
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 3 && !stopWords.has(w))

    words.forEach(word => {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1)
    })
  })

  return Array.from(wordFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word)
}
