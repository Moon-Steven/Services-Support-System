'use client'

import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { HistoryItem } from './data'

interface ChangeTimelineProps {
  items: HistoryItem[]
}

export function ChangeTimeline({ items }: ChangeTimelineProps) {
  return (
    <Card>
      <div className="text-14-bold text-grey-01 mb-[var(--space-4)]">变更历史</div>
      <div className="flex flex-col gap-[var(--space-4)]">
        {items.map((item, idx) => (
          <div key={item.id} className="relative pl-[28px]">
            {/* Timeline line */}
            {idx < items.length - 1 && (
              <div
                className="absolute w-[2px] bg-grey-12"
                style={{ left: 7, top: 28, bottom: -12 }}
              />
            )}
            {/* Timeline dot */}
            <div
              className="absolute left-0 top-[6px] w-[var(--size-icon-sm)] h-[var(--size-icon-sm)] rounded-full"
              style={{ backgroundColor: item.dotColor }}
            />
            {/* Content card */}
            <div className="bg-selected rounded-lg p-[var(--space-4)]">
              <div className="flex items-center justify-between mb-[var(--space-2)]">
                <div className="flex items-center gap-[var(--space-2)]">
                  <Badge variant={item.badge.variant}>{item.badge.label}</Badge>
                  <span className="text-14-bold text-grey-01 text-[13px]">
                    {item.title}
                  </span>
                </div>
                <span className="text-10-regular text-grey-08">{item.date}</span>
              </div>
              {item.content}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
