'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useClient } from '@/lib/client-context'

const weights = { d1: 0.25, d2: 0.25, d3: 0.15, d4: 0.2, d5: 0.15 }

const gradeConfig = {
  S: { min: 85, label: '战略客户', advice: 'VIP 专属服务通道，配备高级投手团队，每日数据同步，测试期可考虑补贴以快速锁定合作。', approval: '行业运营 + HUI + 交付 + 销售 + Zhenyu 全部认可' },
  A: { min: 70, label: '核心客户', advice: '优先资源配置，高级投手跟进，每周两次复盘，测试期适度补贴。', approval: '行业运营 + HUI + 交付 + 销售' },
  B: { min: 50, label: '优质客户', advice: '标准测试期服务，常规投放流程，每周一次复盘。', approval: '行业运营 + HUI + 交付 + 销售' },
  C: { min: 0, label: '普通客户', advice: '基础服务，需进一步评估合作可行性，建议小规模测试验证。', approval: '销售 + 行业运营' },
}

type Grade = 'S' | 'A' | 'B' | 'C'

const dimensions = [
  { key: 'd1', label: '行业匹配度', initial: 70, minLabel: '低匹配', maxLabel: '高匹配', hint: '重点行业（金融/小说/电商）加分' },
  { key: 'd2', label: '预算量级', initial: 50, minLabel: '< $5K/月', maxLabel: '> $100K/月', hint: '$20K-50K' },
  { key: 'd3', label: '合规风险（低分=高风险）', initial: 80, minLabel: '高风险（金融/医疗/棋牌）', maxLabel: '低风险', hint: '' },
  { key: 'd4', label: '合作意愿', initial: 60, minLabel: '观望中', maxLabel: '急切合作', hint: '积极沟通' },
  { key: 'd5', label: '增长潜力', initial: 65, minLabel: '存量市场', maxLabel: '高速增长', hint: '稳定增长' },
]

const circumference = 2 * Math.PI * 52

