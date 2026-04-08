'use client'

import { useState, useMemo } from 'react'
import { clients } from '@/lib/data'
import {
  getSnapshotsForReview,
  getAllPersonaSnapshots,
  getPersonaQuoteById,
  PERSONA_LOCK_STATUS_LABEL,
  REVIEW_STAGE_LABEL,
  PERSONA_QUOTES,
  isRejectedTask,
  getQuoteLibraryHealth,
  type PersonaSnapshot,
  type PersonaLockStatus,
  type ReviewStage,
} from '@/lib/around-the-clock'
import { CapabilityRadar } from '@/components/around-the-clock/CapabilityRadar'
import { PersonaReviewDrawer } from '@/components/around-the-clock/PersonaReviewDrawer'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Tabs } from '@/components/ui/Tabs'

type Role = 'delivery' | 'ops' | 'sales'

const ROLE_OPTIONS = [
  { value: 'delivery', label: '交付' },
  { value: 'ops', label: '行运' },
  { value: 'sales', label: '销售' },
]

const ROLE_STAGE_MAP: Record<Role, ReviewStage> = {
  delivery: 'at_delivery',
  ops: 'at_ops',
  sales: 'at_sales',
}

function lockStatusBadgeVariant(status: PersonaLockStatus): 'cyan' | 'orange' | 'grey' | 'red' {
  switch (status) {
    case 'locked': return 'cyan'
    case 'in_review': return 'orange'
    case 'auto_selected': return 'grey'
    case 'pending_manual': return 'red'
    case 'unlocked': return 'grey'
  }
}

function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max) + '…' : text
}

