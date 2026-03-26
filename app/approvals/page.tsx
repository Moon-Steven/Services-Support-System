'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Dialog } from '@/components/ui/Dialog'
import { Avatar } from '@/components/ui/Avatar'
import { ApprovalChain } from '@/components/ui/ApprovalChain'
import { clients, ioOrders, ONBOARDING_STEPS, IO_APPROVAL_STEPS, STEP_ATTACHMENT_CONFIG, gradeChangeRequests } from '@/lib/data'
import type { ApprovalRole, ApprovalStep, ApprovalAttachment, Client, IOOrder, GradeChangeRequest } from '@/lib/data'

/* ── Constants ── */
const ROLES: ApprovalRole[] = ['销售', '运营', '财务', 'CEO', '合规']

const ROLE_COLOR: Record<ApprovalRole | string, string> = {
  '销售': 'border-l-grey-06',
  '运营': 'border-l-l-cyan',
  '财务': 'border-l-orange',
  'CEO': 'border-l-red',
  '合规': 'border-l-grey-01',
  '系统': 'border-l-grey-12',
}

const ROLE_DOT: Record<ApprovalRole | string, string> = {
  '销售': 'bg-grey-06',
  '运营': 'bg-l-cyan',
  '财务': 'bg-orange',
  'CEO': 'bg-red',
  '合规': 'bg-grey-01',
  '系统': 'bg-grey-12',
}

/* ── Types ── */
type ApprovalTask = {
  id: string
  type: '客户入驻' | 'IO 单审批' | '评级变更'
  clientId: string
  clientName: string
  clientGrade: string
  step: ApprovalStep
  requiredRole: ApprovalRole
  allSteps: ApprovalStep[]
  context: string
  ioOrderId?: string
  ioAmount?: number
  gradeChange?: { from: string; to: string }
  waitDays: number
  completedCount: number
}

/* ── Derive tasks ── */
function deriveOnboardingTasks(client: Client): ApprovalTask[] {
  if (!client.onboarding) return []
  const currentStep = client.onboarding.steps.find((s) => s.status === 'current')
  if (!currentStep) return []
  const template = ONBOARDING_STEPS.find((t) => t.key === currentStep.key)
  if (!template) return []
  const completedCount = client.onboarding.steps.filter((s) => s.status === 'completed' || s.status === 'skipped').length

  // Calculate wait days from last completed step
  const lastCompleted = [...client.onboarding.steps].reverse().find((s) => s.status === 'completed')
  const waitDays = lastCompleted?.date ? Math.max(1, Math.round((new Date('2026-03-26').getTime() - new Date(`2026-${lastCompleted.date}`).getTime()) / 86400000)) : 1

  return [{
    id: `onboard-${client.id}-${currentStep.key}`,
    type: '客户入驻',
    clientId: client.id,
    clientName: client.name,
    clientGrade: client.grade,
    step: currentStep,
    requiredRole: template.role,
    allSteps: client.onboarding.steps,
    context: `${client.industry} · Phase ${client.phase}`,
    completedCount,
    waitDays,
  }]
}

function deriveIOTasks(order: IOOrder): ApprovalTask[] {
  if (!order.fullApprovalChain) return []
  const currentStep = order.fullApprovalChain.find((s) => s.status === 'current')
  if (!currentStep) return []
  const template = IO_APPROVAL_STEPS.find((t) => t.key === currentStep.key)
  if (!template) return []
  const client = clients.find((c) => c.id === order.clientId)
  const completedCount = order.fullApprovalChain.filter((s) => s.status === 'completed' || s.status === 'skipped').length

  const lastCompleted = [...order.fullApprovalChain].reverse().find((s) => s.status === 'completed')
  const waitDays = lastCompleted?.date ? Math.max(1, Math.round((new Date('2026-03-26').getTime() - new Date(`2026-${lastCompleted.date}`).getTime()) / 86400000)) : 1

  return [{
    id: `io-${order.id}-${currentStep.key}`,
    type: 'IO 单审批',
    clientId: order.clientId,
    clientName: order.clientName,
    clientGrade: client?.grade || 'B',
    step: currentStep,
    requiredRole: template.role,
    allSteps: order.fullApprovalChain,
    context: `${order.id} · $${order.amount.toLocaleString()}`,
    ioOrderId: order.id,
    ioAmount: order.amount,
    completedCount,
    waitDays,
  }]
}

