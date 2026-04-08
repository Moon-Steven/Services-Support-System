'use client'

import type { PersonaRadarDimensions } from '@/lib/around-the-clock'
import { DIMENSION_KEYS, DIMENSION_LABELS } from '@/lib/around-the-clock'

const AXES = DIMENSION_KEYS.map((key, i) => ({
  key,
  label: DIMENSION_LABELS[key],
  angle: -Math.PI / 2 + (2 * Math.PI * i) / 6,
}))

function polyForScores(scores: PersonaRadarDimensions, maxR: number, cx: number, cy: number): string {
  return AXES.map(({ key, angle }) => {
    const r = (scores[key] / 100) * maxR
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`
  }).join(' ')
}

export function CapabilityRadar({
  scores,
  previousScores,
  size = 'normal',
  className = '',
}: {
  scores: PersonaRadarDimensions
  previousScores?: PersonaRadarDimensions
  size?: 'normal' | 'mini'
  className?: string
}) {
  const isMini = size === 'mini'
  const dim = isMini ? 48 : 180
  const cx = dim / 2
  const cy = dim / 2
  const maxR = isMini ? 18 : 60

  if (isMini) {
    return (
      <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`} aria-label="能力雷达" className={className}>
        {[0.5, 1].map(t => (
          <polygon key={t} fill="none" stroke="var(--grey-12)" strokeWidth="0.5"
            points={AXES.map(({ angle }) => `${cx + maxR * t * Math.cos(angle)},${cy + maxR * t * Math.sin(angle)}`).join(' ')} />
        ))}
        <polygon fill="var(--cyan-tint-08)" fillOpacity={0.4} stroke="var(--l-cyan)" strokeWidth="1"
          points={polyForScores(scores, maxR, cx, cy)} />
      </svg>
    )
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`} aria-label="能力雷达">
        {[0.25, 0.5, 0.75, 1].map(t => (
          <polygon key={t} fill="none" stroke="var(--grey-12)" strokeWidth="0.5"
            points={AXES.map(({ angle }) => `${cx + maxR * t * Math.cos(angle)},${cy + maxR * t * Math.sin(angle)}`).join(' ')} />
        ))}
        {AXES.map(({ angle }) => (
          <line key={angle} x1={cx} y1={cy}
            x2={cx + maxR * Math.cos(angle)} y2={cy + maxR * Math.sin(angle)}
            stroke="var(--grey-12)" strokeWidth="0.5" />
        ))}

        {previousScores && (
          <polygon fill="none" stroke="var(--grey-08)" strokeWidth="1" strokeDasharray="3 2" opacity={0.5}
            points={polyForScores(previousScores, maxR, cx, cy)} />
        )}

        <polygon fill="var(--cyan-tint-08)" fillOpacity={0.35} stroke="var(--l-cyan)" strokeWidth="1.5"
          points={polyForScores(scores, maxR, cx, cy)} />

        {AXES.map(({ key, angle }) => {
          const r = (scores[key] / 100) * maxR
          return <circle key={key} cx={cx + r * Math.cos(angle)} cy={cy + r * Math.sin(angle)} r="2.5" fill="var(--l-cyan)" />
        })}

        {AXES.map(({ label, angle }) => {
          const lx = cx + (maxR + 16) * Math.cos(angle)
          const ly = cy + (maxR + 16) * Math.sin(angle)
          return (
            <text key={label} x={lx} y={ly} textAnchor="middle" dominantBaseline="central"
              className="text-[9px] fill-grey-06">{label}</text>
          )
        })}
      </svg>

      {previousScores && (
        <div className="flex items-center gap-[var(--space-4)] mt-[var(--space-1)]">
          <span className="flex items-center gap-1 text-10-regular text-grey-06">
            <span className="inline-block w-3 h-0.5 bg-l-cyan rounded" /> 当前
          </span>
          <span className="flex items-center gap-1 text-10-regular text-grey-08">
            <span className="inline-block w-3 h-0.5 bg-grey-08 rounded opacity-50" style={{ borderTop: '1px dashed var(--grey-08)' }} /> 上一周期
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-x-[var(--space-4)] gap-y-[var(--space-1)] mt-[var(--space-2)] w-full max-w-[220px]">
        {AXES.map(({ key, label }) => {
          const delta = previousScores ? scores[key] - previousScores[key] : 0
          return (
            <div key={key} className="flex justify-between text-10-regular text-grey-08">
              <span>{label}</span>
              <span className="tabular-nums">
                <span className="text-grey-01">{scores[key]}</span>
                {previousScores && delta !== 0 && (
                  <span className={delta > 0 ? 'text-l-cyan ml-1' : 'text-red ml-1'}>
                    {delta > 0 ? '+' : ''}{delta}
                  </span>
                )}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
