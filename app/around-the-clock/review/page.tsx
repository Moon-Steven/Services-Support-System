'use client'

import { useMemo, useState, useCallback, useEffect } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Drawer } from '@/components/ui/Drawer'
import { Table } from '@/components/ui/Table'
import { Tabs } from '@/components/ui/Tabs'
import { Stepper } from '@/components/ui/Stepper'
import { Select } from '@/components/ui/Select'
import {
  cloneAtcReviewEvents,
  type AtcReviewEvent,
  type AtcViewerRole,
  type AtcWorkflowTab,
  getSlaTrafficLight,
  formatAtcDateTime,
  ATC_FALLBACK_COPY,
  ATC_REFERENCE_NOW_ISO,
  kpiRefLabel,
} from '@/lib/around-the-clock'

function isMyTurn(e: AtcReviewEvent, role: AtcViewerRole): boolean {
  if (e.currentStage === 'at_delivery') return role === 'delivery'
  if (e.currentStage === 'at_ops') return role === 'ops'
  if (e.currentStage === 'at_sales') return role === 'sales'
  return false
}

function inInflightForRole(e: AtcReviewEvent, role: AtcViewerRole): boolean {
  if (e.currentStage !== 'at_delivery' && e.currentStage !== 'at_ops' && e.currentStage !== 'at_sales') {
    return false
  }
  return !isMyTurn(e, role)
}

const ROLE_OPTIONS: { value: AtcViewerRole; label: string }[] = [
  { value: 'delivery', label: '交付团队（一审）' },
  { value: 'ops', label: '行业运营（二审）' },
  { value: 'sales', label: '销售（三审）' },
]

const EVENT_TYPE_LABEL: Record<string, string> = {
  bidding: '出价',
  creative: '素材',
  monitor: '监控',
  strategy: '策略',
  experiment: '实验',
}

const STAGE_LABEL: Record<string, string> = {
  at_delivery: '交付',
  at_ops: '运营',
  at_sales: '销售',
  published: '已发布',
  blocked: '已拦截',
}

function slaBadge(light: ReturnType<typeof getSlaTrafficLight>) {
  if (light === 'green') return <Badge variant="cyan">SLA 充裕</Badge>
  if (light === 'yellow') return <Badge variant="orange">即将超时</Badge>
  return <Badge variant="red">已超时</Badge>
}

function auditActionLabel(action: string): string {
  const map: Record<string, string> = {
    hui_triggered: 'HUI 触发',
    delivery_submit_ops: '交付 → 提交运营',
    delivery_edit: '交付修改文案',
    delivery_reject: '交付废弃拦截',
    ops_submit_sales: '运营 → 提交销售',
    ops_polish: '运营话术润色',
    ops_return_delivery: '运营退回交付',
    sales_publish: '销售确认发布',
    sales_edit: '销售最终微调',
    sales_hide: '销售隐藏拦截',
    sales_recall: '销售撤回（前台隐藏）',
    system_timeout_forward: '系统超时自动流转',
    system_timeout_hide: '系统超时隐藏拦截',
  }
  return map[action] || action
}

