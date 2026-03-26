'use client'

import { useState } from 'react'
import type { ApprovalStep } from '@/lib/data'

interface ApprovalChainProps {
  steps: ApprovalStep[]
  mode?: 'compact' | 'expanded'
  className?: string
}

const statusColor = (status: ApprovalStep['status']) => {
  if (status === 'completed') return 'bg-l-cyan'
  if (status === 'current') return 'bg-grey-01 animate-pulse'
  if (status === 'skipped') return 'bg-grey-12'
  return 'bg-grey-12'
}

const statusLineColor = (status: ApprovalStep['status']) => {
  if (status === 'completed' || status === 'skipped') return 'bg-l-cyan'
  return 'bg-grey-12'
}

export function ApprovalChain({ steps, mode = 'compact', className = '' }: ApprovalChainProps) {
  const [expanded, setExpanded] = useState(mode === 'expanded')

  const completedCount = steps.filter((s) => s.status === 'completed' || s.status === 'skipped').length
  const currentStep = steps.find((s) => s.status === 'current')
  const allDone = completedCount === steps.length

  if (!expanded) {
    /* Compact: single row of dots with progress */
    return (
      <div className={`flex items-center gap-[var(--space-2)] ${className}`}>
        <div className="flex items-center gap-[3px]">
          {steps.map((step, i) => (
            <div key={step.key} className="flex items-center gap-[3px]">
              <span
                className={`w-[6px] h-[6px] rounded-full ${statusColor(step.status)}`}
                title={`${step.label}${step.person ? ` · ${step.person}` : ''}${step.date ? ` · ${step.date}` : ''}`}
              />
              {i < steps.length - 1 && (
                <span className={`w-[8px] h-[1px] ${statusLineColor(step.status)}`} />
              )}
            </div>
          ))}
        </div>
        <span className="text-10-regular text-grey-08">
          {allDone ? '已完成' : currentStep ? currentStep.label : `${completedCount}/${steps.length}`}
        </span>
        <button
          onClick={() => setExpanded(true)}
          className="text-10-regular text-l-cyan hover:underline bg-transparent border-none cursor-pointer p-0 font-[inherit]"
        >
          详情
        </button>
      </div>
    )
  }

  /* Expanded: vertical timeline */
  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-[var(--space-2)]">
        <span className="text-10-regular text-grey-08">
          审批进度 {completedCount}/{steps.length}
        </span>
        <button
          onClick={() => setExpanded(false)}
          className="text-10-regular text-l-cyan hover:underline bg-transparent border-none cursor-pointer p-0 font-[inherit]"
        >
          收起
        </button>
      </div>
      <div className="relative ml-[3px] pl-[var(--space-3)]">
        {/* Vertical line */}
        <div className="absolute left-[3px] top-[3px] bottom-[3px] w-[1px] bg-grey-12" />

        {steps.map((step, i) => (
          <div key={step.key} className="relative flex items-start gap-[var(--space-2)] pb-[var(--space-2)] last:pb-0">
            {/* Dot on the line */}
            <div
              className={`absolute w-[7px] h-[7px] rounded-full ${statusColor(step.status)}`}
              style={{ left: 'calc(var(--space-3) * -1)', top: '4px' }}
            />
            {/* Colored line segment for completed */}
            {i < steps.length - 1 && (step.status === 'completed' || step.status === 'skipped') && (
              <div
                className="absolute w-[1px] bg-l-cyan"
                style={{
                  left: 'calc(var(--space-3) * -1 + 3px)',
                  top: '11px',
                  bottom: '-8px',
                }}
              />
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-[var(--space-1)]">
                <span className={`text-12-medium ${step.status === 'pending' ? 'text-grey-08' : 'text-grey-01'}`}>
                  {step.label}
                </span>
                {step.status === 'skipped' && (
                  <span className="text-10-regular text-grey-08">(跳过)</span>
                )}
                {step.status === 'completed' && (
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" className="text-l-cyan" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 6l3 3 5-5" />
                  </svg>
                )}
              </div>
              {(step.person || step.date || step.note) && (
                <div className="flex items-center gap-[var(--space-2)] mt-[1px]">
                  {step.person && <span className="text-10-regular text-grey-06">{step.person}</span>}
                  {step.date && <span className="text-10-regular text-grey-08">{step.date}</span>}
                  {step.note && <span className={`text-10-regular ${step.status === 'current' ? 'text-orange' : 'text-grey-08'}`}>{step.note}</span>}
                </div>
              )}
              {step.attachments && step.attachments.length > 0 && (
                <div className="flex flex-wrap gap-[var(--space-1)] mt-[3px]">
                  {step.attachments.map((att) => (
                    <span
                      key={att.name}
                      className="inline-flex items-center gap-[3px] px-[6px] py-[1px] rounded bg-cyan-tint-08 text-l-cyan"
                      title={`${att.name} (${att.size})`}
                    >
                      <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        {att.type === 'pdf' ? (
                          <path d="M4 1h5l4 4v9a1 1 0 01-1 1H4a1 1 0 01-1-1V2a1 1 0 011-1zm4 0v4h4" />
                        ) : (
                          <><rect x="2" y="2" width="12" height="12" rx="1" /><circle cx="5.5" cy="6" r="1" /><path d="M14 10l-3-3-7 7" /></>
                        )}
                      </svg>
                      <span className="text-10-regular">{att.name}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
