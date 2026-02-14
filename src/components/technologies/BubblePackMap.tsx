'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import * as d3 from 'd3'
import { motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import type { TechnologyWithScore } from '@/types'

interface BubblePackMapProps {
  technologies: TechnologyWithScore[]
}

interface BubbleNode {
  id: string
  name: string
  slug: string
  value: number
  color: string
  category: string
  jobs_score: number
  community_score: number
  momentum: number
  x?: number
  y?: number
  radius?: number
}

export function BubblePackMap({ technologies }: BubblePackMapProps) {
  const router = useRouter()
  const svgRef = useRef<SVGSVGElement>(null)
  const prefersReducedMotion = useReducedMotion()
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [bubbleCount, setBubbleCount] = useState(0)

  useEffect(() => {
    if (!svgRef.current) return

    // Filter and prepare data - top 40 technologies by composite score
    const bubbleData: BubbleNode[] = technologies
      .filter(t => t.composite_score !== null && t.composite_score > 25)
      .sort((a, b) => (b.composite_score ?? 0) - (a.composite_score ?? 0))
      .slice(0, 40)
      .map(tech => ({
        id: tech.id,
        name: tech.name,
        slug: tech.slug,
        value: tech.composite_score ?? 50,
        color: tech.color,
        category: tech.category,
        jobs_score: tech.jobs_score ?? 0,
        community_score: tech.community_score ?? 0,
        momentum: tech.momentum ?? 0,
      }))

    if (bubbleData.length === 0) {
      setBubbleCount(0)
      return
    }

    setBubbleCount(bubbleData.length)

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove()

    // Dimensions
    const width = svgRef.current.clientWidth
    const height = 600
    const margin = 40

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)

    // Create container group
    const g = svg.append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`)

    // Add zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3]) // Min zoom 0.5x, max zoom 3x
      .on('zoom', (event) => {
        g.attr('transform', event.transform)
      })

    svg.call(zoom as any)

    // Reset zoom button
    svg.append('g')
      .attr('class', 'zoom-controls')
      .attr('transform', `translate(${width - 100}, 20)`)
      .append('rect')
      .attr('width', 80)
      .attr('height', 30)
      .attr('rx', 6)
      .attr('fill', 'hsl(var(--primary))')
      .attr('opacity', 0.9)
      .style('cursor', 'pointer')
      .on('click', () => {
        svg.transition().duration(750).call(zoom.transform as any, d3.zoomIdentity)
      })

    svg.select('.zoom-controls')
      .append('text')
      .attr('x', 40)
      .attr('y', 19)
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .style('font-size', '12px')
      .style('font-weight', '600')
      .style('pointer-events', 'none')
      .text('Reset Zoom')

    // Scale for bubble sizes - wider range for better distribution
    const radiusScale = d3.scaleSqrt()
      .domain([0, d3.max(bubbleData, d => d.value) || 100])
      .range([30, 70])

    // Add radius to each node
    bubbleData.forEach(d => {
      d.radius = radiusScale(d.value)
    })

    // Add gradient definitions for professional look
    const defs = svg.append('defs')

    bubbleData.forEach(d => {
      const gradient = defs.append('radialGradient')
        .attr('id', `gradient-${d.id}`)

      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', d3.color(d.color)!.brighter(0.5).toString())

      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', d.color)
    })

    // Create force simulation with better spacing
    const simulation = d3.forceSimulation(bubbleData as any)
      .force('charge', d3.forceManyBody().strength(8))
      .force('center', d3.forceCenter(0, 0))
      .force('collision', d3.forceCollide().radius((d: any) => (d.radius || 30) + 6))
      .force('x', d3.forceX(0).strength(0.03))
      .force('y', d3.forceY(0).strength(0.03))

    // Create bubble groups
    const nodes = g.selectAll('g.node')
      .data(bubbleData)
      .join('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')
      .on('mouseenter', function(event, d) {
        setHoveredNode(d.id)
        d3.select(this).select('circle')
          .transition()
          .duration(200)
          .attr('r', (d: any) => (d.radius || 30) * 1.15)
          .style('stroke-width', 3)
      })
      .on('mouseleave', function(event, d) {
        setHoveredNode(null)
        d3.select(this).select('circle')
          .transition()
          .duration(200)
          .attr('r', (d: any) => d.radius || 30)
          .style('stroke-width', 2)
      })
      .on('click', (event, d) => {
        router.push(`/technologies/${d.slug}`)
      })

    // Add shadow filter
    const filter = defs.append('filter')
      .attr('id', 'bubble-shadow')
      .attr('height', '130%')

    filter.append('feGaussianBlur')
      .attr('in', 'SourceAlpha')
      .attr('stdDeviation', 3)

    filter.append('feOffset')
      .attr('dx', 0)
      .attr('dy', 2)
      .attr('result', 'offsetblur')

    filter.append('feComponentTransfer')
      .append('feFuncA')
      .attr('type', 'linear')
      .attr('slope', 0.3)

    const feMerge = filter.append('feMerge')
    feMerge.append('feMergeNode')
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic')

    // Add circles with gradient and shadow
    nodes.append('circle')
      .attr('r', d => d.radius || 30)
      .attr('fill', d => `url(#gradient-${d.id})`)
      .style('stroke', d => d3.color(d.color)!.brighter(0.3).toString())
      .style('stroke-width', 2.5)
      .style('stroke-opacity', 0.6)
      .style('filter', 'url(#bubble-shadow)')
      .style('transition', 'all 0.3s ease')

    // Add text labels
    nodes.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.2em')
      .style('font-size', d => `${Math.max(11, (d.radius || 30) / 3.2)}px`)
      .style('font-weight', '700')
      .style('fill', 'white')
      .style('pointer-events', 'none')
      .style('user-select', 'none')
      .style('text-shadow', '0 2px 8px rgba(0,0,0,0.7), 0 0 2px rgba(0,0,0,0.5)')
      .style('letter-spacing', '0.3px')
      .each(function(d) {
        const text = d3.select(this)
        const words = d.name.split(/\s+/)
        const radius = d.radius || 30

        // Smart text sizing based on bubble size
        if (radius < 40 && words.length > 1) {
          text.text(words[0])
        } else if (radius < 50 && d.name.length > 12) {
          text.text(d.name.substring(0, 10) + '…')
        } else {
          text.text(d.name)
        }
      })

    // Add score badge
    nodes.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1.2em')
      .style('font-size', d => `${Math.max(9, (d.radius || 30) / 4.5)}px`)
      .style('font-weight', '600')
      .style('fill', 'white')
      .style('opacity', 0.85)
      .style('pointer-events', 'none')
      .style('user-select', 'none')
      .style('text-shadow', '0 1px 3px rgba(0,0,0,0.6)')
      .text(d => `${Math.round(d.value)}`)

    // Update positions on simulation tick
    simulation.on('tick', () => {
      nodes.attr('transform', (d: any) => `translate(${d.x},${d.y})`)
    })

    // Cleanup
    return () => {
      simulation.stop()
    }
  }, [technologies, router])

  const excluded = technologies.length - bubbleCount

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Technology Landscape</h3>
          <p className="text-sm text-muted-foreground">
            Top {bubbleCount} technologies visualized • Size = overall strength
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-primary">{bubbleCount} shown</p>
          {excluded > 0 && (
            <p className="text-xs text-muted-foreground">{excluded} filtered</p>
          )}
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-card to-card/50 p-8 shadow-lg">
        <svg
          ref={svgRef}
          className="w-full"
          style={{ minHeight: '650px' }}
        />

        {/* Info overlay */}
        <div className="absolute bottom-6 left-6 rounded-lg border bg-background/95 px-4 py-3 text-xs shadow-md backdrop-blur-sm">
          <p className="font-semibold text-foreground">💡 Interactive Controls</p>
          <div className="mt-1.5 space-y-1 text-muted-foreground">
            <p>• Scroll to zoom • Drag to pan</p>
            <p>• Hover to enlarge • Click to explore</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