export default function GradingPage() {
  const { client } = useClient()

  const [clientName, setClientName] = useState(client?.name || '示例科技')
  const [industry, setIndustry] = useState(client?.industry || '电商')
  const [scores, setScores] = useState<Record<string, number>>({
    d1: 70, d2: 50, d3: 80, d4: 60, d5: 65,
  })
  const [submitted, setSubmitted] = useState(false)

  const updateScore = (key: string, value: number) => {
    setScores((prev) => ({ ...prev, [key]: value }))
  }

  const totalScore = useMemo(() => {
    let total = 0
    for (const [key, w] of Object.entries(weights)) {
      total += (scores[key] || 0) * w
    }
    return Math.round(total)
  }, [scores])

  const currentGrade = useMemo((): Grade => {
    if (totalScore >= 85) return 'S'
    if (totalScore >= 70) return 'A'
    if (totalScore >= 50) return 'B'
    return 'C'
  }, [totalScore])

  const cfg = gradeConfig[currentGrade]
  const ringOffset = circumference - (totalScore / 100) * circumference

  const handleSubmit = () => {
    setSubmitted(true)
    alert(`客户 "${clientName}" 评级已提交！\n等级: ${currentGrade}\n分数: ${totalScore}`)
  }

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 className="text-24-bold" style={{ color: 'var(--grey-01)' }}>客户评级</h1>
        <p className="text-14-regular" style={{ color: 'var(--grey-08)', marginTop: 4 }}>
          多维度打分 · 智能定级
        </p>
      </div>

      {/* 2-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>

        {/* Left: Scoring Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Client Info Card */}
          <div style={{ backgroundColor: 'var(--white)', borderRadius: 'var(--radius-xl)', padding: 20, border: '1px solid var(--stroke)' }}>
            <div className="text-14-bold" style={{ marginBottom: 16 }}>客户信息</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <div className="text-12-regular" style={{ color: 'var(--grey-08)', marginBottom: 6 }}>客户名称</div>
                <Input value={clientName} onChange={(e) => setClientName(e.target.value)} />
              </div>
              <div>
                <div className="text-12-regular" style={{ color: 'var(--grey-08)', marginBottom: 6 }}>所属行业</div>
                <Select
                  options={[
                    { value: '电商', label: '电商' },
                    { value: '金融', label: '金融' },
                    { value: '小说/阅读', label: '小说/阅读' },
                    { value: '游戏', label: '游戏' },
                    { value: '教育', label: '教育' },
                    { value: '医疗健康', label: '医疗健康' },
                    { value: '其他', label: '其他' },
                  ]}
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Dimension Sliders */}
          {dimensions.map((dim) => (
            <div key={dim.key} style={{ backgroundColor: 'var(--white)', borderRadius: 'var(--radius-xl)', padding: 20, border: '1px solid var(--stroke)' }}>
              <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
                <div className="text-14-bold">{dim.label}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--grey-01)' }}>{scores[dim.key]}</div>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={scores[dim.key]}
                onChange={(e) => updateScore(dim.key, parseInt(e.target.value))}
                style={{
                  WebkitAppearance: 'none',
                  appearance: 'none' as 'none',
                  width: '100%',
                  height: 4,
                  borderRadius: 2,
                  background: 'var(--grey-12)',
                  outline: 'none',
                  accentColor: 'var(--grey-01)',
                }}
              />
              <div className="flex items-center justify-between" style={{ marginTop: 8 }}>
                <span className="text-10-regular" style={{ color: 'var(--grey-08)' }}>{dim.minLabel}</span>
                {dim.hint && <span className="text-10-regular" style={{ color: 'var(--grey-08)' }}>{dim.hint}</span>}
                <span className="text-10-regular" style={{ color: 'var(--grey-08)' }}>{dim.maxLabel}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Result Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div
            style={{
              backgroundColor: 'var(--white)', borderRadius: 'var(--radius-xl)',
              padding: 24, border: '1px solid var(--stroke)',
              textAlign: 'center', position: 'sticky', top: 24,
            }}
          >
            <div className="text-14-bold" style={{ marginBottom: 16 }}>综合评分</div>

            {/* Score Ring */}
            <div style={{ position: 'relative', width: 140, height: 140, margin: '0 auto 16px' }}>
              <svg viewBox="0 0 120 120" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                <circle cx="60" cy="60" r="52" stroke="var(--grey-12)" strokeWidth="6" fill="none" />
                <circle
                  cx="60" cy="60" r="52"
                  stroke="var(--grey-01)"
                  strokeWidth="6" fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={ringOffset}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 32, fontWeight: 700, color: 'var(--grey-01)' }}>{totalScore}</span>
                <span className="text-10-regular" style={{ color: 'var(--grey-08)' }}>/ 100</span>
              </div>
            </div>

            {/* Current Grade Pill */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 16px', borderRadius: 'var(--radius-round)',
              backgroundColor: 'var(--grey-01)', color: 'var(--white)',
              fontSize: 18, fontWeight: 700, marginBottom: 20,
            }}>
              <span>{currentGrade}</span>
              <span style={{ fontSize: 13, fontWeight: 500, opacity: 0.7 }}>{cfg.label}</span>
            </div>

            {/* Grade Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
              {(Object.entries(gradeConfig) as [Grade, typeof gradeConfig.S][]).map(([g, gc]) => {
                const isActive = g === currentGrade
                return (
                  <div
                    key={g}
                    className="flex items-center"
                    style={{
                      gap: 12, padding: '10px 12px', textAlign: 'left',
                      borderRadius: 'var(--radius-lg)',
                      backgroundColor: isActive ? 'var(--selected)' : 'transparent',
                      border: isActive ? '1px solid var(--grey-01)' : '1px solid transparent',
                      transition: 'border-color 0.2s',
                    }}
                  >
                    <div
                      className="flex items-center justify-center"
                      style={{
                        width: 28, height: 28, borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--grey-01)', color: 'var(--white)',
                        fontSize: 13, fontWeight: 700, flexShrink: 0,
                      }}
                    >
                      {g}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--grey-01)' }}>{gc.label}</div>
                      <div className="text-10-regular" style={{ color: 'var(--grey-08)' }}>
                        {g === 'C' ? '< 50 分' : `${gc.min}-${g === 'S' ? '100' : g === 'A' ? '84' : '69'} 分`}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Service Advice */}
            <div style={{
              marginTop: 20, textAlign: 'left', padding: '12px 16px',
              backgroundColor: 'var(--bg)', borderRadius: 'var(--radius-lg)',
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--grey-06)', marginBottom: 6 }}>服务建议</div>
              <p style={{ fontSize: 12, fontWeight: 400, color: 'var(--grey-08)', lineHeight: 1.6 }}>{cfg.advice}</p>
            </div>

            {/* Approval Chain */}
            <div style={{
              marginTop: 12, textAlign: 'left', padding: '12px 16px',
              backgroundColor: 'var(--bg)', borderRadius: 'var(--radius-lg)',
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--grey-06)', marginBottom: 6 }}>审批链</div>
              <p style={{ fontSize: 12, fontWeight: 400, color: 'var(--grey-08)', lineHeight: 1.6 }}>{cfg.approval}</p>
            </div>

            {/* Submit */}
            <Button
              onClick={handleSubmit}
              style={{ marginTop: 20, width: '100%', justifyContent: 'center' }}
            >
              提交评估结果
            </Button>
          </div>
        </div>
      </div>

      {/* Slider thumb styling */}
      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--grey-01);
          cursor: pointer;
          border: none;
        }
        input[type="range"]::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--grey-01);
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  )
}
