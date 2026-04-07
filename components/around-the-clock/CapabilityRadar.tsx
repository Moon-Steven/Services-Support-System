'use client'

import type { PersonaRadarDimensions } from '@/lib/around-the-clock'

const LABELS: { key: keyof PersonaRadarDimensions; label: string; angle: number }[] = [
  { key: 'efficiency', label: '效率', angle: -Math.PI / 2 },
  { key: 'riskControl', label: '风控', angle: 0 },
  { key: 'creativity', label: '创意', angle: Math.PI / 2 },
  { key: 'strategy', label: '策略', angle: Math.PI },
]

function polyForScores(scores: PersonaRadarDimensions, maxR: number, cx: number, cy: number): string {
  const vals = LABELS.map(({ key, angle }) => {
    const v = scores[key] / 100
    const r = v * maxR
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`
  })
  return vals.join(' ')
}

export function CapabilityRadar({
  scores,
  className = '',
}: {
  scores: PersonaRadarDimensions
  className?: string
}) {
  const cx = 90
  const cy = 90
  const maxR = 55

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <svg width="180" height="180" viewBox="0 0 180 180" aria-label="能力雷达">
        {[0.25, 0.5, 0.75, 1].map((t) => (
          <polygon
            key={t}
            fill="none"
            stroke="var(--grey-12)"
            strokeWidth="0.5"
            points={LABELS.map(({ angle }) => {
              const r = maxR * t
              return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`
            }).join(' ')}
          />
        ))}
        <polygon
          fill="var(--cyan-tint-08)"
          fillOpacity={0.35}
          stroke="var(--l-cyan)"
          strokeWidth="1"
          points={polyForScores(scores, maxR, cx, cy)}
        />
        {LABELS.map(({ label, angle }) => {
          const lx = cx + (maxR + 14) * Math.cos(angle)
          const ly = cy + (maxR + 14) * Math.sin(angle)
          return (
            <text
              key={label}
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="central"
              className="text-[9px] fill-grey-06"
            >
              {label}
            </text>
          )
        })}
      </svg>
      <div className="grid grid-cols-2 gap-x-[var(--space-4)] gap-y-[var(--space-1)] mt-[var(--space-2)] w-full max-w-[200px]">
        {LABELS.map(({ key, label }) => (
          <div key={key} className="flex justify-between text-10-regular text-grey-08">
            <span>{label}</span>
            <span className="text-grey-01 tabular-nums">{scores[key]}</span>
          </div>
        ))}
      </div>
      <p className="text-10-regular text-grey-08 mt-[var(--space-2)] text-center">
        正面策略事件经审核发布后，将强化「效率 / 风控」等维度的对客感知（演示数据）。
      </p>
    </div>
  )
}
