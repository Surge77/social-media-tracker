'use client'

import React, { useState } from 'react'
import {
  BarsLoader,
  RippleLoader,
  GridLoader,
  ProgressRingLoader,
  DualRingLoader,
  BounceLoader,
} from '@/components/ui/loading-options'
import { Loading } from '@/components/ui/loading'

const options = [
  {
    name: 'Bars Loader',
    component: BarsLoader,
    description: 'Modern, clean, professional. Perfect for data products.',
    recommended: true,
  },
  {
    name: 'Ripple Effect',
    component: RippleLoader,
    description: 'Expanding circles like water ripples. Smooth and elegant.',
    recommended: false,
  },
  {
    name: 'Grid Loader',
    component: GridLoader,
    description: 'Nine dots in a grid that light up in sequence. Tech-forward.',
    recommended: false,
  },
  {
    name: 'Progress Ring',
    component: ProgressRingLoader,
    description: 'Circular progress bar that fills up smoothly. Clean and informative.',
    recommended: false,
  },
  {
    name: 'Dual Ring',
    component: DualRingLoader,
    description: 'Two rings rotating in opposite directions. Dynamic and unique.',
    recommended: false,
  },
  {
    name: 'Bounce',
    component: BounceLoader,
    description: 'Single dot bouncing up and down. Simple and friendly.',
    recommended: false,
  },
]

const currentOptions = [
  {
    name: 'Current: Orbital',
    component: () => <Loading variant="default" size="md" />,
    description: 'Current default with orbiting dots',
  },
  {
    name: 'Current: Minimal',
    component: () => <Loading variant="minimal" size="md" />,
    description: 'Current minimal ring spinner',
  },
  {
    name: 'Current: Dots',
    component: () => <Loading variant="dots" size="md" />,
    description: 'Current three bouncing dots',
  },
  {
    name: 'Current: Pulse',
    component: () => <Loading variant="pulse" size="md" />,
    description: 'Current pulsing gradient circle',
  },
]

export default function SpinnerDemo() {
  const [selectedSize, setSelectedSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('md')

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">Loading Spinner Options</h1>
          <p className="text-xl text-muted-foreground">
            Choose a new loading spinner for DevTrends. Click on any option to see details.
          </p>

          {/* Size selector */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Preview Size:</span>
            <div className="flex gap-2">
              {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedSize === size
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                >
                  {size.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Current Spinners */}
        <div className="space-y-6">
          <div className="border-b pb-2">
            <h2 className="text-2xl font-bold text-muted-foreground">Current Spinners</h2>
            <p className="text-sm text-muted-foreground">What you have now</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {currentOptions.map((option) => {
              const Component = option.component
              return (
                <div
                  key={option.name}
                  className="group relative p-8 rounded-xl border-2 border-border bg-card hover:border-primary/50 transition-all cursor-pointer"
                >
                  <div className="space-y-6">
                    {/* Spinner preview */}
                    <div className="flex items-center justify-center h-32">
                      <Component />
                    </div>

                    {/* Info */}
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">{option.name}</h3>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* New Options */}
        <div className="space-y-6">
          <div className="border-b pb-2">
            <h2 className="text-2xl font-bold">New Options</h2>
            <p className="text-sm text-muted-foreground">
              Modern alternatives to choose from
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {options.map((option) => {
              const Component = option.component
              return (
                <div
                  key={option.name}
                  className="group relative p-8 rounded-xl border-2 border-border bg-card hover:border-primary transition-all cursor-pointer"
                >
                  {option.recommended && (
                    <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      RECOMMENDED
                    </div>
                  )}

                  <div className="space-y-6">
                    {/* Spinner preview */}
                    <div className="flex items-center justify-center h-32">
                      <Component size={selectedSize} />
                    </div>

                    {/* Info */}
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">{option.name}</h3>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>

                    {/* Action button */}
                    <button className="w-full px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground font-medium text-sm transition-colors">
                      Choose This
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Instructions */}
        <div className="p-6 rounded-xl border-2 border-primary/20 bg-primary/5 space-y-4">
          <h3 className="text-lg font-bold">How to Apply Your Choice</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Pick your favorite spinner from the options above</li>
            <li>Tell me which one you like (e.g., "I want the Bars Loader")</li>
            <li>I'll replace the current loading spinner with your choice</li>
            <li>The new spinner will appear everywhere in your app</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
