'use client'

import { useState, useMemo, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Dialog } from '@/components/ui/Dialog'
import { Drawer } from '@/components/ui/Drawer'
import { Select } from '@/components/ui/Select'
import { Toggle } from '@/components/ui/Toggle'
import { Avatar } from '@/components/ui/Avatar'
import { Table } from '@/components/ui/Table'
import { Stepper } from '@/components/ui/Stepper'
import { useClient } from '@/lib/client-context'
import {
  clients, clientClockConfigs, industryTemplates,
  CLOCK_CATEGORIES, TONE_OPTIONS,
} from '@/lib/data'
import type { ClockEntry, ClockCategory, ToneVariant, ClientSophistication } from '@/lib/data'
import {
  cloneAtcReviewEvents,
  getClockEntryNarrative,
  isClockOffHours,
  obfuscateForSophistication,
  kpiRefLabel,
  CLIENT_SOPHISTICATION_OPTIONS,
  getSlaTrafficLight,
  formatAtcDateTime,
  ATC_FALLBACK_COPY,
  ATC_REFERENCE_NOW_ISO,
  type AtcReviewEvent,
  type AtcViewerRole,
} from '@/lib/around-the-clock'

/* ═══════════════════════════════════════════
   审核工作台辅助
   ═══════════════════════════════════════════ */

function isMyTurn(e: AtcReviewEvent, role: AtcViewerRole): boolean {
  if (e.currentStage === 'at_delivery') return role === 'delivery'
  if (e.currentStage === 'at_ops') return role === 'ops'
  if (e.currentStage === 'at_sales') return role === 'sales'
  return false
}

function inInflightForRole(e: AtcReviewEvent, role: AtcViewerRole): boolean {
  if (e.currentStage !== 'at_delivery' && e.currentStage !== 'at_ops' && e.currentStage !== 'at_sales') return false
  return !isMyTurn(e, role)
}

const ROLE_OPTIONS: { value: AtcViewerRole; label: string }[] = [
  { value: 'delivery', label: '交付团队（一审）' },
  { value: 'ops', label: '行业运营（二审）' },
  { value: 'sales', label: '销售（三审）' },
]

const EVENT_TYPE_LABEL: Record<string, string> = {
  bidding: '出价', creative: '素材', monitor: '监控', strategy: '策略', experiment: '实验',
}

const STAGE_LABEL: Record<string, string> = {
  at_delivery: '交付待审', at_ops: '运营待审', at_sales: '销售待审', published: '已发布', blocked: '已拦截',
}
const STAGE_DOT: Record<string, string> = { at_delivery: 'bg-orange', at_ops: 'bg-l-cyan', at_sales: 'bg-[#8b5cf6]', published: 'bg-[#22c55e]', blocked: 'bg-red' }
const STAGE_TEXT_CLS: Record<string, string> = { at_delivery: 'text-orange', at_ops: 'text-l-cyan', at_sales: 'text-[#8b5cf6]', published: 'text-[#22c55e]', blocked: 'text-red' }

function slaBadge(light: ReturnType<typeof getSlaTrafficLight>) {
  if (light === 'green') return <Badge variant="cyan">充裕</Badge>
  if (light === 'yellow') return <Badge variant="orange">即将超时</Badge>
  return <Badge variant="red">已超时</Badge>
}

function auditActionLabel(action: string): string {
  const map: Record<string, string> = {
    hui_triggered: 'HUI 触发',
    delivery_submit_ops: '交付 → 运营',
    delivery_edit: '交付修改文案',
    delivery_reject: '交付废弃',
    ops_submit_sales: '运营 → 销售',
    ops_polish: '运营润色话术',
    ops_return_delivery: '运营退回交付',
    sales_publish: '销售发布',
    sales_edit: '销售微调',
    sales_hide: '销售隐藏',
    sales_recall: '销售撤回',
    system_timeout_forward: '系统超时流转',
    system_timeout_hide: '系统超时拦截',
  }
  return map[action] || action
}

/* ═══════════════════════════════════════════
   Timeline 配置 子组件
   ═══════════════════════════════════════════ */

const CATEGORY_STYLE: Record<ClockCategory, string> = {
  Bidding: 'bg-orange-tint-10 text-orange',
  Monitor: 'bg-cyan-tint-12 text-l-cyan',
  Strategy: 'bg-grey-12 text-grey-01',
  Creative: 'bg-red-tint-08 text-red',
}

function ClockPreview({ entries }: { entries: ClockEntry[] }) {
  const activeEntries = entries.filter((e) => e.active)
  function timeToAngle(time: string) {
    const [h, m] = time.split(':').map(Number)
    return ((h + m / 60) / 24) * 360 - 90
  }
  function timeToPos(time: string, r: number) {
    const angle = (timeToAngle(time) * Math.PI) / 180
    return { x: 80 + r * Math.cos(angle), y: 80 + r * Math.sin(angle) }
  }
  return (
    <div className="relative flex items-center justify-center">
      <svg width="160" height="160" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r="65" fill="none" stroke="var(--grey-12)" strokeWidth="1" />
        <circle cx="80" cy="80" r="50" fill="none" stroke="var(--grey-12)" strokeWidth="0.5" strokeDasharray="2 4" />
        {[0, 3, 6, 9, 12, 15, 18, 21].map((h) => {
          const pos = timeToPos(`${String(h).padStart(2, '0')}:00`, 72)
          return <text key={h} x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="central" className="text-[8px] fill-grey-08">{h}</text>
        })}
        <text x="80" y="76" textAnchor="middle" className="text-[16px] font-bold fill-grey-01">24h</text>
        <text x="80" y="90" textAnchor="middle" className="text-[8px] fill-grey-08">Always On</text>
        {activeEntries.map((entry) => {
          const pos = timeToPos(entry.time, 55)
          const color = entry.category === 'Bidding' ? 'var(--orange)' : entry.category === 'Monitor' ? 'var(--cyan)' : entry.category === 'Creative' ? 'var(--red)' : 'var(--grey-06)'
          const off = isClockOffHours(entry.time)
          return (
            <circle key={entry.id} cx={pos.x} cy={pos.y} r={off ? 5 : 4} fill={color} opacity="0.8"
              stroke={off ? 'var(--orange)' : undefined} strokeWidth={off ? 1 : 0}>
              <title>{entry.time} {entry.category}{off ? ' · 非办公时段' : ''}</title>
            </circle>
          )
        })}
      </svg>
    </div>
  )
}

