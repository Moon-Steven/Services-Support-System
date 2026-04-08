'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { clients } from '@/lib/data'
import {
  getAllPersonaSnapshots,
  getPersonaQuoteById,
  adjustPersonaRadarForClient,
  approvePersonaSnapshot,
  rejectPersonaSnapshot,
  changePersonaQuoteForClient,
  setPersonaCopyOverrideForClient,
  PERSONA_DATA_UPDATED_EVENT,
  PERSONA_LOCK_STATUS_LABEL,
  REVIEW_STAGE_LABEL,
  isRejectedTask,
  type PersonaSnapshot,
  type PersonaLockStatus,
  type ReviewStage,
} from '@/lib/around-the-clock'
import { CapabilityRadar } from '@/components/around-the-clock/CapabilityRadar'
import { PersonaReviewDrawer } from '@/components/around-the-clock/PersonaReviewDrawer'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

type Role = 'delivery' | 'ops' | 'sales'

const ROLE_STAGE_MAP: Record<Role, ReviewStage> = {
  delivery: 'at_delivery',
  ops: 'at_ops',
  sales: 'at_sales',
}

const ROLE_ACTOR_MAP: Record<Role, string> = {
  delivery: '交付',
  ops: '行运',
  sales: '销售',
}

function lockStatusBadgeVariant(status: PersonaLockStatus): 'cyan' | 'orange' | 'grey' | 'red' {
  switch (status) {
    case 'in_review': return 'orange'
    case 'pending_manual': return 'red'
    case 'auto_selected':
    case 'unlocked':
    case 'locked':
      return 'grey'
  }
}

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max)}…` : text
}

export default function PersonaReviewPage() {
  const role: Role = 'delivery'
  const actor = ROLE_ACTOR_MAP[role]

  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const [allSnapshots, setAllSnapshots] = useState<PersonaSnapshot[]>([])

  useEffect(() => {
    setMounted(true)
    setAllSnapshots(getAllPersonaSnapshots())
    const refresh = () => setAllSnapshots(getAllPersonaSnapshots())
    window.addEventListener(PERSONA_DATA_UPDATED_EVENT, refresh)
    return () => window.removeEventListener(PERSONA_DATA_UPDATED_EVENT, refresh)
  }, [])

  const reviewSnapshots = useMemo(
    () => allSnapshots.filter(s => s.reviewStage === ROLE_STAGE_MAP[role]),
    [allSnapshots, role],
  )

  const tableSnapshots = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase()
    return reviewSnapshots
      .filter((snapshot) => {
        if (!keyword) return true
        const client = clients.find(c => c.id === snapshot.clientId)
        const quote = getPersonaQuoteById(snapshot.selectedQuoteId)
        return (
          (client?.name ?? snapshot.clientId).toLowerCase().includes(keyword)
          || (client?.industry ?? '').toLowerCase().includes(keyword)
          || (quote?.author ?? '').toLowerCase().includes(keyword)
          || (quote?.text ?? '').toLowerCase().includes(keyword)
        )
      })
      .sort((a, b) => {
        if (a.quoteMatchScore !== b.quoteMatchScore) return a.quoteMatchScore - b.quoteMatchScore
        return b.generatedAt.localeCompare(a.generatedAt)
      })
  }, [reviewSnapshots, searchQuery])

  useEffect(() => {
    const visibleIds = new Set(tableSnapshots.map(item => item.clientId))
    setSelectedIds(prev => new Set([...prev].filter(id => visibleIds.has(id))))
  }, [tableSnapshots])

  const now = Date.now()
  const todoCount = reviewSnapshots.length
  const lowMatchInTodoCount = reviewSnapshots.filter(s => s.quoteMatchScore < 0.5).length
  const rejectedTodoCount = reviewSnapshots.filter(s => isRejectedTask(s)).length
  const updatedRecentCount = reviewSnapshots.filter((s) => {
    const ts = Date.parse(s.generatedAt.replace(' ', 'T'))
    if (Number.isNaN(ts)) return false
    return now - ts <= 24 * 60 * 60 * 1000
  }).length
  const allChecked = tableSnapshots.length > 0 && tableSnapshots.every(s => selectedIds.has(s.clientId))

  function refreshSnapshots() {
    setAllSnapshots(getAllPersonaSnapshots())
  }

  function toggleAll() {
    if (allChecked) setSelectedIds(new Set())
    else setSelectedIds(new Set(tableSnapshots.map(s => s.clientId)))
  }

  function toggleOne(clientId: string) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(clientId)) next.delete(clientId)
      else next.add(clientId)
      return next
    })
  }

  function handleApprove(clientId: string, comment?: string) {
    const result = approvePersonaSnapshot({ clientId, comment, actor })
    if (result.success) refreshSnapshots()
  }

  function handleReject(clientId: string, reason: string) {
    const result = rejectPersonaSnapshot({ clientId, reason, actor })
    if (result.success) refreshSnapshots()
  }

  function handleChangeQuote(clientId: string, newQuoteId: string, reason: string) {
    const result = changePersonaQuoteForClient({ clientId, quoteId: newQuoteId, reason, actor })
    if (result.success) refreshSnapshots()
  }

  function handleCopyOverride(clientId: string, text: string) {
    const result = setPersonaCopyOverrideForClient({ clientId, text, actor })
    if (result.success) refreshSnapshots()
  }

  function handleAdjustRadar(clientId: string, nextCurrent: PersonaSnapshot['current'], reason: string) {
    const result = adjustPersonaRadarForClient({ clientId, nextCurrent, reason, actor })
    if (result.success) refreshSnapshots()
  }

  function handleBatchApprove() {
    selectedIds.forEach((clientId) => {
      approvePersonaSnapshot({ clientId, comment: '批量通过', actor })
    })
    setSelectedIds(new Set())
    refreshSnapshots()
  }

  if (!mounted) return null

  return (
    <div className="flex flex-col gap-[var(--space-6)] p-[var(--space-6)]">
      <div className="flex items-start justify-between gap-[var(--space-4)]">
        <div className="flex flex-col gap-[var(--space-1)]">
          <h1 className="text-24-bold text-grey-01">Persona</h1>
          <p className="text-12-regular text-grey-08">按交付 → 行运 → 销售顺序逐级审核后对客展示，当前仅显示你的权限范围任务。</p>
        </div>
        <div className="flex items-center gap-[var(--space-2)]">
          <Link href="/persona-overview" className="text-12-medium text-l-cyan hover:underline">查看总览</Link>
          <Link href="/quote-library" className="text-12-medium text-l-cyan hover:underline">名言库</Link>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-[var(--space-4)]">
        <Card padding="standard">
          <div className="flex items-center gap-[var(--space-3)]">
            <div className="w-8 h-8 rounded-lg bg-cyan-tint-08 flex items-center justify-center">
              <span className="text-14-bold text-l-cyan">待</span>
            </div>
            <div>
              <p className="text-12-medium text-grey-06">我的待审</p>
              <p className="text-20-bold text-grey-01">{todoCount}</p>
            </div>
          </div>
        </Card>
        <Card padding="standard">
          <div className="flex items-center gap-[var(--space-3)]">
            <div className="w-8 h-8 rounded-lg bg-orange-tint-10 flex items-center justify-center">
              <span className="text-14-bold text-orange">低</span>
            </div>
            <div>
              <p className="text-12-medium text-grey-06">待审低匹配</p>
              <p className="text-20-bold text-orange">{lowMatchInTodoCount}</p>
            </div>
          </div>
        </Card>
        <Card padding="standard">
          <div className="flex items-center gap-[var(--space-3)]">
            <div className="w-8 h-8 rounded-lg bg-red-tint-08 flex items-center justify-center">
              <span className="text-14-bold text-red">!</span>
            </div>
            <div>
              <p className="text-12-medium text-grey-06">退回待重审</p>
              <p className="text-20-bold text-red">{rejectedTodoCount}</p>
            </div>
          </div>
        </Card>
        <Card padding="standard">
          <div className="flex items-center gap-[var(--space-3)]">
            <div className="w-8 h-8 rounded-lg bg-selected flex items-center justify-center">
              <span className="text-14-bold text-grey-06">更</span>
            </div>
            <div>
              <p className="text-12-medium text-grey-06">最近更新（24h）</p>
              <p className="text-20-bold text-grey-01">{updatedRecentCount}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="flex items-center gap-[var(--space-3)]">
        <div className="w-[320px]">
          <Input
            placeholder="搜索客户/行业/名言/作者"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <span className="text-12-regular text-grey-08">
          当前结果：<span className="text-grey-01 text-12-medium">{tableSnapshots.length}</span> 条
        </span>
        {searchQuery.trim() && (
          <Button variant="ghost" className="!h-8 !px-3 text-12-medium" onClick={() => setSearchQuery('')}>
            清除搜索
          </Button>
        )}
      </Card>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left">
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
                <th className="p-[var(--space-3)] text-12-medium text-grey-06">状态</th>
                <th className="p-[var(--space-3)] text-12-medium text-grey-06">匹配名言</th>
                <th className="p-[var(--space-3)] text-12-medium text-grey-06">匹配度</th>
                <th className="p-[var(--space-3)] text-12-medium text-grey-06">最近更新</th>
                <th className="p-[var(--space-3)] text-12-medium text-grey-06">操作</th>
              </tr>
            </thead>
            <tbody>
              {tableSnapshots.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-[var(--space-6)] text-center text-14-regular text-grey-08">
                    当前筛选下暂无可审核任务
                  </td>
                </tr>
              )}
              {tableSnapshots.map(snapshot => {
                const client = clients.find(c => c.id === snapshot.clientId)
                const quote = getPersonaQuoteById(snapshot.selectedQuoteId)
                const rejected = isRejectedTask(snapshot)
                return (
                  <tr
                    key={snapshot.clientId}
                    className={`border-b border-stroke cursor-pointer transition-colors hover:bg-selected ${selectedClientId === snapshot.clientId ? 'bg-selected' : ''}`}
                    onClick={() => setSelectedClientId(snapshot.clientId)}
                  >
                    <td className="p-[var(--space-3)]" onClick={e => { e.stopPropagation(); toggleOne(snapshot.clientId) }}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(snapshot.clientId)}
                        readOnly
                        className="accent-[var(--l-cyan)]"
                      />
                    </td>
                    <td className="p-[var(--space-3)]">
                      <p className="text-14-bold text-grey-01">{client?.name ?? snapshot.clientId}</p>
                      <p className="text-12-regular text-grey-08">{client?.industry ?? '—'}</p>
                    </td>
                    <td className="p-[var(--space-3)]">
                      <div className="flex flex-col gap-1">
                        <Badge variant={lockStatusBadgeVariant(snapshot.lockStatus)}>
                          {PERSONA_LOCK_STATUS_LABEL[snapshot.lockStatus]}
                        </Badge>
                        {snapshot.reviewStage && (
                          <span className="text-10-regular text-grey-08">{REVIEW_STAGE_LABEL[snapshot.reviewStage]}</span>
                        )}
                        {rejected && <Badge variant="red">退回任务</Badge>}
                      </div>
                    </td>
                    <td className="p-[var(--space-3)] max-w-[200px]">
                      {quote ? (
                        <div className="space-y-[var(--space-1)] flex items-start gap-[var(--space-2)]">
                          <CapabilityRadar scores={snapshot.current} size="mini" className="shrink-0" />
                          <div className="min-w-0">
                            <p className="text-12-regular text-grey-01 leading-snug line-clamp-2">{truncate(quote.text, 30)}</p>
                            <p className="text-10-regular text-grey-08 mt-0.5">— {quote.author}</p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-12-regular text-grey-08">未匹配</span>
                      )}
                    </td>
                    <td className="p-[var(--space-3)]">
                      <span className={`text-14-bold tabular-nums ${snapshot.quoteMatchScore < 0.5 ? 'text-red' : 'text-grey-01'}`}>
                        {(snapshot.quoteMatchScore * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="p-[var(--space-3)]">
                      <span className="text-12-regular text-grey-08 tabular-nums">{snapshot.generatedAt.slice(5, 10)}</span>
                    </td>
                    <td className="p-[var(--space-3)]" onClick={e => e.stopPropagation()}>
                      <Button
                        variant={snapshot.lockStatus === 'pending_manual' ? 'secondary' : 'primary'}
                        className="text-12-medium !px-3 !h-7"
                        onClick={() => setSelectedClientId(snapshot.clientId)}
                      >
                        {snapshot.lockStatus === 'pending_manual' ? '进入处理' : '进入审核'}
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {selectedIds.size > 0 && (
        <div className="sticky bottom-0 z-10">
          <Card padding="standard" className="flex items-center justify-between border border-stroke">
            <span className="text-14-medium text-grey-01">
              已选择 <span className="text-l-cyan">{selectedIds.size}</span> 项
            </span>
            <div className="flex gap-[var(--space-3)]">
              <Button variant="primary" onClick={handleBatchApprove}>批量通过</Button>
              <Button variant="secondary" onClick={() => setSelectedIds(new Set())}>取消选择</Button>
            </div>
          </Card>
        </div>
      )}

      <PersonaReviewDrawer
        snapshot={selectedClientId ? allSnapshots.find(s => s.clientId === selectedClientId) ?? null : null}
        open={selectedClientId !== null}
        onClose={() => setSelectedClientId(null)}
        currentRole={role}
        onApprove={handleApprove}
        onReject={handleReject}
        onChangeQuote={handleChangeQuote}
        onCopyOverride={handleCopyOverride}
        onAdjustRadar={handleAdjustRadar}
      />
    </div>
  )
}
