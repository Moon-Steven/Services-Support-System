'use client'

import { useState, useMemo } from 'react'
import { Drawer } from '@/components/ui/Drawer'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import type { PersonaSnapshot, ReviewStage } from '@/lib/around-the-clock'
import {
  getPersonaQuoteById, getAvailableQuotes, PERSONA_LOCK_STATUS_LABEL,
  REVIEW_STAGE_LABEL, DIMENSION_KEYS, DIMENSION_LABELS,
  isRejectedTask, matchQuoteForRadar,
  ATC_REVIEW_EVENTS_SEED,
} from '@/lib/around-the-clock'
import { clients } from '@/lib/data'
import { CapabilityRadar } from '@/components/around-the-clock/CapabilityRadar'

interface PersonaReviewDrawerProps {
  snapshot: PersonaSnapshot | null
  open: boolean
  onClose: () => void
  onApprove?: (clientId: string) => void
  onReject?: (clientId: string, reason: string) => void
  onChangeQuote?: (clientId: string, newQuoteId: string, reason: string) => void
  onCopyOverride?: (clientId: string, text: string) => void
  currentRole?: 'delivery' | 'ops' | 'sales'
}

const STAGE_TO_ROLE: Record<ReviewStage, PersonaReviewDrawerProps['currentRole']> = {
  at_delivery: 'delivery',
  at_ops: 'ops',
  at_sales: 'sales',
}

const NEXT_STAGE_LABEL: Record<ReviewStage, string> = {
  at_delivery: '运营',
  at_ops: '销售',
  at_sales: '发布',
}

function formatPeriod(start: string, end: string) {
  const fmt = (d: string) => {
    const [, m, day] = d.split('-')
    return `${m}/${day}`
  }
  return `${fmt(start)} – ${fmt(end)}`
}

function formatTimestamp(iso: string) {
  const [datePart, timePart] = iso.split('T')
  const [, m, d] = datePart.split('-')
  const [h, mi] = (timePart || '00:00').split(':')
  return `${Number(m)}/${Number(d)} ${h}:${mi}`
}

const STAGE_BADGE_VARIANT: Record<ReviewStage, 'cyan' | 'orange' | 'grey'> = {
  at_delivery: 'cyan',
  at_ops: 'orange',
  at_sales: 'grey',
}

