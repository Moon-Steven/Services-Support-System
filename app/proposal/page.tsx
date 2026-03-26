'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Select'
import { Dialog } from '@/components/ui/Dialog'

/* ─── data ─── */
const clientOptions = [
  { value: 'wavebone', label: 'Wavebone' },
  { value: 'fintech', label: 'FinTech Pro' },
  { value: 'shopmax', label: 'ShopMax' },
]

const reportTypeOptions = [
  { value: 'first', label: '首次投放提案' },
  { value: 'test', label: '测试期阶段报告' },
  { value: 'renew', label: '续约提案' },
]

const channels = ['Meta', 'Google', 'TikTok']

const clientProfile = [
  { key: '公司', val: 'Wavebone Inc.' },
  { key: '行业', val: '小说/阅读' },
  { key: '目标市场', val: '北美' },
  { key: '推广产品', val: '阅读 APP' },
  { key: '核心目标', val: '获客 + ROAS' },
]

const strategies = [
  { id: 'S1', name: 'LAL 高价值获客', desc: '基于种子用户创建 1% Lookalike 人群，定向北美 18-45 阅读爱好者，预估 CPA $3.5-4.5', tag: '推荐' },
  { id: 'S2', name: '兴趣定向广泛获客', desc: '阅读、小说、书籍等兴趣标签，广泛覆盖潜在用户群体', tag: null },
  { id: 'S3', name: '再营销付费转化', desc: '针对已安装未付费用户，推送付费引导素材，提升 ROAS', tag: null },
]

const budgets = [
  { label: '测试期（14天）', amount: '$21,000', daily: '日均 $1,500', recommended: false },
  { label: '推荐方案', amount: '$35,000', daily: '日均 $2,500', recommended: true },
  { label: '激进方案', amount: '$56,000', daily: '日均 $4,000', recommended: false },
]

const results = [
  { value: '8,750', label: '预估安装' },
  { value: '$4.00', label: '预估 CPA' },
  { value: '165%', label: '预估 ROAS' },
  { value: '2.5%', label: '预估 CTR' },
]

const timeline = [
  { period: 'D1-D3', desc: '账户搭建\n素材上线' },
  { period: 'D4-D7', desc: '数据积累\n策略调优' },
  { period: 'D8-D12', desc: '效果放大\n预算提升' },
  { period: 'D13-D14', desc: '效果复盘\n续约决策' },
]

/* ─── chevron SVG ─── */
const ChevronRight = () => (
  <svg width="16" height="16" fill="var(--grey-12)" viewBox="0 0 20 20" style={{ flexShrink: 0 }}>
    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
  </svg>
)

