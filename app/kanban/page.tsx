'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Drawer } from '@/components/ui/Drawer'
import { useClient } from '@/lib/client-context'
import { clients } from '@/lib/data'
import {
  KanbanColumn,
  PipelineBar,
  ClientChips,
  phases,
  kanbanCards,
  phaseCounts,
  mergeCards,
  isMergedCard,
} from '@/components/kanban'
import type { CardData, DisplayCard, MergedCard } from '@/components/kanban'

const gradeColorMap: Record<string, { bg: string; text: string }> = {
  S: { bg: 'bg-orange-tint-10', text: 'text-orange' },
  A: { bg: 'bg-cyan-tint-08', text: 'text-l-cyan' },
  B: { bg: 'bg-selected', text: 'text-grey-06' },
  C: { bg: 'bg-selected', text: 'text-grey-08' },
}

type DrawerState =
  | { type: 'single'; card: CardData }
  | { type: 'merged'; merged: MergedCard }
  | null

export default function KanbanPage() {
  const router = useRouter()
  const { setClient } = useClient()
  const [search, setSearch] = useState('')
  const [activePhase, setActivePhase] = useState<number | null>(null)
  const [activeClientId, setActiveClientId] = useState<string | null>(null)
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())
  const [chipsExpanded, setChipsExpanded] = useState(false)
  const [drawerState, setDrawerState] = useState<DrawerState>(null)
  const [drawerComment, setDrawerComment] = useState('')
  const [drawerActions, setDrawerActions] = useState<Record<string, 'approve' | 'reject'>>({})

  /* ── Filter logic ── */
  const matchesSearch = (name: string, industry: string) => {
    if (!search) return true
    const q = search.toLowerCase()
    return name.toLowerCase().includes(q) || industry.toLowerCase().includes(q)
  }

  const filteredClients = clients.filter((c) => matchesSearch(c.name, c.industry))
  const filteredIds = new Set(filteredClients.map((c) => c.id))

  const isCardVisible = (card: DisplayCard) => {
    const clientId = isMergedCard(card) ? card.clientId : card.clientId
    if (search && !filteredIds.has(clientId)) return false
    if (activeClientId && clientId !== activeClientId) return false
    return true
  }

  const isColDimmed = (phaseId: number) =>
    activePhase !== null && activePhase !== phaseId

  /* ── Handlers ── */
  const handlePhaseClick = (phaseId: number) => {
    setActiveClientId(null)
    setActivePhase(activePhase === phaseId ? null : phaseId)
  }

  const handleClientClick = (clientId: string) => {
    setActivePhase(null)
    setSearch('')
    setActiveClientId(activeClientId === clientId ? null : clientId)
  }

  const handleCardToggle = (card: DisplayCard) => {
    if (isMergedCard(card)) {
      setDrawerState({ type: 'merged', merged: card })
    } else {
      setDrawerState({ type: 'single', card })
    }
    setDrawerComment('')
    setDrawerActions({})
  }

  const navigateToClient = (clientId: string, page: string) => {
    const c = clients.find((cl) => cl.id === clientId)
    if (c) setClient({ id: c.id, name: c.name, industry: c.industry, grade: c.grade })
    router.push(`/${page}?client=${clientId}`)
  }

  const handleTaskAction = (taskId: string, type: 'approve' | 'reject') => {
    if (type === 'reject' && !drawerComment.trim()) return
    setDrawerActions((prev) => ({ ...prev, [taskId]: type }))
  }

  const closeDrawer = () => {
    setDrawerState(null)
    setDrawerComment('')
    setDrawerActions({})
  }

  /* ── Derived ── */
  const hasActiveFilter = activePhase !== null || activeClientId !== null || search
  const totalTasks = Object.values(kanbanCards).flat().length

  // Compute merged display cards per phase
  const mergedByPhase: Record<number, DisplayCard[]> = {}
  for (const phase of phases) {
    mergedByPhase[phase.id] = mergeCards(kanbanCards[phase.id] || [])
  }

  /* ── Drawer helpers ── */
  const drawerClientId = drawerState
    ? drawerState.type === 'single' ? drawerState.card.clientId : drawerState.merged.clientId
    : null
  const drawerClient = drawerClientId ? clients.find((c) => c.id === drawerClientId) : null
  const drawerGrade = drawerState
    ? drawerState.type === 'single' ? drawerState.card.grade : drawerState.merged.grade
    : 'B'
  const gradeStyle = gradeColorMap[drawerGrade] || gradeColorMap.B

  // Find phase for a single card
  const findPhaseForCard = (cardId: string) =>
    phases.find((p) => kanbanCards[p.id]?.some((c) => c.id === cardId))

  return (
    <div className="min-w-0">
      {/* ═══ Section 1: Pipeline Overview ═══ */}
      <section className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <h2 className="text-16-bold text-grey-01">客户总览</h2>
            <span className="text-12-regular text-grey-08">
              {clients.length} 个客户 · {totalTasks} 个进行中任务
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <svg
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-grey-08 pointer-events-none"
                width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" strokeWidth="2" />
                <path d="M21 21l-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <Input
                placeholder="搜索客户..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setActivePhase(null)
                  setActiveClientId(null)
                }}
                className="!h-[30px] !pl-[28px] !text-[12px] !rounded-full !w-[180px] !border-grey-12"
              />
            </div>
            {hasActiveFilter && (
              <Button
                variant="ghost"
                onClick={() => { setActivePhase(null); setActiveClientId(null); setSearch('') }}
                className="!h-[30px] !text-[12px] !px-2"
              >
                清除筛选
              </Button>
            )}
            <Link href="/intake">
              <Button className="!h-[30px] !text-[12px] !px-3">
                + 新增客户
              </Button>
            </Link>
          </div>
        </div>

        <PipelineBar
          phases={phases}
          phaseCounts={phaseCounts}
          activePhase={activePhase}
          onPhaseClick={handlePhaseClick}
        />

        <ClientChips
          clients={clients}
          filteredIds={filteredIds}
          search={search}
          activeClientId={activeClientId}
          activePhase={activePhase}
          chipsExpanded={chipsExpanded}
          onClientClick={handleClientClick}
          onToggleExpand={() => setChipsExpanded(!chipsExpanded)}
        />
      </section>

      {/* ═══ Section 2: Task Board ═══ */}
      <section>
        <div className="flex items-center gap-3 mb-3">
          <h2 className="text-16-bold text-grey-01">任务看板</h2>
          <span className="text-12-regular text-grey-08">
            按阶段查看各客户当前任务进度
          </span>
        </div>

        <div className="grid grid-cols-5 gap-3 pb-4">
          {phases.map((phase) => (
            <KanbanColumn
              key={phase.id}
              phase={phase}
              cards={mergedByPhase[phase.id] || []}
              rawCount={(kanbanCards[phase.id] || []).length}
              dimmed={isColDimmed(phase.id)}
              expandedCards={expandedCards}
              isCardVisible={isCardVisible}
              onToggleCard={handleCardToggle}
              onNavigate={navigateToClient}
            />
          ))}
        </div>
      </section>

      {/* ═══ Task Drawer ═══ */}
      <Drawer
        open={!!drawerState}
        onClose={closeDrawer}
        title={drawerState?.type === 'merged' ? '任务清单' : '任务详情'}
      >
        {drawerState && (
          <div className="flex flex-col gap-[var(--space-4)]">

            {/* ── Client Header (shared) ── */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-[var(--space-2)]">
                <Avatar name={drawerState.type === 'single' ? drawerState.card.clientInitial : drawerState.merged.clientInitial} size="md" />
                <div>
                  <div className="flex items-center gap-[var(--space-1-5)]">
                    <span className="text-14-bold">
                      {drawerState.type === 'single' ? drawerState.card.clientName : drawerState.merged.clientName}
                    </span>
                    <span className={`inline-flex items-center justify-center w-[18px] h-[18px] rounded-[4px] text-10-regular font-semibold ${gradeStyle.bg} ${gradeStyle.text}`}>
                      {drawerGrade}
                    </span>
                  </div>
                  <span className="text-12-regular text-grey-08">
                    {drawerClient?.industry} · {drawerClient?.status}
                  </span>
                </div>
              </div>
              {drawerState.type === 'single' && (
                <Badge variant={drawerState.card.badge}>{drawerState.card.badgeText}</Badge>
              )}
              {drawerState.type === 'merged' && (
                <Badge variant="dark">{drawerState.merged.tasks.length} 个任务</Badge>
              )}
            </div>

            {/* ── Single Card Content ── */}
            {drawerState.type === 'single' && (
              <SingleCardDrawer
                card={drawerState.card}
                phase={findPhaseForCard(drawerState.card.id)}
                drawerComment={drawerComment}
                setDrawerComment={setDrawerComment}
                drawerAction={drawerActions[drawerState.card.id]}
                onAction={(type) => handleTaskAction(drawerState.card.id, type)}
                onNavigate={navigateToClient}
                router={router}
              />
            )}

            {/* ── Merged Card: Task List ── */}
            {drawerState.type === 'merged' && (
              <div className="flex flex-col gap-[var(--space-3)]">
                {drawerState.merged.tasks.map((task, idx) => (
                  <div key={task.id} className={`border border-stroke rounded-lg overflow-hidden ${task.completed ? 'opacity-50' : ''}`}>
                    {/* Task Header */}
                    <div className="flex items-center justify-between px-[var(--space-3)] py-[var(--space-2)] bg-bg">
                      <div className="flex items-center gap-[var(--space-2)]">
                        <span className="text-10-regular text-grey-08">#{idx + 1}</span>
                        {task.cardType === 'change' && (
                          <span className="text-10-regular text-orange bg-orange-tint-10 px-1.5 py-0.5 rounded">变更</span>
                        )}
                        <span className="text-12-bold text-grey-01">{task.title}</span>
                      </div>
                      <Badge variant={task.badge}>{task.badgeText}</Badge>
                    </div>

                    {/* Task Content */}
                    <div className="px-[var(--space-3)] py-[var(--space-2)]">
                      {task.desc && (
                        <p className="text-12-regular text-grey-08 mb-2">{task.desc}</p>
                      )}

                      {/* Change diff */}
                      {task.cardType === 'change' && task.changeDiff && (
                        <div className="mb-2 flex flex-col gap-1">
                          {task.changeDiff.map((d) => (
                            <div key={d.field} className="flex items-center gap-1.5 text-12-regular">
                              <span className="text-grey-08 w-[70px] shrink-0">{d.field}</span>
                              <span className="text-red line-through text-10-regular">{d.from}</span>
                              <span className="text-grey-08">→</span>
                              <span className="text-l-cyan text-10-regular">{d.to}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Metrics */}
                      {task.metrics && (
                        <div className="flex gap-[var(--space-3)] mb-2">
                          {task.metrics.map((m) => (
                            <span key={m.label} className={`text-12-regular ${m.positive ? 'text-l-cyan font-medium' : 'text-grey-08'}`}>
                              {m.label} {m.value}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Progress */}
                      {task.progress !== undefined && (
                        <div className="mb-2">
                          <div className="flex justify-between text-10-regular mb-1">
                            <span className="text-grey-08">进度</span>
                            <span className="text-grey-06">{task.progress}%</span>
                          </div>
                          <div className="w-full h-[4px] bg-grey-12 rounded-full overflow-hidden">
                            <div className="h-full bg-grey-01 rounded-full" style={{ width: `${task.progress}%` }} />
                          </div>
                        </div>
                      )}

                      {/* Details */}
                      {task.details && task.details.length > 0 && (
                        <div className="flex flex-col gap-1">
                          {task.details.map((d) => (
                            <div key={d.label} className="flex justify-between text-12-regular">
                              <span className="text-grey-08">{d.label}</span>
                              <span className="text-12-medium" style={{ color: d.color || 'var(--grey-01)' }}>{d.value}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Task Actions */}
                      {task.actions && task.actions.length > 0 && !drawerActions[task.id] && (
                        <div className="flex flex-wrap gap-[var(--space-1-5)] mt-2 pt-2 border-t border-stroke">
                          {task.actions.map((action) => (
                            <button
                              key={action.label}
                              onClick={() => {
                                if (action.type === 'approval') {
                                  handleTaskAction(task.id, 'approve')
                                } else if (action.href) {
                                  router.push(action.href)
                                }
                              }}
                              className={`inline-flex items-center gap-1 px-[var(--space-2)] py-1.5 rounded-md text-12-bold cursor-pointer font-[inherit] transition-colors ${
                                action.type === 'approval'
                                  ? 'bg-grey-01 text-white hover:opacity-80 border-none'
                                  : 'bg-white text-grey-01 border border-stroke hover:bg-selected hover:border-grey-06 shadow-sm'
                              }`}
                            >
                              {action.type === 'approval' && (
                                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                  <path d="M4 8l3 3 5-6" />
                                </svg>
                              )}
                              {action.label}
                              {action.type === 'link' && (
                                <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                                  <path d="M6 4l4 4-4 4" />
                                </svg>
                              )}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Action Done State */}
                      {drawerActions[task.id] && (
                        <div className={`mt-2 rounded-md px-[var(--space-2)] py-1.5 text-center text-12-medium ${
                          drawerActions[task.id] === 'approve' ? 'bg-cyan-tint-08 text-l-cyan' : 'bg-red-tint-08 text-red'
                        }`}>
                          {drawerActions[task.id] === 'approve' ? '✓ 已通过' : '✕ 已驳回'}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── Quick Navigate to Client ── */}
            <button
              onClick={() => navigateToClient(drawerClientId!, `client/${drawerClientId}`)}
              className="w-full py-[var(--space-3)] rounded-lg text-14-bold text-l-cyan bg-cyan-tint-08 hover:bg-cyan-tint-12 border border-l-cyan/20 cursor-pointer font-[inherit] transition-colors flex items-center justify-center gap-2"
            >
              查看客户详情
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 4l4 4-4 4" />
              </svg>
            </button>
          </div>
        )}
      </Drawer>
    </div>
  )
}

/* ── Single Card Drawer Content ── */
function SingleCardDrawer({
  card,
  phase,
  drawerComment,
  setDrawerComment,
  drawerAction,
  onAction,
  onNavigate,
  router,
}: {
  card: CardData
  phase?: { id: number; name: string; owner: string } | undefined
  drawerComment: string
  setDrawerComment: (v: string) => void
  drawerAction?: 'approve' | 'reject'
  onAction: (type: 'approve' | 'reject') => void
  onNavigate: (clientId: string, page: string) => void
  router: ReturnType<typeof useRouter>
}) {
  const hasApprovalAction = card.actions?.some((a) => a.type === 'approval')

  return (
    <>
      {/* Task Info */}
      <div className="bg-selected rounded-lg p-[var(--space-3)]">
        {card.cardType === 'change' && (
          <span className="inline-block text-10-regular text-orange bg-orange-tint-10 px-1.5 py-0.5 rounded mb-2">需求变更</span>
        )}
        <div className="text-14-bold mb-1">{card.title}</div>
        {card.desc && <p className="text-12-regular text-grey-08">{card.desc}</p>}
        {phase && (
          <div className="flex items-center gap-[var(--space-1-5)] mt-2">
            <span className="inline-flex items-center justify-center w-[20px] h-[20px] rounded-md bg-grey-01 text-white text-10-regular font-semibold">
              {phase.id}
            </span>
            <span className="text-12-medium text-grey-06">{phase.name}</span>
            <span className="text-12-regular text-grey-08">· 负责人: {phase.owner}</span>
          </div>
        )}
      </div>

      {/* Change Diff */}
      {card.cardType === 'change' && card.changeDiff && (
        <div className="border border-stroke rounded-lg p-[var(--space-3)]">
          <div className="text-12-bold text-grey-06 mb-2">变更内容</div>
          {card.changeDiff.map((d) => (
            <div key={d.field} className="flex items-center gap-2 py-1.5 text-12-regular border-b border-stroke last:border-0">
              <span className="text-grey-08 w-[80px] shrink-0">{d.field}</span>
              <span className="text-red line-through">{d.from}</span>
              <span className="text-grey-08">→</span>
              <span className="text-l-cyan font-medium">{d.to}</span>
            </div>
          ))}
        </div>
      )}

      {/* Metrics */}
      {card.metrics && (
        <div className="flex gap-[var(--space-2)]">
          {card.metrics.map((m) => (
            <div key={m.label} className="flex-1 bg-selected rounded-lg p-[var(--space-3)] text-center">
              <div className="text-10-regular text-grey-08 mb-1">{m.label}</div>
              <div className={`text-16-bold ${m.positive ? 'text-l-cyan' : 'text-grey-01'}`}>{m.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Progress */}
      {card.progress !== undefined && (
        <div>
          <div className="flex justify-between text-12-regular mb-1">
            <span className="text-grey-08">测试进度</span>
            <span className="text-grey-06">{card.progress}%</span>
          </div>
          <div className="w-full h-[6px] bg-grey-12 rounded-full overflow-hidden">
            <div className="h-full bg-grey-01 rounded-full transition-[width] duration-600" style={{ width: `${card.progress}%` }} />
          </div>
        </div>
      )}

      {/* Details */}
      {card.details && card.details.length > 0 && (
        <div className="border border-stroke rounded-lg overflow-hidden">
          {card.details.map((d, i) => (
            <div
              key={d.label}
              className={`flex justify-between px-[var(--space-3)] py-[var(--space-2)] text-12-regular ${
                i < card.details!.length - 1 ? 'border-b border-stroke' : ''
              }`}
            >
              <span className="text-grey-08">{d.label}</span>
              <span className="text-14-medium" style={{ color: d.color || 'var(--grey-01)' }}>{d.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Quick Links */}
      {card.actions && card.actions.length > 0 && (
        <div className="flex flex-wrap gap-[var(--space-2)]">
          {card.actions
            .filter((a) => a.type === 'link')
            .map((action) => (
              <button
                key={action.label}
                onClick={() => action.href && router.push(action.href)}
                className="inline-flex items-center gap-1.5 px-[var(--space-3)] py-[var(--space-2)] rounded-lg text-12-bold border border-stroke bg-white text-grey-01 hover:bg-selected hover:border-grey-06 cursor-pointer font-[inherit] transition-colors shadow-sm"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 3h6a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" />
                  <path d="M8 6v4M6 8h4" />
                </svg>
                {action.label}
              </button>
            ))}
        </div>
      )}

      {/* Approval Action */}
      {hasApprovalAction && !drawerAction && (
        <div className="bg-bg rounded-xl p-[var(--space-4)] border border-stroke">
          <div className="text-14-bold text-grey-01 mb-[var(--space-3)] flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-[24px] h-[24px] rounded-full bg-grey-01 text-white">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 8h8M8 4v8" />
              </svg>
            </span>
            审批操作
          </div>
          <textarea
            value={drawerComment}
            onChange={(e) => setDrawerComment(e.target.value)}
            placeholder="输入审批备注（驳回时必填）..."
            rows={3}
            className="w-full rounded-lg border border-stroke bg-white px-[var(--space-3)] py-[var(--space-2)] text-14-regular text-grey-01 resize-none outline-none focus:border-l-cyan transition-colors font-[inherit]"
          />
          <div className="flex gap-[var(--space-2)] mt-[var(--space-3)]">
            <Button onClick={() => onAction('approve')} className="flex-1 !h-[40px] !text-14-bold">✓ 通过审批</Button>
            <Button variant="destructive" onClick={() => onAction('reject')} className="flex-1 !h-[40px] !text-14-bold">✕ 驳回</Button>
          </div>
        </div>
      )}

      {/* Action Done */}
      {drawerAction && (
        <div className={`rounded-lg p-[var(--space-4)] text-center ${
          drawerAction === 'approve' ? 'bg-cyan-tint-08' : 'bg-red-tint-08'
        }`}>
          <div className={`text-14-bold mb-1 ${drawerAction === 'approve' ? 'text-l-cyan' : 'text-red'}`}>
            {drawerAction === 'approve' ? '✓ 已通过' : '✕ 已驳回'}
          </div>
          <p className="text-12-regular text-grey-06">操作已提交，任务将流转至下一步</p>
          {drawerComment && (
            <p className="text-12-regular text-grey-08 mt-1">备注: {drawerComment}</p>
          )}
        </div>
      )}
    </>
  )
}
