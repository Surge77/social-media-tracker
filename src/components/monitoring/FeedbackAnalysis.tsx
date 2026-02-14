'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Minus, ThumbsUp, ThumbsDown, AlertTriangle } from 'lucide-react'
import type { FeedbackAnalysis } from '@/lib/ai/feedback-analyzer'

interface FeedbackAnalysisProps {
  analysis: FeedbackAnalysis
}

export function FeedbackAnalysis({ analysis }: FeedbackAnalysisProps) {
  const { overall, lowPerformers, topPerformers, trends } = analysis

  const getTrendIcon = () => {
    if (overall.trendDirection === 'improving') return <TrendingUp className="w-4 h-4 text-success" />
    if (overall.trendDirection === 'declining') return <TrendingDown className="w-4 h-4 text-destructive" />
    return <Minus className="w-4 h-4 text-muted-foreground" />
  }

  const getTrendColor = () => {
    if (overall.trendDirection === 'improving') return 'text-success'
    if (overall.trendDirection === 'declining') return 'text-destructive'
    return 'text-muted-foreground'
  }

  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Feedback Overview</h3>
          <div className="flex items-center gap-2">
            {getTrendIcon()}
            <span className={`text-sm font-medium ${getTrendColor()}`}>
              {overall.trendDirection}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-2xl font-bold">{overall.totalFeedback}</div>
            <div className="text-sm text-muted-foreground">Total Feedback</div>
          </div>

          <div>
            <div className="text-2xl font-bold text-success">{overall.positiveCount}</div>
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <ThumbsUp className="w-3 h-3" />
              Positive
            </div>
          </div>

          <div>
            <div className="text-2xl font-bold text-destructive">{overall.negativeCount}</div>
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <ThumbsDown className="w-3 h-3" />
              Negative
            </div>
          </div>

          <div>
            <div className="text-2xl font-bold">
              {(overall.positiveRate * 100).toFixed(0)}%
            </div>
            <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
          </div>
        </div>
      </Card>

      {/* Low Performers */}
      {lowPerformers.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-warning" />
            <h3 className="text-lg font-semibold">Insights Needing Improvement</h3>
          </div>

          <div className="space-y-3">
            {lowPerformers.slice(0, 5).map(insight => (
              <div
                key={insight.insightId}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="font-medium">{insight.technologyName}</div>
                  <div className="text-sm text-muted-foreground">
                    {insight.useCase} • {insight.feedbackCount} responses
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-medium text-destructive">
                      {(insight.positiveRate * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-muted-foreground">satisfaction</div>
                  </div>

                  {insight.avgRating > 0 && (
                    <Badge variant="outline">
                      ⭐ {insight.avgRating.toFixed(1)}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Top Performers */}
      {topPerformers.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-success" />
            <h3 className="text-lg font-semibold">Best Performing Insights</h3>
          </div>

          <div className="space-y-3">
            {topPerformers.slice(0, 5).map(insight => (
              <div
                key={insight.insightId}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="font-medium">{insight.technologyName}</div>
                  <div className="text-sm text-muted-foreground">
                    {insight.useCase} • {insight.feedbackCount} responses
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-medium text-success">
                      {(insight.positiveRate * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-muted-foreground">satisfaction</div>
                  </div>

                  {insight.avgRating > 0 && (
                    <Badge variant="outline">
                      ⭐ {insight.avgRating.toFixed(1)}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Trends Chart */}
      {trends.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Quality Trends</h3>

          <div className="space-y-2">
            {trends.slice(-7).map(trend => (
              <div key={trend.date} className="flex items-center gap-3">
                <div className="text-sm text-muted-foreground w-24">
                  {new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>

                <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-success transition-all"
                    style={{ width: `${trend.positiveRate * 100}%` }}
                  />
                </div>

                <div className="text-sm font-medium w-16 text-right">
                  {(trend.positiveRate * 100).toFixed(0)}%
                </div>

                <div className="text-xs text-muted-foreground w-16 text-right">
                  {trend.feedbackCount} votes
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
