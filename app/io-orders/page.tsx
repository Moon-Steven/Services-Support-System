'use client'

import { useState, useMemo, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Dialog } from '@/components/ui/Dialog'
import { Avatar } from '@/components/ui/Avatar'
import { ioOrders } from '@/lib/data'
import type { IOOrder, IOOrderType, IOOrderStatus } from '@/lib/data'
import { ApprovalChain } from '@/components/ui/ApprovalChain'

const statusVariant = (s: IOOrderStatus): 'cyan' | 'grey' | 'orange' | 'red' | 'dark' => {
  if (s === '投放中') return 'cyan'
  if (s === '已完成') return 'grey'
  if (s === '审批中' || s === '待打款') return 'orange'
  if (s === '退款中') return 'orange'
  if (s === '已终止' || s === '已退款') return 'red'
  return 'dark'
}

const typeVariant = (t: IOOrderType): 'cyan' | 'grey' | 'orange' | 'red' | 'dark' => {
  if (t === '新建投放') return 'cyan'
  if (t === '变更需求') return 'orange'
  if (t === '终止合作') return 'dark'
  return 'grey'
}

function IOOrdersPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const presetClient = searchParams.get('client') || ''

  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('全部')
  const [filterType, setFilterType] = useState<string>('全部')
  const [selectedOrder, setSelectedOrder] = useState<IOOrder | null>(null)

  const filtered = useMemo(() => {
    return ioOrders.filter((o) => {
      if (search && !o.clientName.toLowerCase().includes(search.toLowerCase()) && !o.id.toLowerCase().includes(search.toLowerCase())) return false
      if (filterStatus !== '全部' && o.status !== filterStatus) return false
      if (filterType !== '全部' && o.type !== filterType) return false
      if (presetClient && o.clientId !== presetClient) return false
      return true
    })
  }, [search, filterStatus, filterType, presetClient])

  /* Stats */
  const stats = useMemo(() => ({
    total: ioOrders.length,
    pending: ioOrders.filter((o) => o.status === '审批中').length,
    active: ioOrders.filter((o) => o.status === '投放中').length,
    totalAmount: ioOrders.reduce((s, o) => s + o.amount, 0),
  }), [])

  return (
    <div className="flex flex-col gap-[var(--space-3)]">
      {/* ── Header: title + inline stats + button ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-[var(--space-5)]">
          <h1 className="text-20-bold text-grey-01">IO 单管理</h1>
          <div className="flex items-center gap-[var(--space-3)] text-12-regular">
            <span className="text-grey-08">全部 <span className="text-14-bold text-grey-01">{stats.total}</span></span>
            <span className="w-[1px] h-[12px] bg-stroke" />
            <span className="text-grey-08">审批中 <span className="text-14-bold text-orange">{stats.pending}</span></span>
            <span className="w-[1px] h-[12px] bg-stroke" />
            <span className="text-grey-08">投放中 <span className="text-14-bold text-l-cyan">{stats.active}</span></span>
            <span className="w-[1px] h-[12px] bg-stroke" />
            <span className="text-grey-08">总金额 <span className="text-14-bold text-grey-01">${stats.totalAmount.toLocaleString()}</span></span>
          </div>
        </div>
        <Button onClick={() => router.push(presetClient ? `/io-orders/new?client=${presetClient}` : '/io-orders/new')}>+ 新建 IO 单</Button>
      </div>

      {/* ── Filters ── */}
      <div className="flex items-center gap-[var(--space-3)]">
        <div className="relative flex-1 max-w-[200px]">
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-grey-08 pointer-events-none"
            width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" strokeWidth="2" />
            <path d="M21 21l-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <Input
            placeholder="搜索 IO 单号或客户..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="!pl-[28px] !h-[30px] !text-[12px] !rounded-full"
          />
        </div>
        <div className="flex gap-[var(--space-1)]">
          {['全部', '审批中', '待打款', '投放中', '已完成'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-[var(--space-2)] py-[4px] rounded-full text-12-medium border-none cursor-pointer transition-colors font-[inherit] ${
                filterStatus === s
                  ? 'bg-grey-01 text-white'
                  : 'bg-transparent text-grey-06 hover:bg-grey-12'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <span className="w-[1px] h-[16px] bg-stroke" />
        <div className="flex gap-[var(--space-1)]">
          {['全部', '新建投放', '变更需求', '终止合作'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-[var(--space-2)] py-[4px] rounded-full text-12-medium border-none cursor-pointer transition-colors font-[inherit] ${
                filterType === t
                  ? 'bg-grey-01 text-white'
                  : 'bg-transparent text-grey-06 hover:bg-grey-12'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* ── Order List ── */}
      <Card padding="none" className="overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-[var(--space-6)]">
            <p className="text-14-regular text-grey-08">暂无匹配的 IO 单</p>
          </div>
        ) : (
          filtered.map((order, idx) => (
            <div
              key={order.id}
              className={`flex items-center gap-[var(--space-3)] px-[var(--space-4)] py-[var(--space-3)] cursor-pointer hover:bg-selected transition-colors ${
                idx < filtered.length - 1 ? 'border-b border-stroke' : ''
              }`}
              onClick={() => setSelectedOrder(order)}
            >
              {/* Left: avatar + IO info */}
              <Avatar name={order.clientName[0]} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-[var(--space-2)]">
                  <span className="text-12-bold text-grey-01">{order.id}</span>
                  <Badge variant={typeVariant(order.type)}>{order.type}</Badge>
                  <Badge variant={statusVariant(order.status)}>{order.status}</Badge>
                </div>
                <div className="flex items-center gap-[var(--space-2)] mt-[2px] text-12-regular text-grey-08">
                  <a
                    href={`/client/${order.clientId}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-grey-06 hover:text-l-cyan hover:underline transition-colors"
                  >
                    {order.clientName}
                  </a>
                  <span>·</span>
                  <span>{order.channels.join(' / ')}</span>
                  <span>·</span>
                  <span>{order.period}</span>
                </div>
              </div>

              {/* Right: amount + submitter */}
              <div className="text-right shrink-0">
                <div className="text-14-bold text-grey-01">${order.amount.toLocaleString()}</div>
                <div className="text-10-regular text-grey-08">{order.createdBy} · {order.createdAt}</div>
              </div>
            </div>
          ))
        )}
      </Card>

      {/* ── Order Detail Dialog ── */}
      {selectedOrder && (
        <Dialog
          open={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`IO 单详情 · ${selectedOrder.id}`}
          width={640}
        >
          <div className="flex flex-col gap-[var(--space-4)]">
            {/* Badges */}
            <div className="flex items-center gap-[var(--space-2)]">
              <Badge variant={typeVariant(selectedOrder.type)}>{selectedOrder.type}</Badge>
              <Badge variant={statusVariant(selectedOrder.status)}>{selectedOrder.status}</Badge>
            </div>

            {/* Section: 申请详情 */}
            <div>
              <div className="text-12-bold text-grey-06 mb-[var(--space-2)]">申请详情</div>
              <div className="bg-bg rounded-lg p-[var(--space-3)]">
                <div className="flex items-center gap-[var(--space-2)] mb-[var(--space-3)]">
                  <Avatar name={selectedOrder.clientName[0]} size="sm" />
                  <div>
                    <a href={`/client/${selectedOrder.clientId}`} className="text-14-bold text-grey-01 hover:text-l-cyan hover:underline transition-colors">
                      {selectedOrder.clientName}
                    </a>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-x-[var(--space-4)] gap-y-[var(--space-2)]">
                  <div>
                    <div className="text-10-regular text-grey-08">客户目标</div>
                    <div className="text-14-medium text-grey-01">{selectedOrder.objective || '—'}</div>
                  </div>
                  <div>
                    <div className="text-10-regular text-grey-08">预算金额</div>
                    <div className="text-16-bold text-grey-01">${selectedOrder.amount.toLocaleString()}</div>
                  </div>
                </div>
                {selectedOrder.description && (
                  <div className="mt-[var(--space-2)] pt-[var(--space-2)] border-t border-stroke">
                    <div className="text-10-regular text-grey-08 mb-1">目标说明</div>
                    <div className="text-12-regular text-grey-06">{selectedOrder.description}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Section: 执行信息 */}
            <div>
              <div className="text-12-bold text-grey-06 mb-[var(--space-2)]">执行信息</div>
              <div className="border border-stroke rounded-lg overflow-hidden">
                {[
                  ['业务负责人', selectedOrder.ownerName ? `${selectedOrder.ownerName}（${selectedOrder.ownerRole}）` : selectedOrder.createdBy],
                  ['投放周期', selectedOrder.startDate && selectedOrder.endDate ? `${selectedOrder.startDate} ~ ${selectedOrder.endDate}（${selectedOrder.duration}天）` : selectedOrder.period],
                  ['投放渠道', selectedOrder.channels.join(' / ')],
                  ['关联内容', selectedOrder.relatedDoc || '—'],
                  ['提交人', selectedOrder.createdBy],
                  ['提交日期', selectedOrder.createdAt],
                ].map(([label, value], i, arr) => (
                  <div key={label} className={`flex justify-between px-[var(--space-3)] py-[var(--space-2)] text-12-regular ${i < arr.length - 1 ? 'border-b border-stroke' : ''}`}>
                    <span className="text-grey-08">{label}</span>
                    <span className="text-14-medium text-grey-01">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Termination Section */}
            {selectedOrder.type === '终止合作' && (
              <div className="bg-red-tint-08 rounded-lg p-[var(--space-3)]">
                <div className="text-12-bold text-red mb-[var(--space-2)]">终止合作信息</div>
                <div className="grid grid-cols-2 gap-[var(--space-2)]">
                  <div>
                    <div className="text-10-regular text-grey-08">终止类型</div>
                    <div className="text-12-medium text-red">{selectedOrder.terminationType || '—'}</div>
                  </div>
                  <div>
                    <div className="text-10-regular text-grey-08">终止原因</div>
                    <div className="text-12-regular text-grey-06">{selectedOrder.terminationReason || '—'}</div>
                  </div>
                  <div>
                    <div className="text-10-regular text-grey-08">已消耗</div>
                    <div className="text-14-medium text-grey-01">${selectedOrder.consumed?.toLocaleString() || '—'}</div>
                  </div>
                  <div>
                    <div className="text-10-regular text-grey-08">服务费</div>
                    <div className="text-14-medium text-grey-01">${selectedOrder.serviceFee?.toLocaleString() || '—'}</div>
                  </div>
                  <div>
                    <div className="text-10-regular text-grey-08">预估退款</div>
                    <div className="text-16-bold text-orange">${selectedOrder.refundAmount?.toLocaleString() || '—'}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Approval Chain */}
            <div>
              <div className="text-12-bold text-grey-06 mb-[var(--space-2)]">审批链</div>
              <div className="flex flex-col gap-[var(--space-2)]">
                {selectedOrder.approvals.map((a, i) => (
                  <div key={i} className="flex items-center gap-[var(--space-3)] p-[var(--space-2)] bg-bg rounded-lg">
                    <span className={`w-[8px] h-[8px] rounded-full ${
                      a.status === 'approved' ? 'bg-l-cyan'
                        : a.status === 'rejected' ? 'bg-red'
                          : 'bg-grey-08 animate-pulse'
                    }`} />
                    <span className="text-14-medium text-grey-01 w-[60px]">{a.role}</span>
                    <span className="text-12-regular text-grey-06">{a.person}</span>
                    <span className="text-12-regular text-grey-08 ml-auto">
                      {a.status === 'approved' ? `✓ ${a.date}` : a.status === 'rejected' ? '✗ 已拒绝' : '等待中...'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end">
              <Button variant="secondary" onClick={() => setSelectedOrder(null)}>关闭</Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  )
}

export default function IOOrdersPage() {
  return <Suspense><IOOrdersPageContent /></Suspense>
}
