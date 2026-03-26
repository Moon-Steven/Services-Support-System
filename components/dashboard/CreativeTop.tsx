'use client'

import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'

export type Creative = {
  id: string
  name: string
  stats: string
  top: boolean
}

interface CreativeTopProps {
  creatives: Creative[]
}

export function CreativeTop({ creatives }: CreativeTopProps) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-[var(--space-3)]">
        <h3 className="text-14-bold">素材效果 TOP 3</h3>
      </div>
      <div className="flex flex-col gap-[var(--space-3)]">
        {creatives.map((c) => (
          <div key={c.id} className="flex items-center gap-[var(--space-3)]">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-grey-12 text-12-bold text-grey-06 shrink-0">
              {c.id}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-12-medium truncate">{c.name}</div>
              <div className="text-12-regular text-grey-08 mt-0.5">{c.stats}</div>
            </div>
            {c.top && <Badge variant="dark">TOP</Badge>}
          </div>
        ))}
      </div>
    </Card>
  )
}
