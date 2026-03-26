'use client'

import { useState, useMemo, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Dialog } from '@/components/ui/Dialog'
import { Select } from '@/components/ui/Select'
import { Input } from '@/components/ui/Input'
import { Toggle } from '@/components/ui/Toggle'
import { Avatar } from '@/components/ui/Avatar'
import { useClient } from '@/lib/client-context'
import {
  clients, clientClockConfigs, industryTemplates,
  CLOCK_CATEGORIES, TONE_OPTIONS,
} from '@/lib/data'
import type { ClockEntry, ClockCategory, ToneVariant, ClientClockConfig } from '@/lib/data'

/* ── Category badge colors ── */
const CATEGORY_STYLE: Record<ClockCategory, string> = {
  Bidding: 'bg-orange-tint-10 text-orange',
  Monitor: 'bg-cyan-tint-12 text-l-cyan',
  Strategy: 'bg-grey-12 text-grey-01',
  Creative: 'bg-red-tint-08 text-red',
}

/* ── 24h Clock Preview ── */
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
        {/* Clock circle */}
        <circle cx="80" cy="80" r="65" fill="none" stroke="var(--grey-12)" strokeWidth="1" />
        <circle cx="80" cy="80" r="50" fill="none" stroke="var(--grey-12)" strokeWidth="0.5" strokeDasharray="2 4" />

        {/* Hour labels */}
        {[0, 3, 6, 9, 12, 15, 18, 21].map((h) => {
          const pos = timeToPos(`${String(h).padStart(2, '0')}:00`, 72)
          return (
            <text key={h} x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="central"
              className="text-[8px] fill-grey-08">{h}</text>
          )
        })}

        {/* Center text */}
        <text x="80" y="76" textAnchor="middle" className="text-[16px] font-bold fill-grey-01">24h</text>
        <text x="80" y="90" textAnchor="middle" className="text-[8px] fill-grey-08">Always On</text>

        {/* Entry dots */}
        {activeEntries.map((entry) => {
          const pos = timeToPos(entry.time, 55)
          const color = entry.category === 'Bidding' ? 'var(--orange)'
            : entry.category === 'Monitor' ? 'var(--cyan)'
              : entry.category === 'Creative' ? 'var(--red)'
                : 'var(--grey-06)'
          return (
            <circle key={entry.id} cx={pos.x} cy={pos.y} r="4" fill={color} opacity="0.8">
              <title>{entry.time} {entry.category}</title>
            </circle>
          )
        })}
      </svg>
    </div>
  )
}

