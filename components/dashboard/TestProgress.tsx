'use client'

import { Card } from '@/components/ui/Card'

export function TestProgress() {
  return (
    <Card>
      <div className="text-12-regular text-grey-08">测试期进度</div>
      <div className="text-24-bold text-grey-01 mt-[var(--space-1)]">8 / 14 天</div>
      <div className="w-full h-1.5 bg-grey-12 rounded-full mt-[var(--space-3)] overflow-hidden">
        <div className="w-[57%] h-full bg-grey-01 rounded-full" />
      </div>
      <div className="flex justify-between text-12-regular text-grey-08 mt-[var(--space-2)]">
        <span>2026-03-17</span>
        <span>2026-03-31</span>
      </div>
    </Card>
  )
}
