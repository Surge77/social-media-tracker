'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Clock } from 'lucide-react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface Provider {
  name: string
  status: 'up' | 'down'
  rpm: number
  rpmLimit: number
  dailyUsage: number
  consecutiveFailures: number
  inCooldown?: boolean
}

interface ProviderStatusProps {
  providers: Provider[]
}

export function ProviderStatus({ providers }: ProviderStatusProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
      transition={prefersReducedMotion ? {} : { duration: 0.5, delay: 0.4 }}
      className="mb-8"
    >
      <h2 className="text-xl font-semibold mb-4">AI Provider Status</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {providers.map((provider, index) => {
          const rpmUsagePercent = (provider.rpm / provider.rpmLimit) * 100
          const isHealthy = provider.status === 'up' && !provider.inCooldown && provider.consecutiveFailures === 0

          return (
            <motion.div
              key={provider.name}
              initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.95 }}
              animate={prefersReducedMotion ? {} : { opacity: 1, scale: 1 }}
              transition={prefersReducedMotion ? {} : { duration: 0.3, delay: 0.4 + index * 0.05 }}
              className={`rounded-lg border p-4 ${
                isHealthy
                  ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
                  : provider.inCooldown
                  ? 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800'
                  : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold capitalize">{provider.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {provider.inCooldown ? 'In cooldown' : provider.status.toUpperCase()}
                  </p>
                </div>

                {isHealthy ? (
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : provider.inCooldown ? (
                  <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                )}
              </div>

              <div className="space-y-2">
                {/* RPM Usage */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">RPM Usage</span>
                    <span className="font-medium">
                      {provider.rpm}/{provider.rpmLimit}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        rpmUsagePercent > 80
                          ? 'bg-red-500'
                          : rpmUsagePercent > 50
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(rpmUsagePercent, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Daily Usage */}
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Daily Usage</span>
                  <span className="font-medium">{provider.dailyUsage}</span>
                </div>

                {/* Failures */}
                {provider.consecutiveFailures > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Failures</span>
                    <span className="font-medium text-red-600 dark:text-red-400">
                      {provider.consecutiveFailures}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
