'use client'

import { Card } from '@/components/ui/Card'

export type StrategyNote = {
  day: string
  text: string
  today: boolean
  tag?: string
  result?: string
  resultType?: 'positive' | 'negative' | 'neutral'
}

interface StrategyTimelineProps {
  notes: StrategyNote[]
}

const tagColors: Record<string, { bg: string; text: string }> = {
  '优化': { bg: 'bg-cyan-tint-08', text: 'text-l-cyan' },
  '新增': { bg: 'bg-grey-12', text: 'text-grey-01' },
  '启动': { bg: 'bg-grey-12', text: 'text-grey-06' },
  '暂停': { bg: 'bg-orange-tint-10', text: 'text-orange' },
}

const resultColors: Record<string, string> = {
  positive: 'text-l-cyan',
  negative: 'text-red',
  neutral: 'text-grey-06',
}

export function StrategyTimeline({ notes }: StrategyTimelineProps) {
  return (
    <Card>
      <h3 className="text-14-bold mb-[var(--space-4)]">策略演进</h3>
      <div className="relative">
        {/* Vertical connector line */}
        <div className="absolute left-[5px] top-[8px] bottom-[8px] w-[1.5px] bg-grey-12" />

        <div className="flex flex-col gap-[var(--space-5)]">
          {notes.map((s, i) => (
            <div key={i} className="flex gap-[var(--space-3)] relative">
              {/* Node dot */}
              <div className={`w-[11px] h-[11px] rounded-full border-2 shrink-0 mt-[3px] z-10 ${
                s.today
                  ? 'border-l-cyan bg-l-cyan'
                  : i === notes.length - 1
                    ? 'border-grey-08 bg-white'
                    : 'border-grey-06 bg-grey-06'
              }`} />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-[var(--space-2)] mb-[2px]">
                  <span className={`text-12-medium ${s.today ? 'text-grey-01' : 'text-grey-06'}`}>{s.day}</span>
                  {s.tag && (
                    <span className={`text-10-regular px-[6px] py-[1px] rounded-full ${tagColors[s.tag]?.bg ?? 'bg-grey-12'} ${tagColors[s.tag]?.text ?? 'text-grey-06'}`}>
                      {s.tag}
                    </span>
                  )}
                </div>
                <div className={`text-12-regular ${s.today ? 'text-grey-01' : 'text-grey-08'}`}>{s.text}</div>
                {s.result && (
                  <div className={`text-10-regular mt-[3px] ${resultColors[s.resultType ?? 'neutral']}`}>
                    → {s.result}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
