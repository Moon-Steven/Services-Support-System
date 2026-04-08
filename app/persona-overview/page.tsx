'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { clients } from '@/lib/data'
import {
  getAllPersonaSnapshots,
  getPersonaQuoteById,
  getQuoteLibraryHealth,
  PERSONA_DATA_UPDATED_EVENT,
  PERSONA_LOCK_STATUS_LABEL,
  DIMENSION_KEYS,
  type PersonaSnapshot,
  type PersonaLockStatus,
} from '@/lib/around-the-clock'
import { CapabilityRadar } from '@/components/around-the-clock/CapabilityRadar'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

const STATUS_BADGE_VARIANT: Record<PersonaLockStatus, 'cyan' | 'orange' | 'grey' | 'red'> = {
  locked: 'grey',
  in_review: 'orange',
  auto_selected: 'grey',
  unlocked: 'grey',
  pending_manual: 'grey',
}

function getAnomalies(snap: PersonaSnapshot): string[] {
  const anomalies: string[] = []
  const quote = getPersonaQuoteById(snap.selectedQuoteId)
  if (quote?.status === 'retired') anomalies.push('名言已下架')
  if (snap.quoteMatchScore < 0.5) anomalies.push('匹配度过低')
  if (snap.lockStatus === 'auto_selected') anomalies.push('长期未审核')
  const maxDelta = Math.max(
    ...DIMENSION_KEYS.map(k => Math.abs(snap.current[k] - snap.previous[k]))
  )
  if (maxDelta > 15) anomalies.push('分数剧变')
  return anomalies
}

function formatDate(iso: string): string {
  const [datePart] = iso.split('T')
  const [, month, day] = datePart.split('-')
  return `${Number(month)}/${Number(day)}`
}

function StatCard({
  label,
  count,
  color,
}: {
  label: string
  count: number
  color: 'cyan' | 'orange' | 'grey' | 'red'
}) {
  const colorMap = {
    cyan: { bg: 'bg-cyan-tint-08', text: 'text-l-cyan' },
    orange: { bg: 'bg-orange-tint-10', text: 'text-orange' },
    grey: { bg: 'bg-grey-12', text: 'text-grey-06' },
    red: { bg: 'bg-red-tint-08', text: 'text-red' },
  }
  const c = colorMap[color]
  return (
    <Card className="flex-1 min-w-[140px]">
      <p className="text-12-medium text-grey-06">{label}</p>
      <div className="flex items-center gap-[var(--space-2)] mt-[var(--space-1)]">
        <span className={`w-2 h-2 rounded-full ${c.bg}`} />
        <span className={`text-24-bold ${c.text}`}>{count}</span>
      </div>
    </Card>
  )
}

