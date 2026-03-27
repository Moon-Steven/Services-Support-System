'use client'

export function TestProgress() {
  const daysElapsed = 8
  const totalDays = 14
  const pct = Math.round((daysElapsed / totalDays) * 100)

  return (
    <div className="flex items-center gap-[var(--space-4)] px-[var(--space-5)] py-[var(--space-3)] bg-white rounded-[var(--radius-3)] border border-stroke">
      <span className="text-12-medium text-grey-06 shrink-0">测试周期</span>
      <div className="flex-1 flex items-center gap-[var(--space-3)]">
        <div className="flex-1 h-[6px] bg-grey-12 rounded-full overflow-hidden">
          <div className="h-full bg-grey-01 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <span className="text-12-bold text-grey-01 shrink-0">D{daysElapsed}</span>
      <span className="text-12-regular text-grey-08 shrink-0">/ {totalDays} 天</span>
      <div className="flex items-center gap-[var(--space-2)] ml-[var(--space-2)] pl-[var(--space-4)] border-l border-stroke">
        <span className="text-10-regular text-grey-08">03-17</span>
        <span className="text-10-regular text-grey-08">→</span>
        <span className="text-10-regular text-grey-08">03-31</span>
      </div>
    </div>
  )
}
