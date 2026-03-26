'use client'

import { useMemo, useCallback } from 'react'
import { Card } from '@/components/ui/Card'
import type { IntakeFormState, FormAction } from './types'

interface StepGradingProps {
  form: IntakeFormState
  dispatch: React.Dispatch<FormAction>
}

const weights: Record<string, number> = { d1: 0.25, d2: 0.25, d3: 0.15, d4: 0.2, d5: 0.15 }

const gradeConfig = {
  S: { min: 85, label: '战略客户', advice: 'VIP 专属服务通道，配备高级投手团队，每日数据同步，测试期可考虑补贴以快速锁定合作。' },
  A: { min: 70, label: '核心客户', advice: '优先资源配置，高级投手跟进，每周两次复盘，测试期适度补贴。' },
  B: { min: 50, label: '优质客户', advice: '标准测试期服务，常规投放流程，每周一次复盘。' },
  C: { min: 0, label: '普通客户', advice: '基础服务，需进一步评估合作可行性，建议小规模测试验证。' },
}

type Grade = keyof typeof gradeConfig

const dimensions = [
  { key: 'd1', label: '行业匹配度', minLabel: '低匹配', maxLabel: '高匹配' },
  { key: 'd2', label: '预算量级', minLabel: '< $5K/月', maxLabel: '> $100K/月' },
  { key: 'd3', label: '合规风险（低分=高风险）', minLabel: '高风险', maxLabel: '低风险' },
  { key: 'd4', label: '合作意愿', minLabel: '观望中', maxLabel: '急切合作' },
  { key: 'd5', label: '增长潜力', minLabel: '存量市场', maxLabel: '高速增长' },
]

const circumference = 2 * Math.PI * 42

export function StepGrading({ form, dispatch }: StepGradingProps) {
  const scores = form.gradingScores

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

  const updateScore = useCallback((key: string, value: number) => {
    const next = { ...scores, [key]: value }
    let total = 0
    for (const [k, w] of Object.entries(weights)) {
      total += (next[k] || 0) * w
    }
    const score = Math.round(total)
    const grade: Grade = score >= 85 ? 'S' : score >= 70 ? 'A' : score >= 50 ? 'B' : 'C'
    dispatch({ type: 'SET_GRADING', scores: next, grade, score })
  }, [scores, dispatch])

  const gradeColor = (g: Grade) => {
    switch (g) {
      case 'S': return { bg: 'bg-orange-tint-10', text: 'text-orange', ring: 'var(--orange)' }
      case 'A': return { bg: 'bg-cyan-tint-08', text: 'text-l-cyan', ring: 'var(--l-cyan)' }
      case 'B': return { bg: 'bg-selected', text: 'text-grey-06', ring: 'var(--grey-06)' }
      case 'C': return { bg: 'bg-selected', text: 'text-grey-08', ring: 'var(--grey-08)' }
    }
  }

  const gc = gradeColor(currentGrade)

  return (
    <Card padding="large">
      <div className="text-16-bold text-grey-01 mb-1">客户评级</div>
      <p className="text-12-regular text-grey-08 mb-[var(--space-5)]">
        基于客户信息进行多维度评估，系统将自动计算综合评分与等级
      </p>

      <div className="grid gap-[var(--space-5)]" style={{ gridTemplateColumns: '1fr 220px' }}>
        {/* Left: Dimension Sliders */}
        <div className="flex flex-col gap-[var(--space-4)]">
          {dimensions.map((dim) => (
            <div key={dim.key} className="bg-bg rounded-lg p-[var(--space-4)]">
              <div className="flex items-center justify-between mb-[var(--space-2)]">
                <span className="text-14-medium text-grey-01">{dim.label}</span>
                <span className="text-16-bold text-grey-01">{scores[dim.key]}</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={scores[dim.key]}
                onChange={(e) => updateScore(dim.key, parseInt(e.target.value))}
                className="w-full h-[4px] rounded-full outline-none cursor-pointer"
                style={{
                  WebkitAppearance: 'none',
                  appearance: 'none' as 'none',
                  background: `linear-gradient(to right, var(--grey-01) ${scores[dim.key]}%, var(--grey-12) ${scores[dim.key]}%)`,
                  accentColor: 'var(--grey-01)',
                }}
              />
              <div className="flex items-center justify-between mt-[var(--space-1)]">
                <span className="text-10-regular text-grey-08">{dim.minLabel}</span>
                <span className="text-10-regular text-grey-08">{dim.maxLabel}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Score Result */}
        <div className="flex flex-col items-center">
          <div className="bg-bg rounded-xl p-[var(--space-5)] w-full sticky top-[var(--space-6)]">
            {/* Score Ring */}
            <div className="relative w-[100px] h-[100px] mx-auto mb-[var(--space-3)]">
              <svg viewBox="0 0 100 100" className="w-full h-full" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="50" cy="50" r="42" stroke="var(--grey-12)" strokeWidth="5" fill="none" />
                <circle
                  cx="50" cy="50" r="42"
                  stroke={gc.ring}
                  strokeWidth="5" fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={ringOffset}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-24-bold text-grey-01">{totalScore}</span>
                <span className="text-10-regular text-grey-08">/ 100</span>
              </div>
            </div>

            {/* Grade Badge */}
            <div className="flex items-center justify-center gap-[var(--space-2)] mb-[var(--space-4)]">
              <span className={`inline-flex items-center justify-center w-[28px] h-[28px] rounded-lg text-14-bold ${gc.bg} ${gc.text}`}>
                {currentGrade}
              </span>
              <span className="text-14-medium text-grey-01">{cfg.label}</span>
            </div>

            {/* Grade Scale */}
            <div className="flex flex-col gap-[var(--space-1)]">
              {(Object.entries(gradeConfig) as [Grade, typeof gradeConfig.S][]).map(([g, gcfg]) => {
                const isActive = g === currentGrade
                const colors = gradeColor(g)
                return (
                  <div
                    key={g}
                    className={`flex items-center gap-[var(--space-2)] px-[var(--space-2)] py-[6px] rounded-lg transition-colors ${isActive ? 'bg-selected' : ''}`}
                  >
                    <span className={`inline-flex items-center justify-center w-[20px] h-[20px] rounded text-10-regular font-semibold ${colors.bg} ${colors.text}`}>
                      {g}
                    </span>
                    <span className={`text-12-regular ${isActive ? 'text-grey-01 font-medium' : 'text-grey-08'}`}>
                      {gcfg.label}
                    </span>
                    <span className="text-10-regular text-grey-08 ml-auto">
                      {g === 'C' ? '< 50' : `≥ ${gcfg.min}`}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Advice */}
            <div className="mt-[var(--space-4)] p-[var(--space-3)] bg-white rounded-lg border border-stroke">
              <div className="text-10-regular text-grey-08 mb-1">服务建议</div>
              <p className="text-12-regular text-grey-06 leading-relaxed">{cfg.advice}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Slider thumb styling */}
      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: var(--grey-01);
          cursor: pointer;
          border: none;
        }
        input[type="range"]::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: var(--grey-01);
          cursor: pointer;
          border: none;
        }
      `}</style>
    </Card>
  )
}