/* ─── component ─── */
export default function ProposalPage() {
  const [channelChecked, setChannelChecked] = useState<Record<string, boolean>>({ Meta: true, Google: false, TikTok: false })
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-20-bold" style={{ color: 'var(--grey-01)' }}>投放提案报告</h1>
          <p className="text-12-regular" style={{ color: 'var(--grey-06)', marginTop: 4 }}>
            自动生成 · 审核推送 · 面客展示
          </p>
        </div>
        <div className="flex items-center" style={{ gap: 12 }}>
          <div
            className="flex items-center text-12-medium"
            style={{
              gap: 6,
              padding: '6px 12px',
              border: '1px solid var(--grey-12)',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--orange)' }} />
            <span style={{ color: 'var(--orange)' }}>待审核</span>
          </div>
          <Button variant="secondary" style={{ padding: '8px 16px', fontSize: 13 }}>导出 PDF</Button>
          <Button variant="primary" style={{ padding: '8px 16px', fontSize: 13 }} onClick={() => setModalOpen(true)}>
            提交审核
          </Button>
        </div>
      </div>

      {/* 2-column grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24 }}>

        {/* Left: Config Panel */}
        <div className="flex flex-col" style={{ gap: 16 }}>
          {/* Report Config */}
          <Card>
            <div className="text-14-bold" style={{ color: 'var(--grey-01)', marginBottom: 16 }}>报告配置</div>
            <div className="flex flex-col" style={{ gap: 12 }}>
              <Select label="目标客户" options={clientOptions} defaultValue="wavebone" />
              <Select label="报告类型" options={reportTypeOptions} defaultValue="first" />
              <div>
                <div className="text-12-medium" style={{ color: 'var(--grey-06)', marginBottom: 4 }}>投放渠道</div>
                <div className="flex" style={{ flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                  {channels.map((ch) => (
                    <label
                      key={ch}
                      className="flex items-center text-12-regular"
                      style={{
                        gap: 6,
                        padding: '6px 12px',
                        border: channelChecked[ch] ? '1px solid var(--grey-01)' : '1px solid var(--grey-12)',
                        borderRadius: 'var(--radius-lg)',
                        cursor: 'pointer',
                        backgroundColor: channelChecked[ch] ? 'var(--selected)' : 'var(--white)',
                        color: 'var(--grey-01)',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={channelChecked[ch]}
                        onChange={() => setChannelChecked((p) => ({ ...p, [ch]: !p[ch] }))}
                        style={{ accentColor: 'var(--grey-01)', width: 12, height: 12 }}
                      />
                      {ch}
                    </label>
                  ))}
                </div>
              </div>
              <Button variant="secondary" style={{ width: '100%', justifyContent: 'center', padding: '8px 0', fontSize: 13 }}>
                重新生成报告
              </Button>
            </div>
          </Card>

          {/* Approval Status */}
          <Card>
            <div className="text-14-bold" style={{ color: 'var(--grey-01)', marginBottom: 16 }}>审核流程</div>
            <div className="flex flex-col" style={{ gap: 12 }}>
              {/* Step 1: done */}
              <div className="flex items-center" style={{ gap: 12 }}>
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(0,177,162,0.12)',
                    color: 'var(--l-cyan)',
                    flexShrink: 0,
                  }}
                >
                  <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <div className="text-12-medium" style={{ color: 'var(--grey-01)' }}>投手审核</div>
                  <div className="text-12-regular" style={{ color: 'var(--l-cyan)' }}>罗依桐 已通过</div>
                </div>
              </div>
              {/* Step 2: pending */}
              <div className="flex items-center" style={{ gap: 12 }}>
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255,149,0,0.1)',
                    color: 'var(--orange)',
                    flexShrink: 0,
                  }}
                >
                  <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--orange)' }} />
                </div>
                <div>
                  <div className="text-12-medium" style={{ color: 'var(--grey-01)' }}>销售审核</div>
                  <div className="text-12-regular" style={{ color: 'var(--orange)' }}>王斯琼 待审核</div>
                </div>
              </div>
              {/* Step 3: waiting */}
              <div className="flex items-center" style={{ gap: 12 }}>
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    backgroundColor: 'var(--grey-12)',
                    color: 'var(--grey-08)',
                    flexShrink: 0,
                  }}
                >
                  <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--grey-08)' }} />
                </div>
                <div>
                  <div className="text-12-medium" style={{ color: 'var(--grey-08)' }}>推送 Lanbow</div>
                  <div className="text-12-regular" style={{ color: 'var(--grey-08)' }}>等待审核完成</div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right: Report Preview */}
        <div
          style={{
            backgroundColor: 'var(--white)',
            border: '1px solid var(--stroke)',
            borderRadius: 'var(--radius-2xl)',
            overflow: 'hidden',
          }}
        >
          {/* Report Header - grey-01 bg, NOT gradient */}
          <div style={{ backgroundColor: 'var(--grey-01)', padding: 24, color: 'var(--white)' }}>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-10-regular" style={{ opacity: 0.6, textTransform: 'uppercase', letterSpacing: 1 }}>
                  投放提案报告
                </div>
                <h2 style={{ fontSize: 22, fontWeight: 700, marginTop: 8 }}>Wavebone 海外获客方案</h2>
                <div className="text-12-regular" style={{ opacity: 0.7, marginTop: 4 }}>
                  Meta Ads · 北美市场 · 2026 Q1
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="text-10-regular" style={{ opacity: 0.6, textTransform: 'uppercase', letterSpacing: 1 }}>
                  SANDWICH LAB
                </div>
                <div className="text-10-regular" style={{ opacity: 0.6, marginTop: 4 }}>2026-03-25</div>
              </div>
            </div>
          </div>

          {/* Report Body */}
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 32 }}>

            {/* Section 1: Client Profile */}
            <div>
              <div className="flex items-center" style={{ gap: 8, marginBottom: 16 }}>
                <div
                  className="flex items-center justify-center text-12-bold"
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--grey-01)',
                    color: 'var(--white)',
                    flexShrink: 0,
                    fontSize: 11,
                  }}
                >
                  1
                </div>
                <span className="text-14-bold" style={{ color: 'var(--grey-01)' }}>客户概况</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
                <div>
                  {clientProfile.slice(0, 3).map((r) => (
                    <div
                      key={r.key}
                      className="flex justify-between"
                      style={{ padding: '6px 0', borderBottom: '1px solid var(--stroke)' }}
                    >
                      <span className="text-12-regular" style={{ color: 'var(--grey-06)' }}>{r.key}</span>
                      <span className="text-12-medium" style={{ color: 'var(--grey-01)' }}>{r.val}</span>
                    </div>
                  ))}
                </div>
                <div style={{ paddingLeft: 24 }}>
                  {clientProfile.slice(3).map((r) => (
                    <div
                      key={r.key}
                      className="flex justify-between"
                      style={{ padding: '6px 0', borderBottom: '1px solid var(--stroke)' }}
                    >
                      <span className="text-12-regular" style={{ color: 'var(--grey-06)' }}>{r.key}</span>
                      <span className="text-12-medium" style={{ color: 'var(--grey-01)' }}>{r.val}</span>
                    </div>
                  ))}
                  <div
                    className="flex justify-between items-center"
                    style={{ padding: '6px 0' }}
                  >
                    <span className="text-12-regular" style={{ color: 'var(--grey-06)' }}>客户等级</span>
                    <span
                      className="text-12-medium"
                      style={{
                        padding: '2px 8px',
                        backgroundColor: 'var(--selected)',
                        color: 'var(--grey-01)',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      A 级
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Strategy */}
            <div>
              <div className="flex items-center" style={{ gap: 8, marginBottom: 16 }}>
                <div
                  className="flex items-center justify-center text-12-bold"
                  style={{
                    width: 24, height: 24, borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--grey-01)', color: 'var(--white)', flexShrink: 0, fontSize: 11,
                  }}
                >
                  2
                </div>
                <span className="text-14-bold" style={{ color: 'var(--grey-01)' }}>投放策略建议</span>
              </div>
              <div className="flex flex-col" style={{ gap: 10 }}>
                {strategies.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-start"
                    style={{
                      gap: 12,
                      padding: 12,
                      backgroundColor: 'var(--selected)',
                      borderRadius: 'var(--radius-lg)',
                    }}
                  >
                    <div
                      className="flex items-center justify-center text-12-bold"
                      style={{
                        width: 32, height: 32, borderRadius: '50%',
                        backgroundColor: 'var(--grey-01)', color: 'var(--white)', flexShrink: 0, fontSize: 11,
                      }}
                    >
                      {s.id}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="text-12-medium" style={{ color: 'var(--grey-01)' }}>{s.name}</div>
                      <div className="text-12-regular" style={{ color: 'var(--grey-06)', marginTop: 2 }}>{s.desc}</div>
                    </div>
                    {s.tag && (
                      <span
                        className="text-12-medium"
                        style={{
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-round)',
                          backgroundColor: 'rgba(0,177,162,0.1)',
                          color: 'var(--l-cyan)',
                          flexShrink: 0,
                          fontSize: 11,
                        }}
                      >
                        {s.tag}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Section 3: Budget Plan */}
            <div>
              <div className="flex items-center" style={{ gap: 8, marginBottom: 16 }}>
                <div
                  className="flex items-center justify-center text-12-bold"
                  style={{
                    width: 24, height: 24, borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--grey-01)', color: 'var(--white)', flexShrink: 0, fontSize: 11,
                  }}
                >
                  3
                </div>
                <span className="text-14-bold" style={{ color: 'var(--grey-01)' }}>预算方案</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                {budgets.map((b) => (
                  <div
                    key={b.label}
                    style={{
                      padding: 16,
                      border: b.recommended ? '2px solid var(--grey-01)' : '1px solid var(--stroke)',
                      borderRadius: 'var(--radius-lg)',
                      textAlign: 'center',
                    }}
                  >
                    <div
                      className="text-12-regular"
                      style={{
                        color: b.recommended ? 'var(--grey-01)' : 'var(--grey-06)',
                        fontWeight: b.recommended ? 500 : 400,
                      }}
                    >
                      {b.label}
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--grey-01)', marginTop: 4 }}>
                      {b.amount}
                    </div>
                    <div className="text-12-regular" style={{ color: 'var(--grey-08)', marginTop: 4 }}>
                      {b.daily}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 4: Expected Results */}
            <div>
              <div className="flex items-center" style={{ gap: 8, marginBottom: 16 }}>
                <div
                  className="flex items-center justify-center text-12-bold"
                  style={{
                    width: 24, height: 24, borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--grey-01)', color: 'var(--white)', flexShrink: 0, fontSize: 11,
                  }}
                >
                  4
                </div>
                <span className="text-14-bold" style={{ color: 'var(--grey-01)' }}>预期效果（推荐方案）</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                {results.map((r) => (
                  <div
                    key={r.label}
                    style={{
                      textAlign: 'center',
                      padding: 12,
                      backgroundColor: 'var(--selected)',
                      borderRadius: 'var(--radius-lg)',
                    }}
                  >
                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--grey-01)' }}>{r.value}</div>
                    <div className="text-12-regular" style={{ color: 'var(--grey-06)', marginTop: 2 }}>{r.label}</div>
                  </div>
                ))}
              </div>
              <p className="text-10-regular" style={{ color: 'var(--grey-08)', marginTop: 12, fontStyle: 'italic' }}>
                * 以上数据基于同行业历史投放经验库预估，实际效果可能有所偏差
              </p>
            </div>

            {/* Section 5: Timeline */}
            <div>
              <div className="flex items-center" style={{ gap: 8, marginBottom: 16 }}>
                <div
                  className="flex items-center justify-center text-12-bold"
                  style={{
                    width: 24, height: 24, borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--grey-01)', color: 'var(--white)', flexShrink: 0, fontSize: 11,
                  }}
                >
                  5
                </div>
                <span className="text-14-bold" style={{ color: 'var(--grey-01)' }}>执行时间线</span>
              </div>
              <div className="flex items-center" style={{ gap: 8 }}>
                {timeline.map((step, i) => (
                  <div key={step.period} className="flex items-center" style={{ flex: i < timeline.length - 1 ? 1 : 1, gap: 8, display: 'contents' }}>
                    <div
                      style={{
                        flex: 1,
                        padding: 12,
                        backgroundColor: 'var(--grey-01)',
                        borderRadius: 'var(--radius-lg)',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--white)' }}>{step.period}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 4, lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                        {step.desc}
                      </div>
                    </div>
                    {i < timeline.length - 1 && <ChevronRight />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Approval Modal */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} title="提交审核">
        <p className="text-12-regular" style={{ color: 'var(--grey-06)', marginBottom: 16 }}>
          报告将发送给投手和销售审核，审核通过后自动推送至 Lanbow
        </p>
        <div className="flex flex-col" style={{ gap: 12 }}>
          <Select
            label="投手审核人"
            options={[{ value: 'lyt', label: '罗依桐' }]}
            defaultValue="lyt"
          />
          <Select
            label="销售审核人"
            options={[{ value: 'wsq', label: '王斯琼' }]}
            defaultValue="wsq"
          />
          <div>
            <div className="text-12-medium" style={{ color: 'var(--grey-06)', marginBottom: 4 }}>备注</div>
            <textarea
              rows={2}
              placeholder="审核备注..."
              className="text-14-regular"
              style={{
                width: '100%',
                padding: 8,
                border: '1px solid var(--grey-12)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--white)',
                color: 'var(--grey-01)',
                resize: 'vertical',
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
          </div>
        </div>
        <div className="flex" style={{ gap: 12, marginTop: 20 }}>
          <Button variant="secondary" onClick={() => setModalOpen(false)} style={{ flex: 1, justifyContent: 'center' }}>
            取消
          </Button>
          <Button variant="primary" onClick={() => setModalOpen(false)} style={{ flex: 1, justifyContent: 'center' }}>
            提交
          </Button>
        </div>
      </Dialog>
    </div>
  )
}
