'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface FlickeringGridProps extends React.HTMLAttributes<HTMLDivElement> {
  squareSize?: number
  gridGap?: number
  flickerChance?: number
  color?: string
  width?: number
  height?: number
  className?: string
  maxOpacity?: number
}

export const FlickeringGrid: React.FC<FlickeringGridProps> = ({
  squareSize = 4,
  gridGap = 6,
  flickerChance = 0.3,
  color = 'rgb(0, 0, 0)',
  width,
  height,
  className,
  maxOpacity = 0.3,
  ...props
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isInView, setIsInView] = useState(false)
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })

  const memoizedColor = useMemo(() => {
    const toRGBA = (color: string) => {
      if (typeof window === 'undefined') return 'rgba(0, 0, 0,'
      const canvas = document.createElement('canvas')
      canvas.width = canvas.height = 1
      const ctx = canvas.getContext('2d')
      if (!ctx) return 'rgba(255, 0, 0,'
      ctx.fillStyle = color
      ctx.fillRect(0, 0, 1, 1)
      const [r, g, b] = Array.from(ctx.getImageData(0, 0, 1, 1).data)
      return `rgba(${r}, ${g}, ${b},`
    }
    return toRGBA(color)
  }, [color])

  const setupCanvas = useCallback(
    (canvas: HTMLCanvasElement, width: number, height: number) => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      const cols = Math.floor(width / (squareSize + gridGap))
      const rows = Math.floor(height / (squareSize + gridGap))
      const squares = new Float32Array(cols * rows)
      for (let i = 0; i < squares.length; i++) {
        squares[i] = Math.random() * maxOpacity
      }
      return { cols, rows, squares, dpr }
    },
    [squareSize, gridGap, maxOpacity],
  )

  const updateSquares = useCallback(
    (squares: Float32Array, deltaTime: number) => {
      for (let i = 0; i < squares.length; i++) {
        if (Math.random() < flickerChance * deltaTime) {
          squares[i] = Math.random() * maxOpacity
        }
      }
    },
    [flickerChance, maxOpacity],
  )

  const drawGrid = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number,
      cols: number,
      rows: number,
      squares: Float32Array,
      dpr: number,
    ) => {
      ctx.clearRect(0, 0, width * dpr, height * dpr)
      ctx.fillStyle = 'transparent'
      ctx.fillRect(0, 0, width * dpr, height * dpr)
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const opacity = squares[i * rows + j]
          ctx.fillStyle = `${memoizedColor}${opacity})`
          ctx.fillRect(
            i * (squareSize + gridGap) * dpr,
            j * (squareSize + gridGap) * dpr,
            squareSize * dpr,
            squareSize * dpr,
          )
        }
      }
    },
    [memoizedColor, squareSize, gridGap],
  )

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => setIsInView(e.isIntersecting)),
      { threshold: 0.1 },
    )
    observer.observe(container)

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect) {
          setCanvasSize({ width: entry.contentRect.width, height: entry.contentRect.height })
        }
      }
    })
    resizeObserver.observe(container)

    return () => {
      observer.disconnect()
      resizeObserver.disconnect()
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || canvasSize.width === 0 || canvasSize.height === 0) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { cols, rows, squares, dpr } = setupCanvas(canvas, canvasSize.width, canvasSize.height)
    let animationFrameId: number
    let lastTime = 0

    const animate = (time: number) => {
      const deltaTime = (time - lastTime) / 1000
      lastTime = time
      if (isInView) {
        updateSquares(squares, deltaTime)
        drawGrid(ctx, canvasSize.width, canvasSize.height, cols, rows, squares, dpr)
      }
      animationFrameId = requestAnimationFrame(animate)
    }

    animate(0)
    return () => cancelAnimationFrame(animationFrameId)
  }, [canvasSize, isInView, setupCanvas, updateSquares, drawGrid])

  return (
    <div ref={containerRef} className={cn('w-full h-full', className)} {...props}>
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  )
}
