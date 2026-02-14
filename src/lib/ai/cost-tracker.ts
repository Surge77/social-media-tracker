/**
 * Cost Tracking & Budget Alerting System
 */

import { SupabaseClient } from '@supabase/supabase-js'

export interface CostBreakdown {
  provider: string
  totalCost: number
  totalTokens: number
  requestCount: number
  avgCostPerRequest: number
}

export interface UseCaseCost {
  useCase: string
  totalCost: number
  requestCount: number
  avgCostPerRequest: number
}

export interface CostSummary {
  totalCost: number
  totalRequests: number
  byProvider: CostBreakdown[]
  byUseCase: UseCaseCost[]
  dailyTrend: Array<{
    date: string
    cost: number
    requests: number
  }>
  budgetStatus: {
    dailyBudget: number
    monthlyBudget: number
    dailySpend: number
    monthlySpend: number
    dailyRemaining: number
    monthlyRemaining: number
    isOverDailyBudget: boolean
    isOverMonthlyBudget: boolean
    dailyUtilization: number
    monthlyUtilization: number
  }
  alerts: string[]
}

/**
 * Calculate cost summary and check budgets
 */
export async function calculateCostSummary(
  supabase: SupabaseClient,
  days = 30
): Promise<CostSummary> {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  const startDateStr = startDate.toISOString().split('T')[0]

  // Get telemetry data
  const { data: telemetry } = await supabase
    .from('ai_telemetry')
    .select('*')
    .gte('created_at', startDateStr)
    .order('created_at', { ascending: true })

  if (!telemetry || telemetry.length === 0) {
    const emptyBudgetStatus = await getBudgetStatus(supabase, 0, 0)
    return {
      totalCost: 0,
      totalRequests: 0,
      byProvider: [],
      byUseCase: [],
      dailyTrend: [],
      budgetStatus: emptyBudgetStatus,
      alerts: []
    }
  }

  // Calculate totals
  const totalCost = telemetry.reduce((sum, t) => sum + (t.estimated_cost || 0), 0)
  const totalRequests = telemetry.length

  // Group by provider
  const providerMap = new Map<string, {
    cost: number
    tokens: number
    count: number
  }>()

  telemetry.forEach(t => {
    const provider = t.provider || 'unknown'
    if (!providerMap.has(provider)) {
      providerMap.set(provider, { cost: 0, tokens: 0, count: 0 })
    }
    const data = providerMap.get(provider)!
    data.cost += t.estimated_cost || 0
    data.tokens += t.total_tokens || 0
    data.count++
  })

  const byProvider: CostBreakdown[] = Array.from(providerMap.entries())
    .map(([provider, data]) => ({
      provider,
      totalCost: data.cost,
      totalTokens: data.tokens,
      requestCount: data.count,
      avgCostPerRequest: data.count > 0 ? data.cost / data.count : 0
    }))
    .sort((a, b) => b.totalCost - a.totalCost)

  // Group by use case
  const useCaseMap = new Map<string, { cost: number; count: number }>()

  telemetry.forEach(t => {
    const useCase = t.use_case || 'unknown'
    if (!useCaseMap.has(useCase)) {
      useCaseMap.set(useCase, { cost: 0, count: 0 })
    }
    const data = useCaseMap.get(useCase)!
    data.cost += t.estimated_cost || 0
    data.count++
  })

  const byUseCase: UseCaseCost[] = Array.from(useCaseMap.entries())
    .map(([useCase, data]) => ({
      useCase,
      totalCost: data.cost,
      requestCount: data.count,
      avgCostPerRequest: data.count > 0 ? data.cost / data.count : 0
    }))
    .sort((a, b) => b.totalCost - a.totalCost)

  // Calculate daily trend
  const dailyMap = new Map<string, { cost: number; count: number }>()

  telemetry.forEach(t => {
    const date = t.created_at.split('T')[0]
    if (!dailyMap.has(date)) {
      dailyMap.set(date, { cost: 0, count: 0 })
    }
    const data = dailyMap.get(date)!
    data.cost += t.estimated_cost || 0
    data.count++
  })

  const dailyTrend = Array.from(dailyMap.entries())
    .map(([date, data]) => ({
      date,
      cost: data.cost,
      requests: data.count
    }))
    .sort((a, b) => a.date.localeCompare(b.date))

  // Calculate today and this month's spend
  const today = new Date().toISOString().split('T')[0]
  const thisMonth = new Date().toISOString().substring(0, 7) // YYYY-MM

  const dailySpend = telemetry
    .filter(t => t.created_at.startsWith(today))
    .reduce((sum, t) => sum + (t.estimated_cost || 0), 0)

  const monthlySpend = telemetry
    .filter(t => t.created_at.startsWith(thisMonth))
    .reduce((sum, t) => sum + (t.estimated_cost || 0), 0)

  // Get budget status
  const budgetStatus = await getBudgetStatus(supabase, dailySpend, monthlySpend)

  // Generate alerts
  const alerts: string[] = []

  if (budgetStatus.isOverDailyBudget) {
    alerts.push(`Daily budget exceeded: $${dailySpend.toFixed(4)} / $${budgetStatus.dailyBudget}`)
  } else if (budgetStatus.dailyUtilization > 0.8) {
    alerts.push(`Daily budget ${(budgetStatus.dailyUtilization * 100).toFixed(0)}% utilized`)
  }

  if (budgetStatus.isOverMonthlyBudget) {
    alerts.push(`Monthly budget exceeded: $${monthlySpend.toFixed(4)} / $${budgetStatus.monthlyBudget}`)
  } else if (budgetStatus.monthlyUtilization > 0.8) {
    alerts.push(`Monthly budget ${(budgetStatus.monthlyUtilization * 100).toFixed(0)}% utilized`)
  }

  // Check for unusual spending patterns
  if (dailyTrend.length >= 2) {
    const recentDays = dailyTrend.slice(-3)
    const avgRecent = recentDays.reduce((sum, d) => sum + d.cost, 0) / recentDays.length

    if (dailySpend > avgRecent * 2) {
      alerts.push(`Unusual spending spike detected: ${((dailySpend / avgRecent) * 100).toFixed(0)}% above recent average`)
    }
  }

  return {
    totalCost,
    totalRequests,
    byProvider,
    byUseCase,
    dailyTrend,
    budgetStatus,
    alerts
  }
}

