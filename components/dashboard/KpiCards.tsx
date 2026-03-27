'use client'

import { useRef, useEffect } from 'react'
import { Card } from '@/components/ui/Card'

type Kpi = {
  label: string
  value: string
  trend: string
  trendType: 'positive' | 'negative'
  note: string
  sparkline: number[]
}

interface KpiCardsProps {
  kpis: Kpi[]
}

function Sparkline({ data, color, width = 64, height = 24 }: { data: number[]; color: string; width?: number; height?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || data.length < 2) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, width, height)

    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1
    const pad = 2

    const stepX = (width - pad * 2) / (data.length - 1)
    const scaleY = (v: number) => pad + (1 - (v - min) / range) * (height - pad * 2)

    // Area fill
    ctx.beginPath()
    ctx.moveTo(pad, scaleY(data[0]))
    for (let i = 1; i < data.length; i++) {
      const x0 = pad + (i - 1) * stepX
      const x1 = pad + i * stepX
      const cx = (x0 + x1) / 2
      ctx.bezierCurveTo(cx, scaleY(data[i - 1]), cx, scaleY(data[i]), x1, scaleY(data[i]))
    }
    ctx.lineTo(pad + (data.length - 1) * stepX, height)
    ctx.lineTo(pad, height)
    ctx.closePath()
    ctx.fillStyle = color + '12'
    ctx.fill()

    // Line
    ctx.beginPath()
    ctx.moveTo(pad, scaleY(data[0]))
    for (let i = 1; i < data.length; i++) {
      const x0 = pad + (i - 1) * stepX
      const x1 = pad + i * stepX
      const cx = (x0 + x1) / 2
      ctx.bezierCurveTo(cx, scaleY(data[i - 1]), cx, scaleY(data[i]), x1, scaleY(data[i]))
    }
    ctx.strokeStyle = color
    ctx.lineWidth = 1.5
    ctx.stroke()
  }, [data, color, width, height])

  return <canvas ref={canvasRef} style={{ width, height }} />
}

export function KpiCards({ kpis }: KpiCardsProps) {
  return (
    <div className="grid grid-cols-5 gap-[var(--space-4)]">
      {kpis.map((kpi) => (
        <Card key={kpi.label} className="px-[var(--space-5)] py-[var(--space-4)]" padding="none">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-12-regular text-grey-08 mb-[var(--space-1)]">{kpi.label}</div>
              <div className="text-20-bold text-grey-01">{kpi.value}</div>
            </div>
            <Sparkline
              data={kpi.sparkline}
              color={kpi.trendType === 'positive' ? '#00B1A2' : '#E53935'}
            />
          </div>
          <div className="flex items-center gap-[var(--space-1-5)] mt-[var(--space-2)]">
            <span className={`text-12-medium ${kpi.trendType === 'positive' ? 'text-l-cyan' : 'text-red'}`}>
              {kpi.trend}
            </span>
            <span className="text-12-regular text-grey-08">{kpi.note}</span>
          </div>
        </Card>
      ))}
    </div>
  )
}
