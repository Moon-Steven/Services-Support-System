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
import type { CardData, DisplayCard } from '@/components/kanban'

const gradeColorMap: Record<string, { bg: string; text: string }> = {
  S: { bg: 'bg-orange-tint-10', text: 'text-orange' },
  A: { bg: 'bg-cyan-tint-08', text: 'text-l-cyan' },
  B: { bg: 'bg-selected', text: 'text-grey-06' },
  C: { bg: 'bg-selected', text: 'text-grey-08' },
}

type PhaseTaskGroup = {
  phase: { id: number; name: string; owner: string }
  tasks: CardData[]
}

type DrawerState = {
  clientId: string
  clientName: string
  clientInitial: string
  grade: string
  phaseGroups: PhaseTaskGroup[]
  totalTasks: number
} | null

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
    const clientId = isMergedCard(card) ? card.clientId : card.clientId
    const clientName = isMergedCard(card) ? card.clientName : card.clientName
    const clientInitial = isMergedCard(card) ? card.clientInitial : card.clientInitial
    const grade = isMergedCard(card) ? card.grade : card.grade

    // Gather ALL tasks for this client across ALL phases
    const phaseGroups: PhaseTaskGroup[] = []
    let totalTasks = 0
    for (const phase of phases) {
      const phaseTasks = (kanbanCards[phase.id] || []).filter((c) => c.clientId === clientId)
      if (phaseTasks.length > 0) {
        phaseGroups.push({ phase, tasks: phaseTasks })
        totalTasks += phaseTasks.length
      }
    }

    setDrawerState({ clientId, clientName, clientInitial, grade, phaseGroups, totalTasks })
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
  const drawerClientId = drawerState?.clientId ?? null
  const drawerClient = drawerClientId ? clients.find((c) => c.id === drawerClientId) : null
  const drawerGrade = drawerState?.grade ?? 'B'
  const gradeStyle = gradeColorMap[drawerGrade] || gradeColorMap.B

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
        headerContent={drawerState ? (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-[var(--space-2)]">
              <Avatar name={drawerState.clientInitial} size="md" />
              <div>
                <div className="flex items-center gap-[var(--space-1-5)]">
                  <span className="text-14-bold">{drawerState.clientName}</span>
                  <span className={`inline-flex items-center justify-center w-[18px] h-[18px] rounded-[4px] text-10-regular font-semibold ${gradeStyle.bg} ${gradeStyle.text}`}>
                    {drawerGrade}
                  </span>
                </div>
                <span className="text-12-regular text-grey-08">
                  {drawerClient?.industry} · {drawerState.phaseGroups.length} 个阶段 · {drawerState.totalTasks} 个任务
                </span>
              </div>
            </div>
            <button
              onClick={() => navigateToClient(drawerClientId!, `client/${drawerClientId}`)}
              className="shrink-0 inline-flex items-center gap-1 px-[var(--space-3)] py-[var(--space-1-5)] rounded-lg text-12-bold text-l-cyan bg-cyan-tint-08 hover:bg-cyan-tint-12 border border-l-cyan/20 cursor-pointer font-[inherit] transition-colors"
            >
              查看详情
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 4l4 4-4 4" />
              </svg>
            </button>
          </div>
        ) : undefined}
      >
        {drawerState && (
          <div className="flex flex-col gap-[var(--space-5)]">

            {/* ── Phase Groups (collapsible sections) ── */}
            {drawerState.phaseGroups.map((group) => (
              <PhaseSection
                key={group.phase.id}
                group={group}
                drawerActions={drawerActions}
                onTaskAction={handleTaskAction}
                router={router}
              />
            ))}

          </div>
        )}
      </Drawer>
    </div>
  )
}

