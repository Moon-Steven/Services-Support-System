'use client'

import { useState } from 'react'
import type { OnboardingFlow, ApprovalStep } from '@/lib/data'

interface OnboardingStepperProps {
  onboarding: OnboardingFlow
  className?: string
}

const dotColor = (status: ApprovalStep['status']) => {
  if (status === 'completed') return 'bg-l-cyan'
  if (status === 'current') return 'bg-grey-01'
  if (status === 'skipped') return 'bg-grey-08'
  return 'bg-grey-12'
}

const lineColor = (status: ApprovalStep['status']) => {
  if (status === 'completed' || status === 'skipped') return 'bg-l-cyan'
  return 'bg-grey-12'
}

export function OnboardingStepper({ onboarding, className = '' }: OnboardingStepperProps) {
  const [showDetail, setShowDetail] = useState(false)
  const { steps } = onboarding
  const completedCount = steps.filter((s) => s.status === 'completed' || s.status === 'skipped').length
  const currentStep = steps.find((s) => s.status === 'current')
  const allDone = completedCount === steps.length

  return (
    <div className={`rounded-xl border border-stroke bg-white mb-[var(--space-4)] overflow-hidden ${className}`}>
      <div className="px-[var(--space-4)] py-[var(--space-3)]">
        {/* Header row */}
        <div className="flex items-center justify-between mb-[var(--space-2)]">
          <div className="flex items-center gap-[var(--space-2)]">
            <span className="text-12-bold text-grey-06 uppercase tracking-wide">客户入驻进度</span>
            {allDone ? (
              <span className="text-10-regular text-l-cyan">已完成</span>
            ) : currentStep ? (
              <span className="text-10-regular text-orange">当前: {currentStep.label}{currentStep.note ? ` · ${currentStep.note}` : ''}</span>
            ) : null}
          </div>
          <div className="flex items-center gap-[var(--space-2)]">
            <span className="text-10-regular text-grey-08">{completedCount}/{steps.length}</span>
            <button
              onClick={() => setShowDetail(!showDetail)}
              className="text-10-regular text-l-cyan hover:underline bg-transparent border-none cursor-pointer p-0 font-[inherit]"
            >
              {showDetail ? '收起' : '详情'}
            </button>
          </div>
        </div>

        {/* Horizontal stepper bar */}
        <div className="flex items-center">
          {steps.map((step, i) => (
            <div key={step.key} className="flex items-center flex-1 last:flex-none">
              {/* Dot + label */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-[8px] h-[8px] rounded-full ${dotColor(step.status)} ${step.status === 'current' ? 'ring-2 ring-grey-01/20' : ''}`}
                  title={step.label}
                />
                <span className={`text-[9px] mt-[3px] whitespace-nowrap ${
                  step.status === 'completed' ? 'text-grey-06'
                    : step.status === 'current' ? 'text-grey-01 font-medium'
                      : 'text-grey-08'
                }`}>
                  {step.label}
                </span>
              </div>
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className={`h-[2px] flex-1 mx-[2px] rounded-full ${lineColor(step.status)}`} style={{ marginTop: '-12px' }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Expandable detail */}
      {showDetail && (
        <div className="border-t border-stroke px-[var(--space-4)] py-[var(--space-3)]">
          <div className="grid grid-cols-3 gap-[var(--space-2)]">
            {steps.map((step) => (
              <div
                key={step.key}
                className={`flex items-start gap-[var(--space-2)] px-[var(--space-2)] py-[var(--space-1)] rounded-md ${
                  step.status === 'current' ? 'bg-selected' : ''
                }`}
              >
                <span className={`w-[6px] h-[6px] rounded-full mt-[5px] shrink-0 ${dotColor(step.status)}`} />
                <div className="min-w-0">
                  <div className={`text-12-medium ${step.status === 'pending' ? 'text-grey-08' : 'text-grey-01'}`}>
                    {step.label}
                    {step.status === 'skipped' && <span className="text-10-regular text-grey-08 ml-1">(跳过)</span>}
                  </div>
                  {step.person && (
                    <div className="text-10-regular text-grey-06">
                      {step.person}{step.date ? ` · ${step.date}` : ''}
                    </div>
                  )}
                  {step.note && (
                    <div className={`text-10-regular ${step.status === 'current' ? 'text-orange' : 'text-grey-08'}`}>
                      {step.note}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