/* ── Entry Row ── */
function EntryRow({
  entry, onEdit, onToggle, onDelete,
}: {
  entry: ClockEntry
  onEdit: () => void
  onToggle: () => void
  onDelete: () => void
}) {
  return (
    <div className={`flex items-start gap-[var(--space-3)] p-[var(--space-3)] rounded-lg border border-stroke transition-opacity ${
      entry.active ? '' : 'opacity-40'
    }`}>
      {/* Time */}
      <span className="text-14-bold text-grey-01 tabular-nums w-[48px] shrink-0 pt-[2px]">{entry.time}</span>

      {/* Category + Description */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-[var(--space-2)] mb-[2px]">
          <span className={`text-12-medium px-[6px] py-[1px] rounded ${CATEGORY_STYLE[entry.category]}`}>
            {entry.category}
          </span>
          {entry.effect.type !== 'none' && (
            <span className={`text-12-medium ${entry.effect.type === 'saved' ? 'text-l-cyan' : 'text-red'}`}>
              {entry.effect.type === 'saved' ? 'Saved' : 'Blocked'} {entry.effect.currency}{entry.effect.amount?.toLocaleString()}
            </span>
          )}
        </div>
        <p className="text-12-regular text-grey-06 line-clamp-2">{entry.description}</p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-[var(--space-2)] shrink-0">
        <Toggle checked={entry.active} onChange={onToggle} />
        <button onClick={onEdit} className="text-grey-08 hover:text-grey-01 bg-transparent border-none cursor-pointer p-[2px]" aria-label="编辑">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 2l3 3-8 8H3v-3z" />
          </svg>
        </button>
        <button onClick={onDelete} className="text-grey-08 hover:text-red bg-transparent border-none cursor-pointer p-[2px]" aria-label="删除">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M4 4l8 8M12 4l-8 8" />
          </svg>
        </button>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════ */
function ClockConfigPageContent() {
  const { client, setClient } = useClient()
  const searchParams = useSearchParams()

  const [entries, setEntries] = useState<ClockEntry[]>([])
  const [tone, setTone] = useState<ToneVariant>('professional')
  const [initialized, setInitialized] = useState(false)

  // Auto-select client from URL ?client= param on mount
  useEffect(() => {
    if (initialized) return
    const paramClient = searchParams.get('client')
    if (paramClient) {
      const cl = clients.find((c) => c.id === paramClient)
      if (cl) {
        setClient({ id: cl.id, name: cl.name, industry: cl.industry, grade: cl.grade })
      }
    }
    setInitialized(true)
  }, [searchParams, initialized]) // eslint-disable-line react-hooks/exhaustive-deps

  // Sync entries/tone whenever the active client changes
  const activeClientId = client?.id || ''
  useEffect(() => {
    if (!activeClientId) return
    const config = clientClockConfigs.find((cc) => cc.clientId === activeClientId)
    const cl = clients.find((c) => c.id === activeClientId)
    const tpl = config
      ? industryTemplates.find((t) => t.id === config.templateId)
      : cl ? industryTemplates.find((t) => t.industry === cl.industry) : null
    setEntries(config?.entries || tpl?.entries || [])
    setTone(config?.tone || tpl?.tone || 'professional')
  }, [activeClientId])

  const selectedClientId = client?.id || ''
  const selectedClient = clients.find((c) => c.id === selectedClientId)

  // Get config for selected client (or create empty)
  const existingConfig = clientClockConfigs.find((c) => c.clientId === selectedClientId)
  const matchingTemplate = existingConfig
    ? industryTemplates.find((t) => t.id === existingConfig.templateId)
    : selectedClient
      ? industryTemplates.find((t) => t.industry === selectedClient.industry)
      : null

  const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cl = clients.find((c) => c.id === e.target.value)
    if (cl) {
      setClient({ id: cl.id, name: cl.name, industry: cl.industry, grade: cl.grade })
    } else {
      setClient(null)
    }
  }
  const [editEntry, setEditEntry] = useState<ClockEntry | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [publishedMsg, setPublishedMsg] = useState(false)

  const handleToggle = (id: string) => {
    setEntries((prev) => prev.map((e) => e.id === id ? { ...e, active: !e.active } : e))
  }

  const handleDelete = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }

  const handleSaveEntry = (entry: ClockEntry) => {
    setEntries((prev) => {
      const idx = prev.findIndex((e) => e.id === entry.id)
      if (idx >= 0) {
        const updated = [...prev]
        updated[idx] = entry
        return updated
      }
      return [...prev, { ...entry, order: prev.length }]
    })
    setEditEntry(null)
    setShowAddDialog(false)
  }

  const handleResetFromTemplate = () => {
    if (matchingTemplate) {
      setEntries(matchingTemplate.entries)
      setTone(matchingTemplate.tone)
    }
  }

  const handlePublish = () => {
    setPublishedMsg(true)
    setTimeout(() => setPublishedMsg(false), 2000)
  }

  const activeCount = entries.filter((e) => e.active).length

  return (
    <div>
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-[var(--space-5)]">
        <div>
          <h1 className="text-24-bold text-grey-01">Clock 配置</h1>
          <p className="text-14-regular text-grey-08 mt-[var(--space-1)]">
            配置客户外部展示的 24h 自动化运行时钟内容
          </p>
        </div>
        <select
          value={selectedClientId}
          onChange={handleClientChange}
          className="text-14-regular rounded-md px-3 py-1 h-[var(--size-avatar-md)] border border-grey-12 bg-white text-grey-01 outline-none focus:border-grey-01 transition-colors"
          aria-label="选择客户"
        >
          <option value="">全部客户</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {!selectedClient ? (
        /* All clients overview */
        <div className="flex flex-col gap-[var(--space-3)]">
          {clients.map((cl) => {
            const config = clientClockConfigs.find((cc) => cc.clientId === cl.id)
            const tpl = config
              ? industryTemplates.find((t) => t.id === config.templateId)
              : industryTemplates.find((t) => t.industry === cl.industry)
            const entryList = config?.entries || tpl?.entries || []
            const activeCount = entryList.filter((e) => e.active).length
            const toneLabel = TONE_OPTIONS.find((t) => t.value === (config?.tone || tpl?.tone || 'professional'))?.label || '专业版'

            return (
              <Card key={cl.id} padding="none">
                <button
                  className="w-full text-left bg-transparent border-none cursor-pointer p-[var(--space-3)] hover:bg-selected transition-colors font-[inherit] rounded-xl"
                  onClick={() => {
                    setClient({ id: cl.id, name: cl.name, industry: cl.industry, grade: cl.grade })
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-[var(--space-3)]">
                      <Avatar name={cl.name[0]} size="sm" />
                      <div>
                        <div className="flex items-center gap-[var(--space-2)]">
                          <span className="text-14-bold text-grey-01">{cl.name}</span>
                          <Badge variant="grey">{cl.industry}</Badge>
                        </div>
                        <div className="flex items-center gap-[var(--space-3)] mt-[2px]">
                          <span className="text-12-regular text-grey-08">{entryList.length} 条目</span>
                          <span className="text-12-regular text-l-cyan">{activeCount} 已启用</span>
                          <span className="text-12-regular text-grey-08">{toneLabel}</span>
                          {tpl && <span className="text-10-regular text-grey-08">模板: {tpl.name}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-[var(--space-2)]">
                      {config?.lastPublished && (
                        <span className="text-10-regular text-grey-08">发布于 {config.lastPublished}</span>
                      )}
                      {entryList.length > 0 ? (
                        <Badge variant="cyan">{activeCount}/{entryList.length}</Badge>
                      ) : (
                        <Badge variant="grey">未配置</Badge>
                      )}
                      <svg width="16" height="16" fill="none" stroke="var(--grey-08)" strokeWidth="1.5" strokeLinecap="round" viewBox="0 0 24 24">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </div>
                  </div>
                  {/* Mini timeline preview — top 3 entries */}
                  {activeCount > 0 && (
                    <div className="flex items-center gap-[var(--space-4)] mt-[var(--space-2)] pt-[var(--space-2)] border-t border-stroke">
                      {entryList.filter((e) => e.active).slice(0, 3).map((entry) => (
                        <div key={entry.id} className="flex items-center gap-[var(--space-1)]">
                          <span className="text-12-bold text-grey-06 tabular-nums">{entry.time}</span>
                          <span className={`text-10-medium px-[4px] py-[1px] rounded ${CATEGORY_STYLE[entry.category]}`}>{entry.category}</span>
                          <span className="text-12-regular text-grey-08 truncate max-w-[160px]">{entry.description}</span>
                        </div>
                      ))}
                      {activeCount > 3 && (
                        <span className="text-10-regular text-grey-08">+{activeCount - 3} 更多</span>
                      )}
                    </div>
                  )}
                </button>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="grid gap-[var(--space-4)]" style={{ gridTemplateColumns: '1fr 300px' }}>
          {/* ── Left: Entry list ── */}
          <div>
            {/* Template info bar */}
            <div className="flex items-center justify-between mb-[var(--space-3)] p-[var(--space-3)] rounded-lg bg-bg">
              <div className="flex items-center gap-[var(--space-2)]">
                <Avatar name={selectedClient.name[0]} size="sm" />
                <span className="text-14-bold text-grey-01">{selectedClient.name}</span>
                <Badge variant="grey">{selectedClient.industry}</Badge>
                {matchingTemplate && (
                  <span className="text-12-regular text-grey-08">
                    基于模板: {matchingTemplate.name}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-[var(--space-2)]">
                <span className="text-12-regular text-grey-08">{activeCount}/{entries.length} 条启用</span>
              </div>
            </div>

            {/* Entries */}
            <div className="flex flex-col gap-[var(--space-2)]">
              {entries.sort((a, b) => {
                const ta = a.time.replace(':', '')
                const tb = b.time.replace(':', '')
                return ta.localeCompare(tb)
              }).map((entry) => (
                <EntryRow
                  key={entry.id}
                  entry={entry}
                  onEdit={() => setEditEntry(entry)}
                  onToggle={() => handleToggle(entry.id)}
                  onDelete={() => handleDelete(entry.id)}
                />
              ))}
            </div>

            {/* Add button */}
            <button
              onClick={() => setShowAddDialog(true)}
              className="w-full mt-[var(--space-2)] p-[var(--space-3)] rounded-lg border border-dashed border-grey-12 text-12-medium text-grey-06 hover:text-grey-01 hover:border-grey-06 transition-colors bg-transparent cursor-pointer font-[inherit]"
            >
              + 添加条目
            </button>
          </div>

          {/* ── Right: Preview + Controls ── */}
          <div className="flex flex-col gap-[var(--space-3)]">
            {/* Clock preview */}
            <Card>
              <div className="text-12-bold text-grey-06 mb-[var(--space-2)]">时钟预览</div>
              <ClockPreview entries={entries} />
              <div className="flex items-center justify-center gap-[var(--space-2)] mt-[var(--space-2)]">
                <span className="w-[6px] h-[6px] rounded-full bg-l-cyan" />
                <span className="text-10-regular text-grey-08">24h Always On</span>
              </div>
            </Card>

            {/* Tone selector */}
            <Card>
              <div className="text-12-bold text-grey-06 mb-[var(--space-2)]">内容语气</div>
              <div className="flex flex-col gap-[var(--space-1)]">
                {TONE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setTone(opt.value)}
                    className={`flex items-center gap-[var(--space-2)] px-[var(--space-3)] py-[var(--space-2)] rounded-lg text-left border cursor-pointer transition-all font-[inherit] ${
                      tone === opt.value
                        ? 'border-grey-01 bg-selected shadow-sm'
                        : 'border-stroke bg-white hover:bg-selected'
                    }`}
                  >
                    <span className={`w-[8px] h-[8px] rounded-full ${tone === opt.value ? 'bg-l-cyan' : 'bg-grey-12'}`} />
                    <span className={`text-14-medium ${tone === opt.value ? 'text-grey-01' : 'text-grey-06'}`}>{opt.label}</span>
                  </button>
                ))}
              </div>
            </Card>

            {/* Actions */}
            <Card>
              <div className="flex flex-col gap-[var(--space-2)]">
                <Button variant="secondary" onClick={handleResetFromTemplate} className="w-full">
                  从模板重置
                </Button>
                <Button onClick={handlePublish} className="w-full">
                  {publishedMsg ? '已发布 !' : '发布到客户端'}
                </Button>
                {existingConfig?.lastPublished && (
                  <p className="text-10-regular text-grey-08 text-center">
                    上次发布: {existingConfig.lastPublished}
                  </p>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ── Add/Edit Entry Dialog ── */}
      {(showAddDialog || editEntry) && (
        <EntryFormDialog
          entry={editEntry}
          onSave={handleSaveEntry}
          onClose={() => { setEditEntry(null); setShowAddDialog(false) }}
        />
      )}
    </div>
  )
}

/* ── Entry Form Dialog ── */
function EntryFormDialog({
  entry,
  onSave,
  onClose,
}: {
  entry: ClockEntry | null
  onSave: (e: ClockEntry) => void
  onClose: () => void
}) {
  const [time, setTime] = useState(entry?.time || '12:00')
  const [category, setCategory] = useState<ClockCategory>(entry?.category || 'Bidding')
  const [description, setDescription] = useState(entry?.description || '')
  const [effectType, setEffectType] = useState<'saved' | 'blocked' | 'none'>(entry?.effect.type || 'none')
  const [effectAmount, setEffectAmount] = useState(entry?.effect.amount?.toString() || '')
  const [effectCurrency, setEffectCurrency] = useState(entry?.effect.currency || '¥')

  const handleSubmit = () => {
    if (!description.trim()) return
    onSave({
      id: entry?.id || `entry-${Date.now()}`,
      time,
      category,
      description,
      effect: {
        type: effectType,
        amount: effectType !== 'none' ? Number(effectAmount) || 0 : undefined,
        currency: effectType !== 'none' ? effectCurrency : undefined,
      },
      active: entry?.active ?? true,
      order: entry?.order ?? 0,
    })
  }

  return (
    <Dialog open onClose={onClose} title={entry ? '编辑条目' : '添加条目'} width={480}>
      <div className="flex flex-col gap-[var(--space-4)]">
        {/* Time + Category row */}
        <div className="grid grid-cols-2 gap-[var(--space-3)]">
          <div>
            <label className="text-12-medium text-grey-01 mb-[var(--space-1)] block">时间</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full h-[var(--height-input)] px-[var(--space-3)] rounded-md border border-stroke text-14-regular outline-none focus:border-grey-01 transition-colors"
            />
          </div>
          <div>
            <label className="text-12-medium text-grey-01 mb-[var(--space-1)] block">类别</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ClockCategory)}
              className="w-full h-[var(--height-input)] px-[var(--space-3)] rounded-md border border-stroke text-14-regular outline-none focus:border-grey-01 transition-colors bg-white"
            >
              {CLOCK_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-12-medium text-grey-01 mb-[var(--space-1)] block">描述 <span className="text-red">*</span></label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Agent 在该时间点的操作描述..."
            className="w-full h-[72px] p-[var(--space-3)] rounded-lg border border-stroke text-14-regular resize-none outline-none focus:border-grey-01 transition-colors"
          />
        </div>

        {/* Effect */}
        <div>
          <label className="text-12-medium text-grey-01 mb-[var(--space-2)] block">效果标签</label>
          <div className="flex gap-[var(--space-2)] mb-[var(--space-2)]">
            {(['none', 'saved', 'blocked'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setEffectType(t)}
                className={`px-[var(--space-3)] py-[5px] rounded-full text-12-medium border-none cursor-pointer transition-colors font-[inherit] ${
                  effectType === t
                    ? t === 'saved' ? 'bg-cyan-tint-08 text-l-cyan' : t === 'blocked' ? 'bg-red-tint-08 text-red' : 'bg-grey-01 text-white'
                    : 'bg-selected text-grey-06 hover:bg-grey-12'
                }`}
              >
                {t === 'none' ? '无' : t === 'saved' ? 'Saved' : 'Blocked'}
              </button>
            ))}
          </div>
          {effectType !== 'none' && (
            <div className="grid grid-cols-[60px_1fr] gap-[var(--space-2)]">
              <select
                value={effectCurrency}
                onChange={(e) => setEffectCurrency(e.target.value)}
                className="h-[var(--height-input)] px-2 rounded-md border border-stroke text-14-regular outline-none focus:border-grey-01 bg-white"
              >
                <option value="¥">¥</option>
                <option value="$">$</option>
              </select>
              <input
                type="number"
                value={effectAmount}
                onChange={(e) => setEffectAmount(e.target.value)}
                placeholder="金额"
                className="h-[var(--height-input)] px-[var(--space-3)] rounded-md border border-stroke text-14-regular outline-none focus:border-grey-01 transition-colors"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-[var(--space-2)] pt-[var(--space-2)] border-t border-stroke">
          <Button variant="ghost" onClick={onClose}>取消</Button>
          <Button onClick={handleSubmit} disabled={!description.trim()}>
            {entry ? '保存' : '添加'}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}

export default function ClockConfigPage() {
  return <Suspense><ClockConfigPageContent /></Suspense>
}