function EntryRow({ entry, sophistication, onEdit, onToggle, onDelete }: {
  entry: ClockEntry; sophistication: ClientSophistication; onEdit: () => void; onToggle: () => void; onDelete: () => void
}) {
  const narrative = getClockEntryNarrative(entry)
  const off = isClockOffHours(entry.time)
  return (
    <div className={`flex items-start gap-[var(--space-3)] p-[var(--space-3)] rounded-lg border border-stroke transition-opacity ${entry.active ? '' : 'opacity-40'}`}>
      <div className="w-[52px] shrink-0 pt-[2px]">
        <span className="text-14-bold text-grey-01 tabular-nums block">{entry.time}</span>
        {off && <span className="text-10-regular text-orange mt-[2px] block">非办公</span>}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-[var(--space-2)] mb-[2px]">
          <span className={`text-12-medium px-[6px] py-[1px] rounded ${CATEGORY_STYLE[entry.category]}`}>{entry.category}</span>
          {entry.effect.type !== 'none' && (
            <span className={`text-12-medium ${entry.effect.type === 'saved' ? 'text-l-cyan' : 'text-red'}`}>
              {entry.effect.type === 'saved' ? 'Saved' : 'Blocked'} {entry.effect.currency}{entry.effect.amount?.toLocaleString()}
            </span>
          )}
          {entry.kpiRefs?.map((k) => <Badge key={k} variant="cyan">{kpiRefLabel(k)}</Badge>)}
        </div>
        <p className="text-10-regular text-grey-08 line-clamp-1 mb-[2px]">信号 → 策略 → 动作 → 结果</p>
        <p className="text-12-regular text-grey-06 line-clamp-2">
          {obfuscateForSophistication(`${narrative.signal} → ${narrative.action} → ${narrative.outcome}`, sophistication)}
        </p>
        <p className="text-10-regular text-grey-08 line-clamp-1 mt-[2px]">内部描述：{entry.description}</p>
      </div>
      <div className="flex items-center gap-[var(--space-2)] shrink-0">
        <Toggle checked={entry.active} onChange={onToggle} />
        <button onClick={onEdit} className="text-grey-08 hover:text-grey-01 bg-transparent border-none cursor-pointer p-[2px]" aria-label="编辑">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 2l3 3-8 8H3v-3z" /></svg>
        </button>
        <button onClick={onDelete} className="text-grey-08 hover:text-red bg-transparent border-none cursor-pointer p-[2px]" aria-label="删除">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M4 4l8 8M12 4l-8 8" /></svg>
        </button>
      </div>
    </div>
  )
}

