'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  ActiveChange,
  ChangeTimeline,
  NewChangeDialog,
  diffSections,
  approvalChain,
  historyItems,
  statsData,
  configRows,
  changeTypes,
} from '@/components/changes'

/* ─── component ─── */
export default function ChangesPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [checkedTypes, setCheckedTypes] = useState<Record<string, boolean>>({})

  const handleToggleType = (type: string) => {
    setCheckedTypes((p) => ({ ...p, [type]: !p[type] }))
  }

  return (
    <div className="flex flex-col gap-[var(--space-6)]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-20-bold text-grey-01">变更管理</h1>
          <p className="text-12-regular text-grey-06 mt-[var(--space-1)]">
            客户：Wavebone · 变更历史与审批流
          </p>
        </div>
        <Button variant="primary" onClick={() => setModalOpen(true)}>+ 发起变更</Button>
      </div>

      {/* 2-column layout */}
      <div className="grid grid-cols-[2fr_1fr] gap-[var(--space-6)]">

        {/* Left: Change List */}
        <div className="flex flex-col gap-[var(--space-4)]">
          <ActiveChange diffSections={diffSections} approvalChain={approvalChain} />
          <ChangeTimeline items={historyItems} />
        </div>

        {/* Right: Summary */}
        <div className="flex flex-col gap-[var(--space-4)]">

          {/* Stats Card */}
          <Card>
            <div className="text-14-bold text-grey-01 mb-[var(--space-3)]">变更统计</div>
            {statsData.map((s, i) => (
              <div
                key={s.label}
                className={`flex justify-between items-center py-[var(--space-2-5)] ${
                  i > 0 ? 'border-t border-stroke' : ''
                }`}
              >
                <span className="text-12-regular text-grey-08">{s.label}</span>
                <span className="text-[20px] font-bold" style={{ color: s.color }}>{s.value}</span>
              </div>
            ))}
          </Card>

          {/* Config Card */}
          <Card>
            <div className="text-14-bold text-grey-01 mb-[var(--space-3)]">当前生效配置</div>
            {configRows.map((row, i) => (
              <div
                key={row.label}
                className={`flex justify-between items-center text-12-regular py-[var(--space-2-5)] ${
                  i > 0 ? 'border-t border-stroke' : ''
                }`}
              >
                <span className="text-grey-08">{row.label}</span>
                <span className="text-grey-01 font-medium">
                  {row.value}
                  {row.pending && (
                    <span className="text-orange ml-[var(--space-1)]">{row.pending}</span>
                  )}
                </span>
              </div>
            ))}
          </Card>

          {/* Version Card */}
          <div className="bg-grey-01 rounded-xl p-[var(--space-5)] text-white">
            <div className="text-12-regular text-grey-08">变更版本</div>
            <div className="text-[24px] font-bold mt-[var(--space-1)]">v3 → v4</div>
            <div className="text-12-regular text-grey-08 mt-[var(--space-2)]">
              每次变更自动留痕，支持版本回溯
            </div>
          </div>
        </div>
      </div>

      {/* New Change Modal */}
      <NewChangeDialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        changeTypes={changeTypes}
        checkedTypes={checkedTypes}
        onToggleType={handleToggleType}
      />
    </div>
  )
}