export default function PersonaReviewPage() {
  const [role, setRole] = useState<Role>('delivery')
  const [activeTab, setActiveTab] = useState('review')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)

  const allSnapshots = useMemo(() => getAllPersonaSnapshots(), [])

  const reviewSnapshots = useMemo(
    () => allSnapshots.filter(s => s.reviewStage != null),
    [allSnapshots],
  )
  const lockedSnapshots = useMemo(
    () => allSnapshots.filter(s => s.lockStatus === 'locked'),
    [allSnapshots],
  )
  const pendingManualSnapshots = useMemo(
    () => allSnapshots.filter(s => s.lockStatus === 'pending_manual'),
    [allSnapshots],
  )

  const tabSnapshots = useMemo(() => {
    if (activeTab === 'review') return reviewSnapshots
    if (activeTab === 'locked') return lockedSnapshots
    return pendingManualSnapshots
  }, [activeTab, reviewSnapshots, lockedSnapshots, pendingManualSnapshots])

  const health = useMemo(() => getQuoteLibraryHealth(), [])

  const overduCount = allSnapshots.filter(s => s.lockStatus === 'pending_manual').length
  const nearDueCount = allSnapshots.filter(s => s.lockStatus === 'in_review').length
  const okCount = allSnapshots.filter(
    s => s.lockStatus === 'locked' || s.lockStatus === 'auto_selected',
  ).length

  const tabs = [
    { key: 'review', label: '全部待审', count: reviewSnapshots.length },
    { key: 'locked', label: '已锁定', count: lockedSnapshots.length },
    { key: 'manual', label: '待人工选择', count: pendingManualSnapshots.length },
  ]

  const allChecked = tabSnapshots.length > 0 && tabSnapshots.every(s => selectedIds.has(s.clientId))

  function toggleAll() {
    if (allChecked) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(tabSnapshots.map(s => s.clientId)))
    }
  }

  function toggleOne(clientId: string) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(clientId)) next.delete(clientId)
      else next.add(clientId)
      return next
    })
  }

  function canShowActions(snapshot: PersonaSnapshot): boolean {
    if (!snapshot.reviewStage) return false
    return snapshot.reviewStage === ROLE_STAGE_MAP[role]
  }

  function getClientInfo(clientId: string) {
    return clients.find(c => c.id === clientId)
  }

  return (
    <div className="flex flex-col gap-[var(--space-6)] p-[var(--space-6)]">
      <div className="flex items-center justify-between">
        <h1 className="text-24-bold text-grey-01">Persona 审核</h1>
        <div className="w-[160px]">
          <Select
            options={ROLE_OPTIONS}
            value={role}
            onChange={e => setRole(e.target.value as Role)}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-[var(--space-4)]">
        <Card padding="standard">
          <div className="flex items-center gap-[var(--space-3)]">
            <div className="w-8 h-8 rounded-lg bg-red-tint-08 flex items-center justify-center">
              <span className="text-14-bold text-red">!</span>
            </div>
            <div>
              <p className="text-12-medium text-grey-06">已超时</p>
              <p className="text-20-bold text-red">{overduCount}</p>
            </div>
          </div>
        </Card>

        <Card padding="standard">
          <div className="flex items-center gap-[var(--space-3)]">
            <div className="w-8 h-8 rounded-lg bg-orange-tint-10 flex items-center justify-center">
              <span className="text-14-bold text-orange">⏳</span>
            </div>
            <div>
              <p className="text-12-medium text-grey-06">临近超时</p>
              <p className="text-20-bold text-orange">{nearDueCount}</p>
            </div>
          </div>
        </Card>

        <Card padding="standard">
          <div className="flex items-center gap-[var(--space-3)]">
            <div className="w-8 h-8 rounded-lg bg-cyan-tint-08 flex items-center justify-center">
              <span className="text-14-bold text-l-cyan">✓</span>
            </div>
            <div>
              <p className="text-12-medium text-grey-06">时效充足</p>
              <p className="text-20-bold text-l-cyan">{okCount}</p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs tabs={tabs} activeKey={activeTab} onChange={setActiveTab}>
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-stroke">
                  <th className="p-[var(--space-3)] w-10">
                    <input
                      type="checkbox"
                      checked={allChecked}
                      onChange={toggleAll}
                      className="accent-[var(--l-cyan)]"
                    />
                  </th>
                  <th className="p-[var(--space-3)] text-12-medium text-grey-06">客户</th>
                  <th className="p-[var(--space-3)] text-12-medium text-grey-06">雷达预览</th>
                  <th className="p-[var(--space-3)] text-12-medium text-grey-06">匹配名言</th>
                  <th className="p-[var(--space-3)] text-12-medium text-grey-06">匹配度</th>
                  <th className="p-[var(--space-3)] text-12-medium text-grey-06">当前节点</th>
                  <th className="p-[var(--space-3)] text-12-medium text-grey-06">操作</th>
                </tr>
              </thead>
              <tbody>
                {tabSnapshots.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-[var(--space-6)] text-center text-14-regular text-grey-08">
                      暂无数据
                    </td>
                  </tr>
                )}
                {tabSnapshots.map(snapshot => {
                  const client = getClientInfo(snapshot.clientId)
                  const quote = getPersonaQuoteById(snapshot.selectedQuoteId)
                  const rejected = isRejectedTask(snapshot)
                  const isSelected = selectedIds.has(snapshot.clientId)

                  return (
                    <tr
                      key={snapshot.clientId}
                      className={`border-b border-stroke cursor-pointer transition-colors hover:bg-selected ${
                        selectedClientId === snapshot.clientId ? 'bg-selected' : ''
                      }`}
                      onClick={() => setSelectedClientId(snapshot.clientId)}
                    >
                      <td className="p-[var(--space-3)]" onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleOne(snapshot.clientId)}
                          className="accent-[var(--l-cyan)]"
                        />
                      </td>

                      <td className="p-[var(--space-3)]">
                        <div>
                          <p className="text-14-bold text-grey-01">
                            {client?.name ?? snapshot.clientId}
                          </p>
                          <p className="text-12-regular text-grey-08">
                            {client?.industry ?? '—'}
                          </p>
                        </div>
                      </td>

                      <td className="p-[var(--space-3)]">
                        <CapabilityRadar scores={snapshot.current} size="mini" />
                      </td>

                      <td className="p-[var(--space-3)] max-w-[200px]">
                        {quote ? (
                          <div>
                            <p className="text-12-regular text-grey-01 leading-snug">
                              {truncate(quote.text, 30)}
                            </p>
                            <p className="text-10-regular text-grey-08 mt-0.5">
                              — {quote.author}
                            </p>
                          </div>
                        ) : (
                          <span className="text-12-regular text-grey-08">未匹配</span>
                        )}
                      </td>

                      <td className="p-[var(--space-3)]">
                        <span
                          className={`text-14-bold tabular-nums ${
                            snapshot.quoteMatchScore < 0.5 ? 'text-red' : 'text-grey-01'
                          }`}
                        >
                          {(snapshot.quoteMatchScore * 100).toFixed(0)}
                        </span>
                      </td>

                      <td className="p-[var(--space-3)]">
                        <div className="flex flex-col gap-1">
                          <Badge variant={lockStatusBadgeVariant(snapshot.lockStatus)}>
                            {PERSONA_LOCK_STATUS_LABEL[snapshot.lockStatus]}
                          </Badge>
                          {snapshot.reviewStage && (
                            <span className="text-10-regular text-grey-08">
                              {REVIEW_STAGE_LABEL[snapshot.reviewStage]}
                            </span>
                          )}
                          {rejected && (
                            <Badge variant="red">退回任务</Badge>
                          )}
                        </div>
                      </td>

                      <td className="p-[var(--space-3)]" onClick={e => e.stopPropagation()}>
                        {canShowActions(snapshot) ? (
                          <div className="flex gap-[var(--space-2)]">
                            <Button variant="primary" className="text-12-medium px-3 h-7">
                              通过
                            </Button>
                            <Button variant="ghost" className="text-12-medium px-3 h-7">
                              退回
                            </Button>
                          </div>
                        ) : snapshot.lockStatus === 'pending_manual' ? (
                          <Button variant="secondary" className="text-12-medium px-3 h-7">
                            选择名言
                          </Button>
                        ) : (
                          <span className="text-12-regular text-grey-08">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </Tabs>

      {selectedIds.size > 0 && (
        <div className="sticky bottom-0 z-10">
          <Card padding="standard" className="flex items-center justify-between">
            <span className="text-14-medium text-grey-01">
              已选择 <span className="text-l-cyan">{selectedIds.size}</span> 项
            </span>
            <div className="flex gap-[var(--space-3)]">
              <Button variant="primary">批量通过</Button>
              <Button variant="ghost">批量退回</Button>
              <Button variant="secondary" onClick={() => setSelectedIds(new Set())}>
                取消选择
              </Button>
            </div>
          </Card>
        </div>
      )}

      <PersonaReviewDrawer
        snapshot={selectedClientId ? allSnapshots.find(s => s.clientId === selectedClientId) ?? null : null}
        open={selectedClientId !== null}
        onClose={() => setSelectedClientId(null)}
        currentRole={role}
      />
    </div>
  )
}