/**
 * Get budget configuration and calculate status
 */
async function getBudgetStatus(
  supabase: SupabaseClient,
  dailySpend: number,
  monthlySpend: number
) {
  // Get budget config from system_config
  const { data: config } = await supabase
    .from('system_config')
    .select('config_value')
    .eq('config_key', 'cost_budgets')
    .single()

  // Default budgets (very conservative for free tier)
  let dailyBudget = 0.10 // $0.10/day
  let monthlyBudget = 3.00 // $3/month

  if (config?.config_value) {
    const budgets = config.config_value as { daily?: number; monthly?: number }
    dailyBudget = budgets.daily || dailyBudget
    monthlyBudget = budgets.monthly || monthlyBudget
  }

  const dailyRemaining = Math.max(0, dailyBudget - dailySpend)
  const monthlyRemaining = Math.max(0, monthlyBudget - monthlySpend)

  return {
    dailyBudget,
    monthlyBudget,
    dailySpend,
    monthlySpend,
    dailyRemaining,
    monthlyRemaining,
    isOverDailyBudget: dailySpend > dailyBudget,
    isOverMonthlyBudget: monthlySpend > monthlyBudget,
    dailyUtilization: dailyBudget > 0 ? dailySpend / dailyBudget : 0,
    monthlyUtilization: monthlyBudget > 0 ? monthlySpend / monthlyBudget : 0
  }
}

/**
 * Update budget configuration
 */
export async function updateBudgets(
  supabase: SupabaseClient,
  dailyBudget: number,
  monthlyBudget: number
): Promise<void> {
  await supabase
    .from('system_config')
    .upsert({
      config_key: 'cost_budgets',
      config_value: { daily: dailyBudget, monthly: monthlyBudget },
      updated_at: new Date().toISOString()
    })
}