export default function PersonaOverviewPage() {
  const [snapshots, setSnapshots] = useState<PersonaSnapshot[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [mounted, setMounted] = useState(false)
  const health = useMemo(() => getQuoteLibraryHealth(), [])

  useEffect(() => {
    setMounted(true)
    setSnapshots(getAllPersonaSnapshots())
    const refresh = () => setSnapshots(getAllPersonaSnapshots())
    window.addEventListener(PERSONA_DATA_UPDATED_EVENT, refresh)
    return () => window.removeEventListener(PERSONA_DATA_UPDATED_EVENT, refresh)
  }, [])

  const matchedCount = snapshots.filter(s => s.lockStatus === 'auto_selected').length
  const reviewCount = snapshots.filter(s => s.lockStatus === 'in_review').length
  const pendingCount = snapshots.filter(
    s => s.lockStatus === 'auto_selected' || s.lockStatus === 'unlocked' || s.lockStatus === 'pending_manual'
  ).length

  const snapsWithAnomalies = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase()
    return snapshots
      .map(s => ({ snap: s, anomalies: getAnomalies(s) }))
      .filter(({ snap }) => {
        if (!keyword) return true
        const client = clients.find(c => c.id === snap.clientId)
        const quote = getPersonaQuoteById(snap.selectedQuoteId)
        return (
          (client?.name ?? snap.clientId).toLowerCase().includes(keyword)
          || (client?.industry ?? '').toLowerCase().includes(keyword)
          || (quote?.author ?? '').toLowerCase().includes(keyword)
        )
      })
      .sort((a, b) => {
        if (a.anomalies.length !== b.anomalies.length) return b.anomalies.length - a.anomalies.length
        return a.snap.quoteMatchScore - b.snap.quoteMatchScore
      })
  }, [snapshots, searchQuery])
  const anomalyCount = snapsWithAnomalies.filter(({ anomalies }) => anomalies.length > 0).length

  const avgMatch =
    snapshots.length > 0
      ? snapshots.reduce((sum, s) => sum + s.quoteMatchScore, 0) / snapshots.length
      : 0

  if (!mounted) return null

  return (
    <div className="flex flex-col gap-[var(--space-6)] p-[var(--space-6)]">
      <div className="flex items-start justify-between gap-[var(--space-4)]">
        <div className="flex flex-col gap-[var(--space-1)]">
          <h1 className="text-24-bold text-grey-01">Persona 总览</h1>
          <p className="text-12-regular text-grey-08">优先显示异常与低匹配客户，支持快速跳转到审核处理。</p>
        </div>
        <Link href="/persona-review" className="text-12-medium text-l-cyan hover:underline">
          返回审核台
        </Link>
      </div>

      <div className="flex gap-[var(--space-4)] flex-wrap">
        <StatCard label="已匹配" count={matchedCount} color="cyan" />
        <StatCard label="审核中" count={reviewCount} color="orange" />
        <StatCard label="待审/待匹配" count={pendingCount} color="grey" />
        <StatCard label="异常" count={anomalyCount} color="red" />
      </div>

      <Card>
        <div className="flex items-center justify-between flex-wrap gap-[var(--space-2)]">
          <p className="text-14-medium text-grey-01">
            名言库健康度:
            <span className="text-l-cyan ml-[var(--space-1)]">{health.totalAvailable} 可用</span>
            <span className="text-grey-06 mx-[var(--space-1)]">/</span>
            <span className="text-orange">{health.totalUnderReview} 待审</span>
            <span className="text-grey-06 mx-[var(--space-1)]">/</span>
            <span className="text-red">{health.totalRetired} 已下架</span>
          </p>
          {health.totalAvailable < 20 && (
            <span className="flex items-center gap-[var(--space-1)] text-12-medium text-orange">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path
                  d="M7 1L13 12H1L7 1Z"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
                <path d="M7 5.5V8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                <circle cx="7" cy="9.75" r="0.6" fill="currentColor" />
              </svg>
              可用库存不足（建议 ≥ 20 条）
            </span>
          )}
        </div>
      </Card>

      <Card className="flex items-center gap-[var(--space-3)]">
        <div className="w-[320px]">
          <Input
            placeholder="搜索客户/行业/作者"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <span className="text-12-regular text-grey-08">
          当前结果：<span className="text-grey-01 text-12-medium">{snapsWithAnomalies.length}</span> 条
        </span>
        {searchQuery.trim() && (
          <Button variant="ghost" className="!h-8 !px-3 text-12-medium" onClick={() => setSearchQuery('')}>
            清除搜索
          </Button>
        )}
      </Card>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-stroke text-12-medium text-grey-06 text-left">
                <th className="px-[var(--space-5)] py-[var(--space-3)]">客户</th>
                <th className="px-[var(--space-3)] py-[var(--space-3)]">雷达缩略</th>
                <th className="px-[var(--space-3)] py-[var(--space-3)]">当前名言</th>
                <th className="px-[var(--space-3)] py-[var(--space-3)]">匹配度</th>
                <th className="px-[var(--space-3)] py-[var(--space-3)]">状态</th>
                <th className="px-[var(--space-3)] py-[var(--space-3)]">上次更新</th>
                <th className="px-[var(--space-3)] py-[var(--space-3)]">异常</th>
                <th className="px-[var(--space-3)] py-[var(--space-3)] pr-[var(--space-5)]">操作</th>
              </tr>
            </thead>
            <tbody>
              {snapsWithAnomalies.map(({ snap, anomalies }) => {
                const client = clients.find(c => c.id === snap.clientId)
                const quote = getPersonaQuoteById(snap.selectedQuoteId)
                const matchPct = (snap.quoteMatchScore * 100).toFixed(0)
                const isLowMatch = snap.quoteMatchScore < 0.5

                return (
                  <tr
                    key={snap.clientId}
                    className="border-b border-stroke last:border-b-0 hover:bg-selected transition-colors"
                  >
                    <td className="px-[var(--space-5)] py-[var(--space-3)]">
                      <span className="text-14-medium text-grey-01">
                        {client?.name ?? snap.clientId}
                      </span>
                    </td>
                    <td className="px-[var(--space-3)] py-[var(--space-3)]">
                      <CapabilityRadar scores={snap.current} size="mini" />
                    </td>
                    <td className="px-[var(--space-3)] py-[var(--space-3)]">
                      <span className="text-12-regular text-grey-06">
                        {quote?.author ?? '—'}
                      </span>
                    </td>
                    <td className="px-[var(--space-3)] py-[var(--space-3)]">
                      <span
                        className={`text-14-bold tabular-nums ${isLowMatch ? 'text-red' : 'text-grey-01'}`}
                      >
                        {matchPct}%
                      </span>
                    </td>
                    <td className="px-[var(--space-3)] py-[var(--space-3)]">
                      <Badge variant={STATUS_BADGE_VARIANT[snap.lockStatus]}>
                        {PERSONA_LOCK_STATUS_LABEL[snap.lockStatus]}
                      </Badge>
                    </td>
                    <td className="px-[var(--space-3)] py-[var(--space-3)]">
                      <span className="text-12-regular text-grey-08 tabular-nums">
                        {formatDate(snap.generatedAt)}
                      </span>
                    </td>
                    <td className="px-[var(--space-3)] py-[var(--space-3)]">
                      {anomalies.length > 0 ? (
                        <div className="flex flex-wrap gap-[var(--space-1)]">
                          {anomalies.map(a => (
                            <Badge key={a} variant="red">
                              {a}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-12-regular text-grey-08">—</span>
                      )}
                    </td>
                    <td className="px-[var(--space-3)] py-[var(--space-3)] pr-[var(--space-5)]">
                      <Link
                        href="/persona-review"
                        className="text-12-medium text-l-cyan hover:underline"
                      >
                        去处理
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-[var(--space-6)] flex-wrap text-14-regular text-grey-06">
          <span>
            匹配覆盖率:
            <span className="text-14-bold text-grey-01 ml-[var(--space-1)]">
              {matchedCount}/{snapshots.length}
            </span>
            <span className="text-12-regular text-grey-08 ml-[var(--space-1)]">
              ({snapshots.length > 0 ? ((matchedCount / snapshots.length) * 100).toFixed(0) : 0}%)
            </span>
          </span>
          <span className="w-px h-4 bg-stroke" />
          <span>
            平均匹配分数:
            <span className="text-14-bold text-grey-01 ml-[var(--space-1)]">
              {avgMatch.toFixed(2)}
            </span>
          </span>
        </div>
      </Card>
    </div>
  )
}
