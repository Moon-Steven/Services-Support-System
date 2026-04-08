'use client'

import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Tabs } from '@/components/ui/Tabs'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import {
  PERSONA_QUOTES,
  getQuoteLibraryHealth,
  clientPersonaSnapshots,
  DIMENSION_KEYS,
  DIMENSION_LABELS,
  type PersonaQuote,
  type QuoteLibraryStatus,
  type PersonaRadarDimensions,
} from '@/lib/around-the-clock'

const STATUS_CONFIG: Record<QuoteLibraryStatus, { label: string; variant: 'cyan' | 'grey' | 'orange' | 'red' }> = {
  available: { label: '可用', variant: 'cyan' },
  draft: { label: '草稿', variant: 'grey' },
  under_review: { label: '待处理', variant: 'orange' },
  retired: { label: '已下架', variant: 'red' },
}

const INDUSTRY_TAGS = [
  { value: '', label: '全部行业' },
  { value: 'ecommerce', label: '电商' },
  { value: 'finance', label: '金融' },
  { value: 'gaming', label: '游戏' },
  { value: 'healthcare', label: '医疗' },
  { value: 'entertainment', label: '娱乐' },
  { value: 'general', label: '通用' },
]

const INDUSTRY_LABEL: Record<string, string> = {
  ecommerce: '电商', finance: '金融', gaming: '游戏',
  healthcare: '医疗', entertainment: '娱乐', general: '通用',
}

const LANGUAGE_OPTIONS = [
  { value: '', label: '全部语言' },
  { value: 'en', label: 'English' },
  { value: 'zh', label: '中文' },
]

const DIM_SHORT: Record<keyof PersonaRadarDimensions, string> = {
  retention: 'Ret', exploration: 'Exp', precision: 'Prc',
  efficiency: 'Eff', riskControl: 'Rsk', creativity: 'Cre',
}