const GRADE_ROLE_MAP: Record<string, ApprovalRole> = {
  '行运': '运营',
  '振宇': 'CEO',
}

function deriveGradeChangeTasks(gc: GradeChangeRequest): ApprovalTask[] {
  const currentStep = gc.steps.find((s) => s.status === 'current')
  if (!currentStep) return []
  const requiredRole = GRADE_ROLE_MAP[currentStep.role] || '运营'
  const completedCount = gc.steps.filter((s) => s.status === 'done').length
  const lastDone = [...gc.steps].reverse().find((s) => s.status === 'done')
  const waitDays = lastDone?.date ? Math.max(1, Math.round((new Date('2026-03-26').getTime() - new Date(lastDone.date).getTime()) / 86400000)) : 1

  // Convert grade change steps to ApprovalStep format for display
  const allSteps: ApprovalStep[] = gc.steps.map((s) => ({
    key: s.role,
    label: s.role === '销售' ? '销售发起' : s.role === '行运' ? '行运审批' : '最终确认',
    status: s.status === 'done' ? 'completed' : s.status === 'current' ? 'current' : s.status === 'rejected' ? 'completed' : 'pending',
    role: GRADE_ROLE_MAP[s.role] || '销售' as ApprovalRole,
    person: s.person,
    date: s.date?.slice(5),
    note: s.comment,
  }))

  return [{
    id: `gc-${gc.id}`,
    type: '评级变更',
    clientId: gc.clientId,
    clientName: gc.clientName,
    clientGrade: gc.fromGrade,
    step: allSteps.find((s) => s.status === 'current')!,
    requiredRole: requiredRole as ApprovalRole,
    allSteps,
    context: `${gc.fromGrade} → ${gc.toGrade}`,
    gradeChange: { from: gc.fromGrade, to: gc.toGrade },
    completedCount,
    waitDays,
  }]
}

const gradeVariant = (g: string): 'cyan' | 'orange' | 'grey' | 'dark' => {
  if (g === 'S') return 'orange'
  if (g === 'A') return 'cyan'
  return 'grey'
}

/* ── Icons ── */
function IconCheck({ className = '' }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 8l4 4 6-6" />
    </svg>
  )
}
function IconClock({ className = '' }: { className?: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="8" cy="8" r="6.5" /><path d="M8 4.5V8l2.5 1.5" />
    </svg>
  )
}
function IconUpload({ className = '' }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  )
}
function IconFile({ type }: { type: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-l-cyan shrink-0">
      {type === 'pdf' ? (
        <path d="M4 1h5l4 4v9a1 1 0 01-1 1H4a1 1 0 01-1-1V2a1 1 0 011-1zm4 0v4h4" />
      ) : type === 'image' ? (
        <><rect x="2" y="2" width="12" height="12" rx="1" /><circle cx="5.5" cy="6" r="1" /><path d="M14 10l-3-3-7 7" /></>
      ) : (
        <path d="M4 1h5l4 4v9a1 1 0 01-1 1H4a1 1 0 01-1-1V2a1 1 0 011-1zm4 0v4h4" />
      )}
    </svg>
  )
}

/* ── Mini step progress (horizontal dots for card) ── */
function StepProgress({ steps, total }: { steps: number; total: number }) {
  const pct = Math.round((steps / total) * 100)
  return (
    <div className="flex items-center gap-[var(--space-2)]">
      <div className="flex-1 h-[3px] rounded-full bg-grey-12 overflow-hidden" style={{ minWidth: 60 }}>
        <div className="h-full rounded-full bg-l-cyan transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-10-regular text-grey-08 shrink-0 tabular-nums">{steps}/{total}</span>
    </div>
  )
}

