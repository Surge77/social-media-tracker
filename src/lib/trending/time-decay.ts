import { TrendingWindow } from '@/types/database.types'

export interface TimeDecayConfig {
  halfLife: number // Hours after which score is halved
  minDecay: number // Minimum decay factor (0-1)
  maxAge: number   // Maximum age in hours before score becomes negligible
}

// Time decay configurations for different windows
const DECAY_CONFIGS: Record<TrendingWindow, TimeDecayConfig> = {
  '15m': { halfLife: 0.5, minDecay: 0.8, maxAge: 2 },    // Very recent, minimal decay
  '1h': { halfLife: 2, minDecay: 0.6, maxAge: 8 },       // Recent, light decay
  '6h': { halfLife: 8, minDecay: 0.4, maxAge: 24 },      // Moderate decay
  '24h': { halfLife: 24, minDecay: 0.2, maxAge: 72 },    // Daily trends
  '7d': { halfLife: 72, minDecay: 0.1, maxAge: 336 },    // Weekly trends
  '30d': { halfLife: 240, minDecay: 0.05, maxAge: 720 }  // Monthly trends
}

export function applyTimeDecay(
  score: number,
  publishedAt: Date,
  window: TrendingWindow
): number {
  const config = DECAY_CONFIGS[window]
  const ageHours = getAgeInHours(publishedAt)
  
  // If content is too old, return minimal score
  if (ageHours > config.maxAge) {
    return score * config.minDecay
  }
  
  // Calculate exponential decay
  const decayFactor = Math.pow(0.5, ageHours / config.halfLife)
  const finalDecayFactor = Math.max(config.minDecay, decayFactor)
  
  return score * finalDecayFactor
}

export function getAgeInHours(publishedAt: Date): number {
  const now = new Date()
  const ageMs = now.getTime() - publishedAt.getTime()
  return ageMs / (1000 * 60 * 60)
}

export function calculateDecayFactor(ageHours: number, window: TrendingWindow): number {
  const config = DECAY_CONFIGS[window]
  
  if (ageHours > config.maxAge) {
    return config.minDecay
  }
  
  const decayFactor = Math.pow(0.5, ageHours / config.halfLife)
  return Math.max(config.minDecay, decayFactor)
}

export function getEffectiveAge(score: number, decayedScore: number, window: TrendingWindow): number {
  const config = DECAY_CONFIGS[window]
  const decayFactor = decayedScore / score
  
  if (decayFactor <= config.minDecay) {
    return config.maxAge
  }
  
  // Reverse the decay calculation to find effective age
  return config.halfLife * Math.log2(1 / decayFactor)
}