export default function AroundTheClockReviewPage() {
  const [events, setEvents] = useState<AtcReviewEvent[]>(() => cloneAtcReviewEvents())
  const [role, setRole] = useState<AtcViewerRole>('delivery')
  const [tab, setTab] = useState<AtcWorkflowTab>('todo')
  const [selected, setSelected] = useState<Set<string>>(() => new Set())
  const [detail, setDetail] = useState<AtcReviewEvent | null>(null)
  const [editCopy, setEditCopy] = useState('')

  const openDetail = useCallback((e: AtcReviewEvent) => {
    setDetail(e)
    setEditCopy(e.customerCopyDraft)
  }, [])

  useEffect(() => {
    if (detail) setEditCopy(detail.customerCopyDraft)
  }, [detail?.id, detail?.customerCopyDraft])

  const patchEvent = useCallback((id: string, patch: Partial<AtcReviewEvent>) => {
    setEvents((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)))
    setDetail((d) => (d && d.id === id ? { ...d, ...patch } : d))
  }, [])

  const pushAudit = useCallback(
    (id: string, entry: AtcReviewEvent['auditLog'][0]) => {
      setEvents((prev) =>
        prev.map((x) => (x.id === id ? { ...x, auditLog: [...x.auditLog, entry] } : x))
      )
      setDetail((d) =>
        d && d.id === id ? { ...d, auditLog: [...d.auditLog, entry] } : d
      )
    },
    []
  )

  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (tab === 'published') return e.currentStage === 'published'
      if (tab === 'blocked') return e.currentStage === 'blocked'
      if (tab === 'todo') return isMyTurn(e, role)
      return inInflightForRole(e, role)
    })
  }, [events, tab, role])

  const counts = useMemo(() => {
    const todo = events.filter((e) => isMyTurn(e, role)).length
    const inflight = events.filter((e) => inInflightForRole(e, role)).length
    const published = events.filter((e) => e.currentStage === 'published').length
    const blocked = events.filter((e) => e.currentStage === 'blocked').length
    return { todo, inflight, published, blocked }
  }, [events, role])

  const toggleSelect = (id: string) => {
    setSelected((s) => {
      const n = new Set(s)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  }

  const selectAllFiltered = () => {
    if (selected.size === filtered.length) setSelected(new Set())
    else setSelected(new Set(filtered.map((e) => e.id)))
  }

  const bulkAdvance = () => {
    const ids = [...selected].filter((id) => {
      const e = events.find((x) => x.id === id)
      return e && isMyTurn(e, role)
    })
    ids.forEach((id) => {
      const e = events.find((x) => x.id === id)
      if (!e) return
      if (role === 'delivery' && e.currentStage === 'at_delivery') {
        patchEvent(id, { currentStage: 'at_ops' })
        pushAudit(id, {
          id: `b-${Date.now()}-${id}`,
          at: ATC_REFERENCE_NOW_ISO,
          action: 'delivery_submit_ops',
          actor: '张三（批量）',
        })
      } else if (role === 'ops' && e.currentStage === 'at_ops') {
        patchEvent(id, { currentStage: 'at_sales' })
        pushAudit(id, {
          id: `b-${Date.now()}-${id}`,
          at: ATC_REFERENCE_NOW_ISO,
          action: 'ops_submit_sales',
          actor: '王五（批量）',
        })
      } else if (role === 'sales' && e.currentStage === 'at_sales') {
        patchEvent(id, { currentStage: 'published' })
        pushAudit(id, {
          id: `b-${Date.now()}-${id}`,
          at: ATC_REFERENCE_NOW_ISO,
          action: 'sales_publish',
          actor: '孙八（批量）',
        })
      }
    })
    setSelected(new Set())
  }

  const bulkBlock = () => {
    const ids = [...selected].filter((id) => {
      const e = events.find((x) => x.id === id)
      return e && isMyTurn(e, role)
    })
    ids.forEach((id) => {
      patchEvent(id, {
        currentStage: 'blocked',
        blockedReason: role === 'delivery' ? '批量废弃拦截' : '批量隐藏拦截',
      })
      pushAudit(id, {
        id: `b-${Date.now()}-${id}`,
        at: ATC_REFERENCE_NOW_ISO,
        action: role === 'delivery' ? 'delivery_reject' : 'sales_hide',
        actor: '批量操作',
      })
    })
    setSelected(new Set())
  }

  const detailActions = detail && (
    <div className="flex flex-col gap-[var(--space-3)]">
      {role === 'delivery' && detail.currentStage === 'at_delivery' && (
        <div className="flex flex-wrap gap-[var(--space-2)]">
          <Button
            onClick={() => {
              patchEvent(detail.id, { currentStage: 'at_ops' })
              pushAudit(detail.id, {
                id: `a-${Date.now()}`,
                at: ATC_REFERENCE_NOW_ISO,
                action: 'delivery_submit_ops',
                actor: '张三',
              })
            }}
          >
            提交运营
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              patchEvent(detail.id, {
                previousCustomerCopy: detail.customerCopyDraft,
                customerCopyDraft: editCopy,
                currentStage: 'at_ops',
              })
              pushAudit(detail.id, {
                id: `a-${Date.now()}`,
                at: ATC_REFERENCE_NOW_ISO,
                action: 'delivery_edit',
                actor: '张三',
                copySnapshot: editCopy,
              })
            }}
          >
            修改并提交
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              patchEvent(detail.id, {
                currentStage: 'blocked',
                blockedReason: '交付判定废弃拦截',
              })
              pushAudit(detail.id, {
                id: `a-${Date.now()}`,
                at: ATC_REFERENCE_NOW_ISO,
                action: 'delivery_reject',
                actor: '张三',
              })
            }}
          >
            废弃拦截
          </Button>
        </div>
      )}

      {role === 'ops' && detail.currentStage === 'at_ops' && (
        <div className="flex flex-wrap gap-[var(--space-2)]">
          <Button
            onClick={() => {
              patchEvent(detail.id, { currentStage: 'at_sales' })
              pushAudit(detail.id, {
                id: `a-${Date.now()}`,
                at: ATC_REFERENCE_NOW_ISO,
                action: 'ops_submit_sales',
                actor: '王五',
              })
            }}
          >
            提交销售
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              patchEvent(detail.id, {
                previousCustomerCopy: detail.customerCopyDraft,
                customerCopyDraft: editCopy,
              })
              pushAudit(detail.id, {
                id: `a-${Date.now()}`,
                at: ATC_REFERENCE_NOW_ISO,
                action: 'ops_polish',
                actor: '王五',
                copySnapshot: editCopy,
              })
            }}
          >
            话术润色
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              patchEvent(detail.id, { currentStage: 'at_delivery' })
              pushAudit(detail.id, {
                id: `a-${Date.now()}`,
                at: ATC_REFERENCE_NOW_ISO,
                action: 'ops_return_delivery',
                actor: '王五',
              })
            }}
          >
            退回交付
          </Button>
        </div>
      )}

      {role === 'sales' && detail.currentStage === 'at_sales' && (
        <div className="flex flex-wrap gap-[var(--space-2)]">
          <Button
            onClick={() => {
              patchEvent(detail.id, { currentStage: 'published' })
              pushAudit(detail.id, {
                id: `a-${Date.now()}`,
                at: ATC_REFERENCE_NOW_ISO,
                action: 'sales_publish',
                actor: '孙八',
              })
            }}
          >
            确认发布
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              patchEvent(detail.id, {
                previousCustomerCopy: detail.customerCopyDraft,
                customerCopyDraft: editCopy,
              })
              pushAudit(detail.id, {
                id: `a-${Date.now()}`,
                at: ATC_REFERENCE_NOW_ISO,
                action: 'sales_edit',
                actor: '孙八',
                copySnapshot: editCopy,
              })
            }}
          >
            最终微调
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              patchEvent(detail.id, {
                currentStage: 'blocked',
                blockedReason: '销售隐藏拦截',
              })
              pushAudit(detail.id, {
                id: `a-${Date.now()}`,
                at: ATC_REFERENCE_NOW_ISO,
                action: 'sales_hide',
                actor: '孙八',
              })
            }}
          >
            隐藏拦截
          </Button>
        </div>
      )}

      {role === 'sales' && detail.currentStage === 'published' && (
        <Button
          variant="destructive"
          onClick={() => {
            patchEvent(detail.id, {
              currentStage: 'blocked',
              blockedReason: '已发布内容撤回，前台隐藏',
            })
            pushAudit(detail.id, {
              id: `a-${Date.now()}`,
              at: ATC_REFERENCE_NOW_ISO,
              action: 'sales_recall',
              actor: '孙八',
            })
          }}
        >
          撤回（前台隐藏）
        </Button>
      )}
    </div>
  )

  return (
    <div>
      <div className="mb-[var(--space-5)]">
        <h1 className="text-24-bold text-grey-01">Around the Clock · 审核工作台</h1>
        <p className="text-14-regular text-grey-08 mt-[var(--space-1)]">
          策略事件三审流转与对客 Timeline 发布门禁（演示数据，前端 mock）
        </p>
        <p className="text-12-regular text-grey-08 mt-[var(--space-2)]">
          演示基准时间 {formatAtcDateTime(ATC_REFERENCE_NOW_ISO)} · {ATC_FALLBACK_COPY}
        </p>
      </div>

      <Card className="mb-[var(--space-4)]">
        <div className="flex flex-wrap items-end gap-[var(--space-4)]">
          <div className="min-w-[220px]">
            <span className="text-12-medium text-grey-01 block mb-[var(--space-1)]">当前视角</span>
            <Select
              id="atc-review-role"
              aria-label="审核角色"
              value={role}
              onChange={(e) => {
                setRole(e.target.value as AtcViewerRole)
                setSelected(new Set())
              }}
              options={ROLE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            />
          </div>
        </div>
      </Card>

      <Tabs
        activeKey={tab}
        onChange={(k) => {
          setTab(k as AtcWorkflowTab)
          setSelected(new Set())
        }}
        tabs={[
          { key: 'todo', label: '我的待办', count: counts.todo },
          { key: 'inflight', label: '流转中', count: counts.inflight },
          { key: 'published', label: '已发布', count: counts.published },
          { key: 'blocked', label: '已拦截 / 废弃', count: counts.blocked },
        ]}
      />

      {tab === 'todo' && counts.todo > 0 && (
        <span className="inline-block mt-[var(--space-2)] w-2 h-2 rounded-full bg-red" aria-hidden />
      )}

      <div className="flex items-center justify-between mt-[var(--space-4)] mb-[var(--space-2)] flex-wrap gap-[var(--space-2)]">
        <div className="flex items-center gap-[var(--space-2)]">
          <Button variant="ghost" onClick={selectAllFiltered} className="text-12-medium">
            {selected.size === filtered.length ? '取消全选' : '全选本页'}
          </Button>
          <span className="text-12-regular text-grey-08">已选 {selected.size} 条</span>
        </div>
        <div className="flex gap-[var(--space-2)]">
          <Button variant="secondary" disabled={selected.size === 0} onClick={bulkAdvance}>
            批量提交下一环节
          </Button>
          <Button variant="destructive" disabled={selected.size === 0} onClick={bulkBlock}>
            批量拦截
          </Button>
        </div>
      </div>

      <Table<AtcReviewEvent>
        rowKey={(e) => e.id}
        data={filtered}
        onRowClick={openDetail}
        columns={[
          {
            key: 'sel',
            header: '',
            width: 40,
            render: (e) => (
              <input
                type="checkbox"
                checked={selected.has(e.id)}
                onClick={(ev) => ev.stopPropagation()}
                onChange={() => toggleSelect(e.id)}
                aria-label={`选择 ${e.clientName}`}
              />
            ),
          },
          {
            key: 'sla',
            header: 'SLA',
            width: 100,
            render: (e) =>
              e.currentStage === 'published' || e.currentStage === 'blocked'
                ? '—'
                : slaBadge(getSlaTrafficLight(e.slaDueAt)),
          },
          { key: 'clientName', header: '客户', render: (e) => e.clientName },
          {
            key: 'sens',
            header: '敏感度',
            width: 72,
            render: (e) => <Badge variant={e.sensitivity === 'P0' ? 'red' : e.sensitivity === 'P1' ? 'orange' : 'grey'}>{e.sensitivity}</Badge>,
          },
          {
            key: 'eventType',
            header: '事件类型',
            render: (e) => EVENT_TYPE_LABEL[e.eventType] || e.eventType,
          },
          {
            key: 'stage',
            header: '环节',
            render: (e) => STAGE_LABEL[e.currentStage] || e.currentStage,
          },
          {
            key: 'time',
            header: '发生时间',
            render: (e) => formatAtcDateTime(e.occurredAt),
          },
          {
            key: 'copy',
            header: '对客文案摘要',
            render: (e) => (
              <span className="text-12-regular text-grey-06 line-clamp-2">{e.customerCopyDraft}</span>
            ),
          },
        ]}
      />

      <Drawer
        open={!!detail}
        onClose={() => setDetail(null)}
        title={detail ? `${detail.clientName} · 事件详情` : undefined}
        width={480}
      >
        {detail && (
          <div className="flex flex-col gap-[var(--space-4)]">
            {detail.blockedReason && (
              <div className="p-[var(--space-3)] rounded-lg bg-red-tint-08 text-red text-12-regular">
                {detail.blockedReason}
              </div>
            )}

            <div>
              <div className="text-12-bold text-grey-06 mb-[var(--space-2)]">叙事链</div>
              <ul className="text-12-regular text-grey-06 space-y-[var(--space-1)] list-disc pl-[var(--space-4)]">
                <li>
                  <span className="text-grey-01">信号</span> {detail.narrative.signal}
                </li>
                <li>
                  <span className="text-grey-01">策略</span> {detail.narrative.strategy}
                </li>
                <li>
                  <span className="text-grey-01">动作</span> {detail.narrative.action}
                </li>
                <li>
                  <span className="text-grey-01">预期</span> {detail.narrative.outcome}
                </li>
              </ul>
            </div>

            {detail.kpiRefs.length > 0 && (
              <div className="flex flex-wrap gap-[var(--space-2)]">
                {detail.kpiRefs.map((k) => (
                  <Badge key={k} variant="cyan">
                    {kpiRefLabel(k)}
                  </Badge>
                ))}
              </div>
            )}

            {detail.experimentProgress && (
              <div>
                <div className="text-12-bold text-grey-06 mb-[var(--space-2)]">{detail.experimentProgress.label}</div>
                <Stepper
                  steps={Array.from({ length: detail.experimentProgress.totalSteps }, (_, i) => ({
                    key: `e${i}`,
                    label: `E${i + 1}`,
                  }))}
                  currentStep={detail.experimentProgress.currentStep}
                />
              </div>
            )}

            {role === 'delivery' && detail.currentStage === 'at_delivery' && (
              <div>
                <div className="text-12-bold text-grey-06 mb-[var(--space-1)]">HUI 参数摘要</div>
                <pre className="text-10-regular text-grey-06 bg-bg p-[var(--space-2)] rounded-md overflow-x-auto whitespace-pre-wrap break-all">
                  {detail.huiPayloadSummary}
                </pre>
              </div>
            )}

            <div>
              <div className="text-12-bold text-grey-06 mb-[var(--space-1)]">对客文案</div>
              <textarea
                value={editCopy}
                onChange={(e) => setEditCopy(e.target.value)}
                className="w-full min-h-[80px] p-[var(--space-3)] rounded-lg border border-stroke text-14-regular outline-none focus:border-grey-01"
              />
            </div>

            {detail.previousCustomerCopy && (
              <div>
                <div className="text-12-bold text-grey-06 mb-[var(--space-1)]">Diff（上一版 → 当前）</div>
                <div className="text-12-regular p-[var(--space-3)] rounded-lg bg-bg border border-stroke">
                  <p className="text-red line-through mb-[var(--space-2)]">{detail.previousCustomerCopy}</p>
                  <p className="text-l-cyan">{detail.customerCopyDraft}</p>
                </div>
              </div>
            )}

            {role === 'sales' && (
              <Card padding="standard">
                <div className="text-12-bold text-grey-06 mb-[var(--space-2)]">前台 UI 预览卡片</div>
                <div className="rounded-lg border border-stroke p-[var(--space-3)] bg-bg">
                  <div className="text-10-regular text-grey-08 mb-[var(--space-1)]">Always On · Timeline</div>
                  <div className="text-12-bold text-grey-01 mb-[var(--space-2)]">{detail.clientName}</div>
                  <p className="text-12-regular text-grey-06">{editCopy}</p>
                  <div className="flex flex-wrap gap-[var(--space-1)] mt-[var(--space-2)]">
                    {detail.kpiRefs.map((k) => (
                      <span key={k} className="text-10-medium text-l-cyan bg-cyan-tint-08 px-[6px] py-[2px] rounded">
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            <div>
              <div className="text-12-bold text-grey-06 mb-[var(--space-2)]">操作时间轴</div>
              <ul className="space-y-[var(--space-2)]">
                {[...detail.auditLog].reverse().map((log) => (
                  <li key={log.id} className="text-12-regular text-grey-06 border-l-2 border-stroke pl-[var(--space-2)]">
                    <span className="text-grey-01">{formatAtcDateTime(log.at)}</span> ·{' '}
                    {auditActionLabel(log.action)} · {log.actor}
                    {log.note && <span className="text-grey-08"> — {log.note}</span>}
                  </li>
                ))}
              </ul>
            </div>

            {detailActions}
          </div>
        )}
      </Drawer>
    </div>
  )
}
