'use client'

import { Card } from '@/components/ui/Card'

type Kpi = {
  label: string
  value: string
  trend: string
  trendType: 'positive' | 'negative'
  note: string
}

interface KpiCardsProps {
  kpis: Kpi[]
}

export function KpiCards({ kpis }: KpiCardsProps) {
  return (
    <div className="grid grid-cols-5 gap-[var(--space-4)] mb-[var(--space-6)]">
      {kpis.map((kpi) => (
        <Card key={kpi.label} className="px-[var(--space-5)] py-[var(--space-4)]" padding="none">
          <div className="text-12-regular text-grey-08 mb-[var(--space-1)]">{kpi.label}</div>
          <div className="text-24-bold text-grey-01">{kpi.value}</div>
          <div className="flex items-center gap-[var(--space-1-5)] mt-[var(--space-1)]">
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
