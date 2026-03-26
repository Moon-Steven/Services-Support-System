'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { IconSearch, IconPlus } from '@/components/icons'
import {
  clients,
  ioOrders,
  clientPerformance,
  clientClockConfigs,
  learningNotes,
} from '@/lib/data'
import type { ClientPerformance } from '@/lib/data'

/* ── Grade Config ── */
const gradeConfig: Record<string, { bg: string; text: string; border: string; label: string }> = {
  S: { bg: 'bg-orange-tint-10', text: 'text-orange', border: 'border-orange/30', label: '战略' },
  A: { bg: 'bg-cyan-tint-08', text: 'text-l-cyan', border: 'border-l-cyan/30', label: '核心' },
  B: { bg: 'bg-selected', text: 'text-grey-06', border: 'border-grey-12', label: '优质' },
  C: { bg: 'bg-selected', text: 'text-grey-08', border: 'border-grey-12', label: '普通' },
}

const phaseLabels: Record<number, string> = {
  1: '客户触达', 2: '需求沟通', 3: '测试期', 4: '转正续约', 5: '终止处理中',
}

const industryLabels: string[] = [...new Set(clients.map((c) => c.industry))]

type SortKey = 'name' | 'grade' | 'budget' | 'cpa' | 'roas' | 'spend'
type SortDir = 'asc' | 'desc'

type HealthStatus = 'good' | 'warn' | 'danger' | 'none'

function computeHealth(perf: ClientPerformance | null): HealthStatus {
  if (!perf) return 'none'
  const { cpa, cpaTarget, roas, roasTarget } = perf.summary
  if (cpaTarget <= 0 && roasTarget <= 0) return 'none'
  const cpaOver = cpaTarget > 0 ? ((cpa - cpaTarget) / cpaTarget) * 100 : 0
  const roasUnder = roasTarget > 0 ? ((roasTarget - roas) / roasTarget) * 100 : 0
  if (cpaOver > 30 || roasUnder > 30) return 'danger'
  if (cpaOver > 0 || roasUnder > 0) return 'warn'
  return 'good'
}

const healthMeta: Record<HealthStatus, { dot: string; label: string; sortOrder: number }> = {
  danger: { dot: 'bg-red', label: '预警', sortOrder: 0 },
  warn:   { dot: 'bg-orange', label: '关注', sortOrder: 1 },
  good:   { dot: 'bg-l-cyan', label: '正常', sortOrder: 2 },
  none:   { dot: 'bg-grey-12', label: '未投放', sortOrder: 3 },
}

const gradeOrder: Record<string, number> = { S: 0, A: 1, B: 2, C: 3 }

