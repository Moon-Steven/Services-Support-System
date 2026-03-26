'use client'

import { Card } from '@/components/ui/Card'

export type StrategyNote = {
  day: string
  text: string
  today: boolean
}

interface StrategyTimelineProps {
  notes: StrategyNote[]
}

export function StrategyTimeline({ notes }: StrategyTimelineProps) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-[var(--space-3)]">
        <h3 className="text-14-bold">策略演进记录</h3>
      </div>
      <div className="flex flex-col gap-[var(--space-3)]">
        {notes.map((s, i) => (
          <div key={i} className="flex gap-[var(--space-3)]">
            <div
              className={`w-[3px] rounded-full shrink-0 min-h-[var(--space-8)] ${
                s.today ? 'bg-l-cyan' : 'bg-grey-12'
              }`}
            />
            <div>
              <div className="text-12-regular text-grey-08">{s.day}</div>
              <div className="text-12-regular text-grey-06 mt-0.5">{s.text}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