export function PersonaReviewDrawer({
  snapshot,
  open,
  onClose,
  onApprove,
  onReject,
  onChangeQuote,
  onCopyOverride,
  currentRole = 'delivery',
}: PersonaReviewDrawerProps) {
  const [reviewComment, setReviewComment] = useState('')
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [changeQuoteDialogOpen, setChangeQuoteDialogOpen] = useState(false)
  const [changeQuoteSearch, setChangeQuoteSearch] = useState('')
  const [changeQuoteSelected, setChangeQuoteSelected] = useState<string | null>(null)
  const [changeQuoteReason, setChangeQuoteReason] = useState('')
  const [polishDialogOpen, setPolishDialogOpen] = useState(false)
  const [polishText, setPolishText] = useState('')

  const client = useMemo(
    () => (snapshot ? clients.find(c => c.id === snapshot.clientId) : null),
    [snapshot],
  )

  const quote = useMemo(
    () => (snapshot ? getPersonaQuoteById(snapshot.selectedQuoteId) : null),
    [snapshot],
  )

  const isMyTurn = snapshot?.reviewStage
    ? STAGE_TO_ROLE[snapshot.reviewStage] === currentRole
    : false

  const relatedEvents = useMemo(() => {
    if (!snapshot) return []
    return ATC_REVIEW_EVENTS_SEED
      .filter(e => e.clientId === snapshot.clientId)
      .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
      .slice(0, 3)
  }, [snapshot])

  const availableQuotesScored = useMemo(() => {
    if (!snapshot) return []
    const available = getAvailableQuotes()
    return available
      .map(q => {
        const result = matchQuoteForRadar(snapshot.current)
        return { quote: q, matchScore: result?.quote.id === q.id ? result.matchScore : 0 }
      })
      .sort((a, b) => b.matchScore - a.matchScore)
  }, [snapshot])

  const filteredQuotes = useMemo(() => {
    if (!changeQuoteSearch.trim()) return availableQuotesScored
    const s = changeQuoteSearch.toLowerCase()
    return availableQuotesScored.filter(
      ({ quote: q }) =>
        q.author.toLowerCase().includes(s) ||
        q.text.toLowerCase().includes(s) ||
        q.tags.some(t => t.toLowerCase().includes(s)),
    )
  }, [availableQuotesScored, changeQuoteSearch])

  const topAffinityDims = useMemo(() => {
    if (!quote) return []
    return DIMENSION_KEYS
      .map(k => ({ key: k, val: quote.dimensionAffinity[k] }))
      .sort((a, b) => b.val - a.val)
      .slice(0, 3)
  }, [quote])

  if (!snapshot) return null

  const rejected = isRejectedTask(snapshot)

  const handleApprove = () => {
    onApprove?.(snapshot.clientId)
    onClose()
  }

  const handleRejectConfirm = () => {
    if (!rejectReason.trim()) return
    onReject?.(snapshot.clientId, rejectReason.trim())
    setRejectReason('')
    setRejectDialogOpen(false)
    onClose()
  }

  const handleChangeQuoteConfirm = () => {
    if (!changeQuoteSelected || !changeQuoteReason.trim()) return
    onChangeQuote?.(snapshot.clientId, changeQuoteSelected, changeQuoteReason.trim())
    setChangeQuoteSelected(null)
    setChangeQuoteReason('')
    setChangeQuoteSearch('')
    setChangeQuoteDialogOpen(false)
    onClose()
  }

  const handlePolishConfirm = () => {
    if (!polishText.trim()) return
    onCopyOverride?.(snapshot.clientId, polishText.trim())
    setPolishText('')
    setPolishDialogOpen(false)
  }

  const headerContent = (
    <div className="flex flex-col gap-[var(--space-2)]">
      <h2 className="text-16-bold text-grey-01 truncate">
        {client?.name ?? snapshot.clientId} · Persona 审核详情
      </h2>
      <div className="flex flex-wrap items-center gap-[var(--space-1)]">
        <Badge variant="grey">P2 常规</Badge>
        <Badge variant="cyan">匹配度 {snapshot.quoteMatchScore.toFixed(2)}</Badge>
        {snapshot.reviewStage && (
          <Badge variant={STAGE_BADGE_VARIANT[snapshot.reviewStage]}>
            ● {REVIEW_STAGE_LABEL[snapshot.reviewStage]}
          </Badge>
        )}
        {rejected && <Badge variant="red">已驳回</Badge>}
      </div>
      <span className="text-12-regular text-grey-08">
        评估周期：{formatPeriod(snapshot.evaluationPeriod.start, snapshot.evaluationPeriod.end)}
      </span>
    </div>
  )

  return (
    <>
      <Drawer open={open} onClose={onClose} headerContent={headerContent} width={480}>
        <div className="flex flex-col gap-[var(--space-5)]">
          {/* Section 1: 匹配名言 */}
          <section>
            <h3 className="text-14-bold text-grey-01 mb-[var(--space-3)]">匹配名言</h3>
            {quote ? (
              <Card className="flex flex-col gap-[var(--space-3)]">
                <div className="flex items-baseline gap-[var(--space-2)]">
                  <span className="text-14-bold text-grey-01">{quote.author}</span>
                  <span className="text-12-regular text-grey-08">{quote.authorLifespan}</span>
                  <span className="text-12-regular text-grey-08">· {quote.authorTitle}</span>
                </div>

                <blockquote className="text-14-regular text-grey-06 italic border-l-2 border-l-cyan pl-[var(--space-3)] py-[var(--space-1)]">
                  &ldquo;{quote.text}&rdquo;
                </blockquote>

                {snapshot.copyOverride && (
                  <div className="flex flex-col gap-[var(--space-1)] pt-[var(--space-2)] border-t border-stroke">
                    <span className="text-12-medium text-l-cyan">润色版</span>
                    <p className="text-14-regular text-grey-01">{snapshot.copyOverride}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-[var(--space-1)]">
                  {quote.tags.map(tag => (
                    <Badge key={tag} variant="grey">{tag}</Badge>
                  ))}
                </div>

                <div className="flex flex-wrap gap-[var(--space-2)]">
                  {topAffinityDims.map(({ key, val }) => (
                    <span key={key} className="text-12-regular text-grey-08">
                      {DIMENSION_LABELS[key]} <span className="text-l-cyan">{(val * 100).toFixed(0)}</span>
                    </span>
                  ))}
                </div>
              </Card>
            ) : (
              <p className="text-14-regular text-grey-08">未找到匹配名言</p>
            )}
          </section>

          {/* Section 2: 能力雷达 */}
          <section>
            <h3 className="text-14-bold text-grey-01 mb-[var(--space-3)]">能力雷达</h3>
            <Card className="flex justify-center">
              <CapabilityRadar
                scores={snapshot.current}
                previousScores={snapshot.previous}
              />
            </Card>
          </section>

          {/* Section 3: Around the Clock 关联事件 */}
          <section>
            <h3 className="text-14-bold text-grey-01 mb-[var(--space-3)]">Around the Clock 关联事件</h3>
            {relatedEvents.length > 0 ? (
              <div className="flex flex-col gap-[var(--space-2)]">
                {relatedEvents.map(ev => (
                  <div
                    key={ev.id}
                    className="flex items-start gap-[var(--space-3)] px-[var(--space-3)] py-[var(--space-2)] rounded-lg bg-selected"
                  >
                    <span className="text-12-regular text-grey-08 shrink-0 tabular-nums">
                      {formatTimestamp(ev.occurredAt)}
                    </span>
                    <span className="text-12-regular text-grey-01 flex-1 line-clamp-2">
                      {ev.customerCopyDraft}
                    </span>
                    <Badge
                      variant={
                        ev.currentStage === 'published' ? 'cyan'
                          : ev.currentStage === 'blocked' ? 'red'
                            : 'grey'
                      }
                    >
                      {ev.currentStage === 'published' ? '已发布'
                        : ev.currentStage === 'blocked' ? '已拦截'
                          : ev.currentStage === 'at_delivery' ? '交付中'
                            : ev.currentStage === 'at_ops' ? '运营中'
                              : '销售中'}
                    </Badge>
                  </div>
                ))}
                <button className="text-12-medium text-l-cyan text-left hover:underline mt-[var(--space-1)]">
                  查看全部 Around the Clock →
                </button>
              </div>
            ) : (
              <p className="text-14-regular text-grey-08">暂无关联事件</p>
            )}
          </section>

          {/* Section 4: 审核意见 */}
          <section>
            <h3 className="text-14-bold text-grey-01 mb-[var(--space-3)]">审核意见</h3>
            <textarea
              value={reviewComment}
              onChange={e => setReviewComment(e.target.value)}
              placeholder="输入审核意见（选填）…"
              rows={3}
              className="w-full text-14-regular rounded-md px-3 py-2 border border-grey-12 bg-white text-grey-01 outline-none transition-colors focus:border-grey-01 resize-none"
            />
          </section>

          {/* Section 5: 操作时间轴 */}
          <section>
            <h3 className="text-14-bold text-grey-01 mb-[var(--space-3)]">操作时间轴</h3>
            <div className="flex flex-col gap-0">
              <TimelineItem
                time={formatTimestamp(snapshot.generatedAt)}
                label="HUI 生成"
                active={false}
              />
              {snapshot.reviewStage === 'at_delivery' && (
                <TimelineItem time="当前" label={REVIEW_STAGE_LABEL.at_delivery} active />
              )}
              {(snapshot.reviewStage === 'at_ops' || snapshot.reviewStage === 'at_sales') && (
                <>
                  <TimelineItem time="已通过" label={REVIEW_STAGE_LABEL.at_delivery} active={false} />
                  {snapshot.reviewStage === 'at_ops' && (
                    <TimelineItem time="当前" label={REVIEW_STAGE_LABEL.at_ops} active />
                  )}
                </>
              )}
              {snapshot.reviewStage === 'at_sales' && (
                <>
                  <TimelineItem time="已通过" label={REVIEW_STAGE_LABEL.at_ops} active={false} />
                  <TimelineItem time="当前" label={REVIEW_STAGE_LABEL.at_sales} active />
                </>
              )}
              {snapshot.lockStatus === 'locked' && (
                <TimelineItem
                  time={snapshot.lockedAt ? formatTimestamp(snapshot.lockedAt) : '–'}
                  label={`已锁定（${snapshot.lockedBy ?? '系统'}）`}
                  active={false}
                />
              )}
            </div>
          </section>

          {/* Footer spacer for sticky bar */}
          <div className="h-[60px] shrink-0" />
        </div>

        {/* Sticky footer actions */}
        <div className="sticky bottom-0 left-0 right-0 border-t border-stroke bg-white px-[var(--space-5)] py-[var(--space-3)] flex items-center gap-[var(--space-2)]">
          {isMyTurn && snapshot.reviewStage ? (
            <>
              <Button variant="primary" onClick={handleApprove}>
                通过，提交{NEXT_STAGE_LABEL[snapshot.reviewStage]}
              </Button>
              <Button variant="destructive" onClick={() => setRejectDialogOpen(true)}>
                驳回
              </Button>
              <Button variant="ghost" onClick={() => {
                setChangeQuoteSelected(null)
                setChangeQuoteReason('')
                setChangeQuoteSearch('')
                setChangeQuoteDialogOpen(true)
              }}>
                手动换名言 ▾
              </Button>
              {(currentRole === 'ops' || currentRole === 'sales') && (
                <Button variant="ghost" onClick={() => {
                  setPolishText(snapshot.copyOverride || quote?.text || '')
                  setPolishDialogOpen(true)
                }}>
                  润色
                </Button>
              )}
            </>
          ) : (
            <span className="text-14-regular text-grey-08">非本级审核</span>
          )}
        </div>
      </Drawer>

      {/* 驳回 Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} title="驳回审核" width={420}>
        <div className="flex flex-col gap-[var(--space-4)]">
          <textarea
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
            placeholder="请输入驳回原因（必填）…"
            rows={4}
            className="w-full text-14-regular rounded-md px-3 py-2 border border-grey-12 bg-white text-grey-01 outline-none transition-colors focus:border-grey-01 resize-none"
          />
          <div className="flex justify-end gap-[var(--space-2)]">
            <Button variant="secondary" onClick={() => setRejectDialogOpen(false)}>取消</Button>
            <Button variant="destructive" disabled={!rejectReason.trim()} onClick={handleRejectConfirm}>确认驳回</Button>
          </div>
        </div>
      </Dialog>

      {/* 手动换名言 Dialog */}
      <Dialog open={changeQuoteDialogOpen} onClose={() => setChangeQuoteDialogOpen(false)} title="手动换名言" width={520}>
        <div className="flex flex-col gap-[var(--space-4)]">
          {quote && (
            <div className="flex flex-col gap-[var(--space-1)] p-[var(--space-3)] rounded-lg bg-selected">
              <span className="text-12-medium text-grey-06">当前名言</span>
              <p className="text-14-regular text-grey-01 italic">&ldquo;{quote.text}&rdquo; — {quote.author}</p>
            </div>
          )}

          <Input
            placeholder="搜索作者、内容、标签…"
            value={changeQuoteSearch}
            onChange={e => setChangeQuoteSearch(e.target.value)}
          />

          <div className="max-h-[240px] overflow-y-auto flex flex-col gap-[var(--space-1)]">
            {filteredQuotes.map(({ quote: q, matchScore }) => (
              <button
                key={q.id}
                type="button"
                onClick={() => setChangeQuoteSelected(q.id)}
                className={`text-left w-full px-[var(--space-3)] py-[var(--space-2)] rounded-lg border transition-colors cursor-pointer ${
                  changeQuoteSelected === q.id
                    ? 'border-l-cyan bg-cyan-tint-08'
                    : 'border-stroke bg-white hover:bg-selected'
                }`}
              >
                <div className="flex items-baseline justify-between gap-[var(--space-2)]">
                  <span className="text-12-medium text-grey-01">{q.author}</span>
                  <span className="text-10-regular text-grey-08 tabular-nums">{matchScore.toFixed(2)}</span>
                </div>
                <p className="text-12-regular text-grey-06 italic mt-[var(--space-1)] line-clamp-2">
                  &ldquo;{q.text}&rdquo;
                </p>
              </button>
            ))}
          </div>

          <textarea
            value={changeQuoteReason}
            onChange={e => setChangeQuoteReason(e.target.value)}
            placeholder="请输入更换原因（必填）…"
            rows={2}
            className="w-full text-14-regular rounded-md px-3 py-2 border border-grey-12 bg-white text-grey-01 outline-none transition-colors focus:border-grey-01 resize-none"
          />

          <div className="flex justify-end gap-[var(--space-2)]">
            <Button variant="secondary" onClick={() => setChangeQuoteDialogOpen(false)}>取消</Button>
            <Button
              variant="primary"
              disabled={!changeQuoteSelected || !changeQuoteReason.trim()}
              onClick={handleChangeQuoteConfirm}
            >
              确认更换
            </Button>
          </div>
        </div>
      </Dialog>

      {/* 润色文案 Dialog */}
      <Dialog open={polishDialogOpen} onClose={() => setPolishDialogOpen(false)} title="润色文案" width={480}>
        <div className="flex flex-col gap-[var(--space-4)]">
          <div className="flex flex-col gap-[var(--space-1)]">
            <span className="text-12-medium text-grey-06">原始文案</span>
            <p className="text-14-regular text-grey-08 p-[var(--space-3)] rounded-lg bg-selected">
              {quote?.text ?? '–'}
            </p>
          </div>

          <div className="flex flex-col gap-[var(--space-1)]">
            <span className="text-12-medium text-grey-06">润色内容</span>
            <textarea
              value={polishText}
              onChange={e => setPolishText(e.target.value)}
              rows={4}
              className="w-full text-14-regular rounded-md px-3 py-2 border border-grey-12 bg-white text-grey-01 outline-none transition-colors focus:border-grey-01 resize-none"
            />
          </div>

          <div className="flex justify-end gap-[var(--space-2)]">
            <Button variant="secondary" onClick={() => setPolishDialogOpen(false)}>取消</Button>
            <Button variant="primary" disabled={!polishText.trim()} onClick={handlePolishConfirm}>确认润色</Button>
          </div>
        </div>
      </Dialog>
    </>
  )
}

function TimelineItem({ time, label, active }: { time: string; label: string; active: boolean }) {
  return (
    <div className="flex items-center gap-[var(--space-3)] py-[var(--space-2)]">
      <span
        className={`w-2 h-2 rounded-full shrink-0 ${active ? 'bg-l-cyan' : 'bg-grey-12'}`}
      />
      <span className="text-12-regular text-grey-08 tabular-nums w-[72px] shrink-0">{time}</span>
      <span className={`text-12-medium ${active ? 'text-l-cyan' : 'text-grey-06'}`}>{label}</span>
    </div>
  )
}