function getTop3Dimensions(aff: PersonaRadarDimensions) {
  return DIMENSION_KEYS
    .map(k => ({ key: k, value: aff[k] }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 3)
}

function getQuoteRefs(quoteId: string) {
  const refs = clientPersonaSnapshots.filter(s => s.selectedQuoteId === quoteId)
  return { total: refs.length, clients: refs }
}

const EMPTY_DIMS: PersonaRadarDimensions = {
  retention: 0, exploration: 0, precision: 0,
  efficiency: 0, riskControl: 0, creativity: 0,
}

type DraftQuote = {
  text: string
  locale: 'en' | 'zh'
  author: string
  authorLifespan: string
  authorTitle: string
  tags: string[]
  dimensionAffinity: PersonaRadarDimensions
}

function emptyDraft(): DraftQuote {
  return {
    text: '', locale: 'en', author: '', authorLifespan: '', authorTitle: '',
    tags: [], dimensionAffinity: { ...EMPTY_DIMS },
  }
}

function quoteToDraft(q: PersonaQuote): DraftQuote {
  return {
    text: q.text, locale: q.locale, author: q.author,
    authorLifespan: q.authorLifespan, authorTitle: q.authorTitle,
    tags: [...q.tags],
    dimensionAffinity: { ...q.dimensionAffinity },
  }
}

function validateDraft(d: DraftQuote): string | null {
  if (!d.text.trim()) return '名言内容不能为空'
  if (!d.author.trim()) return '作者不能为空'
  const highCount = DIMENSION_KEYS.filter(k => d.dimensionAffinity[k] >= 0.7).length
  const midCount = DIMENSION_KEYS.filter(k => d.dimensionAffinity[k] >= 0.5).length
  if (highCount < 1) return '至少 1 个维度 ≥ 0.7'
  if (midCount > 3) return '至多 3 个维度 ≥ 0.5'
  return null
}

export default function QuoteLibraryPage() {
  const [statusFilter, setStatusFilter] = useState<QuoteLibraryStatus | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [editingQuote, setEditingQuote] = useState<PersonaQuote | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [retiringQuote, setRetiringQuote] = useState<PersonaQuote | null>(null)
  const [industryFilter, setIndustryFilter] = useState('')
  const [languageFilter, setLanguageFilter] = useState('')

  const health = useMemo(() => getQuoteLibraryHealth(), [])

  const statusTabs = useMemo(() => [
    { key: 'all', label: '全部', count: PERSONA_QUOTES.length },
    { key: 'draft', label: '草稿', count: health.totalDraft },
    { key: 'under_review', label: '待处理', count: health.totalUnderReview },
    { key: 'available', label: '可用', count: health.totalAvailable },
    { key: 'retired', label: '已下架', count: health.totalRetired },
  ], [health])

  const filtered = useMemo(() => {
    let list = PERSONA_QUOTES
    if (statusFilter !== 'all') list = list.filter(q => q.status === statusFilter)
    if (industryFilter) list = list.filter(q => q.tags.includes(industryFilter))
    if (languageFilter) list = list.filter(q => q.locale === languageFilter)
    if (searchQuery.trim()) {
      const lq = searchQuery.toLowerCase()
      list = list.filter(q =>
        q.text.toLowerCase().includes(lq) ||
        q.author.toLowerCase().includes(lq) ||
        q.authorTitle.toLowerCase().includes(lq)
      )
    }
    return list
  }, [statusFilter, industryFilter, languageFilter, searchQuery])

  const hasActiveFilters = statusFilter !== 'all' || !!industryFilter || !!languageFilter || !!searchQuery.trim()

  return (
    <div className="flex flex-col gap-[var(--space-6)] p-[var(--space-6)]">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-[var(--space-1)]">
          <h1 className="text-24-bold text-grey-01">名言库管理</h1>
          <p className="text-12-regular text-grey-08">先筛选后批量处理，保证名言与客户场景一致。</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>录入名言</Button>
      </div>

      <Card padding="none">
        <div className="px-[var(--space-5)] pt-[var(--space-4)]">
          <Tabs
            tabs={statusTabs}
            activeKey={statusFilter}
            onChange={(k) => setStatusFilter(k as QuoteLibraryStatus | 'all')}
          />
        </div>

        <div className="flex items-center gap-[var(--space-3)] px-[var(--space-5)] py-[var(--space-4)]">
          <div className="flex-1 max-w-xs">
            <Input
              placeholder="搜索名言、作者…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="w-32">
            <Select
              options={INDUSTRY_TAGS}
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
            />
          </div>
          <div className="w-32">
            <Select
              options={LANGUAGE_OPTIONS}
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value)}
            />
          </div>
          <span className="text-12-regular text-grey-08">
            结果 {filtered.length} 条
          </span>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              className="!h-8 !px-3 text-12-medium"
              onClick={() => {
                setStatusFilter('all')
                setSearchQuery('')
                setIndustryFilter('')
                setLanguageFilter('')
              }}
            >
              清除筛选
            </Button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-t border-b border-stroke text-12-medium text-grey-06">
                <th className="px-[var(--space-5)] py-[var(--space-3)] w-10">#</th>
                <th className="px-[var(--space-3)] py-[var(--space-3)]">名言 / 作者</th>
                <th className="px-[var(--space-3)] py-[var(--space-3)] w-44">亲和力</th>
                <th className="px-[var(--space-3)] py-[var(--space-3)] w-24">状态</th>
                <th className="px-[var(--space-3)] py-[var(--space-3)] w-28">引用</th>
                <th className="px-[var(--space-5)] py-[var(--space-3)] w-36 text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((q, i) => {
                const top3 = getTop3Dimensions(q.dimensionAffinity)
                const refs = getQuoteRefs(q.id)
                const cfg = STATUS_CONFIG[q.status]
                return (
                  <tr
                    key={q.id}
                    className="border-b border-stroke transition-colors hover:bg-selected"
                  >
                    <td className="px-[var(--space-5)] py-[var(--space-4)] text-12-regular text-grey-08">
                      {i + 1}
                    </td>
                    <td className="px-[var(--space-3)] py-[var(--space-4)]">
                      <p className="text-14-regular text-grey-01 line-clamp-2">{q.text}</p>
                      <p className="text-12-regular text-grey-06 mt-[var(--space-1)]">
                        {q.author} · {q.authorTitle}
                      </p>
                      <div className="flex gap-[var(--space-1)] mt-[var(--space-1)] flex-wrap">
                        {q.tags.map(t => (
                          <span
                            key={t}
                            className="text-10-regular text-grey-08 bg-grey-12 rounded px-1.5 py-0.5"
                          >
                            {INDUSTRY_LABEL[t] ?? t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-[var(--space-3)] py-[var(--space-4)]">
                      <span className="text-12-regular text-grey-06">
                        {top3.map(d => `${DIM_SHORT[d.key]} ${d.value}`).join(', ')}
                      </span>
                    </td>
                    <td className="px-[var(--space-3)] py-[var(--space-4)]">
                      <Badge variant={cfg.variant}>
                        {cfg.variant === 'cyan' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-l-cyan mr-1.5 shrink-0" />
                        )}
                        {cfg.label}
                      </Badge>
                    </td>
                    <td className="px-[var(--space-3)] py-[var(--space-4)] text-12-regular text-grey-06">
                      {refs.total > 0 ? refs.total : '—'}
                    </td>
                    <td className="px-[var(--space-5)] py-[var(--space-4)] text-right">
                      <div className="flex items-center justify-end gap-[var(--space-2)]">
                        {q.status !== 'retired' && (
                          <Button
                            variant="ghost"
                            className="!px-2 !h-7 text-12-medium"
                            onClick={() => setEditingQuote(q)}
                          >
                            编辑
                          </Button>
                        )}
                        {(q.status === 'available' || q.status === 'draft') && (
                          <Button
                            variant="ghost"
                            className="!px-2 !h-7 text-12-medium !text-red"
                            onClick={() => setRetiringQuote(q)}
                          >
                            下架
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-[var(--space-8)] text-14-regular text-grey-08"
                  >
                    暂无匹配名言
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center gap-[var(--space-6)] px-[var(--space-5)] py-[var(--space-3)] border-t border-stroke text-12-regular text-grey-06">
          <span>{health.totalAvailable} 条可用</span>
          <span>·</span>
          <span>{health.totalUnderReview} 条待处理</span>
          <span>·</span>
          <span>{health.totalRetired} 条已下架</span>
          <span className="mx-1">|</span>
          <span>平均利用率: {Math.round(health.utilizationRate * 100)}%</span>
        </div>
      </Card>

      <QuoteFormDialog
        open={showCreateDialog || editingQuote !== null}
        quote={editingQuote}
        onClose={() => { setShowCreateDialog(false); setEditingQuote(null) }}
      />

      <RetireDialog
        quote={retiringQuote}
        onClose={() => setRetiringQuote(null)}
      />
    </div>
  )
}

function QuoteFormDialog({
  open,
  quote,
  onClose,
}: {
  open: boolean
  quote: PersonaQuote | null
  onClose: () => void
}) {
  const [draft, setDraft] = useState<DraftQuote>(emptyDraft)
  const [error, setError] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)

  const isEdit = quote !== null

  if (open && !initialized) {
    setDraft(quote ? quoteToDraft(quote) : emptyDraft())
    setError(null)
    setInitialized(true)
  }
  if (!open && initialized) {
    setInitialized(false)
  }

  const handleSubmit = (asDraft: boolean) => {
    if (!asDraft) {
      const err = validateDraft(draft)
      if (err) { setError(err); return }
    }
    onClose()
  }

  const updateDim = (key: keyof PersonaRadarDimensions, val: number) => {
    setDraft(d => ({
      ...d,
      dimensionAffinity: { ...d.dimensionAffinity, [key]: val },
    }))
  }

  const toggleTag = (tag: string) => {
    setDraft(d => ({
      ...d,
      tags: d.tags.includes(tag) ? d.tags.filter(t => t !== tag) : [...d.tags, tag],
    }))
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEdit ? '编辑名言' : '录入名言'}
      width={600}
    >
      <div className="flex flex-col gap-[var(--space-4)]">
        <div className="flex flex-col gap-[var(--space-1)]">
          <label className="text-12-medium text-grey-06">
            <span className="text-l-cyan mr-[var(--space-1)]">&bull;</span>
            名言内容
          </label>
          <textarea
            className="text-14-regular rounded-md px-3 py-2 border border-grey-12 bg-white text-grey-01 outline-none transition-colors focus:border-grey-01 resize-none"
            rows={3}
            value={draft.text}
            onChange={(e) => setDraft(d => ({ ...d, text: e.target.value }))}
          />
        </div>

        <Select
          label="语言"
          options={[
            { value: 'en', label: 'English' },
            { value: 'zh', label: '中文' },
          ]}
          value={draft.locale}
          onChange={(e) => setDraft(d => ({ ...d, locale: e.target.value as 'en' | 'zh' }))}
        />

        <div className="grid grid-cols-3 gap-[var(--space-3)]">
          <Input
            label="作者"
            value={draft.author}
            onChange={(e) => setDraft(d => ({ ...d, author: e.target.value }))}
          />
          <Input
            label="生卒年"
            value={draft.authorLifespan}
            onChange={(e) => setDraft(d => ({ ...d, authorLifespan: e.target.value }))}
          />
          <Input
            label="头衔"
            value={draft.authorTitle}
            onChange={(e) => setDraft(d => ({ ...d, authorTitle: e.target.value }))}
          />
        </div>

        <div className="flex flex-col gap-[var(--space-1)]">
          <span className="text-12-medium text-grey-06">
            <span className="text-l-cyan mr-[var(--space-1)]">&bull;</span>
            行业标签
          </span>
          <div className="flex flex-wrap gap-[var(--space-2)]">
            {INDUSTRY_TAGS.filter(t => t.value).map(t => {
              const active = draft.tags.includes(t.value)
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => toggleTag(t.value)}
                  className={`text-12-medium rounded-full px-3 py-1 border transition-colors ${
                    active
                      ? 'bg-cyan-tint-08 border-l-cyan text-l-cyan'
                      : 'bg-white border-grey-12 text-grey-06 hover:border-grey-08'
                  }`}
                >
                  {t.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex flex-col gap-[var(--space-3)]">
          <span className="text-12-medium text-grey-06">
            <span className="text-l-cyan mr-[var(--space-1)]">&bull;</span>
            维度亲和力
          </span>
          <div className="grid grid-cols-2 gap-x-[var(--space-6)] gap-y-[var(--space-3)]">
            {DIMENSION_KEYS.map(k => (
              <div key={k} className="flex items-center gap-[var(--space-3)]">
                <span className="text-12-medium text-grey-06 w-10 shrink-0">
                  {DIMENSION_LABELS[k]}
                </span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={draft.dimensionAffinity[k]}
                  onChange={(e) => updateDim(k, parseFloat(e.target.value))}
                  className="flex-1 accent-[var(--cyan)]"
                />
                <span className="text-12-regular text-grey-01 w-8 text-right tabular-nums">
                  {draft.dimensionAffinity[k].toFixed(1)}
                </span>
              </div>
            ))}
          </div>
          <p className="text-10-regular text-grey-08">
            至少 1 维 ≥ 0.7 · 至多 3 维 ≥ 0.5
          </p>
        </div>

        {error && (
          <p className="text-12-regular text-red" role="alert">{error}</p>
        )}

        <div className="flex items-center justify-end gap-[var(--space-3)] pt-[var(--space-2)]">
          <Button variant="ghost" onClick={onClose}>取消</Button>
          <Button variant="secondary" onClick={() => handleSubmit(true)}>存为草稿</Button>
          <Button onClick={() => handleSubmit(false)}>提交审核</Button>
        </div>
      </div>
    </Dialog>
  )
}

function RetireDialog({
  quote,
  onClose,
}: {
  quote: PersonaQuote | null
  onClose: () => void
}) {
  const [retireType, setRetireType] = useState<'normal' | 'safety'>('normal')
  const [reason, setReason] = useState('')

  const refs = useMemo(() => {
    if (!quote) return { total: 0, locked: 0, clients: [] as typeof clientPersonaSnapshots }
    return getQuoteRefs(quote.id)
  }, [quote])

  const handleConfirm = () => {
    if (!reason.trim()) return
    onClose()
  }

  if (!quote) return null

  return (
    <Dialog open onClose={onClose} title="下架确认" width={480}>
      <div className="flex flex-col gap-[var(--space-4)]">
        <p className="text-14-regular text-grey-06 line-clamp-2">
          「{quote.text}」— {quote.author}
        </p>

        <div className="flex flex-col gap-[var(--space-2)]">
          <span className="text-12-medium text-grey-06">下架类型</span>
          <label className="flex items-center gap-[var(--space-2)] text-14-regular text-grey-01 cursor-pointer">
            <input
              type="radio"
              name="retireType"
              checked={retireType === 'normal'}
              onChange={() => setRetireType('normal')}
              className="accent-[var(--cyan)]"
            />
            普通下架
          </label>
          <label className="flex items-center gap-[var(--space-2)] text-14-regular text-grey-01 cursor-pointer">
            <input
              type="radio"
              name="retireType"
              checked={retireType === 'safety'}
              onChange={() => setRetireType('safety')}
              className="accent-[var(--cyan)]"
            />
            安全下架
          </label>
        </div>

        {retireType === 'safety' && (
          <div className="rounded-lg bg-orange-tint-10 p-[var(--space-3)]">
            <p className="text-12-medium text-orange">
              ⚠ 将触发 {refs.total} 个引用该名言的客户重新匹配
            </p>
            {refs.clients.length > 0 && (
              <ul className="mt-[var(--space-2)] text-12-regular text-grey-06 list-disc pl-[var(--space-4)]">
                {refs.clients.map(c => (
                  <li key={c.clientId}>
                    {c.clientId}
                    {c.lockStatus === 'in_review' && (
                      <span className="text-orange ml-1">(审核中)</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="flex flex-col gap-[var(--space-1)]">
          <label className="text-12-medium text-grey-06">
            <span className="text-l-cyan mr-[var(--space-1)]">&bull;</span>
            下架原因
          </label>
          <textarea
            className="text-14-regular rounded-md px-3 py-2 border border-grey-12 bg-white text-grey-01 outline-none transition-colors focus:border-grey-01 resize-none"
            rows={3}
            value={reason}
            placeholder="请填写下架原因（必填）"
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-end gap-[var(--space-3)] pt-[var(--space-2)]">
          <Button variant="ghost" onClick={onClose}>取消</Button>
          <Button
            variant="destructive"
            disabled={!reason.trim()}
            onClick={handleConfirm}
          >
            确认下架
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
