'use client'

import { useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { Dialog } from '@/components/ui/Dialog'
import { clients, ioOrders, changeLogs, complianceRequiredIndustries, clientPerformance, clientProposals, clientAssets, clientClockConfigs, learningNotes, industryTemplates, TONE_OPTIONS, gradeChangeRequests, GRADE_CHANGE_APPROVAL_STEPS } from '@/lib/data'
import type { IOOrder, ChangeLog, ClockEntry, LearningNote, GradeChangeRequest } from '@/lib/data'
import { CampaignSnapshot } from '@/components/client/CampaignSnapshot'
import { OnboardingStepper } from '@/components/client/OnboardingStepper'
import { ApprovalChain } from '@/components/ui/ApprovalChain'
import { CapabilityRadar } from '@/components/around-the-clock/CapabilityRadar'
import {
  getPersonaRadarForClient,
  getPersonaSnapshotForClient,
  getPersonaQuoteById,
  PERSONA_LOCK_STATUS_LABEL,
  getClockEntryNarrative,
  obfuscateForSophistication,
  kpiRefLabel,
  isClockOffHours,
} from '@/lib/around-the-clock'

const gradeMap: Record<string, { bg: string; text: string; border: string; label: string; glow: string }> = {
  S: { bg: 'bg-orange-tint-10', text: 'text-orange', border: 'border-orange/30', label: '战略客户', glow: 'shadow-[0_0_8px_rgba(255,160,50,0.2)]' },
  A: { bg: 'bg-cyan-tint-08', text: 'text-l-cyan', border: 'border-l-cyan/30', label: '核心客户', glow: 'shadow-[0_0_8px_rgba(0,200,200,0.15)]' },
  B: { bg: 'bg-selected', text: 'text-grey-06', border: 'border-grey-12', label: '优质客户', glow: '' },
  C: { bg: 'bg-selected', text: 'text-grey-08', border: 'border-grey-12', label: '普通客户', glow: '' },
}

const phaseLabels: Record<number, string> = {
  1: '客户触达', 2: '需求沟通', 3: '测试期', 4: '转正续约', 5: '终止处理中',
}

const categoryColors: Record<string, 'cyan' | 'grey' | 'orange' | 'red' | 'dark'> = {
  '基本信息': 'grey', 'IO 单': 'cyan', '投放': 'dark', '财务': 'orange', '合规': 'grey', '终止': 'red',
}

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [showTerminate, setShowTerminate] = useState(false)
  const [logFilter, setLogFilter] = useState<string>('全部')
  const [showGradeChange, setShowGradeChange] = useState(false)

  const client = clients.find((c) => c.id === id)
  const clientOrders = useMemo(() => ioOrders.filter((o) => o.clientId === id), [id])
  const clientLogs = useMemo(() => changeLogs.filter((l) => l.clientId === id), [id])
  const perf = useMemo(() => clientPerformance.find((p) => p.clientId === id) || null, [id])
  const proposal = useMemo(() => clientProposals.filter((p) => p.clientId === id).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0] || null, [id])
  const assets = useMemo(() => clientAssets.find((a) => a.clientId === id) || null, [id])
  const latestOrder = clientOrders[0] || null
  const activeOrders = clientOrders.filter((o) => o.status === '投放中' || o.status === '审批中')
  const totalSpend = clientOrders.reduce((s, o) => s + o.amount, 0)

  // Clock & Learning Notes data
  const clockConfig = useMemo(() => clientClockConfigs.find((c) => c.clientId === id) || null, [id])
  const personaRadar = useMemo(() => getPersonaRadarForClient(id), [id])
  const personaSnapshot = useMemo(() => getPersonaSnapshotForClient(id), [id])
  const personaQuote = useMemo(() => personaSnapshot ? getPersonaQuoteById(personaSnapshot.selectedQuoteId) : undefined, [personaSnapshot])
  const healthScoreM6 = useMemo(() => {
    const h = id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
    return 68 + (h % 24)
  }, [id])
  const clientNotes = useMemo(() => learningNotes.filter((n) => n.clientId === id).sort((a, b) => b.date.localeCompare(a.date)), [id])

  // Grade change requests
  const gradeChanges = useMemo(() => gradeChangeRequests.filter((g) => g.clientId === id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [id])
  const pendingGradeChange = gradeChanges.find((g) => g.status === 'pending_ops' || g.status === 'pending_ceo')

  if (!client) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="text-20-bold text-grey-01 mb-2">客户未找到</div>
          <Button variant="secondary" onClick={() => router.push('/clients')}>返回客户列表</Button>
        </div>
      </div>
    )
  }

  const gc = gradeMap[client.grade] || gradeMap.B
  const needsCompliance = complianceRequiredIndustries.includes(client.industry)

  return (
    <div>
      {/* ── Header: Name + Actions ── */}
      <div className="flex items-center justify-between mb-[var(--space-5)]">
        <div className="flex items-center gap-[var(--space-3)]">
          <button
            onClick={() => router.back()}
            className="bg-transparent border-none cursor-pointer text-grey-08 hover:text-grey-01 transition-colors p-0"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <h1 className="text-20-bold text-grey-01">{client.name}</h1>
          <span className={`inline-flex items-center gap-[5px] px-[10px] py-[3px] rounded-full border text-12-bold ${gc.bg} ${gc.text} ${gc.border} ${gc.glow}`}>
            <span className={`w-[6px] h-[6px] rounded-full`} style={{ backgroundColor: 'currentColor' }} />
            {client.grade} · {gc.label}
          </span>
        </div>
        <Button variant="ghost" onClick={() => setShowTerminate(true)} className="!text-red">
          终止合作
        </Button>
      </div>

      {/* ── Client Profile Bar ── */}
      {(() => {
        const actualSpend = perf?.summary.totalSpend || 0
        const remainingBudget = totalSpend - actualSpend
        return (
          <div className="rounded-xl border border-stroke bg-white mb-[var(--space-4)] overflow-hidden">
            <div className="grid grid-cols-12 gap-0">
              {/* Col 1: Asset Value + Remaining */}
              <div className="col-span-4 px-[var(--space-4)] py-[var(--space-3)] border-r border-stroke">
                <div className="text-10-regular text-grey-08 uppercase tracking-wide">资产价值</div>
                <div className="flex items-baseline gap-[var(--space-3)] mt-[2px]">
                  <span className="text-20-bold text-grey-01">${totalSpend.toLocaleString()}</span>
                  <span className="text-12-regular text-grey-08">{clientOrders.length} 个 IO 单 · {activeOrders.length} 个进行中</span>
                </div>
                <div className="flex items-center gap-[var(--space-1)] mt-[3px]">
                  <span className="text-10-regular text-grey-08">剩余预算</span>
                  <span className={`text-12-bold ${remainingBudget > 0 ? 'text-l-cyan' : 'text-orange'}`}>
                    ${remainingBudget.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Col 2: Budget + Channels */}
              <div className="col-span-3 px-[var(--space-4)] py-[var(--space-3)] border-r border-stroke">
                <div className="text-10-regular text-grey-08 uppercase tracking-wide">月预算 / 渠道</div>
                <div className="text-14-bold text-grey-01 mt-[2px]">${(client.budget || 0).toLocaleString()}</div>
                <div className="flex items-center gap-[4px] mt-[3px] flex-wrap">
                  {(client.channels || []).map((ch) => (
                    <span key={ch} className="inline-flex items-center px-[6px] py-[1px] rounded bg-bg text-12-medium text-grey-06">
                      {ch}
                    </span>
                  ))}
                </div>
              </div>

              {/* Col 3: Owner */}
              <div className="col-span-3 px-[var(--space-4)] py-[var(--space-3)] border-r border-stroke">
                <div className="text-10-regular text-grey-08 uppercase tracking-wide">归属</div>
                <div className="flex items-center gap-[var(--space-2)] mt-[4px]">
                  <Avatar name={client.salesOwner || '?'} size="sm" className="!w-[24px] !h-[24px] !text-[10px]" />
                  <div>
                    <div className="text-14-medium text-grey-01">{client.salesOwner || '—'}</div>
                    <div className="text-10-regular text-grey-08">销售负责人</div>
                  </div>
                </div>
              </div>

              {/* Col 4: Phase */}
              <div className="col-span-2 px-[var(--space-4)] py-[var(--space-3)]">
                <div className="text-10-regular text-grey-08 uppercase tracking-wide">阶段</div>
                <div className="flex items-center gap-[var(--space-1)] mt-[2px]">
                  <span className="text-14-bold text-grey-01">{phaseLabels[client.phase] || '—'}</span>
                </div>
                <div className="text-12-regular text-grey-08 mt-[3px]">{client.status}</div>
              </div>
            </div>
          </div>
        )
      })()}

      {/* ── Onboarding Progress ── */}
      {client.onboarding && <OnboardingStepper onboarding={client.onboarding} />}

      {/* ── Two-Column Layout ── */}
      <div className="grid gap-[var(--space-3)]" style={{ gridTemplateColumns: '11fr 5fr' }}>

        {/* ═══ Left Column: Main Content ═══ */}
        <div className="flex flex-col gap-[var(--space-3)]">

          {/* Campaign Performance Snapshot */}
          {perf && <CampaignSnapshot perf={perf} clientId={id} />}

          {/* Proposal Summary */}
          {proposal && (
            <Card>
              <div className="flex items-center justify-between mb-[var(--space-2)]">
                <div className="text-14-bold text-grey-01">测试期投放计划</div>
                <Link href={`/proposal?client=${id}`} className="text-12-regular text-l-cyan hover:underline">
                  查看详情
                </Link>
              </div>
              <div className="border border-stroke rounded-lg px-[var(--space-4)] py-[var(--space-3)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-[var(--space-2)]">
                    <span className="text-14-bold text-grey-01">{proposal.title}</span>
                  </div>
                  <Badge variant={
                    proposal.status === '执行中' ? 'cyan'
                      : proposal.status === '已确认' ? 'cyan'
                        : proposal.status === '待审核' ? 'orange'
                          : proposal.status === '草稿' ? 'grey'
                            : 'grey'
                  }>{proposal.status}</Badge>
                </div>
                <div className="flex items-center gap-[var(--space-3)] mt-[var(--space-2)] text-12-regular text-grey-08">
                  <span>{proposal.type}</span>
                  <span>{proposal.channels.join(' / ')}</span>
                  <span>${proposal.budget.toLocaleString()}</span>
                  <span>{proposal.period}</span>
                </div>
                {/* KPI Targets */}
                <div className="flex items-center gap-[var(--space-4)] mt-[var(--space-2)] pt-[var(--space-2)] border-t border-stroke">
                  {proposal.kpiTargets.cpa && (
                    <div className="text-12-regular">
                      <span className="text-grey-08">目标 CPA </span>
                      <span className="text-grey-01 font-medium">${proposal.kpiTargets.cpa.toFixed(2)}</span>
                    </div>
                  )}
                  {proposal.kpiTargets.roas && (
                    <div className="text-12-regular">
                      <span className="text-grey-08">目标 ROAS </span>
                      <span className="text-grey-01 font-medium">{proposal.kpiTargets.roas}%</span>
                    </div>
                  )}
                  {proposal.kpiTargets.installs && (
                    <div className="text-12-regular">
                      <span className="text-grey-08">预估安装 </span>
                      <span className="text-grey-01 font-medium">{proposal.kpiTargets.installs.toLocaleString()}</span>
                    </div>
                  )}
                </div>
                {/* Strategies */}
                <div className="flex items-center gap-[4px] mt-[var(--space-2)] flex-wrap">
                  {proposal.strategies.map((s) => (
                    <span key={s} className="inline-flex items-center px-[6px] py-[1px] rounded bg-bg text-10-regular text-grey-06">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Latest IO Order */}
          <Card>
            <div className="flex items-center justify-between mb-[var(--space-2)]">
              <div className="text-14-bold text-grey-01">最近 IO 单</div>
              {latestOrder && (
                <div className="flex items-center gap-[var(--space-3)]">
                  <Link href={`/io-orders?client=${id}`} className="text-12-regular text-l-cyan hover:underline">
                    查看所有 IO 单
                  </Link>
                  <button
                    onClick={() => router.push(`/io-orders/new?client=${id}`)}
                    className="text-12-medium text-grey-01 bg-selected hover:bg-grey-12 border-none rounded-md px-[var(--space-2)] py-[3px] cursor-pointer transition-colors font-[inherit]"
                  >
                    + 新建
                  </button>
                </div>
              )}
            </div>
            {latestOrder ? (
              <div className="border border-stroke rounded-lg px-[var(--space-4)] py-[var(--space-3)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-[var(--space-2)]">
                    <span className="text-14-bold text-grey-01">{latestOrder.id}</span>
                    <Badge variant={latestOrder.type === '新建投放' ? 'cyan' : latestOrder.type === '变更需求' ? 'orange' : 'red'}>
                      {latestOrder.type}
                    </Badge>
                    <Badge variant={
                      latestOrder.status === '投放中' ? 'cyan'
                        : latestOrder.status === '已完成' ? 'grey'
                          : latestOrder.status.includes('终止') ? 'red'
                            : 'orange'
                    }>{latestOrder.status}</Badge>
                  </div>
                  <span className="text-16-bold text-grey-01">${latestOrder.amount.toLocaleString()}</span>
                </div>
                <div className="text-12-regular text-grey-08 mt-[var(--space-1)]">
                  {latestOrder.createdAt} · {latestOrder.channels.join(' / ')} · {latestOrder.period}
                </div>
                {/* Approval Chain */}
                {latestOrder.fullApprovalChain ? (
                  <div className="mt-[var(--space-2)] pt-[var(--space-2)] border-t border-stroke">
                    <ApprovalChain steps={latestOrder.fullApprovalChain} />
                  </div>
                ) : (
                  <div className="flex items-center gap-[var(--space-2)] mt-[var(--space-2)] pt-[var(--space-2)] border-t border-stroke">
                    {latestOrder.approvals.map((a, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <span className={`w-[5px] h-[5px] rounded-full ${
                          a.status === 'approved' ? 'bg-l-cyan' : a.status === 'rejected' ? 'bg-red' : 'bg-grey-12'
                        }`} />
                        <span className="text-10-regular text-grey-08">{a.role}</span>
                        {i < latestOrder.approvals.length - 1 && <span className="text-grey-12 text-10-regular">→</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="border border-dashed border-grey-12 rounded-lg p-[var(--space-5)] text-center">
                <p className="text-12-regular text-grey-08 mb-[var(--space-2)]">暂无 IO 单</p>
                <Button variant="secondary" onClick={() => router.push(`/io-orders/new?client=${id}`)}>
                  创建 IO 单
                </Button>
              </div>
            )}
          </Card>

          {/* Timeline / Change Logs */}
          <Card>
            <div className="flex items-center justify-between mb-[var(--space-3)]">
              <div className="text-14-bold text-grey-01">时间线</div>
              <div className="flex gap-[var(--space-1)]">
                {['全部', '投放', 'IO 单', '财务', '其他'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setLogFilter(f)}
                    className={`px-[var(--space-2)] py-[3px] rounded-full text-10-regular border-none cursor-pointer transition-colors font-[inherit] ${
                      logFilter === f
                        ? 'bg-grey-01 text-white'
                        : 'bg-selected text-grey-06 hover:bg-grey-12'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            {(() => {
              const logCategoryMap: Record<string, ChangeLog['category'][]> = {
                '全部': [],
                '投放': ['投放'],
                'IO 单': ['IO 单'],
                '财务': ['财务'],
                '其他': ['基本信息', '合规', '终止'],
              }
              const cats = logCategoryMap[logFilter] || []
              const filteredLogs = cats.length === 0 ? clientLogs : clientLogs.filter((l) => cats.includes(l.category))
              return filteredLogs.length === 0 ? (
              <p className="text-12-regular text-grey-08 py-[var(--space-4)] text-center">暂无操作记录</p>
            ) : (
              <div className="relative ml-[14px] pl-[var(--space-4)]">
                {/* Vertical line */}
                <div className="absolute left-0 top-[2px] bottom-[2px] w-[1.5px] bg-grey-12" />

                {filteredLogs.map((log, i) => (
                  <div key={log.id} className="relative pb-[var(--space-4)] last:pb-0">
                    {/* Dot */}
                    <div
                      className={`absolute top-[5px] w-[8px] h-[8px] rounded-full ${i === 0 ? 'bg-grey-01' : 'bg-grey-12'}`}
                      style={{ left: 'calc(var(--space-4) * -1 - 4.5px)' }}
                    />

                    <div className="flex items-start justify-between gap-[var(--space-3)]">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-[var(--space-1)]">
                          <Badge variant={categoryColors[log.category] || 'grey'}>{log.category}</Badge>
                          <span className="text-14-medium text-grey-01">{log.action}</span>
                        </div>
                        <p className="text-12-regular text-grey-08 mt-[2px] leading-relaxed">{log.detail}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="text-12-regular text-grey-08">{log.timestamp.split(' ')[0]}</div>
                        <div className="text-10-regular text-grey-08">{log.operator}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
            })()}
          </Card>
        </div>

        {/* ═══ Right Column: Sidebar ═══ */}
        <div className="flex flex-col gap-[var(--space-3)]">

          {/* Client Info */}
          <Card padding="none">
            <div className="px-[var(--space-4)] pt-[var(--space-3)] pb-[var(--space-1)] flex items-center justify-between">
              <div className="text-12-bold text-grey-06 uppercase tracking-wide">客户信息</div>
              <button className="bg-transparent border-none cursor-pointer text-grey-08 hover:text-grey-01 p-0">
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <circle cx="12" cy="6" r="1.5" fill="currentColor" />
                  <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                  <circle cx="12" cy="18" r="1.5" fill="currentColor" />
                </svg>
              </button>
            </div>

            <div className="px-[var(--space-4)] pb-[var(--space-3)]">
              {/* Contact */}
              <div className="py-[var(--space-2)]">
                <div className="text-10-regular text-grey-08 mb-[2px]">联系人</div>
                <div className="text-14-medium text-grey-01">{client.contact || '—'}</div>
                {client.phone && <div className="text-12-regular text-grey-08 mt-[1px]">{client.phone}</div>}
                {client.email && (
                  <div className="text-12-regular text-l-cyan mt-[1px]">{client.email}</div>
                )}
              </div>

              <div className="h-[1px] bg-stroke" />

              {/* Business Info */}
              <div className="py-[var(--space-2)]">
                <div className="flex flex-col gap-[5px]">
                  {[
                    ['行业', client.industry],
                    ['测试预算', client.testBudget ? `$${client.testBudget.toLocaleString()}` : '—'],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between text-12-regular">
                      <span className="text-grey-08">{label}</span>
                      <span className="text-grey-01 font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </Card>

          {/* Grade Detail */}
          <Card padding="none">
            <div className="px-[var(--space-4)] pt-[var(--space-3)] pb-[var(--space-1)] flex items-center justify-between">
              <div className="text-12-bold text-grey-06 uppercase tracking-wide">评级详情</div>
              {pendingGradeChange ? (
                <Badge variant="orange">变更审批中</Badge>
              ) : (
                <button
                  onClick={() => setShowGradeChange(true)}
                  className="text-10-regular text-l-cyan hover:underline bg-transparent border-none cursor-pointer font-[inherit] p-0"
                >
                  申请变更
                </button>
              )}
            </div>
            <div className="px-[var(--space-4)] pb-[var(--space-3)]">
              <div className="flex items-center gap-[var(--space-2)] mb-[var(--space-2)]">
                <span className={`inline-flex items-center justify-center w-[28px] h-[28px] rounded-md text-14-bold ${gc.bg} ${gc.text}`}>
                  {client.grade}
                </span>
                <div>
                  <div className="text-14-medium text-grey-01">{gc.label}</div>
                  <div className="text-10-regular text-grey-08">
                    {client.grade === 'S' ? '≥ 85 分' : client.grade === 'A' ? '70-84 分' : client.grade === 'B' ? '50-69 分' : '< 50 分'}
                  </div>
                </div>
              </div>
              <div className="text-12-regular text-grey-08 leading-relaxed">
                {client.grade === 'S' && 'VIP 专属服务通道，配备高级投手团队，每日数据同步'}
                {client.grade === 'A' && '优先资源配置，高级投手跟进，每周两次复盘'}
                {client.grade === 'B' && '标准测试期服务，常规投放流程，每周一次复盘'}
                {client.grade === 'C' && '基础服务，需进一步评估合作可行性'}
              </div>

              {/* Pending grade change card */}
              {pendingGradeChange && (
                <div className="mt-[var(--space-3)] p-[var(--space-3)] rounded-lg border border-orange/20 bg-orange-tint-10">
                  <div className="flex items-center justify-between mb-[var(--space-2)]">
                    <div className="flex items-center gap-[var(--space-2)]">
                      <span className="text-12-bold text-orange">变更申请</span>
                      <span className="text-12-medium text-grey-01">
                        {pendingGradeChange.fromGrade} → {pendingGradeChange.toGrade}
                      </span>
                    </div>
                    <span className="text-10-regular text-grey-08">{pendingGradeChange.createdAt}</span>
                  </div>
                  <p className="text-12-regular text-grey-06 line-clamp-2 mb-[var(--space-2)]">{pendingGradeChange.reason}</p>
                  {/* Mini step progress */}
                  <div className="flex items-center gap-[var(--space-1)]">
                    {pendingGradeChange.steps.map((step, i) => (
                      <div key={step.role} className="flex items-center gap-[var(--space-1)]">
                        <span className={`w-[6px] h-[6px] rounded-full ${
                          step.status === 'done' ? 'bg-l-cyan' : step.status === 'current' ? 'bg-orange' : 'bg-grey-12'
                        }`} />
                        <span className={`text-10-regular ${step.status === 'current' ? 'text-orange' : step.status === 'done' ? 'text-l-cyan' : 'text-grey-08'}`}>
                          {step.role}
                        </span>
                        {i < pendingGradeChange.steps.length - 1 && (
                          <span className="text-grey-12 text-10-regular mx-[2px]">→</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Grade change history */}
              {gradeChanges.length > 0 && (
                <div className="mt-[var(--space-3)] pt-[var(--space-3)] border-t border-stroke">
                  <div className="text-10-regular text-grey-08 uppercase tracking-wide mb-[var(--space-2)]">变更记录</div>
                  <div className="flex flex-col gap-[var(--space-2)]">
                    {gradeChanges.map((gc) => {
                      const isApproved = gc.status === 'approved'
                      const isRejected = gc.status === 'rejected'
                      const isPending = gc.status === 'pending_ops' || gc.status === 'pending_ceo'
                      return (
                        <div key={gc.id} className="flex items-center gap-[var(--space-2)]">
                          <span className={`w-[5px] h-[5px] rounded-full shrink-0 ${
                            isApproved ? 'bg-l-cyan' : isRejected ? 'bg-red' : 'bg-orange'
                          }`} />
                          <span className="text-12-medium text-grey-01">{gc.fromGrade} → {gc.toGrade}</span>
                          <span className={`text-10-regular ${
                            isApproved ? 'text-l-cyan' : isRejected ? 'text-red' : 'text-orange'
                          }`}>
                            {isApproved ? '已通过' : isRejected ? '已驳回' : '审批中'}
                          </span>
                          <span className="text-10-regular text-grey-08 ml-auto">{gc.createdAt}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Asset Overview */}
          {assets && (
            <Card padding="none">
              <div className="px-[var(--space-4)] pt-[var(--space-3)] pb-[var(--space-1)] flex items-center justify-between">
                <div className="text-12-bold text-grey-06 uppercase tracking-wide">资产概览</div>
                <Link href={`/assets?client=${id}`} className="text-10-regular text-l-cyan hover:underline">
                  查看详情
                </Link>
              </div>
              <div className="px-[var(--space-4)] pb-[var(--space-3)]">
                {/* Counts row */}
                <div className="grid grid-cols-3 gap-[var(--space-2)] mb-[var(--space-2)]">
                  <div className="bg-bg rounded-md px-[var(--space-2)] py-[var(--space-1)] text-center">
                    <div className="text-14-bold text-grey-01">{assets.adAccounts.active}/{assets.adAccounts.total}</div>
                    <div className="text-10-regular text-grey-08">广告账户</div>
                  </div>
                  <div className="bg-bg rounded-md px-[var(--space-2)] py-[var(--space-1)] text-center">
                    <div className="text-14-bold text-grey-01">{assets.creatives.active}/{assets.creatives.total}</div>
                    <div className="text-10-regular text-grey-08">素材创意</div>
                  </div>
                  <div className="bg-bg rounded-md px-[var(--space-2)] py-[var(--space-1)] text-center">
                    <div className="text-14-bold text-grey-01">{assets.audiences.active}/{assets.audiences.total}</div>
                    <div className="text-10-regular text-grey-08">人群包</div>
                  </div>
                </div>

                <div className="h-[1px] bg-stroke" />

                {/* Tracking & Compliance */}
                <div className="flex flex-col gap-[5px] pt-[var(--space-2)]">
                  <div className="flex justify-between text-12-regular">
                    <span className="text-grey-08">主力格式</span>
                    <span className="text-grey-01 font-medium">{assets.creatives.topFormat}</span>
                  </div>
                  <div className="flex justify-between text-12-regular">
                    <span className="text-grey-08">Pixel</span>
                    <span className={assets.tracking.pixelStatus === '正常' ? 'text-l-cyan' : assets.tracking.pixelStatus === '异常' ? 'text-red' : 'text-grey-08'}>
                      {assets.tracking.pixelStatus}
                    </span>
                  </div>
                  <div className="flex justify-between text-12-regular">
                    <span className="text-grey-08">SDK</span>
                    <span className={assets.tracking.sdkStatus === '正常' ? 'text-l-cyan' : assets.tracking.sdkStatus === '异常' ? 'text-red' : 'text-grey-08'}>
                      {assets.tracking.sdkStatus}
                    </span>
                  </div>
                  <div className="flex justify-between text-12-regular">
                    <span className="text-grey-08">资质合规</span>
                    <span className={
                      assets.compliance.status === '已通过' ? 'text-l-cyan'
                        : assets.compliance.status === '即将过期' ? 'text-orange'
                          : assets.compliance.status === '审核中' ? 'text-grey-06'
                            : 'text-red'
                    }>
                      {assets.compliance.status}
                      {assets.compliance.expiresAt && ` · ${assets.compliance.expiresAt}`}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Persona capability radar */}
          <Card padding="none">
            <div className="px-[var(--space-4)] pt-[var(--space-3)] pb-[var(--space-1)]">
              <div className="flex items-center justify-between">
                <div className="text-12-bold text-grey-06 uppercase tracking-wide">Persona</div>
                <div className="flex items-center gap-[var(--space-1)]">
                  {personaSnapshot?.isDemo && (
                    <span role="status" className="text-10-regular px-[6px] py-[1px] rounded-full bg-grey-12 text-grey-08">演示数据</span>
                  )}
                  {personaSnapshot && (
                    <span className={`text-10-regular px-[6px] py-[1px] rounded-full ${
                      personaSnapshot.lockStatus === 'locked' ? 'bg-cyan-tint-08 text-l-cyan' :
                      personaSnapshot.lockStatus === 'in_review' ? 'bg-orange-tint-10 text-orange' :
                      'bg-grey-12 text-grey-06'
                    }`}>
                      {PERSONA_LOCK_STATUS_LABEL[personaSnapshot.lockStatus]}
                    </span>
                  )}
                </div>
              </div>
              {personaSnapshot && (
                <p className="text-10-regular text-grey-08 mt-[var(--space-1)]">
                  {personaSnapshot.evaluationPeriod.start.slice(5)} – {personaSnapshot.evaluationPeriod.end.slice(5)}
                </p>
              )}
            </div>
            {personaQuote && (
              <div className="px-[var(--space-4)] pb-[var(--space-2)]">
                <p className="text-10-regular text-grey-08">
                  {personaQuote.author} ({personaQuote.authorLifespan})
                </p>
                <blockquote className="text-14-medium text-grey-01 mt-[var(--space-1)] italic leading-relaxed">
                  &ldquo;{personaSnapshot?.copyOverride || personaQuote.text}&rdquo;
                </blockquote>
              </div>
            )}
            <div className="px-[var(--space-4)] pb-[var(--space-3)] flex justify-center">
              <CapabilityRadar scores={personaRadar} previousScores={personaSnapshot?.previous} />
            </div>
          </Card>

          {/* Clock Overview */}
          <Card padding="none">
            <div className="px-[var(--space-4)] pt-[var(--space-3)] pb-[var(--space-1)] flex items-center justify-between gap-[var(--space-2)] flex-wrap">
              <div className="text-12-bold text-grey-06 uppercase tracking-wide">Around the Clock</div>
              <div className="flex items-center gap-[var(--space-3)]">
                <Link href={`/clock-config?client=${id}&tab=review`} className="text-10-regular text-l-cyan hover:underline">
                  审核工作台
                </Link>
                <Link href={`/clock-config?client=${id}`} className="text-10-regular text-l-cyan hover:underline">
                  Timeline 配置
                </Link>
              </div>
            </div>
            <div className="px-[var(--space-4)] pb-[var(--space-3)]">
              {clockConfig ? (() => {
                const activeEntries = clockConfig.entries.filter((e) => e.active)
                const toneLabel = TONE_OPTIONS.find((t) => t.value === clockConfig.tone)?.label || clockConfig.tone
                const template = industryTemplates.find((t) => t.id === clockConfig.templateId)
                const soph = clockConfig.clientSophistication || 'standard'
                return (
                  <>
                    {/* Stats row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-[var(--space-2)] mb-[var(--space-2)]">
                      <div className="bg-bg rounded-md px-[var(--space-2)] py-[var(--space-1)] text-center">
                        <div className="text-14-bold text-grey-01">{clockConfig.entries.length}</div>
                        <div className="text-10-regular text-grey-08">总条目</div>
                      </div>
                      <div className="bg-bg rounded-md px-[var(--space-2)] py-[var(--space-1)] text-center">
                        <div className="text-14-bold text-l-cyan">{activeEntries.length}</div>
                        <div className="text-10-regular text-grey-08">已启用</div>
                      </div>
                      <div className="bg-bg rounded-md px-[var(--space-2)] py-[var(--space-1)] text-center">
                        <div className="text-14-bold text-l-cyan">{healthScoreM6}</div>
                        <div className="text-10-regular text-grey-08">健康分 M6</div>
                      </div>
                      <div className="bg-bg rounded-md px-[var(--space-2)] py-[var(--space-1)] text-center">
                        <div className="text-14-bold text-grey-01">{toneLabel}</div>
                        <div className="text-10-regular text-grey-08">语气</div>
                      </div>
                    </div>

                    <div className="h-[1px] bg-stroke" />

                    {/* Mini timeline preview — top 4 entries */}
                    <div className="flex flex-col gap-[6px] pt-[var(--space-2)]">
                      {activeEntries.slice(0, 4).map((entry) => {
                        const nar = getClockEntryNarrative(entry)
                        const line = obfuscateForSophistication(
                          `${nar.signal} → ${nar.action}`,
                          soph
                        )
                        return (
                          <div key={entry.id} className="flex items-start gap-[var(--space-2)]">
                            <div className="w-[40px] shrink-0">
                              <span className="text-12-bold text-grey-06 block">{entry.time}</span>
                              {isClockOffHours(entry.time) && (
                                <span className="text-10-regular text-orange">非办公</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-[4px] mb-[2px]">
                                <span className={`inline-flex items-center px-[5px] py-[1px] rounded text-10-regular ${
                                  entry.category === 'Bidding' ? 'bg-cyan-tint-08 text-l-cyan'
                                    : entry.category === 'Creative' ? 'bg-orange-tint-10 text-orange'
                                      : entry.category === 'Monitor' ? 'bg-selected text-grey-06'
                                        : 'bg-bg text-grey-06'
                                }`}>{entry.category}</span>
                                {entry.kpiRefs?.map((k) => (
                                  <span key={k} className="text-10-medium text-l-cyan bg-cyan-tint-08 px-[4px] py-[1px] rounded">
                                    {kpiRefLabel(k)}
                                  </span>
                                ))}
                              </div>
                              <span className="text-12-regular text-grey-08 line-clamp-2">{line}</span>
                            </div>
                          </div>
                        )
                      })}
                      {activeEntries.length > 4 && (
                        <div className="text-10-regular text-grey-08 text-center pt-[2px]">
                          还有 {activeEntries.length - 4} 个条目...
                        </div>
                      )}
                    </div>

                    {/* Footer info */}
                    <div className="flex items-center justify-between mt-[var(--space-2)] pt-[var(--space-2)] border-t border-stroke">
                      {template && (
                        <span className="text-10-regular text-grey-08">模板: {template.name}</span>
                      )}
                      {clockConfig.lastPublished && (
                        <span className="text-10-regular text-grey-08">发布于 {clockConfig.lastPublished}</span>
                      )}
                    </div>
                  </>
                )
              })() : (
                <div className="py-[var(--space-3)] text-center">
                  <div className="text-12-regular text-grey-08 mb-[var(--space-2)]">尚未配置 Clock 内容</div>
                  <Link
                    href={`/clock-config?client=${id}`}
                    className="inline-flex items-center px-[var(--space-3)] py-[5px] rounded-md text-12-medium bg-grey-01 text-white hover:bg-grey-06 transition-colors no-underline"
                  >
                    前往配置
                  </Link>
                </div>
              )}
            </div>
          </Card>

          {/* Learning Notes */}
          <Card padding="none">
            <div className="px-[var(--space-4)] pt-[var(--space-3)] pb-[var(--space-1)] flex items-center justify-between">
              <div className="text-12-bold text-grey-06 uppercase tracking-wide">学习笔记</div>
              <Link href={`/learning-notes?client=${id}`} className="text-10-regular text-l-cyan hover:underline">
                管理笔记
              </Link>
            </div>
            <div className="px-[var(--space-4)] pb-[var(--space-3)]">
              {clientNotes.length > 0 ? (
                <>
                  {/* Stats */}
                  <div className="flex items-center gap-[var(--space-3)] mb-[var(--space-2)]">
                    <div className="flex items-center gap-[4px]">
                      <span className="w-[6px] h-[6px] rounded-full bg-l-cyan" />
                      <span className="text-12-medium text-grey-01">{clientNotes.filter((n) => n.status === 'published').length}</span>
                      <span className="text-10-regular text-grey-08">已发布</span>
                    </div>
                    <div className="flex items-center gap-[4px]">
                      <span className="w-[6px] h-[6px] rounded-full bg-grey-12" />
                      <span className="text-12-medium text-grey-01">{clientNotes.filter((n) => n.status === 'draft').length}</span>
                      <span className="text-10-regular text-grey-08">草稿</span>
                    </div>
                  </div>

                  <div className="h-[1px] bg-stroke" />

                  {/* Recent notes list */}
                  <div className="flex flex-col gap-[var(--space-2)] pt-[var(--space-2)]">
                    {clientNotes.slice(0, 3).map((note) => (
                      <div key={note.id} className="group">
                        <div className="flex items-start gap-[var(--space-2)]">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-[4px] mb-[2px]">
                              <span className={`inline-flex items-center px-[5px] py-[1px] rounded text-10-regular ${
                                note.type === 'LIVE CAMPAIGN' ? 'bg-cyan-tint-08 text-l-cyan'
                                  : note.type === 'A/B TEST RESULT' ? 'bg-orange-tint-10 text-orange'
                                    : 'bg-selected text-grey-06'
                              }`}>{note.type === 'LIVE CAMPAIGN' ? 'LIVE' : note.type === 'A/B TEST RESULT' ? 'A/B' : 'OPT'}</span>
                              <span className={`w-[5px] h-[5px] rounded-full ${note.status === 'published' ? 'bg-l-cyan' : 'bg-grey-12'}`} />
                            </div>
                            <div className="text-12-medium text-grey-01 truncate">{note.title}</div>
                            <div className="text-10-regular text-grey-08 mt-[1px]">{note.date}</div>
                          </div>
                        </div>
                        {/* Capability tags */}
                        {note.capabilityTags.length > 0 && (
                          <div className="flex items-center gap-[4px] mt-[4px] flex-wrap">
                            {note.capabilityTags.slice(0, 3).map((tag) => (
                              <span
                                key={tag.skill}
                                className={`inline-flex items-center px-[5px] py-[1px] rounded text-10-regular ${
                                  tag.delta > 0 ? 'bg-cyan-tint-08 text-l-cyan' : 'bg-red-tint-08 text-red'
                                }`}
                              >
                                {tag.delta > 0 ? '↑' : '↓'} {tag.skill} {tag.delta > 0 ? '+' : ''}{tag.delta}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {clientNotes.length > 3 && (
                    <div className="text-center pt-[var(--space-2)]">
                      <Link href={`/learning-notes?client=${id}`} className="text-10-regular text-l-cyan hover:underline">
                        查看全部 {clientNotes.length} 条笔记
                      </Link>
                    </div>
                  )}
                </>
              ) : (
                <div className="py-[var(--space-3)] text-center">
                  <div className="text-12-regular text-grey-08 mb-[var(--space-2)]">暂无学习笔记</div>
                  <Link
                    href={`/learning-notes?client=${id}`}
                    className="inline-flex items-center px-[var(--space-3)] py-[5px] rounded-md text-12-medium bg-grey-01 text-white hover:bg-grey-06 transition-colors no-underline"
                  >
                    新建笔记
                  </Link>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Termination Dialog */}
      <TerminationDialog
        open={showTerminate}
        onClose={() => setShowTerminate(false)}
        client={client}
      />

      {/* Grade Change Dialog */}
      {showGradeChange && (
        <GradeChangeDialog
          open
          onClose={() => setShowGradeChange(false)}
          client={client}
          currentGrade={client.grade}
        />
      )}
    </div>
  )
}

/* ── Termination Dialog ── */
function TerminationDialog({ open, onClose, client }: {
  open: boolean
  onClose: () => void
  client: { id: string; name: string; budget?: number; testBudget?: number }
}) {
  const [step, setStep] = useState(0)
  const [reason, setReason] = useState('')
  const [type, setType] = useState('')

  const totalCharged = client.budget || 0
  const consumed = Math.round(totalCharged * 0.35)
  const serviceFee = Math.round(consumed * 0.15)
  const refund = totalCharged - consumed - serviceFee

  const handleSubmit = () => setStep(1)

  const handleClose = () => {
    setStep(0)
    setReason('')
    setType('')
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} title="终止合作申请" width={560}>
      {step === 0 ? (
        <div className="flex flex-col gap-[var(--space-4)]">
          <div>
            <div className="text-12-medium text-grey-08 mb-[var(--space-1)]">客户</div>
            <div className="text-14-bold text-grey-01">{client.name}</div>
          </div>

          <div>
            <div className="text-12-medium text-grey-08 mb-[var(--space-2)]">终止类型</div>
            <div className="flex gap-[var(--space-2)]">
              {['客户主动', '效果不达标', '合规问题', '其他'].map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`px-[var(--space-3)] py-[var(--space-2)] rounded-lg text-12-medium border cursor-pointer transition-colors font-[inherit] ${
                    type === t
                      ? 'bg-grey-01 text-white border-grey-01'
                      : 'bg-white text-grey-06 border-stroke hover:border-grey-06'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-12-medium text-grey-08 mb-[var(--space-1)]">终止原因</div>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="请详细描述终止原因..."
              className="w-full h-[80px] p-[var(--space-3)] rounded-lg border border-stroke text-14-regular resize-none outline-none focus:border-grey-01 transition-colors"
            />
          </div>

          <div className="bg-bg rounded-lg p-[var(--space-4)]">
            <div className="text-12-bold text-grey-06 mb-[var(--space-2)]">退款估算</div>
            <div className="flex flex-col gap-[var(--space-1)]">
              {[
                ['充值总额', `$${totalCharged.toLocaleString()}`],
                ['已消耗', `-$${consumed.toLocaleString()}`],
                ['服务费 (15%)', `-$${serviceFee.toLocaleString()}`],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between text-12-regular">
                  <span className="text-grey-08">{label}</span>
                  <span className="text-grey-06">{value}</span>
                </div>
              ))}
              <div className="flex justify-between text-14-bold mt-[var(--space-2)] pt-[var(--space-2)] border-t border-stroke">
                <span className="text-grey-01">预估退款</span>
                <span className="text-orange">${refund.toLocaleString()}</span>
              </div>
            </div>
            <p className="text-10-regular text-grey-08 mt-[var(--space-2)]">
              最终金额以财务核算为准
            </p>
          </div>

          <div className="flex justify-end gap-[var(--space-2)]">
            <Button variant="secondary" onClick={handleClose}>取消</Button>
            <Button variant="destructive" onClick={handleSubmit} disabled={!type}>提交终止申请</Button>
          </div>
        </div>
      ) : (
        <div className="text-center py-[var(--space-4)]">
          <svg width="48" height="48" className="mx-auto mb-[var(--space-3)] text-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-16-bold text-grey-01 mb-1">终止申请已提交</div>
          <p className="text-12-regular text-grey-08 mb-[var(--space-4)]">
            将进入审批流程：销售确认 → 运营暂停 → 交付交割 → 财务退款
          </p>
          <div className="flex items-center justify-center gap-[var(--space-6)] text-12-regular">
            {['销售确认', '运营暂停', '交付交割', '财务退款'].map((s, i) => (
              <div key={s} className="flex items-center gap-[var(--space-1)]">
                <span className={`w-[6px] h-[6px] rounded-full ${i === 0 ? 'bg-orange' : 'bg-grey-12'}`} />
                <span className={i === 0 ? 'text-orange' : 'text-grey-08'}>{s}</span>
              </div>
            ))}
          </div>
          <div className="mt-[var(--space-5)]">
            <Button onClick={handleClose}>关闭</Button>
          </div>
        </div>
      )}
    </Dialog>
  )
}

/* ── Grade Change Request Dialog ── */
const GRADE_OPTIONS = [
  { value: 'S', label: '战略客户', desc: 'VIP 专属服务通道，配备高级投手团队', score: '≥ 85 分', bg: 'bg-orange-tint-10', text: 'text-orange', border: 'border-orange/30' },
  { value: 'A', label: '核心客户', desc: '优先资源配置，高级投手跟进', score: '70-84 分', bg: 'bg-cyan-tint-08', text: 'text-l-cyan', border: 'border-l-cyan/30' },
  { value: 'B', label: '优质客户', desc: '标准测试期服务，常规投放流程', score: '50-69 分', bg: 'bg-selected', text: 'text-grey-06', border: 'border-grey-12' },
  { value: 'C', label: '普通客户', desc: '基础服务，需进一步评估', score: '< 50 分', bg: 'bg-selected', text: 'text-grey-08', border: 'border-grey-12' },
]

function GradeChangeDialog({ open, onClose, client, currentGrade }: {
  open: boolean
  onClose: () => void
  client: { id: string; name: string; salesOwner?: string }
  currentGrade: string
}) {
  const [targetGrade, setTargetGrade] = useState('')
  const [reason, setReason] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const currentOpt = GRADE_OPTIONS.find((g) => g.value === currentGrade)
  const targetOpt = GRADE_OPTIONS.find((g) => g.value === targetGrade)
  const canSubmit = targetGrade && targetGrade !== currentGrade && reason.trim().length >= 10

  const handleSubmit = () => {
    if (!canSubmit) return
    setSubmitted(true)
  }

  return (
    <Dialog open={open} onClose={onClose} title="申请评级变更" width={520}>
      {!submitted ? (
        <div className="flex flex-col gap-[var(--space-4)]">
          {/* Current grade */}
          <div>
            <div className="text-12-medium text-grey-06 mb-[var(--space-2)]">当前评级</div>
            {currentOpt && (
              <div className={`flex items-center gap-[var(--space-3)] p-[var(--space-3)] rounded-lg border ${currentOpt.border} ${currentOpt.bg}`}>
                <span className={`inline-flex items-center justify-center w-[36px] h-[36px] rounded-md text-16-bold ${currentOpt.bg} ${currentOpt.text}`}>
                  {currentGrade}
                </span>
                <div>
                  <div className={`text-14-bold ${currentOpt.text}`}>{currentOpt.label}</div>
                  <div className="text-12-regular text-grey-08">{currentOpt.score}</div>
                </div>
              </div>
            )}
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--grey-08)" strokeWidth="2" strokeLinecap="round">
              <path d="M12 5v14M19 12l-7 7-7-7" />
            </svg>
          </div>

          {/* Target grade selection */}
          <div>
            <div className="text-12-medium text-grey-06 mb-[var(--space-2)]">目标评级</div>
            <div className="grid grid-cols-4 gap-[var(--space-2)]">
              {GRADE_OPTIONS.filter((g) => g.value !== currentGrade).map((g) => (
                <button
                  key={g.value}
                  onClick={() => setTargetGrade(g.value)}
                  className={`flex flex-col items-center gap-[4px] p-[var(--space-3)] rounded-lg border transition-all cursor-pointer font-[inherit] ${
                    targetGrade === g.value
                      ? `${g.border} ${g.bg} ring-2 ring-offset-1 ring-current ${g.text}`
                      : 'border-stroke bg-white hover:bg-selected'
                  }`}
                >
                  <span className={`text-16-bold ${targetGrade === g.value ? g.text : 'text-grey-01'}`}>{g.value}</span>
                  <span className={`text-10-regular ${targetGrade === g.value ? g.text : 'text-grey-08'}`}>{g.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Reason */}
          <div>
            <div className="text-12-medium text-grey-06 mb-[var(--space-2)]">
              变更理由 <span className="text-red">*</span>
              <span className="text-10-regular text-grey-08 ml-[var(--space-1)]">（至少 10 字）</span>
            </div>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="请详细说明变更评级的原因，包括数据支撑、客户表现等..."
              rows={4}
              className="w-full rounded-lg border border-stroke px-[var(--space-3)] py-[var(--space-2)] text-14-regular text-grey-01 outline-none focus:border-grey-06 transition-colors resize-none placeholder:text-grey-08"
            />
            <div className="text-10-regular text-grey-08 mt-[2px] text-right">{reason.length} 字</div>
          </div>

          {/* Approval preview */}
          {targetGrade && targetGrade !== currentGrade && (
            <div className="p-[var(--space-3)] rounded-lg bg-bg">
              <div className="text-10-regular text-grey-08 uppercase tracking-wide mb-[var(--space-2)]">审批流程预览</div>
              <div className="flex items-center gap-[var(--space-3)]">
                {GRADE_CHANGE_APPROVAL_STEPS.map((step, i) => (
                  <div key={step.role} className="flex items-center gap-[var(--space-2)]">
                    <div className="flex items-center gap-[4px]">
                      <span className={`w-[6px] h-[6px] rounded-full ${i === 0 ? 'bg-l-cyan' : 'bg-grey-12'}`} />
                      <span className="text-12-medium text-grey-01">{step.label}</span>
                    </div>
                    {i < GRADE_CHANGE_APPROVAL_STEPS.length - 1 && (
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="var(--grey-08)" strokeWidth="1.5" strokeLinecap="round">
                        <path d="M6 4l4 4-4 4" />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-[var(--space-2)] pt-[var(--space-2)]">
            <Button variant="ghost" onClick={onClose}>取消</Button>
            <Button onClick={handleSubmit} className={!canSubmit ? '!opacity-40 !cursor-not-allowed' : ''}>
              提交申请
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center py-[var(--space-6)]">
          <div className="w-[48px] h-[48px] rounded-full bg-cyan-tint-08 flex items-center justify-center mb-[var(--space-3)]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2" strokeLinecap="round">
              <path d="M5 12l5 5L20 7" />
            </svg>
          </div>
          <div className="text-16-bold text-grey-01 mb-[var(--space-1)]">申请已提交</div>
          <div className="text-14-regular text-grey-06 text-center mb-[var(--space-2)]">
            评级变更 {currentGrade} → {targetGrade} 已进入审批流程
          </div>
          <div className="flex items-center gap-[var(--space-2)] text-12-regular text-grey-08 mb-[var(--space-4)]">
            <span>下一步: 行运审批（李行运）</span>
          </div>
          <Button onClick={onClose}>知道了</Button>
        </div>
      )}
    </Dialog>
  )
}
