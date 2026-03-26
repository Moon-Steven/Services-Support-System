'use client'

import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ApprovalChain } from './ApprovalChain'
import { DiffSection, ApprovalNode } from './data'

interface ActiveChangeProps {
  diffSections: DiffSection[]
  approvalChain: ApprovalNode[]
}

export function ActiveChange({ diffSections, approvalChain }: ActiveChangeProps) {
  return (
    <Card className="border-[1.5px] border-orange">
      <div className="flex items-center justify-between mb-[var(--space-4)]">
        <div className="flex items-center gap-[var(--space-3)]">
          <Badge variant="orange">审批中</Badge>
          <span className="text-14-bold text-grey-01">变更 #003 · 预算上调 + 策略新增</span>
        </div>
        <span className="text-10-regular text-grey-08">2026-03-25 10:30</span>
      </div>

      {/* Diff View */}
      <div className="flex flex-col gap-[var(--space-3)] mb-[var(--space-4)]">
        {diffSections.map((section) => (
          <div
            key={section.title}
            className="bg-selected rounded-lg overflow-hidden"
          >
            <div className="text-12-medium px-[var(--space-4)] py-[var(--space-2)] text-grey-06 bg-selected">
              {section.title}
            </div>
            <div className="px-[var(--space-4)] py-[var(--space-2)]">
              {section.lines.map((line, i) => (
                <div
                  key={i}
                  className={`text-14-regular px-[var(--space-2)] py-[var(--space-1)] rounded-sm ${
                    line.type === 'add'
                      ? 'bg-cyan-tint-08 text-grey-01'
                      : 'bg-red-tint-08 text-grey-06 line-through'
                  } ${i < section.lines.length - 1 ? 'mb-[var(--space-1)]' : ''}`}
                >
                  {line.text}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Approval Chain */}
      <ApprovalChain chain={approvalChain} />
    </Card>
  )
}
