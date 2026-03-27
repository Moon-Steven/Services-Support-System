'use client'

import { useState, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { Select } from '@/components/ui/Select'
import { clients } from '@/lib/data'
import type { IOOrderType } from '@/lib/data'

/* ── Options ── */
const objectives = [
  { value: '', label: '请选择' },
  { value: 'brand', label: '品牌曝光' },
  { value: 'conversion', label: '效果转化' },
  { value: 'growth', label: '用户增长' },
  { value: 'retention', label: '用户留存' },
  { value: 'test', label: '测试验证' },
]

const channels = ['Meta', 'Google', 'TikTok', 'X (Twitter)', 'Snapchat', 'Pinterest']

const team = [
  { id: 'wangsiqiong', name: '王斯琼', role: '销售', initial: '王' },
  { id: 'luoyitong', name: '罗依桐', role: '投手', initial: '罗' },
  { id: 'taoyangyang', name: '陶阳阳', role: '投手', initial: '陶' },
  { id: 'guojinguang', name: '郭晋光', role: '运营', initial: '郭' },
  { id: 'minghu', name: '明虎', role: '交付', initial: '明' },
]

const relatedContent = [
  { value: '', label: '请选择' },
  { value: 'framework', label: '框架协议' },
  { value: 'supplement', label: '补充协议' },
  { value: 'renewal', label: '续约协议' },
]

function NewIOOrderPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const presetClient = searchParams.get('client') || ''

  /* ── Form State ── */
  const [clientId, setClientId] = useState(presetClient)
  const [type, setType] = useState<IOOrderType>('新建投放')
  const [amount, setAmount] = useState('')
  const [objective, setObjective] = useState('')
  const [description, setDescription] = useState('')
  const [ownerId, setOwnerId] = useState('')
  const [startDate, setStartDate] = useState('2026-03-26')
  const [endDate, setEndDate] = useState('2026-04-09')
  const [selectedChannels, setSelectedChannels] = useState<string[]>([])
  const [relatedDoc, setRelatedDoc] = useState('')
  const [showApproval, setShowApproval] = useState(true)
  const [submitted, setSubmitted] = useState(false)

  const duration = useMemo(() => {
    if (!startDate || !endDate) return 0
    const diff = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000)
    return diff > 0 ? diff : 0
  }, [startDate, endDate])

  const selectedClient = clients.find((c) => c.id === clientId)
  const owner = team.find((m) => m.id === ownerId)
  const isComplete = !!(clientId && amount && objective && startDate && endDate && duration > 0)

  const toggleChannel = (ch: string) =>
    setSelectedChannels((p) => (p.includes(ch) ? p.filter((c) => c !== ch) : [...p, ch]))

  /* ── Success State ── */
  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center max-w-[480px]">
          <div className="w-[64px] h-[64px] rounded-full bg-cyan-tint-08 mx-auto mb-[var(--space-5)] flex items-center justify-center">
            <svg width="32" height="32" className="text-l-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-20-bold text-grey-01 mb-[var(--space-2)]">IO 单已提交</h2>
          <p className="text-14-regular text-grey-08 mb-[var(--space-6)]">
            已进入审批流程，审批通过后将流转至财务确认打款
          </p>

          {/* Summary */}
          <Card className="text-left mb-[var(--space-5)]">
            <div className="flex items-center justify-between mb-[var(--space-3)]">
              <div className="flex items-center gap-[var(--space-2)]">
                <Avatar name={selectedClient?.name || '?'} size="sm" />
                <span className="text-14-bold text-grey-01">{selectedClient?.name}</span>
              </div>
              <Badge variant={type === '新建投放' ? 'cyan' : type === '变更需求' ? 'orange' : 'red'}>{type}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-x-[var(--space-4)] gap-y-[var(--space-2)]">
              {[
                ['预算金额', `$${Number(amount || 0).toLocaleString()}`],
                ['投放时长', `${duration} 天`],
                ['客户目标', objectives.find((o) => o.value === objective)?.label || '—'],
                ['投放渠道', selectedChannels.join(' / ') || '—'],
              ].map(([l, v]) => (
                <div key={l}>
                  <div className="text-10-regular text-grey-08">{l}</div>
                  <div className="text-14-medium text-grey-01">{v}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Approval chain */}
          <div className="flex items-center justify-center gap-[var(--space-4)] mb-[var(--space-6)]">
            {['销售确认', '投手审批', '财务打款'].map((s, i) => (
              <div key={s} className="flex items-center gap-[var(--space-1)]">
                <span className={`w-[6px] h-[6px] rounded-full ${i === 0 ? 'bg-orange animate-pulse' : 'bg-grey-12'}`} />
                <span className={`text-12-regular ${i === 0 ? 'text-orange font-medium' : 'text-grey-08'}`}>{s}</span>
                {i < 2 && <span className="text-grey-12 ml-[var(--space-1)]">→</span>}
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-[var(--space-3)]">
            <Button variant="secondary" onClick={() => router.push('/io-orders')}>返回 IO 单列表</Button>
            <Button onClick={() => { setSubmitted(false); setClientId(''); setAmount(''); setObjective(''); setDescription(''); setOwnerId(''); setSelectedChannels([]); setRelatedDoc('') }}>
              继续创建
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-[var(--space-5)]">
        <div className="flex items-center gap-[var(--space-3)]">
          <button
            onClick={() => router.back()}
            className="bg-transparent border-none cursor-pointer text-grey-08 hover:text-grey-01 transition-colors p-0"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <div>
            <h1 className="text-20-bold text-grey-01">IO 确认单</h1>
            <p className="text-12-regular text-grey-08 mt-[2px]">适用于框架协议签订后的客户具体 IO 确认</p>
          </div>
        </div>
      </div>

      {/* Two-Column: Form + Summary */}
      <div className="grid gap-[var(--space-4)]" style={{ gridTemplateColumns: '1fr 340px' }}>

        {/* ═══ Left: Form ═══ */}
        <div className="flex flex-col gap-[var(--space-4)]">

          {/* Section 1: 基本信息 */}
          <Card>
            <SectionTitle>申请详情</SectionTitle>

            {/* Submitter */}
            <div className="mb-[var(--space-4)]">
              <div className="flex items-center gap-[var(--space-2)] mb-[var(--space-1)]">
                <span className="text-12-regular text-grey-08">提交人</span>
                <button className="bg-transparent border-none cursor-pointer text-l-cyan text-12-regular font-[inherit] p-0">代他人提交</button>
              </div>
              <div className="flex items-center gap-[var(--space-2)]">
                <Avatar name="张" size="sm" className="!w-[26px] !h-[26px] !text-[11px]" />
                <span className="text-14-medium text-grey-01">张邵华</span>
              </div>
            </div>

            {/* Client + Type in two columns */}
            <div className="grid grid-cols-2 gap-[var(--space-3)] mb-[var(--space-4)]">
              <FieldLabel label="客户名称" required>
                <Select
                  options={[{ value: '', label: '请选择客户' }, ...clients.map((c) => ({ value: c.id, label: c.name }))]}
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                />
              </FieldLabel>
              <FieldLabel label="客户目标" required>
                <Select
                  options={objectives}
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                />
              </FieldLabel>
            </div>

            {/* IO Type */}
            <FieldLabel label="IO 类型" required className="mb-[var(--space-4)]">
              <div className="flex gap-[var(--space-2)]">
                {(['新建投放', '变更需求', '终止合作'] as IOOrderType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={`flex-1 py-[9px] rounded-lg text-12-medium border cursor-pointer transition-all font-[inherit] ${
                      type === t
                        ? t === '终止合作'
                          ? 'bg-red text-white border-red'
                          : 'bg-grey-01 text-white border-grey-01'
                        : 'bg-white text-grey-06 border-stroke hover:border-grey-06'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </FieldLabel>

            {/* Amount */}
            <FieldLabel label="本次预算金额" required className="mb-[var(--space-4)]">
              <div className="flex overflow-hidden rounded-md border border-grey-12 focus-within:border-grey-01 transition-colors">
                <input
                  type="text"
                  placeholder="请输入金额"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="flex-1 text-14-regular px-3 h-[var(--height-input)] bg-white text-grey-01 outline-none border-none font-[inherit]"
                />
                <div className="flex items-center px-[var(--space-3)] bg-bg text-12-medium text-grey-06 border-l border-grey-12 shrink-0 select-none">
                  USD · 美元
                </div>
              </div>
            </FieldLabel>

            {/* Description */}
            <FieldLabel label="IO 单目标说明" required>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="请输入投放目标、预期效果、特殊要求等..."
                rows={3}
                className="w-full text-14-regular rounded-md p-[var(--space-3)] border border-grey-12 bg-white text-grey-01 outline-none font-[inherit] resize-y transition-colors focus:border-grey-01"
              />
            </FieldLabel>
          </Card>

          {/* Section 2: 执行信息 */}
          <Card>
            <SectionTitle>执行信息</SectionTitle>

            {/* Business Owner */}
            <FieldLabel label="业务负责人" required className="mb-[var(--space-4)]">
              {ownerId ? (
                <div className="flex items-center gap-[var(--space-2)] p-[var(--space-2)] bg-bg rounded-lg">
                  <Avatar name={owner?.initial || ''} size="sm" className="!w-[28px] !h-[28px] !text-[11px]" />
                  <div className="flex-1">
                    <div className="text-14-medium text-grey-01">{owner?.name}</div>
                    <div className="text-10-regular text-grey-08">{owner?.role}</div>
                  </div>
                  <button
                    onClick={() => setOwnerId('')}
                    className="bg-transparent border-none cursor-pointer text-12-regular text-grey-08 hover:text-red transition-colors font-[inherit]"
                  >
                    更换
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-[6px]">
                  {team.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setOwnerId(m.id)}
                      className="inline-flex items-center gap-[5px] pl-[4px] pr-[var(--space-2)] py-[4px] rounded-full border border-stroke bg-white text-12-medium text-grey-06 cursor-pointer hover:border-grey-06 hover:bg-selected transition-colors font-[inherit]"
                    >
                      <Avatar name={m.initial} size="sm" className="!w-[20px] !h-[20px] !text-[9px]" />
                      <span>{m.name}</span>
                      <span className="text-10-regular text-grey-08">{m.role}</span>
                    </button>
                  ))}
                </div>
              )}
            </FieldLabel>

            {/* Date Range */}
            <div className="grid grid-cols-3 gap-[var(--space-3)] mb-[var(--space-4)]">
              <FieldLabel label="开始时间" required>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full text-14-regular rounded-md px-3 h-[var(--height-input)] border border-grey-12 bg-white text-grey-01 outline-none transition-colors focus:border-grey-01 font-[inherit]"
                />
              </FieldLabel>
              <FieldLabel label="结束时间" required>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full text-14-regular rounded-md px-3 h-[var(--height-input)] border border-grey-12 bg-white text-grey-01 outline-none transition-colors focus:border-grey-01 font-[inherit]"
                />
              </FieldLabel>
              <FieldLabel label="时长（天）" required>
                <div className="flex items-center h-[var(--height-input)] px-3 rounded-md bg-bg text-14-bold text-grey-01 border border-grey-12">
                  {duration || '—'}
                </div>
              </FieldLabel>
            </div>

            {/* Channels */}
            <FieldLabel label="投放渠道" required className="mb-[var(--space-4)]">
              <div className="flex flex-wrap gap-[6px]">
                {channels.map((ch) => (
                  <button
                    key={ch}
                    onClick={() => toggleChannel(ch)}
                    className={`px-[var(--space-3)] py-[6px] rounded-full text-12-medium border cursor-pointer transition-all font-[inherit] ${
                      selectedChannels.includes(ch)
                        ? 'bg-grey-01 text-white border-grey-01'
                        : 'bg-white text-grey-06 border-stroke hover:border-grey-06'
                    }`}
                  >
                    {ch}
                  </button>
                ))}
              </div>
            </FieldLabel>

            {/* Related Content */}
            <FieldLabel label="关联内容" required>
              <Select
                options={relatedContent}
                value={relatedDoc}
                onChange={(e) => setRelatedDoc(e.target.value)}
              />
            </FieldLabel>
          </Card>

          {/* Termination Warning */}
          {type === '终止合作' && (
            <div className="bg-red-tint-08 rounded-xl p-[var(--space-4)] border border-red/20">
              <div className="text-12-bold text-red mb-[var(--space-1)]">终止合作说明</div>
              <p className="text-12-regular text-grey-06 leading-relaxed">
                提交后将触发终止流程：销售确认 → 运营暂停投放 → 交付资产交割 → 财务核算退款。
                退款金额将由财务根据实际消耗和服务费核算确定。
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between py-[var(--space-2)]">
            <Button variant="ghost" onClick={() => router.back()}>取消</Button>
            <Button
              onClick={() => setSubmitted(true)}
              disabled={!isComplete}
            >
              提交 IO 单
            </Button>
          </div>
        </div>

        {/* ═══ Right: Live Summary Sidebar ═══ */}
        <div className="flex flex-col gap-[var(--space-3)]">

          {/* Approval Flow */}
          <Card padding="none">
            <div className="px-[var(--space-4)] pt-[var(--space-3)] pb-[var(--space-1)]">
              <div className="flex items-center justify-between">
                <div className="text-12-bold text-grey-06 uppercase tracking-wide">审批流程</div>
                <button
                  onClick={() => setShowApproval(!showApproval)}
                  className="bg-transparent border-none cursor-pointer p-0"
                >
                  <svg
                    width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                    className={`text-grey-08 transition-transform duration-200 ${showApproval ? '' : 'rotate-180'}`}
                  >
                    <path d="M4 10l4-4 4 4" />
                  </svg>
                </button>
              </div>
            </div>
            {showApproval && (
              <div className="px-[var(--space-4)] pb-[var(--space-3)]">
                {isComplete ? (
                  <div className="flex flex-col gap-[var(--space-2)]">
                    {[
                      { role: '销售确认', person: '王斯琼', status: 'pending' },
                      { role: '投手审批', person: owner?.name || '待指定', status: 'waiting' },
                      { role: '财务打款', person: '明虎', status: 'waiting' },
                    ].map((step, i) => (
                      <div key={step.role} className="flex items-center gap-[var(--space-2)] py-[var(--space-1)]">
                        <div className="flex items-center justify-center w-[20px] h-[20px] rounded-full bg-bg text-10-regular text-grey-08 font-medium shrink-0">
                          {i + 1}
                        </div>
                        <div className="flex-1">
                          <div className="text-12-medium text-grey-01">{step.role}</div>
                          <div className="text-10-regular text-grey-08">{step.person}</div>
                        </div>
                        <span className={`w-[6px] h-[6px] rounded-full ${
                          step.status === 'pending' ? 'bg-orange' : 'bg-grey-12'
                        }`} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-[var(--space-2)]">
                    <p className="text-12-regular text-grey-08">必填信息填写完整后，将显示审批流程</p>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Live Preview */}
          <Card padding="none">
            <div className="px-[var(--space-4)] pt-[var(--space-3)] pb-[var(--space-1)]">
              <div className="text-12-bold text-grey-06 uppercase tracking-wide">实时预览</div>
            </div>
            <div className="px-[var(--space-4)] pb-[var(--space-3)]">
              {/* Client */}
              <div className="flex items-center gap-[var(--space-2)] mb-[var(--space-3)]">
                {selectedClient ? (
                  <>
                    <Avatar name={selectedClient.name} size="sm" />
                    <div>
                      <div className="text-14-medium text-grey-01">{selectedClient.name}</div>
                      <div className="text-10-regular text-grey-08">{selectedClient.industry}</div>
                    </div>
                  </>
                ) : (
                  <span className="text-12-regular text-grey-08">未选择客户</span>
                )}
              </div>

              <div className="h-[1px] bg-stroke mb-[var(--space-3)]" />

              {/* Summary rows */}
              <div className="flex flex-col gap-[var(--space-2)]">
                <SummaryRow label="IO 类型">
                  <Badge variant={type === '新建投放' ? 'cyan' : type === '变更需求' ? 'orange' : 'red'}>{type}</Badge>
                </SummaryRow>
                <SummaryRow label="预算金额">
                  <span className={`text-14-bold ${amount ? 'text-grey-01' : 'text-grey-08'}`}>
                    {amount ? `$${Number(amount).toLocaleString()}` : '—'}
                  </span>
                </SummaryRow>
                <SummaryRow label="客户目标">
                  <span className="text-12-medium text-grey-01">
                    {objectives.find((o) => o.value === objective)?.label || '—'}
                  </span>
                </SummaryRow>
                <SummaryRow label="投放周期">
                  <span className="text-12-medium text-grey-01">
                    {duration > 0 ? `${startDate} ~ ${endDate}（${duration}天）` : '—'}
                  </span>
                </SummaryRow>
                <SummaryRow label="负责人">
                  <span className="text-12-medium text-grey-01">{owner?.name || '—'}</span>
                </SummaryRow>
                <SummaryRow label="投放渠道">
                  <span className="text-12-medium text-grey-01">
                    {selectedChannels.length > 0 ? selectedChannels.join(' / ') : '—'}
                  </span>
                </SummaryRow>
              </div>

              {/* Completeness indicator */}
              <div className="mt-[var(--space-3)] pt-[var(--space-3)] border-t border-stroke">
                <div className="flex items-center justify-between mb-[var(--space-1)]">
                  <span className="text-10-regular text-grey-08">表单完成度</span>
                  <span className="text-10-regular text-grey-06">
                    {[clientId, amount, objective, ownerId, selectedChannels.length > 0, duration > 0].filter(Boolean).length}/6
                  </span>
                </div>
                <div className="w-full h-[3px] bg-grey-12 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-l-cyan rounded-full transition-all duration-300"
                    style={{
                      width: `${([clientId, amount, objective, ownerId, selectedChannels.length > 0, duration > 0].filter(Boolean).length / 6) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Tips */}
          <Card padding="none">
            <div className="px-[var(--space-4)] pt-[var(--space-3)] pb-[var(--space-1)]">
              <div className="text-12-bold text-grey-06 uppercase tracking-wide">填写指引</div>
            </div>
            <div className="px-[var(--space-4)] pb-[var(--space-3)]">
              <div className="flex flex-col gap-[var(--space-2)]">
                {[
                  '预算金额需与框架协议约定一致',
                  '投放周期建议不少于 7 天',
                  '审批通过后将自动通知财务确认打款',
                  '终止合作类型需销售总监额外审批',
                ].map((tip) => (
                  <div key={tip} className="flex items-start gap-[var(--space-1)]">
                    <span className="text-grey-08 mt-[2px] shrink-0">·</span>
                    <span className="text-12-regular text-grey-08 leading-relaxed">{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

/* ── Helper Components ── */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-14-bold text-grey-01 mb-[var(--space-4)] pb-[var(--space-2)] border-b border-stroke">
      {children}
    </div>
  )
}

function FieldLabel({ label, required, className, children }: {
  label: string
  required?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={className}>
      <div className="text-12-medium text-grey-06 mb-[var(--space-1)]">
        {label}{required && <span className="text-red ml-0.5">*</span>}
      </div>
      {children}
    </div>
  )
}

function SummaryRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-12-regular text-grey-08">{label}</span>
      {children}
    </div>
  )
}

export default function NewIOOrderPage() {
  return <Suspense><NewIOOrderPageContent /></Suspense>
}