/* ── Compact horizontal step bar for dialog ── */
function HorizontalSteps({ steps }: { steps: ApprovalStep[] }) {
  return (
    <div className="flex items-center gap-[2px]">
      {steps.map((s, i) => {
        const isCompleted = s.status === 'completed' || s.status === 'skipped'
        const isCurrent = s.status === 'current'
        return (
          <div key={s.key} className="flex items-center gap-[2px]">
            <div
              className={`rounded-full transition-all ${
                isCurrent
                  ? 'w-[10px] h-[10px] bg-grey-01 ring-2 ring-grey-01/20'
                  : isCompleted
                    ? 'w-[8px] h-[8px] bg-l-cyan'
                    : 'w-[6px] h-[6px] bg-grey-12'
              }`}
              title={s.label}
            />
            {i < steps.length - 1 && (
              <div className={`w-[12px] h-[1.5px] rounded-full ${isCompleted ? 'bg-l-cyan' : 'bg-grey-12'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ════════════════════════════════════════════════════ */
export default function ApprovalsPage() {
  const router = useRouter()
  const [roleFilter, setRoleFilter] = useState<string>('全部')
  const [typeFilter, setTypeFilter] = useState<string>('全部')
  const [selectedTask, setSelectedTask] = useState<ApprovalTask | null>(null)
  const [actionDone, setActionDone] = useState<'approve' | 'reject' | null>(null)
  const [mode, setMode] = useState<'approve' | 'reject'>('approve')
  const [comment, setComment] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState<ApprovalAttachment[]>([])
  const [showChain, setShowChain] = useState(false)

  /* Build & filter tasks */
  const allTasks = useMemo(() => {
    const tasks: ApprovalTask[] = []
    clients.forEach((c) => tasks.push(...deriveOnboardingTasks(c)))
    ioOrders.forEach((o) => tasks.push(...deriveIOTasks(o)))
    gradeChangeRequests.forEach((gc) => tasks.push(...deriveGradeChangeTasks(gc)))
    return tasks
  }, [])

  const filtered = useMemo(() => {
    return allTasks.filter((t) => {
      if (roleFilter !== '全部' && t.requiredRole !== roleFilter) return false
      if (typeFilter !== '全部') {
        if (typeFilter === '客户入驻' && t.type !== '客户入驻') return false
        if (typeFilter === 'IO 单' && t.type !== 'IO 单审批') return false
        if (typeFilter === '评级变更' && t.type !== '评级变更') return false
      }
      return true
    })
  }, [allTasks, roleFilter, typeFilter])

  const stats = useMemo(() => ({
    total: allTasks.length,
    sales: allTasks.filter((t) => t.requiredRole === '销售').length,
    ops: allTasks.filter((t) => t.requiredRole === '运营').length,
    finance: allTasks.filter((t) => t.requiredRole === '财务').length,
    ceo: allTasks.filter((t) => t.requiredRole === 'CEO').length,
  }), [allTasks])

  /* Handlers */
  const openTask = (task: ApprovalTask) => {
    setSelectedTask(task)
    setMode('approve')
    setComment('')
    setUploadedFiles([])
    setShowChain(false)
    setActionDone(null)
  }

  const handleAction = () => {
    if (mode === 'reject' && !comment.trim()) return
    setActionDone(mode)
  }

  const handleCloseDialog = () => {
    setSelectedTask(null)
    setActionDone(null)
    setComment('')
    setUploadedFiles([])
    setShowChain(false)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    const newFiles: ApprovalAttachment[] = Array.from(files).map((f) => ({
      name: f.name,
      type: f.type.startsWith('image/') ? 'image' : f.name.endsWith('.pdf') ? 'pdf' : f.name.endsWith('.doc') || f.name.endsWith('.docx') ? 'doc' : 'other',
      size: f.size < 1024 * 1024 ? `${Math.round(f.size / 1024)} KB` : `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
    }))
    setUploadedFiles((prev) => [...prev, ...newFiles])
    e.target.value = ''
  }

  const removeFile = (name: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.name !== name))
  }

  const attachConfig = selectedTask ? STEP_ATTACHMENT_CONFIG[selectedTask.step.key] : null
  const needsUpload = attachConfig?.required && uploadedFiles.length === 0
  const canSubmit = mode === 'approve' ? !needsUpload : comment.trim().length > 0

  return (
    <div>
      {/* ── Header ── */}
      <div className="mb-[var(--space-5)]">
        <h1 className="text-24-bold text-grey-01">审批工作台</h1>
        <p className="text-14-regular text-grey-08 mt-[var(--space-1)]">
          查看和处理待审批的客户入驻、IO 单与评级变更流程
        </p>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-5 gap-[var(--space-3)] mb-[var(--space-5)]">
        {[
          { label: '全部待审批', value: stats.total, dot: 'bg-grey-01', filter: '全部' },
          { label: '销售', value: stats.sales, dot: 'bg-grey-06', filter: '销售' },
          { label: '运营', value: stats.ops, dot: 'bg-l-cyan', filter: '运营' },
          { label: '财务', value: stats.finance, dot: 'bg-orange', filter: '财务' },
          { label: 'CEO', value: stats.ceo, dot: 'bg-red', filter: 'CEO' },
        ].map((s) => (
          <button
            key={s.label}
            onClick={() => setRoleFilter(s.filter)}
            className={`text-left rounded-xl border p-[var(--space-4)] transition-all cursor-pointer bg-white ${
              roleFilter === s.filter
                ? 'border-grey-01 shadow-[0_0_0_1px_var(--grey-01)]'
                : 'border-stroke hover:border-grey-12'
            }`}
          >
            <div className="flex items-center gap-[var(--space-1)] mb-[var(--space-1)]">
              <span className={`w-[6px] h-[6px] rounded-full ${s.dot}`} />
              <span className="text-12-regular text-grey-08">{s.label}</span>
            </div>
            <div className="text-20-bold text-grey-01">{s.value}</div>
          </button>
        ))}
      </div>

      {/* ── Filter bar ── */}
      <div className="flex items-center gap-[var(--space-3)] mb-[var(--space-4)]">
        <span className="text-12-medium text-grey-06">类型</span>
        <div className="flex gap-[var(--space-1)]">
          {['全部', '客户入驻', 'IO 单', '评级变更'].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-[var(--space-3)] py-[5px] rounded-full text-12-medium border-none cursor-pointer transition-colors font-[inherit] ${
                typeFilter === t
                  ? 'bg-grey-01 text-white'
                  : 'bg-selected text-grey-06 hover:bg-grey-12'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <span className="text-12-regular text-grey-08 ml-auto">
          共 {filtered.length} 条待处理
        </span>
      </div>

      {/* ── Task List ── */}
      <div className="flex flex-col gap-[var(--space-2)]">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-[80px]">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="mb-[var(--space-3)] text-grey-12">
              <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="1.5" />
              <path d="M16 24l6 6 10-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="text-14-medium text-grey-06">暂无待审批任务</p>
            <p className="text-12-regular text-grey-08 mt-[2px]">所有流程均已处理完毕</p>
          </div>
        ) : (
          filtered.map((task) => (
            <button
              key={task.id}
              onClick={() => openTask(task)}
              className={`group text-left w-full rounded-xl bg-white border border-stroke hover:border-grey-12 hover:shadow-sm transition-all cursor-pointer p-0 overflow-hidden font-[inherit]`}
            >
              <div className={`flex border-l-[3px] ${ROLE_COLOR[task.requiredRole] || 'border-l-grey-12'}`}>
                <div className="flex-1 p-[var(--space-4)]">
                  {/* Row 1: client + badges */}
                  <div className="flex items-center gap-[var(--space-2)] mb-[var(--space-1)]">
                    <Avatar name={task.clientName[0]} size="sm" />
                    <span className="text-14-bold text-grey-01">{task.clientName}</span>
                    <Badge variant={gradeVariant(task.clientGrade)}>{task.clientGrade}</Badge>
                    <Badge variant={task.type === '客户入驻' ? 'dark' : task.type === '评级变更' ? 'orange' : 'cyan'}>{task.type}</Badge>
                  </div>

                  {/* Row 2: current step + context */}
                  <div className="flex items-center gap-[var(--space-2)] ml-[32px]">
                    <span className={`inline-flex items-center gap-[3px] text-12-medium px-[6px] py-[1px] rounded ${
                      task.requiredRole === '财务' ? 'bg-orange-tint-10 text-orange'
                        : task.requiredRole === 'CEO' ? 'bg-red-tint-08 text-red'
                          : task.requiredRole === '运营' ? 'bg-cyan-tint-12 text-l-cyan'
                            : 'bg-grey-12 text-grey-06'
                    }`}>
                      <span className={`w-[5px] h-[5px] rounded-full ${ROLE_DOT[task.requiredRole] || 'bg-grey-06'}`} />
                      {task.step.label}
                    </span>
                    <span className="text-12-regular text-grey-08">{task.context}</span>
                    {task.step.note && (
                      <span className="text-12-regular text-orange">{task.step.note}</span>
                    )}
                  </div>

                  {/* Row 3: progress bar + wait time */}
                  <div className="flex items-center gap-[var(--space-4)] mt-[var(--space-2)] ml-[32px]">
                    <div className="w-[120px]">
                      <StepProgress steps={task.completedCount} total={task.allSteps.length} />
                    </div>
                    <div className="flex items-center gap-[3px] text-grey-08">
                      <IconClock />
                      <span className="text-10-regular">等待 {task.waitDays} 天</span>
                    </div>
                    {task.step.person && (
                      <span className="text-10-regular text-grey-06">负责人: {task.step.person}</span>
                    )}
                  </div>
                </div>

                {/* Right: arrow */}
                <div className="flex items-center pr-[var(--space-4)] text-grey-12 group-hover:text-grey-06 transition-colors">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7.5 5l5 5-5 5" />
                  </svg>
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {/* ════ Approval Dialog ════ */}
      {selectedTask && (
        <Dialog
          open={!!selectedTask}
          onClose={handleCloseDialog}
          width={560}
        >
          {!actionDone ? (
            <div className="flex flex-col">
              {/* ── Hero header ── */}
              <div className="flex items-start gap-[var(--space-3)] mb-[var(--space-4)]">
                <div className={`w-[44px] h-[44px] rounded-xl flex items-center justify-center text-16-bold text-white shrink-0 ${
                  selectedTask.requiredRole === '财务' ? 'bg-orange'
                    : selectedTask.requiredRole === 'CEO' ? 'bg-red'
                      : selectedTask.requiredRole === '运营' ? 'bg-l-cyan'
                        : 'bg-grey-01'
                }`}>
                  {selectedTask.step.label.substring(0, 1)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-16-bold text-grey-01">{selectedTask.step.label}</div>
                  <div className="flex items-center gap-[var(--space-2)] mt-[2px]">
                    <span className="text-14-regular text-grey-06">{selectedTask.clientName}</span>
                    <Badge variant={gradeVariant(selectedTask.clientGrade)}>{selectedTask.clientGrade}</Badge>
                    <Badge variant={selectedTask.type === '客户入驻' ? 'dark' : selectedTask.type === '评级变更' ? 'orange' : 'cyan'}>{selectedTask.type}</Badge>
                  </div>
                </div>
                <button
                  onClick={handleCloseDialog}
                  aria-label="关闭"
                  className="flex items-center justify-center w-7 h-7 rounded-md text-grey-06 hover:opacity-60 bg-transparent border-none cursor-pointer transition-opacity shrink-0"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M4 4l8 8M12 4l-8 8" />
                  </svg>
                </button>
              </div>

              {/* ── Context info pills ── */}
              <div className="flex flex-wrap items-center gap-[var(--space-2)] mb-[var(--space-4)]">
                <span className={`inline-flex items-center gap-[4px] text-12-medium px-[var(--space-2)] py-[3px] rounded-md ${
                  selectedTask.requiredRole === '财务' ? 'bg-orange-tint-10 text-orange'
                    : selectedTask.requiredRole === 'CEO' ? 'bg-red-tint-08 text-red'
                      : selectedTask.requiredRole === '运营' ? 'bg-cyan-tint-12 text-l-cyan'
                        : 'bg-grey-12 text-grey-06'
                }`}>
                  <span className={`w-[5px] h-[5px] rounded-full ${ROLE_DOT[selectedTask.requiredRole] || 'bg-grey-06'}`} />
                  {selectedTask.requiredRole}
                </span>
                {selectedTask.step.person && (
                  <span className="text-12-regular text-grey-06 bg-selected rounded-md px-[var(--space-2)] py-[3px]">
                    {selectedTask.step.person}
                  </span>
                )}
                {selectedTask.ioOrderId && (
                  <span className="text-12-regular text-grey-06 bg-selected rounded-md px-[var(--space-2)] py-[3px]">
                    {selectedTask.ioOrderId} · ${selectedTask.ioAmount?.toLocaleString()}
                  </span>
                )}
                {selectedTask.gradeChange && (
                  <span className="text-12-medium text-orange bg-orange-tint-10 rounded-md px-[var(--space-2)] py-[3px]">
                    {selectedTask.gradeChange.from} → {selectedTask.gradeChange.to}
                  </span>
                )}
                {selectedTask.step.note && (
                  <span className="text-12-medium text-orange bg-orange-tint-10 rounded-md px-[var(--space-2)] py-[3px]">
                    {selectedTask.step.note}
                  </span>
                )}
              </div>

              {/* ── Progress bar ── */}
              <div className="mb-[var(--space-4)]">
                <div className="flex items-center justify-between mb-[var(--space-2)]">
                  <HorizontalSteps steps={selectedTask.allSteps} />
                  <span className="text-10-regular text-grey-08">{selectedTask.completedCount}/{selectedTask.allSteps.length} 步已完成</span>
                </div>
                <button
                  onClick={() => setShowChain(!showChain)}
                  className="text-12-regular text-l-cyan hover:underline bg-transparent border-none cursor-pointer p-0 font-[inherit]"
                >
                  {showChain ? '收起流程详情' : '查看完整流程'}
                </button>
                {showChain && (
                  <div className="mt-[var(--space-2)] p-[var(--space-3)] rounded-lg bg-bg">
                    <ApprovalChain steps={selectedTask.allSteps} mode="expanded" />
                  </div>
                )}
              </div>

              {/* ── Divider ── */}
              <div className="h-[1px] bg-stroke mb-[var(--space-4)]" />

              {/* ── Approve / Reject toggle ── */}
              <div className="flex mb-[var(--space-3)]">
                <div className="inline-flex rounded-lg bg-selected p-[2px]">
                  <button
                    onClick={() => setMode('approve')}
                    className={`px-[var(--space-4)] py-[6px] rounded-md text-12-medium border-none cursor-pointer transition-all font-[inherit] ${
                      mode === 'approve'
                        ? 'bg-white text-grey-01 shadow-sm'
                        : 'bg-transparent text-grey-06 hover:text-grey-01'
                    }`}
                  >
                    通过审批
                  </button>
                  <button
                    onClick={() => setMode('reject')}
                    className={`px-[var(--space-4)] py-[6px] rounded-md text-12-medium border-none cursor-pointer transition-all font-[inherit] ${
                      mode === 'reject'
                        ? 'bg-white text-red shadow-sm'
                        : 'bg-transparent text-grey-06 hover:text-grey-01'
                    }`}
                  >
                    驳回
                  </button>
                </div>
              </div>

              {/* ── Action area ── */}
              {mode === 'approve' ? (
                <div className="flex flex-col gap-[var(--space-3)]">
                  {/* File upload (if configured) */}
                  {attachConfig && (
                    <div>
                      <div className="flex items-center gap-[var(--space-1)] mb-[var(--space-2)]">
                        <span className="text-12-medium text-grey-01">
                          上传材料
                        </span>
                        {attachConfig.required ? (
                          <span className="text-12-medium text-red">*</span>
                        ) : (
                          <span className="text-10-regular text-grey-08">选填</span>
                        )}
                      </div>
                      <p className="text-12-regular text-grey-08 mb-[var(--space-2)]">
                        {attachConfig.hint}
                      </p>

                      {/* Upload zone */}
                      <label className="flex items-center gap-[var(--space-3)] p-[var(--space-3)] rounded-lg border border-dashed border-grey-12 bg-bg cursor-pointer hover:border-l-cyan hover:bg-cyan-tint-08 transition-colors">
                        <div className="w-[36px] h-[36px] rounded-lg bg-white border border-stroke flex items-center justify-center shrink-0">
                          <IconUpload className="text-grey-06" />
                        </div>
                        <div>
                          <div className="text-12-medium text-grey-01">点击选择文件或拖拽到此处</div>
                          <div className="text-10-regular text-grey-08 mt-[1px]">
                            支持 {attachConfig.accept.replace(/\./g, '').toUpperCase()}
                          </div>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept={attachConfig.accept}
                          multiple
                          onChange={handleFileSelect}
                        />
                      </label>

                      {/* File list */}
                      {uploadedFiles.length > 0 && (
                        <div className="flex flex-col gap-[var(--space-1)] mt-[var(--space-2)]">
                          {uploadedFiles.map((f) => (
                            <div
                              key={f.name}
                              className="flex items-center justify-between px-[var(--space-3)] py-[6px] rounded-lg bg-selected"
                            >
                              <div className="flex items-center gap-[var(--space-2)] min-w-0">
                                <IconFile type={f.type} />
                                <span className="text-12-regular text-grey-01 truncate">{f.name}</span>
                                <span className="text-10-regular text-grey-08 shrink-0">{f.size}</span>
                              </div>
                              <button
                                onClick={(e) => { e.preventDefault(); removeFile(f.name) }}
                                className="text-grey-08 hover:text-red bg-transparent border-none cursor-pointer p-[2px] font-[inherit]"
                                aria-label={`删除 ${f.name}`}
                              >
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                                  <path d="M2 2l8 8M10 2l-8 8" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Approve comment */}
                  <div>
                    <div className="text-12-medium text-grey-01 mb-[var(--space-1)]">审批备注 <span className="text-grey-08 font-normal">选填</span></div>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="添加审批备注..."
                      className="w-full h-[56px] p-[var(--space-3)] rounded-lg border border-stroke text-14-regular resize-none outline-none focus:border-grey-01 transition-colors bg-white"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-[var(--space-3)]">
                  {/* Reject warning */}
                  <div className="flex items-start gap-[var(--space-2)] p-[var(--space-3)] rounded-lg bg-red-tint-08">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-red shrink-0 mt-[1px]">
                      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M8 5v3.5M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    <div>
                      <div className="text-12-medium text-red">驳回将中止当前审批流程</div>
                      <div className="text-12-regular text-grey-06 mt-[1px]">请填写驳回原因，申请人可根据反馈修改后重新提交。</div>
                    </div>
                  </div>

                  {/* Reject reason (required) */}
                  <div>
                    <div className="text-12-medium text-grey-01 mb-[var(--space-1)]">驳回原因 <span className="text-red">*</span></div>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="请详细说明驳回原因，便于申请人修改..."
                      className="w-full h-[80px] p-[var(--space-3)] rounded-lg border border-stroke text-14-regular resize-none outline-none focus:border-red transition-colors bg-white"
                    />
                  </div>
                </div>
              )}

              {/* ── Footer actions ── */}
              <div className="flex items-center justify-between mt-[var(--space-4)] pt-[var(--space-4)] border-t border-stroke">
                <button
                  onClick={() => router.push(`/client/${selectedTask.clientId}`)}
                  className="text-12-regular text-l-cyan hover:underline bg-transparent border-none cursor-pointer p-0 font-[inherit]"
                >
                  查看客户详情 &rarr;
                </button>
                <div className="flex gap-[var(--space-2)]">
                  <Button variant="ghost" onClick={handleCloseDialog}>取消</Button>
                  {mode === 'approve' ? (
                    <Button onClick={handleAction} disabled={!canSubmit}>
                      <IconCheck className="mr-[4px]" />
                      通过
                    </Button>
                  ) : (
                    <Button variant="destructive" onClick={handleAction} disabled={!canSubmit}>
                      驳回
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* ── Result state ── */
            <div className="flex flex-col items-center py-[var(--space-6)]">
              {actionDone === 'approve' ? (
                <>
                  <div className="w-[56px] h-[56px] rounded-full bg-cyan-tint-08 flex items-center justify-center mb-[var(--space-3)]">
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="text-l-cyan">
                      <path d="M7 14l5 5 9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="text-16-bold text-grey-01 mb-[4px]">审批已通过</div>
                  <p className="text-14-regular text-grey-06 text-center">
                    「{selectedTask.clientName} · {selectedTask.step.label}」已通过
                  </p>
                  <p className="text-12-regular text-grey-08 mt-[2px]">
                    流程将自动进入下一步
                  </p>
                </>
              ) : (
                <>
                  <div className="w-[56px] h-[56px] rounded-full bg-red-tint-08 flex items-center justify-center mb-[var(--space-3)]">
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="text-red">
                      <path d="M9 9l10 10M19 9l-10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div className="text-16-bold text-grey-01 mb-[4px]">已驳回</div>
                  <p className="text-14-regular text-grey-06 text-center">
                    「{selectedTask.clientName} · {selectedTask.step.label}」已驳回
                  </p>
                  <div className="mt-[var(--space-3)] p-[var(--space-3)] rounded-lg bg-bg w-full max-w-[320px]">
                    <div className="text-10-regular text-grey-08 mb-[2px]">驳回原因</div>
                    <div className="text-12-regular text-grey-01">{comment}</div>
                  </div>
                </>
              )}
              <div className="flex gap-[var(--space-2)] mt-[var(--space-5)]">
                <Button variant="ghost" onClick={handleCloseDialog}>关闭</Button>
                <Button variant="secondary" onClick={() => router.push(`/client/${selectedTask.clientId}`)}>
                  查看客户详情
                </Button>
              </div>
            </div>
          )}
        </Dialog>
      )}
    </div>
  )
}
