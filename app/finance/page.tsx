'use client'

import { useState, useMemo } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { Tabs } from '@/components/ui/Tabs'
import { Dialog } from '@/components/ui/Dialog'
import { financeItems, ioOrders } from '@/lib/data'
import type { FinanceItem } from '@/lib/data'

const tabs = [
  { key: 'payment', label: '打款确认' },
  { key: 'refund', label: '退款处理' },
]

/* Mock refund items */
const refundItems: FinanceItem[] = [
  {
    id: 'REF-001', ioOrderId: 'IO-2026-008', clientId: 'brightpath', clientName: 'BrightPath',
    type: '退款', amount: 8750, status: '待确认', requestDate: '2026-03-24',
    note: '客户主动终止，测试期未达标',
    totalCharged: 15000, consumed: 4500, serviceFee: 675,
  },
]

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState('payment')
  const [confirmDialog, setConfirmDialog] = useState<FinanceItem | null>(null)
  const [confirmType, setConfirmType] = useState<'approve' | 'refund'>('approve')

  /* Stats */
  const paymentPending = financeItems.filter((f) => f.type === '收款' && f.status === '待确认')
  const paymentDone = financeItems.filter((f) => f.type === '收款' && f.status !== '待确认')
  const refundPending = refundItems.filter((f) => f.status === '待确认')

  const totalPending = paymentPending.reduce((s, f) => s + f.amount, 0)
  const totalConfirmed = paymentDone.reduce((s, f) => s + f.amount, 0)
  const totalRefundPending = refundPending.reduce((s, f) => s + f.amount, 0)

  const handleConfirm = (item: FinanceItem, type: 'approve' | 'refund') => {
    setConfirmType(type)
    setConfirmDialog(item)
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-[var(--space-5)]">
        <h1 className="text-24-bold text-grey-01">财务工作台</h1>
        <p className="text-14-regular text-grey-08 mt-[var(--space-1)]">
          打款确认 · 退款处理 · 财务数据留痕
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-[var(--space-3)] mb-[var(--space-5)]">
        <Card>
          <div className="text-12-regular text-grey-08">待确认打款</div>
          <div className="text-20-bold text-orange mt-1">{paymentPending.length} 笔</div>
          <div className="text-12-regular text-grey-08 mt-0.5">${totalPending.toLocaleString()}</div>
        </Card>
        <Card>
          <div className="text-12-regular text-grey-08">已确认打款</div>
          <div className="text-20-bold text-l-cyan mt-1">{paymentDone.length} 笔</div>
          <div className="text-12-regular text-grey-08 mt-0.5">${totalConfirmed.toLocaleString()}</div>
        </Card>
        <Card>
          <div className="text-12-regular text-grey-08">待处理退款</div>
          <div className="text-20-bold text-red mt-1">{refundPending.length} 笔</div>
          <div className="text-12-regular text-grey-08 mt-0.5">${totalRefundPending.toLocaleString()}</div>
        </Card>
        <Card>
          <div className="text-12-regular text-grey-08">本月净收入</div>
          <div className="text-20-bold text-grey-01 mt-1">
            ${(totalConfirmed - totalRefundPending).toLocaleString()}
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeKey={activeTab} onChange={setActiveTab} />

      <div className="mt-[var(--space-4)]">
        {/* ── Payment Confirmation ── */}
        {activeTab === 'payment' && (
          <div className="flex flex-col gap-[var(--space-3)]">
            {/* Pending */}
            {paymentPending.length > 0 && (
              <div>
                <div className="text-12-bold text-grey-08 mb-[var(--space-2)]">待确认</div>
                {paymentPending.map((item) => (
                  <Card key={item.id} className="mb-[var(--space-2)]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-[var(--space-3)]">
                        <Avatar name={item.clientName[0]} size="sm" />
                        <div>
                          <div className="flex items-center gap-[var(--space-2)]">
                            <span className="text-14-bold text-grey-01">{item.clientName}</span>
                            <Badge variant="orange">待确认</Badge>
                            <span className="text-12-regular text-grey-08">{item.ioOrderId}</span>
                          </div>
                          <div className="text-12-regular text-grey-08 mt-[2px]">
                            申请日期：{item.requestDate}
                            {item.note && <span className="ml-[var(--space-3)]">{item.note}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-[var(--space-3)]">
                        <span className="text-20-bold text-grey-01">${item.amount.toLocaleString()}</span>
                        <Button onClick={() => handleConfirm(item, 'approve')}>确认打款</Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Confirmed */}
            {paymentDone.length > 0 && (
              <div>
                <div className="text-12-bold text-grey-08 mb-[var(--space-2)]">已完成</div>
                {paymentDone.map((item) => (
                  <Card key={item.id} className="mb-[var(--space-2)] opacity-70">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-[var(--space-3)]">
                        <Avatar name={item.clientName[0]} size="sm" />
                        <div>
                          <div className="flex items-center gap-[var(--space-2)]">
                            <span className="text-14-medium text-grey-01">{item.clientName}</span>
                            <Badge variant="cyan">已确认</Badge>
                            <span className="text-12-regular text-grey-08">{item.ioOrderId}</span>
                          </div>
                          <div className="text-12-regular text-grey-08 mt-[2px]">
                            确认日期：{item.confirmDate} · 操作人：{item.operator}
                          </div>
                        </div>
                      </div>
                      <span className="text-16-bold text-grey-06">${item.amount.toLocaleString()}</span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Refund Processing ── */}
        {activeTab === 'refund' && (
          <div className="flex flex-col gap-[var(--space-3)]">
            {refundPending.length > 0 ? (
              refundPending.map((item) => (
                <Card key={item.id}>
                  <div className="flex items-start justify-between mb-[var(--space-3)]">
                    <div className="flex items-center gap-[var(--space-3)]">
                      <Avatar name={item.clientName[0]} size="sm" />
                      <div>
                        <div className="flex items-center gap-[var(--space-2)]">
                          <span className="text-14-bold text-grey-01">{item.clientName}</span>
                          <Badge variant="red">待退款</Badge>
                        </div>
                        <div className="text-12-regular text-grey-08 mt-[2px]">
                          {item.note}
                        </div>
                      </div>
                    </div>
                    <Badge variant="red">{item.ioOrderId}</Badge>
                  </div>

                  {/* Refund breakdown */}
                  <div className="bg-bg rounded-lg p-[var(--space-3)] mb-[var(--space-3)]">
                    <div className="grid grid-cols-4 gap-[var(--space-4)]">
                      <div>
                        <div className="text-10-regular text-grey-08">充值总额</div>
                        <div className="text-14-bold text-grey-01">${item.totalCharged?.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-10-regular text-grey-08">已消耗</div>
                        <div className="text-14-bold text-grey-01">${item.consumed?.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-10-regular text-grey-08">服务费 (15%)</div>
                        <div className="text-14-bold text-grey-01">${item.serviceFee?.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-10-regular text-grey-08">应退金额</div>
                        <div className="text-14-bold text-red">${item.amount.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>

                  {/* Approval progress */}
                  <div className="flex items-center gap-[var(--space-4)] mb-[var(--space-3)]">
                    {['销售确认', '运营暂停', '交付交割', '财务退款'].map((s, i) => (
                      <div key={s} className="flex items-center gap-[var(--space-1)]">
                        <span className={`w-[8px] h-[8px] rounded-full ${
                          i < 3 ? 'bg-l-cyan' : 'bg-orange animate-pulse'
                        }`} />
                        <span className={`text-12-regular ${i < 3 ? 'text-grey-06' : 'text-orange font-medium'}`}>
                          {s}
                        </span>
                        {i < 3 && <span className="text-grey-08 mx-1">→</span>}
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end gap-[var(--space-2)]">
                    <Button variant="secondary">查看详情</Button>
                    <Button variant="destructive" onClick={() => handleConfirm(item, 'refund')}>
                      确认退款
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="text-center py-[var(--space-8)]">
                <p className="text-14-regular text-grey-08">暂无待处理退款</p>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Confirm Dialog */}
      {confirmDialog && (
        <Dialog
          open={!!confirmDialog}
          onClose={() => setConfirmDialog(null)}
          title={confirmType === 'approve' ? '确认打款' : '确认退款'}
          width={400}
        >
          <div className="flex flex-col gap-[var(--space-4)]">
            <div className="bg-bg rounded-lg p-[var(--space-4)] text-center">
              <div className="text-12-regular text-grey-08 mb-1">
                {confirmType === 'approve' ? '打款金额' : '退款金额'}
              </div>
              <div className={`text-24-bold ${confirmType === 'approve' ? 'text-grey-01' : 'text-red'}`}>
                ${confirmDialog.amount.toLocaleString()}
              </div>
              <div className="text-14-medium text-grey-06 mt-1">{confirmDialog.clientName}</div>
            </div>

            <p className="text-12-regular text-grey-08 text-center">
              {confirmType === 'approve'
                ? '确认后 IO 单状态将更新为「已打款」，投放流程将自动启动'
                : '确认后退款将执行，客户合作状态将变更为「已终止」'}
            </p>

            <div className="flex justify-end gap-[var(--space-2)]">
              <Button variant="secondary" onClick={() => setConfirmDialog(null)}>取消</Button>
              <Button
                variant={confirmType === 'approve' ? 'primary' : 'destructive'}
                onClick={() => {
                  setConfirmDialog(null)
                  alert(`${confirmType === 'approve' ? '打款' : '退款'}已确认！`)
                }}
              >
                {confirmType === 'approve' ? '确认打款' : '确认退款'}
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  )
}