export default function ClientsPage() {
  const [search, setSearch] = useState('')
  const [filterGrade, setFilterGrade] = useState<string>('all')
  const [filterPhase, setFilterPhase] = useState<string>('all')
  const [filterIndustry, setFilterIndustry] = useState<string>('all')
  const [filterHealth, setFilterHealth] = useState<string>('all')
  const [sortKey, setSortKey] = useState<SortKey>('grade')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  /* ── Aggregate data per client ── */
  const clientRows = useMemo(() => {
    return clients.map((c) => {
      const orders = ioOrders.filter((o) => o.clientId === c.id)
      const activeOrders = orders.filter((o) => o.status === '投放中' || o.status === '审批中')
      const totalAmount = orders.reduce((s, o) => s + o.amount, 0)
      const perf = clientPerformance.find((p) => p.clientId === c.id) || null
      const clockConfig = clientClockConfigs.find((cc) => cc.clientId === c.id) || null
      const notes = learningNotes.filter((n) => n.clientId === c.id)
      const health = computeHealth(perf)

      return {
        ...c,
        orders,
        activeOrders,
        totalAmount,
        perf,
        clockConfig,
        notesCount: notes.length,
        health,
      }
    })
  }, [])

  /* ── Summary Stats ── */
  const stats = useMemo(() => {
    const gradeCount = { S: 0, A: 0, B: 0, C: 0 }
    let activeCampaigns = 0
    let totalBudget = 0
    clientRows.forEach((r) => {
      gradeCount[r.grade as keyof typeof gradeCount]++
      if (r.activeOrders.length > 0) activeCampaigns++
      totalBudget += r.budget || 0
    })
    const healthCount = { good: 0, warn: 0, danger: 0, none: 0 }
    clientRows.forEach((r) => healthCount[r.health]++)
    return { total: clientRows.length, gradeCount, activeCampaigns, totalBudget, healthCount }
  }, [clientRows])

  /* ── Filter & Sort ── */
  const filteredRows = useMemo(() => {
    let rows = clientRows

    if (search) {
      const q = search.toLowerCase()
      rows = rows.filter((r) =>
        r.name.toLowerCase().includes(q) || r.industry.toLowerCase().includes(q) || (r.salesOwner || '').toLowerCase().includes(q)
      )
    }
    if (filterGrade !== 'all') rows = rows.filter((r) => r.grade === filterGrade)
    if (filterPhase !== 'all') rows = rows.filter((r) => String(r.phase) === filterPhase)
    if (filterIndustry !== 'all') rows = rows.filter((r) => r.industry === filterIndustry)
    if (filterHealth !== 'all') rows = rows.filter((r) => r.health === filterHealth)

    rows = [...rows].sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case 'name': cmp = a.name.localeCompare(b.name); break
        case 'grade': cmp = (gradeOrder[a.grade] ?? 9) - (gradeOrder[b.grade] ?? 9); break
        case 'budget': cmp = (b.budget || 0) - (a.budget || 0); break
        case 'cpa': cmp = (a.perf?.summary.cpa ?? 999) - (b.perf?.summary.cpa ?? 999); break
        case 'roas': cmp = (b.perf?.summary.roas ?? 0) - (a.perf?.summary.roas ?? 0); break
        case 'spend': cmp = (b.perf?.summary.totalSpend ?? 0) - (a.perf?.summary.totalSpend ?? 0); break
      }
      return sortDir === 'desc' ? -cmp : cmp
    })

    return rows
  }, [clientRows, search, filterGrade, filterPhase, filterIndustry, filterHealth, sortKey, sortDir])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const SortArrow = ({ k }: { k: SortKey }) => (
    sortKey === k ? (
      <span className="ml-[2px] text-l-cyan">{sortDir === 'asc' ? '↑' : '↓'}</span>
    ) : null
  )

  return (
    <div>
      {/* ── Summary Bar ── */}
      <div className="grid grid-cols-4 gap-[var(--space-3)] mb-[var(--space-4)]">
        <Card padding="none">
          <div className="px-[var(--space-4)] py-[var(--space-3)]">
            <div className="text-10-regular text-grey-08 uppercase tracking-wide">客户总数</div>
            <div className="text-24-bold text-grey-01 mt-[2px]">{stats.total}</div>
            <div className="flex items-center gap-[var(--space-2)] mt-[var(--space-1)]">
              {(['S', 'A', 'B', 'C'] as const).map((g) => {
                const gc = gradeConfig[g]
                return (
                  <button
                    key={g}
                    onClick={() => setFilterGrade(filterGrade === g ? 'all' : g)}
                    className={`inline-flex items-center gap-[3px] px-[6px] py-[1px] rounded-full text-10-regular border cursor-pointer transition-colors font-[inherit] ${
                      filterGrade === g
                        ? `${gc.bg} ${gc.text} ${gc.border}`
                        : 'bg-transparent text-grey-08 border-transparent hover:text-grey-06'
                    }`}
                  >
                    {g} {stats.gradeCount[g]}
                  </button>
                )
              })}
            </div>
          </div>
        </Card>

        <Card padding="none">
          <div className="px-[var(--space-4)] py-[var(--space-3)]">
            <div className="text-10-regular text-grey-08 uppercase tracking-wide">健康度分布</div>
            <div className="flex items-baseline gap-[var(--space-2)] mt-[2px]">
              <span className="text-24-bold text-grey-01">{stats.healthCount.good + stats.healthCount.warn + stats.healthCount.danger}</span>
              <span className="text-12-regular text-grey-08">投放中</span>
            </div>
            <div className="flex items-center gap-[var(--space-2)] mt-[var(--space-1)]">
              {(['good', 'warn', 'danger', 'none'] as const).map((h) => (
                <button
                  key={h}
                  onClick={() => setFilterHealth(filterHealth === h ? 'all' : h)}
                  className={`inline-flex items-center gap-[3px] px-[6px] py-[1px] rounded-full text-10-regular border cursor-pointer transition-colors font-[inherit] ${
                    filterHealth === h
                      ? 'bg-grey-01 text-white border-grey-01'
                      : 'bg-transparent text-grey-08 border-transparent hover:text-grey-06'
                  }`}
                >
                  <span className={`w-[5px] h-[5px] rounded-full ${healthMeta[h].dot}`} />
                  {healthMeta[h].label} {stats.healthCount[h]}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <Card padding="none">
          <div className="px-[var(--space-4)] py-[var(--space-3)]">
            <div className="text-10-regular text-grey-08 uppercase tracking-wide">活跃投放</div>
            <div className="text-24-bold text-grey-01 mt-[2px]">{stats.activeCampaigns}</div>
            <div className="text-12-regular text-grey-08 mt-[var(--space-1)]">
              {stats.total - stats.activeCampaigns} 个客户暂无投放
            </div>
          </div>
        </Card>

        <Card padding="none">
          <div className="px-[var(--space-4)] py-[var(--space-3)]">
            <div className="text-10-regular text-grey-08 uppercase tracking-wide">总管理预算</div>
            <div className="text-24-bold text-grey-01 mt-[2px]">${stats.totalBudget.toLocaleString()}</div>
            <div className="text-12-regular text-grey-08 mt-[var(--space-1)]">
              月均 ${Math.round(stats.totalBudget / Math.max(stats.total, 1)).toLocaleString()}/客户
            </div>
          </div>
        </Card>
      </div>

      {/* ── Toolbar: Search + Filters ── */}
      <div className="flex items-center gap-[var(--space-3)] mb-[var(--space-3)]">
        {/* Search */}
        <div className="relative flex-1 max-w-[320px]">
          <div className="absolute left-[10px] top-1/2 -translate-y-1/2 text-grey-08 pointer-events-none">
            <IconSearch size={14} />
          </div>
          <input
            type="text"
            placeholder="搜索客户名称、行业、负责人..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-[30px] pr-[var(--space-3)] py-[6px] rounded-lg border border-stroke bg-white text-14-regular text-grey-01 outline-none focus:border-grey-06 transition-colors placeholder:text-grey-08"
          />
        </div>

        {/* Filters */}
        <select
          value={filterPhase}
          onChange={(e) => setFilterPhase(e.target.value)}
          className="text-12-regular rounded-md px-[var(--space-2)] py-[6px] border border-stroke bg-white text-grey-01 outline-none focus:border-grey-06 transition-colors cursor-pointer"
        >
          <option value="all">全部阶段</option>
          {Object.entries(phaseLabels).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>

        <select
          value={filterIndustry}
          onChange={(e) => setFilterIndustry(e.target.value)}
          className="text-12-regular rounded-md px-[var(--space-2)] py-[6px] border border-stroke bg-white text-grey-01 outline-none focus:border-grey-06 transition-colors cursor-pointer"
        >
          <option value="all">全部行业</option>
          {industryLabels.map((ind) => (
            <option key={ind} value={ind}>{ind}</option>
          ))}
        </select>

        {/* Active filter count */}
        {(filterGrade !== 'all' || filterPhase !== 'all' || filterIndustry !== 'all' || filterHealth !== 'all' || search) && (
          <button
            onClick={() => {
              setFilterGrade('all')
              setFilterPhase('all')
              setFilterIndustry('all')
              setFilterHealth('all')
              setSearch('')
            }}
            className="text-12-regular text-l-cyan bg-transparent border-none cursor-pointer font-[inherit] hover:underline"
          >
            清除筛选
          </button>
        )}

        <div className="ml-auto flex items-center gap-[var(--space-3)]">
          <span className="text-12-regular text-grey-08">共 {filteredRows.length} 个客户</span>
          <Link href="/intake">
            <Button variant="primary" className="!py-[5px] !px-[var(--space-3)]">
              <IconPlus size={14} className="mr-[4px]" />
              创建客户
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Table ── */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-stroke">
                <Th onClick={() => handleSort('name')} className="pl-[var(--space-4)]">
                  客户<SortArrow k="name" />
                </Th>
                <Th onClick={() => handleSort('grade')}>
                  评级<SortArrow k="grade" />
                </Th>
                <Th>阶段</Th>
                <Th>负责人</Th>
                <Th onClick={() => handleSort('budget')} align="right">
                  月预算<SortArrow k="budget" />
                </Th>
                <Th onClick={() => handleSort('spend')} align="right">
                  总花费<SortArrow k="spend" />
                </Th>
                <Th onClick={() => handleSort('cpa')} align="right">
                  CPA<SortArrow k="cpa" />
                </Th>
                <Th onClick={() => handleSort('roas')} align="right">
                  ROAS<SortArrow k="roas" />
                </Th>
                <Th align="center">健康度</Th>
                <Th className="pr-[var(--space-4)]">最近动态</Th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => {
                const gc = gradeConfig[row.grade] || gradeConfig.B
                const hm = healthMeta[row.health]
                const perf = row.perf?.summary
                const cpaDeviation = perf && perf.cpaTarget > 0
                  ? ((perf.cpa - perf.cpaTarget) / perf.cpaTarget) * 100
                  : null

                // Find latest changelog for this client
                const latestLog = getLatestActivity(row.id)

                return (
                  <tr
                    key={row.id}
                    className="border-b border-stroke last:border-b-0 hover:bg-selected transition-colors group"
                  >
                    {/* Client Name + Industry */}
                    <td className="py-[var(--space-2)] px-[var(--space-4)]">
                      <Link href={`/client/${row.id}`} className="flex items-center gap-[var(--space-2)] no-underline group/link">
                        <Avatar name={row.name[0]} size="sm" />
                        <div>
                          <div className="text-14-medium text-grey-01 group-hover/link:text-l-cyan transition-colors">{row.name}</div>
                          <div className="text-10-regular text-grey-08">{row.industry}</div>
                        </div>
                      </Link>
                    </td>

                    {/* Grade */}
                    <td className="py-[var(--space-2)] px-[var(--space-2)]">
                      <span className={`inline-flex items-center justify-center w-[24px] h-[24px] rounded-md text-12-bold ${gc.bg} ${gc.text}`}>
                        {row.grade}
                      </span>
                    </td>

                    {/* Phase */}
                    <td className="py-[var(--space-2)] px-[var(--space-2)]">
                      <div className="text-12-medium text-grey-01">{phaseLabels[row.phase] || '—'}</div>
                      <div className="flex items-center gap-[2px] mt-[2px]">
                        {[1, 2, 3, 4].map((p) => (
                          <span
                            key={p}
                            className={`w-[12px] h-[3px] rounded-full ${
                              p <= row.phase ? 'bg-l-cyan' : 'bg-grey-12'
                            }`}
                          />
                        ))}
                      </div>
                    </td>

                    {/* Owner */}
                    <td className="py-[var(--space-2)] px-[var(--space-2)]">
                      <div className="text-12-regular text-grey-06">{row.salesOwner || '—'}</div>
                    </td>

                    {/* Budget */}
                    <td className="py-[var(--space-2)] px-[var(--space-2)] text-right">
                      <div className="text-12-medium text-grey-01">
                        {row.budget ? `$${row.budget.toLocaleString()}` : '—'}
                      </div>
                    </td>

                    {/* Total Spend */}
                    <td className="py-[var(--space-2)] px-[var(--space-2)] text-right">
                      <div className="text-12-medium text-grey-01">
                        {perf ? `$${perf.totalSpend.toLocaleString()}` : '—'}
                      </div>
                    </td>

                    {/* CPA */}
                    <td className="py-[var(--space-2)] px-[var(--space-2)] text-right">
                      {perf ? (
                        <div>
                          <span className={`text-12-medium ${
                            cpaDeviation !== null && cpaDeviation > 30 ? 'text-red'
                              : cpaDeviation !== null && cpaDeviation > 0 ? 'text-orange'
                                : 'text-grey-01'
                          }`}>
                            ${perf.cpa.toFixed(2)}
                          </span>
                          {perf.cpaTarget > 0 && (
                            <div className="text-10-regular text-grey-08">目标 ${perf.cpaTarget.toFixed(2)}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-12-regular text-grey-08">—</span>
                      )}
                    </td>

                    {/* ROAS */}
                    <td className="py-[var(--space-2)] px-[var(--space-2)] text-right">
                      {perf ? (
                        <div>
                          <span className={`text-12-medium ${
                            perf.roas >= perf.roasTarget ? 'text-l-cyan' : perf.roas >= perf.roasTarget * 0.7 ? 'text-orange' : 'text-red'
                          }`}>
                            {perf.roas}%
                          </span>
                          {perf.roasTarget > 0 && (
                            <div className="text-10-regular text-grey-08">目标 {perf.roasTarget}%</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-12-regular text-grey-08">—</span>
                      )}
                    </td>

                    {/* Health */}
                    <td className="py-[var(--space-2)] px-[var(--space-2)] text-center">
                      <div className="inline-flex items-center gap-[4px]">
                        <span className={`w-[7px] h-[7px] rounded-full ${hm.dot}`} />
                        <span className="text-10-regular text-grey-08">{hm.label}</span>
                      </div>
                    </td>

                    {/* Latest Activity */}
                    <td className="py-[var(--space-2)] pr-[var(--space-4)] pl-[var(--space-2)]">
                      {latestLog ? (
                        <div className="max-w-[180px]">
                          <div className="text-12-regular text-grey-06 truncate">{latestLog.action}</div>
                          <div className="text-10-regular text-grey-08">{latestLog.timestamp.split(' ')[0]}</div>
                        </div>
                      ) : (
                        <span className="text-10-regular text-grey-08">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filteredRows.length === 0 && (
          <div className="py-[var(--space-8)] text-center">
            <div className="text-14-regular text-grey-08">没有匹配的客户</div>
            <button
              onClick={() => {
                setFilterGrade('all')
                setFilterPhase('all')
                setFilterIndustry('all')
                setFilterHealth('all')
                setSearch('')
              }}
              className="text-12-regular text-l-cyan bg-transparent border-none cursor-pointer mt-[var(--space-2)] font-[inherit] hover:underline"
            >
              清除所有筛选
            </button>
          </div>
        )}
      </Card>
    </div>
  )
}

/* ── Helper: Table Header Cell ── */
function Th({
  children,
  onClick,
  align = 'left',
  className = '',
}: {
  children: React.ReactNode
  onClick?: () => void
  align?: 'left' | 'right' | 'center'
  className?: string
}) {
  return (
    <th
      className={`py-[var(--space-2)] px-[var(--space-2)] text-10-regular text-grey-08 uppercase tracking-wide font-normal whitespace-nowrap ${
        align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'
      } ${onClick ? 'cursor-pointer hover:text-grey-06 select-none' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </th>
  )
}

/* ── Helper: get latest changelog for a client ── */
import { changeLogs } from '@/lib/data'

function getLatestActivity(clientId: string) {
  const logs = changeLogs.filter((l) => l.clientId === clientId)
  return logs.length > 0 ? logs[0] : null
}