/* ── Phase Section (collapsible) ── */
function PhaseSection({
  group,
  drawerActions,
  onTaskAction,
  router,
}: {
  group: PhaseTaskGroup
  drawerActions: Record<string, 'approve' | 'reject'>
  onTaskAction: (taskId: string, type: 'approve' | 'reject') => void
  router: ReturnType<typeof useRouter>
}) {
  const [expanded, setExpanded] = useState(true)

  return (
    <div>
      {/* Phase Header — clickable to toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-[var(--space-2)] w-full mb-[var(--space-2)] cursor-pointer border-none bg-transparent p-0 font-[inherit] text-left"
      >
        <span className="inline-flex items-center justify-center w-[22px] h-[22px] rounded-md bg-grey-01 text-white text-10-regular font-semibold shrink-0">
          {group.phase.id}
        </span>
        <span className="text-12-bold text-grey-01">{group.phase.name}</span>
        <span className="text-10-regular text-grey-08">负责人: {group.phase.owner}</span>
        <span className="text-10-regular text-grey-08 ml-auto">{group.tasks.length} 项</span>
        <svg
          width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="var(--grey-08)"
          strokeWidth="1.5" strokeLinecap="round"
          className={`shrink-0 transition-transform duration-200 ${expanded ? 'rotate-0' : '-rotate-90'}`}
        >
          <path d="M4 6l4 4 4-4" />
        </svg>
      </button>

      {/* Tasks — collapsible */}
      {expanded && (
        <div className="flex flex-col gap-[var(--space-2)] pl-[30px] border-l-2 border-grey-12 ml-[10px]">
          {group.tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              actionState={drawerActions[task.id]}
              onAction={onTaskAction}
              router={router}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Single Task Card inside drawer ── */
function TaskCard({
  task,
  actionState,
  onAction,
  router,
}: {
  task: CardData
  actionState?: 'approve' | 'reject'
  onAction: (taskId: string, type: 'approve' | 'reject') => void
  router: ReturnType<typeof useRouter>
}) {
  return (
    <div className={`border border-stroke rounded-lg overflow-hidden ${task.completed ? 'opacity-50' : ''}`}>
      {/* Task Header */}
      <div className="flex items-center justify-between px-[var(--space-3)] py-[var(--space-2)] bg-bg">
        <div className="flex items-center gap-[var(--space-2)]">
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

        {/* Approval Steps */}
        {task.approvalSteps && task.approvalSteps.length > 0 && (
          <div className="mt-2 pt-2 border-t border-stroke">
            <div className="flex flex-col gap-1">
              {task.approvalSteps.map((step, si) => (
                <div key={step.role} className="flex items-center gap-[var(--space-2)]">
                  {/* Step connector */}
                  <div className="flex flex-col items-center w-[16px] shrink-0">
                    <div className={`w-[8px] h-[8px] rounded-full ${
                      step.status === 'done' ? 'bg-l-cyan' :
                      step.status === 'current' ? 'bg-grey-01' :
                      'bg-grey-12'
                    }`} />
                    {si < task.approvalSteps!.length - 1 && (
                      <div className={`w-[1.5px] h-[12px] ${
                        task.approvalSteps![si + 1].status !== 'pending' ? 'bg-grey-01' : 'bg-grey-12'
                      }`} />
                    )}
                  </div>
                  {/* Step info */}
                  <div className="flex items-center gap-1 flex-1 min-w-0">
                    <span className={`text-10-regular ${step.status === 'current' ? 'text-grey-01 font-semibold' : 'text-grey-08'}`}>
                      {step.role}
                    </span>
                    <span className={`text-10-regular ${step.status === 'current' ? 'text-grey-06' : 'text-grey-08 opacity-60'}`}>
                      {step.person}
                    </span>
                    {step.status === 'done' && (
                      <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="var(--l-cyan)" strokeWidth="2.5" strokeLinecap="round" className="shrink-0">
                        <path d="M4 8l3 3 5-6" />
                      </svg>
                    )}
                    {step.date && (
                      <span className="text-10-regular text-grey-08 opacity-50 ml-auto shrink-0">{step.date}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Task Actions */}
        {task.actions && task.actions.length > 0 && !actionState && (
          <div className="flex flex-wrap gap-[var(--space-1-5)] mt-2 pt-2 border-t border-stroke">
            {task.actions.map((action) => (
              <button
                key={action.label}
                onClick={() => {
                  if (action.type === 'approval') {
                    onAction(task.id, 'approve')
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
        {actionState && (
          <div className={`mt-2 rounded-md px-[var(--space-2)] py-1.5 text-center text-12-medium ${
            actionState === 'approve' ? 'bg-cyan-tint-08 text-l-cyan' : 'bg-red-tint-08 text-red'
          }`}>
            {actionState === 'approve' ? '✓ 已通过' : '✕ 已驳回'}
          </div>
        )}
      </div>
    </div>
  )
}

