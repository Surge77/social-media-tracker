'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DollarSign, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react'
import type { CostSummary } from '@/lib/ai/cost-tracker'

interface CostTrackingProps {
  summary: CostSummary
}

export function CostTracking({ summary }: CostTrackingProps) {
  const { totalCost, totalRequests, byProvider, byUseCase, budgetStatus, dailyTrend } = summary

  const getBudgetColor = (utilization: number) => {
    if (utilization >= 1) return 'text-destructive'
    if (utilization >= 0.8) return 'text-warning'
    return 'text-success'
  }

  const getBudgetBgColor = (utilization: number) => {
    if (utilization >= 1) return 'bg-destructive'
    if (utilization >= 0.8) return 'bg-warning'
    return 'bg-success'
  }

  return (
    <div className="space-y-6">
      {/* Budget Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Daily Budget</h3>
            {budgetStatus.isOverDailyBudget ? (
              <AlertCircle className="w-5 h-5 text-destructive" />
            ) : (
              <CheckCircle className="w-5 h-5 text-success" />
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-bold ${getBudgetColor(budgetStatus.dailyUtilization)}`}>
                ${budgetStatus.dailySpend.toFixed(4)}
              </span>
              <span className="text-muted-foreground">
                / ${budgetStatus.dailyBudget.toFixed(2)}
              </span>
            </div>

            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className={`h-full transition-all ${getBudgetBgColor(budgetStatus.dailyUtilization)}`}
                style={{ width: `${Math.min(100, budgetStatus.dailyUtilization * 100)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {(budgetStatus.dailyUtilization * 100).toFixed(1)}% used
              </span>
              <span className={getBudgetColor(budgetStatus.dailyUtilization)}>
                ${budgetStatus.dailyRemaining.toFixed(4)} remaining
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Monthly Budget</h3>
            {budgetStatus.isOverMonthlyBudget ? (
              <AlertCircle className="w-5 h-5 text-destructive" />
            ) : (
              <CheckCircle className="w-5 h-5 text-success" />
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-bold ${getBudgetColor(budgetStatus.monthlyUtilization)}`}>
                ${budgetStatus.monthlySpend.toFixed(4)}
              </span>
              <span className="text-muted-foreground">
                / ${budgetStatus.monthlyBudget.toFixed(2)}
              </span>
            </div>

            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className={`h-full transition-all ${getBudgetBgColor(budgetStatus.monthlyUtilization)}`}
                style={{ width: `${Math.min(100, budgetStatus.monthlyUtilization * 100)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {(budgetStatus.monthlyUtilization * 100).toFixed(1)}% used
              </span>
              <span className={getBudgetColor(budgetStatus.monthlyUtilization)}>
                ${budgetStatus.monthlyRemaining.toFixed(4)} remaining
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Cost by Provider */}
      {byProvider.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5" />
            <h3 className="text-lg font-semibold">Cost by Provider</h3>
          </div>

          <div className="space-y-3">
            {byProvider.map(provider => (
              <div key={provider.provider} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{provider.provider}</span>
                    <span className="text-sm font-semibold">
                      ${provider.totalCost.toFixed(4)}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{provider.requestCount} requests</span>
                    <span>{provider.totalTokens.toLocaleString()} tokens</span>
                    <span>${provider.avgCostPerRequest.toFixed(6)}/req</span>
                  </div>
                </div>

                <div className="w-32 bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{
                      width: `${(provider.totalCost / totalCost) * 100}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Cost by Use Case */}
      {byUseCase.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5" />
            <h3 className="text-lg font-semibold">Cost by Use Case</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {byUseCase.map(useCase => (
              <div
                key={useCase.useCase}
                className="p-4 border rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline">{useCase.useCase}</Badge>
                  <span className="text-lg font-bold">
                    ${useCase.totalCost.toFixed(4)}
                  </span>
                </div>

                <div className="text-sm text-muted-foreground">
                  {useCase.requestCount} requests
                  <span className="mx-2">•</span>
                  ${useCase.avgCostPerRequest.toFixed(6)}/req
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Daily Spending Trend */}
      {dailyTrend.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Daily Spending Trend</h3>

          <div className="space-y-2">
            {dailyTrend.slice(-14).map(day => {
              const maxCost = Math.max(...dailyTrend.map(d => d.cost))
              const width = maxCost > 0 ? (day.cost / maxCost) * 100 : 0

              return (
                <div key={day.date} className="flex items-center gap-3">
                  <div className="text-sm text-muted-foreground w-24">
                    {new Date(day.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>

                  <div className="flex-1 bg-muted rounded-full h-6 overflow-hidden relative">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all"
                      style={{ width: `${width}%` }}
                    />
                    <span className="absolute inset-0 flex items-center px-3 text-xs font-medium">
                      ${day.cost.toFixed(4)}
                    </span>
                  </div>

                  <div className="text-xs text-muted-foreground w-20 text-right">
                    {day.requests} reqs
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Summary Stats */}
      <Card className="p-6 bg-muted/30">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold">${totalCost.toFixed(4)}</div>
            <div className="text-sm text-muted-foreground">Total Cost (30d)</div>
          </div>

          <div>
            <div className="text-2xl font-bold">{totalRequests.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total Requests</div>
          </div>

          <div>
            <div className="text-2xl font-bold">
              ${totalRequests > 0 ? (totalCost / totalRequests).toFixed(6) : '0'}
            </div>
            <div className="text-sm text-muted-foreground">Avg Cost/Request</div>
          </div>

          <div>
            <div className="text-2xl font-bold">{byProvider.length}</div>
            <div className="text-sm text-muted-foreground">Active Providers</div>
          </div>
        </div>
      </Card>
    </div>
  )
}
