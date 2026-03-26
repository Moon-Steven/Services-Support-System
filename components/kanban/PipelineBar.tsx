'use client'

import type { Phase } from './types'

interface PipelineBarProps {
  phases: Phase[]
  phaseCounts: number[]
  activePhase: number | null
  onPhaseClick: (phaseId: number) => void
}

export function PipelineBar({ phases, phaseCounts, activePhase, onPhaseClick }: PipelineBarProps) {
  return (
    <div className="flex items-stretch h-[40px] rounded-lg overflow-hidden cursor-pointer">
      {phases.map((phase, i) => {
        const isDimmed = activePhase !== null && activePhase !== phase.id
        const isActive = activePhase === phase.id
        const opacity = isDimmed ? 0.15 : isActive ? 1 : phase.opacity

        return (
          <div
            key={phase.id}
            onClick={() => onPhaseClick(phase.id)}
            className="flex items-center justify-center gap-1-5 bg-grey-01 transition-all duration-300"
            style={{ flex: phaseCounts[i], opacity }}
          >
            <span className="text-[20px] font-bold text-white">
              {phaseCounts[i]}
            </span>
            <span className="text-[11px] text-white/60">
              {phase.name}
            </span>
          </div>
        )
      })}
    </div>
  )
}