function EntryFormDialog({ entry, onSave, onClose }: { entry: ClockEntry | null; onSave: (e: ClockEntry) => void; onClose: () => void }) {
  const [time, setTime] = useState(entry?.time || '12:00')
  const [category, setCategory] = useState<ClockCategory>(entry?.category || 'Bidding')
  const [description, setDescription] = useState(entry?.description || '')
  const [effectType, setEffectType] = useState<'saved' | 'blocked' | 'none'>(entry?.effect.type || 'none')
  const [effectAmount, setEffectAmount] = useState(entry?.effect.amount?.toString() || '')
  const [effectCurrency, setEffectCurrency] = useState(entry?.effect.currency || '¥')

  const handleSubmit = () => {
    if (!description.trim()) return
    onSave({
      id: entry?.id || `entry-${Date.now()}`, time, category, description,
      effect: { type: effectType, amount: effectType !== 'none' ? Number(effectAmount) || 0 : undefined, currency: effectType !== 'none' ? effectCurrency : undefined },
      active: entry?.active ?? true, order: entry?.order ?? 0,
    })
  }

  return (
    <Dialog open onClose={onClose} title={entry ? '编辑条目' : '添加条目'} width={480}>
      <div className="flex flex-col gap-[var(--space-4)]">
        <div className="grid grid-cols-2 gap-[var(--space-3)]">
          <div>
            <label className="text-12-medium text-grey-01 mb-[var(--space-1)] block">时间</label>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
              className="w-full h-[var(--height-input)] px-[var(--space-3)] rounded-md border border-stroke text-14-regular outline-none focus:border-grey-01 transition-colors" />
          </div>
          <div>
            <label className="text-12-medium text-grey-01 mb-[var(--space-1)] block">类别</label>
            <select value={category} onChange={(e) => setCategory(e.target.value as ClockCategory)}
              className="w-full h-[var(--height-input)] px-[var(--space-3)] rounded-md border border-stroke text-14-regular outline-none focus:border-grey-01 transition-colors bg-white">
              {CLOCK_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="text-12-medium text-grey-01 mb-[var(--space-1)] block">描述 <span className="text-red">*</span></label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Agent 在该时间点的操作描述..."
            className="w-full h-[72px] p-[var(--space-3)] rounded-lg border border-stroke text-14-regular resize-none outline-none focus:border-grey-01 transition-colors" />
        </div>
        <div>
          <label className="text-12-medium text-grey-01 mb-[var(--space-2)] block">效果标签</label>
          <div className="flex gap-[var(--space-2)] mb-[var(--space-2)]">
            {(['none', 'saved', 'blocked'] as const).map((t) => (
              <button key={t} onClick={() => setEffectType(t)}
                className={`px-[var(--space-3)] py-[5px] rounded-full text-12-medium border-none cursor-pointer transition-colors font-[inherit] ${
                  effectType === t ? t === 'saved' ? 'bg-cyan-tint-08 text-l-cyan' : t === 'blocked' ? 'bg-red-tint-08 text-red' : 'bg-grey-01 text-white' : 'bg-selected text-grey-06 hover:bg-grey-12'
                }`}>{t === 'none' ? '无' : t === 'saved' ? 'Saved' : 'Blocked'}</button>
            ))}
          </div>
          {effectType !== 'none' && (
            <div className="grid grid-cols-[60px_1fr] gap-[var(--space-2)]">
              <select value={effectCurrency} onChange={(e) => setEffectCurrency(e.target.value)}
                className="h-[var(--height-input)] px-2 rounded-md border border-stroke text-14-regular outline-none focus:border-grey-01 bg-white">
                <option value="¥">¥</option><option value="$">$</option>
              </select>
              <input type="number" value={effectAmount} onChange={(e) => setEffectAmount(e.target.value)} placeholder="金额"
                className="h-[var(--height-input)] px-[var(--space-3)] rounded-md border border-stroke text-14-regular outline-none focus:border-grey-01 transition-colors" />
            </div>
          )}
        </div>
        <div className="flex justify-end gap-[var(--space-2)] pt-[var(--space-2)] border-t border-stroke">
          <Button variant="ghost" onClick={onClose}>取消</Button>
          <Button onClick={handleSubmit} disabled={!description.trim()}>{entry ? '保存' : '添加'}</Button>
        </div>
      </div>
    </Dialog>
  )
}

/* ═══════════════════════════════════════════
   审核工作台 · SLA 统计卡片
   ═══════════════════════════════════════════ */
const SLA_ICONS: Record<string, React.ReactNode> = {
  red: <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5"/><path d="M10 6v4.5l3 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M6 14l8-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity=".5"/></svg>,
  orange: <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5"/><path d="M10 6v4.5l3 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  cyan: <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5"/><path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
}

function SlaStatCard({ label, count, variant, active, onClick }: {
  label: string; count: number; variant: 'red' | 'orange' | 'cyan'; active?: boolean; onClick?: () => void
}) {
  const color = variant === 'red' ? 'text-red' : variant === 'orange' ? 'text-orange' : 'text-l-cyan'
  const bg = variant === 'red' ? 'bg-red-tint-08' : variant === 'orange' ? 'bg-orange-tint-10' : 'bg-cyan-tint-12'
  return (
    <button onClick={onClick} className={`flex items-center gap-[var(--space-3)] p-[var(--space-4)] rounded-xl border bg-white cursor-pointer transition-all font-[inherit] text-left group
      ${active ? `border-2 ${variant === 'red' ? 'border-red' : variant === 'orange' ? 'border-orange' : 'border-l-cyan'} shadow-sm` : 'border-stroke hover:border-grey-06'}`}>
      <div className={`w-[36px] h-[36px] rounded-lg flex items-center justify-center ${bg} ${color} shrink-0`}>
        {SLA_ICONS[variant]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-12-medium text-grey-08">{label}</div>
        <div className={`text-20-bold ${color}`}>{count}</div>
      </div>
      {active && <div className={`w-[6px] h-[6px] rounded-full shrink-0 ${variant === 'red' ? 'bg-red' : variant === 'orange' ? 'bg-orange' : 'bg-l-cyan'}`} />}
    </button>
  )
}

/* ═══════════════════════════════════════════
   审核工作台 · 操作反馈 Toast
   ═══════════════════════════════════════════ */
function Toast({ message, visible }: { message: string; visible: boolean }) {
  if (!visible) return null
  return (
    <div className="fixed bottom-[var(--space-6)] left-1/2 -translate-x-1/2 z-50 px-[var(--space-5)] py-[var(--space-3)] rounded-xl bg-grey-01 text-white text-14-medium shadow-lg animate-[fadeInUp_0.25s_ease]">
      {message}
    </div>
  )
}

/* ═══════════════════════════════════════════
   审核工作台 · 行内操作下拉
   ═══════════════════════════════════════════ */
const MENU_ICONS: Record<string, React.ReactNode> = {
  detail: <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="6"/><path d="M8 7v4"/><circle cx="8" cy="5.5" r=".5" fill="currentColor"/></svg>,
  history: <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="6"/><path d="M8 5v3l2 1.5"/></svg>,
  edit: <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 2l3 3-8 8H3v-3z"/></svg>,
  block: <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="6"/><path d="M4 12L12 4"/></svg>,
  hide: <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2 8s2.5-5 6-5 6 5 6 5-2.5 5-6 5-6-5-6-5z"/><path d="M4 12L12 4"/></svg>,
  return: <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3L2 7l4 4"/><path d="M2 7h10a2 2 0 012 2v2"/></svg>,
  recall: <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3L2 7l4 4"/><path d="M2 7h12"/></svg>,
}

function ActionMenu({ items, onSelect }: { items: { key: string; label: string; danger?: boolean }[]; onSelect: (key: string) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button onClick={(ev) => { ev.stopPropagation(); setOpen(!open) }}
        className={`w-[24px] h-[24px] flex items-center justify-center rounded-md cursor-pointer transition-all font-[inherit] border-none ${
          open ? 'bg-selected text-grey-01' : 'bg-transparent text-grey-08 hover:text-grey-01 hover:bg-selected'}`}
        aria-label="更多操作">
        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><circle cx="3" cy="8" r="1.3"/><circle cx="8" cy="8" r="1.3"/><circle cx="13" cy="8" r="1.3"/></svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-[34px] z-20 min-w-[140px] py-[var(--space-1)] rounded-xl border border-stroke bg-white shadow-xl animate-[fadeInUp_0.15s_ease]">
            {items.map((it, i) => (
              <button key={it.key} onClick={(ev) => { ev.stopPropagation(); onSelect(it.key); setOpen(false) }}
                className={`w-full text-left px-[var(--space-3)] py-[6px] text-12-medium border-none bg-transparent cursor-pointer font-[inherit] hover:bg-selected transition-colors flex items-center gap-[var(--space-2)]
                  ${it.danger ? 'text-red' : 'text-grey-01'}
                  ${i > 0 && items[i - 1]?.danger !== it.danger ? 'border-t border-stroke' : ''}`}>
                <span className="opacity-60 shrink-0">{MENU_ICONS[it.key] || null}</span>
                {it.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════
   主页面
   ═══════════════════════════════════════════ */
function ClockConfigPageContent() {
  const { client, setClient } = useClient()
  const searchParams = useSearchParams()
  const [topTab, setTopTab] = useState<'config' | 'review'>('config')

  /* ── Timeline 配置状态 ── */
  const [entries, setEntries] = useState<ClockEntry[]>([])
  const [tone, setTone] = useState<ToneVariant>('professional')
  const [sophistication, setSophistication] = useState<ClientSophistication>('standard')
  const [initialized, setInitialized] = useState(false)
  const [editEntry, setEditEntry] = useState<ClockEntry | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [publishedMsg, setPublishedMsg] = useState(false)

  /* ── 审核工作台状态 ── */
  const [events, setEvents] = useState<AtcReviewEvent[]>([])
  const [role, setRole] = useState<AtcViewerRole>('delivery')
  const [selected, setSelected] = useState<Set<string>>(() => new Set())
  const [detail, setDetail] = useState<AtcReviewEvent | null>(null)
  const [editCopy, setEditCopy] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterSla, setFilterSla] = useState<'all' | 'red' | 'yellow' | 'green'>('all')
  const [filterSens, setFilterSens] = useState<'all' | 'P0' | 'P1' | 'P2'>('all')
  const [toast, setToast] = useState<string | null>(null)
  const showToast = useCallback((msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2000) }, [])

  /* ── URL 参数 & 客户切换 & 审核数据初始化 ── */
  useEffect(() => {
    if (initialized) return
    setEvents(cloneAtcReviewEvents())
    const paramClient = searchParams.get('client')
    const paramTab = searchParams.get('tab')
    if (paramTab === 'review') setTopTab('review')
    if (paramClient) {
      const cl = clients.find((c) => c.id === paramClient)
      if (cl) setClient({ id: cl.id, name: cl.name, industry: cl.industry, grade: cl.grade })
    }
    setInitialized(true)
  }, [searchParams, initialized]) // eslint-disable-line react-hooks/exhaustive-deps

  const activeClientId = client?.id || ''
  useEffect(() => {
    if (!activeClientId) return
    const config = clientClockConfigs.find((cc) => cc.clientId === activeClientId)
    const cl = clients.find((c) => c.id === activeClientId)
    const tpl = config ? industryTemplates.find((t) => t.id === config.templateId) : cl ? industryTemplates.find((t) => t.industry === cl.industry) : null
    setEntries(config?.entries || tpl?.entries || [])
    setTone(config?.tone || tpl?.tone || 'professional')
    setSophistication(config?.clientSophistication || 'standard')
  }, [activeClientId])

  const selectedClientId = client?.id || ''
  const selectedClient = clients.find((c) => c.id === selectedClientId)
  const existingConfig = clientClockConfigs.find((c) => c.clientId === selectedClientId)
  const matchingTemplate = existingConfig
    ? industryTemplates.find((t) => t.id === existingConfig.templateId)
    : selectedClient ? industryTemplates.find((t) => t.industry === selectedClient.industry) : null

  const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cl = clients.find((c) => c.id === e.target.value)
    if (cl) setClient({ id: cl.id, name: cl.name, industry: cl.industry, grade: cl.grade })
    else setClient(null)
  }

  const handleToggle = (id: string) => setEntries((prev) => prev.map((e) => e.id === id ? { ...e, active: !e.active } : e))
  const handleDelete = (id: string) => setEntries((prev) => prev.filter((e) => e.id !== id))
  const handleSaveEntry = (entry: ClockEntry) => {
    setEntries((prev) => { const idx = prev.findIndex((e) => e.id === entry.id); if (idx >= 0) { const u = [...prev]; u[idx] = entry; return u } return [...prev, { ...entry, order: prev.length }] })
    setEditEntry(null); setShowAddDialog(false)
  }
  const handleResetFromTemplate = () => { if (matchingTemplate) { setEntries(matchingTemplate.entries); setTone(matchingTemplate.tone) } }
  const handlePublish = () => { setPublishedMsg(true); setTimeout(() => setPublishedMsg(false), 2000) }
  const activeCount = entries.filter((e) => e.active).length

  /* ── 审核工作台逻辑 ── */
  const openDetail = useCallback((e: AtcReviewEvent) => { setDetail(e); setEditCopy(e.customerCopyDraft) }, [])

  useEffect(() => { if (detail) setEditCopy(detail.customerCopyDraft) }, [detail?.id, detail?.customerCopyDraft]) // eslint-disable-line react-hooks/exhaustive-deps

  const patchEvent = useCallback((id: string, patch: Partial<AtcReviewEvent>) => {
    setEvents((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)))
    setDetail((d) => (d && d.id === id ? { ...d, ...patch } : d))
  }, [])

  const pushAudit = useCallback((id: string, entry: AtcReviewEvent['auditLog'][0]) => {
    setEvents((prev) => prev.map((x) => (x.id === id ? { ...x, auditLog: [...x.auditLog, entry] } : x)))
    setDetail((d) => d && d.id === id ? { ...d, auditLog: [...d.auditLog, entry] } : d)
  }, [])

  const slaCounts = useMemo(() => {
    let red = 0, yellow = 0, green = 0
    events.forEach((e) => {
      if (e.currentStage === 'published' || e.currentStage === 'blocked') return
      const light = getSlaTrafficLight(e.slaDueAt)
      if (light === 'red') red++
      else if (light === 'yellow') yellow++
      else green++
    })
    return { red, yellow, green }
  }, [events])

  const pendingByClient = useMemo(() => {
    const m = new Map<string, number>()
    events.forEach((e) => {
      if (e.currentStage === 'published' || e.currentStage === 'blocked') return
      clients.forEach((cl) => {
        if (e.clientName.toLowerCase().startsWith(cl.id)) m.set(cl.id, (m.get(cl.id) || 0) + 1)
      })
    })
    return m
  }, [events])

  const filtered = useMemo(() => {
    let list = events
    if (selectedClientId) {
      list = list.filter((e) => e.clientName.toLowerCase().startsWith(selectedClientId))
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter((e) => e.clientName.toLowerCase().includes(q) || e.id.toLowerCase().includes(q) || e.customerCopyDraft.toLowerCase().includes(q))
    }
    if (filterSla !== 'all') {
      list = list.filter((e) => {
        if (e.currentStage === 'published' || e.currentStage === 'blocked') return filterSla === 'green'
        return getSlaTrafficLight(e.slaDueAt) === filterSla
      })
    }
    if (filterSens !== 'all') list = list.filter((e) => e.sensitivity === filterSens)
    return list
  }, [events, selectedClientId, searchQuery, filterSla, filterSens])

  const totalPending = useMemo(() => events.filter((e) => e.currentStage !== 'published' && e.currentStage !== 'blocked').length, [events])
  const todoCount = useMemo(() => events.filter((e) => isMyTurn(e, role)).length, [events, role])

  const toggleSelect = (id: string) => setSelected((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n })
  const selectAllFiltered = () => { if (selected.size === filtered.length) setSelected(new Set()); else setSelected(new Set(filtered.map((e) => e.id))) }

  const bulkAdvance = () => {
    const ids = [...selected].filter((id) => { const e = events.find((x) => x.id === id); return e && isMyTurn(e, role) })
    ids.forEach((id) => {
      const e = events.find((x) => x.id === id); if (!e) return
      if (role === 'delivery' && e.currentStage === 'at_delivery') {
        patchEvent(id, { currentStage: 'at_ops' }); pushAudit(id, { id: `b-${Date.now()}-${id}`, at: ATC_REFERENCE_NOW_ISO, action: 'delivery_submit_ops', actor: '张三（批量）' })
      } else if (role === 'ops' && e.currentStage === 'at_ops') {
        patchEvent(id, { currentStage: 'at_sales' }); pushAudit(id, { id: `b-${Date.now()}-${id}`, at: ATC_REFERENCE_NOW_ISO, action: 'ops_submit_sales', actor: '王五（批量）' })
      } else if (role === 'sales' && e.currentStage === 'at_sales') {
        patchEvent(id, { currentStage: 'published' }); pushAudit(id, { id: `b-${Date.now()}-${id}`, at: ATC_REFERENCE_NOW_ISO, action: 'sales_publish', actor: '孙八（批量）' })
      }
    })
    setSelected(new Set())
    showToast(`已批量提交 ${ids.length} 条`)
  }

  const bulkBlock = () => {
    const ids = [...selected].filter((id) => { const e = events.find((x) => x.id === id); return e && isMyTurn(e, role) })
    ids.forEach((id) => {
      patchEvent(id, { currentStage: 'blocked', blockedReason: role === 'delivery' ? '批量废弃' : '批量隐藏' })
      pushAudit(id, { id: `b-${Date.now()}-${id}`, at: ATC_REFERENCE_NOW_ISO, action: role === 'delivery' ? 'delivery_reject' : 'sales_hide', actor: '批量操作' })
    })
    setSelected(new Set())
    showToast(`已批量驳回 ${ids.length} 条`)
  }

  const copyEdited = detail ? editCopy !== detail.customerCopyDraft : false

  const getPrimaryAction = useCallback((ev: AtcReviewEvent, r: AtcViewerRole): { label: string; onClick: () => void } | null => {
    if (r === 'delivery' && ev.currentStage === 'at_delivery') return { label: '提交运营', onClick: () => { patchEvent(ev.id, { currentStage: 'at_ops' }); pushAudit(ev.id, { id: `a-${Date.now()}`, at: ATC_REFERENCE_NOW_ISO, action: 'delivery_submit_ops', actor: '张三' }); showToast('已提交至运营审核') } }
    if (r === 'ops' && ev.currentStage === 'at_ops') return { label: '提交销售', onClick: () => { patchEvent(ev.id, { currentStage: 'at_sales' }); pushAudit(ev.id, { id: `a-${Date.now()}`, at: ATC_REFERENCE_NOW_ISO, action: 'ops_submit_sales', actor: '王五' }); showToast('已提交至销售确认') } }
    if (r === 'sales' && ev.currentStage === 'at_sales') return { label: '发布', onClick: () => { patchEvent(ev.id, { currentStage: 'published' }); pushAudit(ev.id, { id: `a-${Date.now()}`, at: ATC_REFERENCE_NOW_ISO, action: 'sales_publish', actor: '孙八' }); showToast('已发布') } }
    return null
  }, [patchEvent, pushAudit, showToast])

  const getMenuItems = useCallback((ev: AtcReviewEvent, r: AtcViewerRole) => {
    const items: { key: string; label: string; danger?: boolean }[] = [{ key: 'detail', label: '查看详情' }, { key: 'history', label: '查看历史' }]
    if (isMyTurn(ev, r)) items.push({ key: 'edit', label: '编辑文案' })
    if (r === 'delivery' && ev.currentStage === 'at_delivery') items.push({ key: 'block', label: '拦截废弃', danger: true })
    if (r === 'ops' && ev.currentStage === 'at_ops') items.push({ key: 'return', label: '退回交付' })
    if (r === 'sales' && ev.currentStage === 'at_sales') items.push({ key: 'hide', label: '拦截隐藏', danger: true })
    if (r === 'sales' && ev.currentStage === 'published') items.push({ key: 'recall', label: '撤回', danger: true })
    return items
  }, [])

  const handleMenuAction = useCallback((ev: AtcReviewEvent, key: string) => {
    if (key === 'detail' || key === 'edit' || key === 'history') { openDetail(ev); return }
    if (key === 'block') { patchEvent(ev.id, { currentStage: 'blocked', blockedReason: '交付判定无效，废弃' }); pushAudit(ev.id, { id: `a-${Date.now()}`, at: ATC_REFERENCE_NOW_ISO, action: 'delivery_reject', actor: '张三' }); showToast('已拦截废弃') }
    if (key === 'return') { patchEvent(ev.id, { currentStage: 'at_delivery' }); pushAudit(ev.id, { id: `a-${Date.now()}`, at: ATC_REFERENCE_NOW_ISO, action: 'ops_return_delivery', actor: '王五' }); showToast('已退回交付') }
    if (key === 'hide') { patchEvent(ev.id, { currentStage: 'blocked', blockedReason: '销售客情干预，隐藏' }); pushAudit(ev.id, { id: `a-${Date.now()}`, at: ATC_REFERENCE_NOW_ISO, action: 'sales_hide', actor: '孙八' }); showToast('已隐藏') }
    if (key === 'recall') { patchEvent(ev.id, { currentStage: 'blocked', blockedReason: '已发布内容撤回' }); pushAudit(ev.id, { id: `a-${Date.now()}`, at: ATC_REFERENCE_NOW_ISO, action: 'sales_recall', actor: '孙八' }); showToast('已撤回') }
  }, [openDetail, patchEvent, pushAudit, showToast])

  /* ═══════════════ 渲染 ═══════════════ */
  return (
    <div suppressHydrationWarning>
      {/* ── 页面标题 ── */}
      <div className="flex items-center justify-between mb-[var(--space-4)]">
        <div>
          <h1 className="text-24-bold text-grey-01">Around the Clock</h1>
          <p className="text-14-regular text-grey-08 mt-[var(--space-1)]">24h 策略叙事管理 · Timeline 配置 & 审核工作台</p>
        </div>
        <select value={selectedClientId} onChange={handleClientChange} aria-label="选择客户"
          className="text-14-regular rounded-md px-3 py-1 h-[var(--size-avatar-md)] border border-grey-12 bg-white text-grey-01 outline-none focus:border-grey-01 transition-colors">
          <option value="">全部客户</option>
          {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* ── 顶级 Tab ── */}
      <div className="flex gap-[var(--space-1)] mb-[var(--space-4)] border-b border-stroke">
        {([
          { key: 'config' as const, label: 'Timeline 配置', count: 0 },
          { key: 'review' as const, label: '审核工作台', count: totalPending },
        ]).map((t) => (
          <button key={t.key} onClick={() => setTopTab(t.key)}
            className={`px-[var(--space-4)] py-[var(--space-2)] text-14-medium border-none cursor-pointer transition-colors font-[inherit] bg-transparent border-b-2 -mb-px flex items-center gap-[6px] ${
              topTab === t.key ? 'text-grey-01 border-b-l-cyan' : 'text-grey-08 border-b-transparent hover:text-grey-01'
            }`}>
            {t.label}
            {t.count > 0 && <span className="text-[10px] font-semibold leading-[16px] min-w-[16px] text-center px-[4px] rounded-full bg-orange text-white">{t.count}</span>}
          </button>
        ))}
      </div>

      {/* ═══════════════ Tab 1: Timeline 配置 ═══════════════ */}
      {topTab === 'config' && (
        <>
          {!selectedClient ? (
            <div className="flex flex-col gap-[var(--space-3)]">
              {clients.map((cl) => {
                const config = clientClockConfigs.find((cc) => cc.clientId === cl.id)
                const tpl = config ? industryTemplates.find((t) => t.id === config.templateId) : industryTemplates.find((t) => t.industry === cl.industry)
                const entryList = config?.entries || tpl?.entries || []
                const ac = entryList.filter((e) => e.active).length
                const toneLabel = TONE_OPTIONS.find((t) => t.value === (config?.tone || tpl?.tone || 'professional'))?.label || '专业版'
                const pendingCount = pendingByClient.get(cl.id) || 0
                return (
                  <Card key={cl.id} padding="none">
                    <button className="w-full text-left bg-transparent border-none cursor-pointer p-[var(--space-3)] hover:bg-selected transition-colors font-[inherit] rounded-xl"
                      onClick={() => setClient({ id: cl.id, name: cl.name, industry: cl.industry, grade: cl.grade })}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-[var(--space-3)]">
                          <Avatar name={cl.name[0]} size="sm" />
                          <div>
                            <div className="flex items-baseline gap-[6px]">
                              <span className="text-14-bold text-grey-01">{cl.name}</span>
                              <span className="text-12-regular text-grey-08">{cl.industry}</span>
                            </div>
                            <div className="flex items-center gap-[var(--space-3)] mt-[2px]">
                              <span className="text-12-regular text-grey-08">{entryList.length} 条目</span>
                              <span className="text-12-regular text-l-cyan">{ac} 已启用</span>
                              <span className="text-12-regular text-grey-08">{toneLabel}</span>
                              {pendingCount > 0 && (
                                <span className="text-12-regular text-orange cursor-pointer hover:underline flex items-center gap-[3px]"
                                  onClick={(e) => { e.stopPropagation(); setClient({ id: cl.id, name: cl.name, industry: cl.industry, grade: cl.grade }); setTopTab('review') }}>
                                  <span className="w-[4px] h-[4px] rounded-full bg-orange" />
                                  {pendingCount} 待审
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-[var(--space-2)]">
                          {config?.lastPublished && <span className="text-10-regular text-grey-08">发布于 {config.lastPublished}</span>}
                          {entryList.length > 0 ? <Badge variant="cyan">{ac}/{entryList.length}</Badge> : <Badge variant="grey">未配置</Badge>}
                          <svg width="16" height="16" fill="none" stroke="var(--grey-08)" strokeWidth="1.5" strokeLinecap="round" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" /></svg>
                        </div>
                      </div>
                    </button>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="grid gap-[var(--space-4)]" style={{ gridTemplateColumns: '1fr 300px' }}>
              <div>
                <div className="flex items-center justify-between mb-[var(--space-3)] p-[var(--space-3)] rounded-lg bg-bg">
                  <div className="flex items-center gap-[var(--space-2)]">
                    <Avatar name={selectedClient.name[0]} size="sm" />
                    <span className="text-14-bold text-grey-01">{selectedClient.name}</span>
                    <Badge variant="grey">{selectedClient.industry}</Badge>
                    {matchingTemplate && <span className="text-12-regular text-grey-08">基于模板: {matchingTemplate.name}</span>}
                  </div>
                  <span className="text-12-regular text-grey-08">{activeCount}/{entries.length} 条启用</span>
                </div>
                <div className="flex flex-col gap-[var(--space-2)]">
                  {entries.sort((a, b) => a.time.replace(':', '').localeCompare(b.time.replace(':', ''))).map((entry) => (
                    <EntryRow key={entry.id} entry={entry} sophistication={sophistication} onEdit={() => setEditEntry(entry)} onToggle={() => handleToggle(entry.id)} onDelete={() => handleDelete(entry.id)} />
                  ))}
                </div>
                <button onClick={() => setShowAddDialog(true)} className="w-full mt-[var(--space-2)] p-[var(--space-3)] rounded-lg border border-dashed border-grey-12 text-12-medium text-grey-06 hover:text-grey-01 hover:border-grey-06 transition-colors bg-transparent cursor-pointer font-[inherit]">+ 添加条目</button>
              </div>
              <div className="flex flex-col gap-[var(--space-3)]">
                <Card><div className="text-12-bold text-grey-06 mb-[var(--space-2)]">时钟预览</div><ClockPreview entries={entries} /></Card>
                <Card>
                  <div className="text-12-bold text-grey-06 mb-[var(--space-2)]">内容语气</div>
                  <div className="flex flex-col gap-[var(--space-1)]">
                    {TONE_OPTIONS.map((opt) => (
                      <button key={opt.value} onClick={() => setTone(opt.value)}
                        className={`flex items-center gap-[var(--space-2)] px-[var(--space-3)] py-[var(--space-2)] rounded-lg text-left border cursor-pointer transition-all font-[inherit] ${
                          tone === opt.value ? 'border-grey-01 bg-selected shadow-sm' : 'border-stroke bg-white hover:bg-selected'}`}>
                        <span className={`w-[8px] h-[8px] rounded-full ${tone === opt.value ? 'bg-l-cyan' : 'bg-grey-12'}`} />
                        <span className={`text-14-medium ${tone === opt.value ? 'text-grey-01' : 'text-grey-06'}`}>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </Card>
                <Card>
                  <div className="text-12-bold text-grey-06 mb-[var(--space-2)]">客户认知水平</div>
                  <p className="text-10-regular text-grey-08 mb-[var(--space-2)]">影响对客文案模糊化强度</p>
                  <Select id="clock-client-sophistication" value={sophistication} onChange={(e) => setSophistication(e.target.value as ClientSophistication)} options={CLIENT_SOPHISTICATION_OPTIONS} />
                </Card>
                <Card>
                  <div className="flex flex-col gap-[var(--space-2)]">
                    <Button variant="secondary" onClick={handleResetFromTemplate} className="w-full">从模板重置</Button>
                    <Button onClick={handlePublish} className="w-full">{publishedMsg ? '已发布 !' : '发布到客户端'}</Button>
                    {existingConfig?.lastPublished && <p className="text-10-regular text-grey-08 text-center">上次发布: {existingConfig.lastPublished}</p>}
                  </div>
                </Card>
              </div>
            </div>
          )}
          {(showAddDialog || editEntry) && <EntryFormDialog entry={editEntry} onSave={handleSaveEntry} onClose={() => { setEditEntry(null); setShowAddDialog(false) }} />}
        </>
      )}

      {/* ═══════════════ Tab 2: 审核工作台 ═══════════════ */}
      {topTab === 'review' && (
        <>
          {/* ── 客户上下文条 ── */}
          {selectedClient && (
            <div className="flex items-center justify-between mb-[var(--space-3)] px-[var(--space-3)] py-[var(--space-2)] rounded-lg bg-bg border border-stroke">
              <div className="flex items-center gap-[var(--space-2)]">
                <Avatar name={selectedClient.name[0]} size="sm" />
                <span className="text-14-medium text-grey-01">{selectedClient.name}</span>
                <Badge variant="grey">{selectedClient.industry}</Badge>
                <span className="text-12-regular text-grey-08">的审核事件</span>
              </div>
              <div className="flex items-center gap-[var(--space-3)]">
                <button onClick={() => setTopTab('config')}
                  className="text-12-medium text-l-cyan bg-transparent border-none cursor-pointer font-[inherit] hover:underline transition-opacity flex items-center gap-[3px]">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="6"/><path d="M8 5v3l2 1.5"/></svg>
                  查看 Timeline 配置
                </button>
                <button onClick={() => { setClient(null) }}
                  className="text-12-medium text-grey-08 bg-transparent border-none cursor-pointer font-[inherit] hover:text-grey-01 transition-colors">
                  查看全部
                </button>
              </div>
            </div>
          )}

          {/* ── SLA 统计卡片（可点击筛选） ── */}
          <div className="grid grid-cols-3 gap-[var(--space-3)] mb-[var(--space-5)]">
            <SlaStatCard label="已超时" count={slaCounts.red} variant="red" active={filterSla === 'red'}
              onClick={() => setFilterSla(filterSla === 'red' ? 'all' : 'red')} />
            <SlaStatCard label="临近超时" count={slaCounts.yellow} variant="orange" active={filterSla === 'yellow'}
              onClick={() => setFilterSla(filterSla === 'yellow' ? 'all' : 'yellow')} />
            <SlaStatCard label="时效充足" count={slaCounts.green} variant="cyan" active={filterSla === 'green'}
              onClick={() => setFilterSla(filterSla === 'green' ? 'all' : 'green')} />
          </div>

          {/* ── 搜索 + 筛选 + 批量操作 ── */}
          <div className="flex items-center gap-[var(--space-3)] mb-[var(--space-3)] flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-[320px]">
              <svg className="absolute left-[var(--space-3)] top-1/2 -translate-y-1/2 text-grey-08 pointer-events-none" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="5"/><path d="M11 11l3.5 3.5"/></svg>
              <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="搜索客户名、事件ID或文案..."
                className="w-full h-[var(--height-input)] pl-[var(--space-8)] pr-[var(--space-8)] rounded-lg border border-stroke text-14-regular outline-none focus:border-l-cyan transition-colors bg-white" />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-[var(--space-2)] top-1/2 -translate-y-1/2 w-[20px] h-[20px] flex items-center justify-center rounded-full bg-grey-12 text-grey-06 hover:text-grey-01 hover:bg-grey-08 border-none cursor-pointer transition-colors" aria-label="清空搜索">
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 2l8 8M10 2l-8 8"/></svg>
                </button>
              )}
            </div>
            <select value={filterSla} onChange={(e) => setFilterSla(e.target.value as typeof filterSla)} aria-label="SLA 状态筛选"
              className={`h-[var(--height-input)] px-[var(--space-3)] pr-[var(--space-6)] rounded-lg border text-12-medium bg-white outline-none cursor-pointer transition-colors appearance-none bg-[url('data:image/svg+xml,<svg viewBox="0 0 12 12" fill="none" stroke="%23999" stroke-width="1.5" xmlns="http://www.w3.org/2000/svg"><path d="M3 4.5l3 3 3-3"/></svg>')] bg-[length:12px] bg-[right_8px_center] bg-no-repeat
                ${filterSla !== 'all' ? 'border-l-cyan text-l-cyan' : 'border-stroke text-grey-01'}`}>
              <option value="all">▽ SLA 状态</option>
              <option value="red">⊘ 已超时</option>
              <option value="yellow">◔ 临近超时</option>
              <option value="green">◉ 时效充足</option>
            </select>
            <select value={filterSens} onChange={(e) => setFilterSens(e.target.value as typeof filterSens)} aria-label="敏感等级筛选"
              className={`h-[var(--height-input)] px-[var(--space-3)] pr-[var(--space-6)] rounded-lg border text-12-medium bg-white outline-none cursor-pointer transition-colors appearance-none bg-[url('data:image/svg+xml,<svg viewBox="0 0 12 12" fill="none" stroke="%23999" stroke-width="1.5" xmlns="http://www.w3.org/2000/svg"><path d="M3 4.5l3 3 3-3"/></svg>')] bg-[length:12px] bg-[right_8px_center] bg-no-repeat
                ${filterSens !== 'all' ? 'border-l-cyan text-l-cyan' : 'border-stroke text-grey-01'}`}>
              <option value="all">⊙ 敏感等级</option>
              <option value="P0">P0 高危</option>
              <option value="P1">P1 敏感</option>
              <option value="P2">P2 常规</option>
            </select>
            <select value={role} onChange={(e) => { setRole(e.target.value as AtcViewerRole); setSelected(new Set()) }} aria-label="审核角色"
              className="h-[var(--height-input)] px-[var(--space-3)] pr-[var(--space-6)] rounded-lg border border-stroke text-12-medium text-grey-01 bg-white outline-none cursor-pointer appearance-none bg-[url('data:image/svg+xml,<svg viewBox=%220 0 12 12%22 fill=%22none%22 stroke=%22%23999%22 stroke-width=%221.5%22 xmlns=%22http://www.w3.org/2000/svg%22><path d=%22M3 4.5l3 3 3-3%22/></svg>')] bg-[length:12px] bg-[right_8px_center] bg-no-repeat">
              {ROLE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <div className="ml-auto flex items-center gap-[6px]">
              {selected.size > 0 && <span className="text-10-medium text-l-cyan bg-cyan-tint-12 px-[6px] py-[2px] rounded-full">{selected.size} 项已选</span>}
              <button disabled={selected.size === 0} onClick={bulkBlock}
                className="h-[30px] px-[var(--space-3)] rounded-lg text-12-medium border border-stroke bg-white text-grey-06 cursor-pointer font-[inherit] transition-all hover:border-grey-06 hover:text-grey-01 disabled:opacity-40 disabled:cursor-not-allowed">驳回</button>
              <button disabled={selected.size === 0} onClick={bulkAdvance}
                className="h-[30px] px-[var(--space-3)] rounded-lg text-12-medium border-none bg-grey-01 text-white cursor-pointer font-[inherit] transition-all hover:opacity-85 disabled:opacity-30 disabled:cursor-not-allowed">通过</button>
            </div>
          </div>

          {/* ── 事件表格 ── */}
          <div className="border border-stroke rounded-xl overflow-hidden bg-white">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-bg border-b border-stroke">
                  <th className="w-[40px] px-[var(--space-3)] py-[10px]">
                    <input type="checkbox" className="atc-checkbox" checked={filtered.length > 0 && selected.size === filtered.length} onChange={selectAllFiltered} aria-label="全选" />
                  </th>
                  <th className="text-left text-10-regular text-grey-08 px-[var(--space-3)] py-[10px] w-[96px] tracking-wider uppercase">时间 / SLA</th>
                  <th className="text-left text-10-regular text-grey-08 px-[var(--space-3)] py-[10px] tracking-wider uppercase">客户名称</th>
                  <th className="text-left text-10-regular text-grey-08 px-[var(--space-3)] py-[10px] w-[170px] tracking-wider uppercase">敏感度 / 原操作</th>
                  <th className="text-left text-10-regular text-grey-08 px-[var(--space-3)] py-[10px] tracking-wider uppercase">展示文案</th>
                  <th className="text-left text-10-regular text-grey-08 px-[var(--space-3)] py-[10px] w-[96px] tracking-wider uppercase">当前节点</th>
                  <th className="text-left text-10-regular text-grey-08 px-[var(--space-3)] py-[10px] w-[130px] tracking-wider uppercase">操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((ev) => {
                  const sla = (ev.currentStage === 'published' || ev.currentStage === 'blocked') ? null : getSlaTrafficLight(ev.slaDueAt)
                  const lastAudit = ev.auditLog[ev.auditLog.length - 1]
                  const primaryAction = getPrimaryAction(ev, role)
                  const menuItems = getMenuItems(ev, role)
                  const isSelected = selected.has(ev.id)
                  const dotCls = STAGE_DOT[ev.currentStage] || 'bg-grey-08'
                  const txtCls = STAGE_TEXT_CLS[ev.currentStage] || 'text-grey-06'
                  return (
                    <tr key={ev.id} className={`border-t border-stroke hover:bg-selected transition-colors cursor-pointer ${isSelected ? 'atc-row-selected' : ''}`} onClick={() => openDetail(ev)}>
                      <td className="px-[var(--space-3)] py-[var(--space-3)] align-top">
                        <input type="checkbox" className="atc-checkbox" checked={isSelected} onClick={(e) => e.stopPropagation()} onChange={() => toggleSelect(ev.id)} aria-label={`选择 ${ev.clientName}`} />
                      </td>
                      <td className="px-[var(--space-3)] py-[var(--space-3)] align-top">
                        <div className="flex items-center gap-[6px]">
                          {sla && <span className={`shrink-0 w-[6px] h-[6px] rounded-full ${sla === 'red' ? 'bg-red' : sla === 'yellow' ? 'bg-orange' : 'bg-l-cyan'}`} />}
                          <span className="text-14-bold text-grey-01 tabular-nums leading-[20px]">{formatAtcDateTime(ev.occurredAt).split(' ')[1]}</span>
                        </div>
                        {sla && (
                          <div className={`text-[9px] leading-[14px] font-medium mt-[1px] ${sla ? 'pl-[12px]' : ''} ${
                            sla === 'red' ? 'text-red' : sla === 'yellow' ? 'text-orange' : 'text-grey-08'
                          }`}>{sla === 'red' ? '已超时' : sla === 'yellow' ? '临近' : '充裕'}</div>
                        )}
                      </td>
                      <td className="px-[var(--space-3)] py-[var(--space-3)] align-top">
                        <div className="text-14-medium text-grey-01">{ev.clientName}</div>
                        {ev.accountLabel && <div className="text-10-regular text-grey-08 mt-[2px]">{ev.accountLabel}</div>}
                      </td>
                      <td className="px-[var(--space-3)] py-[var(--space-3)] align-top">
                        <Badge variant={ev.sensitivity === 'P0' ? 'red' : ev.sensitivity === 'P1' ? 'orange' : 'grey'}>{ev.sensitivity} {ev.sensitivity === 'P0' ? '高危' : ev.sensitivity === 'P1' ? '敏感' : '常规'}</Badge>
                        <div className="text-10-regular text-grey-08 mt-[4px] truncate max-w-[150px]">{EVENT_TYPE_LABEL[ev.eventType] || ev.eventType}</div>
                      </td>
                      <td className="px-[var(--space-3)] py-[var(--space-3)] align-top">
                        <div className="text-12-regular text-grey-01 line-clamp-2">&ldquo;{ev.customerCopyDraft}&rdquo;</div>
                        {lastAudit && (
                          <div className="text-10-regular text-grey-08 mt-[3px] flex items-center gap-[4px]">
                            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2" className="shrink-0 opacity-60"><path d="M6 1v4l2.5 1.5"/><circle cx="6" cy="6" r="5"/></svg>
                            前序: {auditActionLabel(lastAudit.action)} · {lastAudit.actor}
                          </div>
                        )}
                      </td>
                      <td className="px-[var(--space-3)] py-[var(--space-3)] align-top">
                        <div className="flex items-center gap-[5px]">
                          <span className={`shrink-0 w-[5px] h-[5px] rounded-full ${dotCls}`} />
                          <span className={`text-12-medium whitespace-nowrap ${txtCls}`}>{STAGE_LABEL[ev.currentStage]}</span>
                        </div>
                      </td>
                      <td className="px-[var(--space-3)] py-[var(--space-3)] align-top" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-[6px]">
                          {primaryAction && (
                            <button onClick={primaryAction.onClick}
                              className="text-12-medium text-l-cyan bg-transparent border-none cursor-pointer font-[inherit] hover:underline active:opacity-70 transition-opacity whitespace-nowrap">
                              {primaryAction.label}
                            </button>
                          )}
                          {primaryAction && menuItems.length > 0 && <span className="text-grey-12">|</span>}
                          {menuItems.length > 0 && (
                            <ActionMenu items={menuItems} onSelect={(key) => handleMenuAction(ev, key)} />
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-[var(--space-4)] py-[var(--space-8)] text-center text-14-regular text-grey-08">
                    <div className="flex flex-col items-center gap-[var(--space-2)]">
                      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="var(--grey-12)" strokeWidth="1.5"><circle cx="16" cy="16" r="12"/><path d="M12 12l8 8M20 12l-8 8"/></svg>
                      暂无匹配事件
                    </div>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 表格底部统计 */}
          <div className="flex items-center justify-between mt-[var(--space-3)] px-[var(--space-1)]">
            <span className="text-12-regular text-grey-08">共 {filtered.length} 条{searchQuery || filterSla !== 'all' || filterSens !== 'all' ? `（筛选自 ${events.length} 条）` : ''}</span>
          </div>

          {/* ── 详情 Drawer ── */}
          <Drawer open={!!detail} onClose={() => setDetail(null)} title={detail ? `${detail.clientName} · 事件详情` : undefined} width={540}>
            {detail && (
              <div className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto flex flex-col gap-[var(--space-4)] pb-[var(--space-4)]">
                  {detail.blockedReason && (
                    <div className="flex items-start gap-[var(--space-2)] p-[var(--space-3)] rounded-lg bg-red-tint-08 text-red text-12-regular">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0 mt-[1px]"><circle cx="8" cy="8" r="6"/><path d="M8 5v3"/><circle cx="8" cy="11" r=".5" fill="currentColor"/></svg>
                      {detail.blockedReason}
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-[var(--space-2)]">
                    <Badge variant={detail.sensitivity === 'P0' ? 'red' : detail.sensitivity === 'P1' ? 'orange' : 'grey'}>{detail.sensitivity}</Badge>
                    <Badge variant="grey">{EVENT_TYPE_LABEL[detail.eventType]}</Badge>
                    <Badge variant="cyan">{STAGE_LABEL[detail.currentStage]}</Badge>
                    <span className="text-12-regular text-grey-08 ml-auto">{formatAtcDateTime(detail.occurredAt)}</span>
                  </div>

                  <div className="border-t border-stroke" />

                  <div>
                    <div className="text-12-bold text-grey-01 mb-[var(--space-2)] flex items-center gap-[var(--space-2)]">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="var(--grey-08)" strokeWidth="1.5" strokeLinecap="round"><path d="M3 3h10M3 8h7M3 13h4"/></svg>
                      叙事链
                    </div>
                    <div className="grid grid-cols-[auto_1fr] gap-x-[var(--space-3)] gap-y-[6px] text-12-regular pl-[var(--space-1)]">
                      {(['signal', 'strategy', 'action', 'outcome'] as const).map((k) => (
                        <><span key={`l-${k}`} className="text-grey-01 text-12-medium whitespace-nowrap">{k === 'signal' ? '信号' : k === 'strategy' ? '策略' : k === 'action' ? '动作' : '预期'}</span><span key={`v-${k}`} className="text-grey-06">{detail.narrative[k]}</span></>
                      ))}
                    </div>
                  </div>

                  {detail.kpiRefs.length > 0 && (
                    <div className="flex flex-wrap gap-[var(--space-2)]">{detail.kpiRefs.map((k) => <Badge key={k} variant="cyan">{kpiRefLabel(k)}</Badge>)}</div>
                  )}

                  {detail.experimentProgress && (
                    <div>
                      <div className="text-12-bold text-grey-01 mb-[var(--space-2)]">{detail.experimentProgress.label}</div>
                      <Stepper steps={Array.from({ length: detail.experimentProgress.totalSteps }, (_, i) => ({ key: `e${i}`, label: `E${i + 1}` }))} currentStep={detail.experimentProgress.currentStep} />
                    </div>
                  )}

                  <div className="border-t border-stroke" />

                  <div className={`rounded-xl border p-[var(--space-4)] transition-colors ${copyEdited ? 'border-l-cyan bg-cyan-tint-12' : 'border-stroke'}`}>
                    <div className="flex items-center justify-between mb-[var(--space-2)]">
                      <span className="text-12-bold text-grey-01 flex items-center gap-[var(--space-2)]">
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="var(--grey-08)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 2l3 3-8 8H3v-3z"/></svg>
                        对客文案编辑
                      </span>
                      {copyEdited && <span className="text-10-medium text-l-cyan bg-cyan-tint-08 px-[8px] py-[2px] rounded-full">已修改</span>}
                    </div>
                    <textarea value={editCopy} onChange={(e) => setEditCopy(e.target.value)}
                      className="w-full min-h-[100px] p-[var(--space-3)] rounded-lg border border-stroke text-14-regular outline-none focus:border-l-cyan bg-white resize-y transition-colors" />
                  </div>

                  {detail.previousCustomerCopy && (
                    <div>
                      <div className="text-12-bold text-grey-01 mb-[var(--space-2)]">版本对比</div>
                      <div className="text-12-regular p-[var(--space-3)] rounded-lg bg-bg border border-stroke space-y-[var(--space-1)]">
                        <p className="text-red line-through">{detail.previousCustomerCopy}</p>
                        <p className="text-l-cyan">{detail.customerCopyDraft}</p>
                      </div>
                    </div>
                  )}

                  <div className="border-t border-stroke" />

                  <div>
                    <div className="text-12-bold text-grey-01 mb-[var(--space-3)] flex items-center gap-[var(--space-2)]">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="var(--grey-08)" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="6"/><path d="M8 5v3l2 1.5"/></svg>
                      操作时间轴
                    </div>
                    <div className="relative pl-[var(--space-4)]">
                      <div className="absolute left-[7px] top-[4px] bottom-[4px] w-[1.5px] bg-stroke" />
                      <ul className="space-y-[var(--space-3)]">
                        {[...detail.auditLog].reverse().map((log, i) => (
                          <li key={log.id} className="relative text-12-regular">
                            <div className={`absolute -left-[calc(var(--space-4)-3px)] top-[5px] w-[9px] h-[9px] rounded-full border-2 border-white ${i === 0 ? 'bg-l-cyan' : 'bg-grey-12'}`} />
                            <div className="text-grey-01 text-12-medium">{auditActionLabel(log.action)}</div>
                            <div className="text-grey-08 text-10-regular mt-[1px]">{formatAtcDateTime(log.at)} · {log.actor}</div>
                            {log.note && <div className="text-grey-06 text-10-regular mt-[1px]">{log.note}</div>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {isMyTurn(detail, role) && (
                  <div className="sticky bottom-0 pt-[var(--space-3)] pb-[var(--space-1)] border-t border-stroke bg-white flex flex-wrap gap-[var(--space-2)]">
                    {getPrimaryAction(detail, role) && (
                      <Button onClick={getPrimaryAction(detail, role)!.onClick}>{getPrimaryAction(detail, role)!.label}</Button>
                    )}
                    <Button variant="secondary" disabled={!copyEdited} onClick={() => {
                      patchEvent(detail.id, { previousCustomerCopy: detail.customerCopyDraft, customerCopyDraft: editCopy })
                      pushAudit(detail.id, { id: `a-${Date.now()}`, at: ATC_REFERENCE_NOW_ISO, action: role === 'delivery' ? 'delivery_edit' : role === 'ops' ? 'ops_polish' : 'sales_edit', actor: role === 'delivery' ? '张三' : role === 'ops' ? '王五' : '孙八', copySnapshot: editCopy })
                      showToast('文案已保存')
                    }}>保存修改</Button>
                  </div>
                )}
              </div>
            )}
          </Drawer>

          <Toast message={toast || ''} visible={!!toast} />
        </>
      )}
    </div>
  )
}

export default function ClockConfigPage() {
  return <Suspense><ClockConfigPageContent /></Suspense>
}
