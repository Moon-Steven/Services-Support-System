'use client'

import { ApprovalNode } from './data'

/* ─── SVG helpers ─── */
const CheckIcon = () => (
  <svg width="12" height="12" fill="white" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
)

const ChevronArrow = () => (
  <svg width="12" height="12" viewBox="0 0 20 20" fill="var(--grey-12)" className="shrink-0">
    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
  </svg>
)

interface ApprovalChainProps {
  chain: ApprovalNode[]
}

export function ApprovalChain({ chain }: ApprovalChainProps) {
  return (
    <div className="flex items-center gap-[var(--space-3)] px-[var(--space-4)] py-[var(--space-3)] bg-selected rounded-lg">
      {chain.map((node, i) => (
        <div key={i} className="flex items-center gap-[var(--space-2)] contents">
          <div className="flex items-center gap-[var(--space-2)]">
            <div
              className={`flex items-center justify-center w-[var(--size-avatar-sm)] h-[var(--size-avatar-sm)] rounded-full shrink-0 ${
                node.status === 'done'
                  ? 'bg-grey-01'
                  : node.status === 'pending'
                  ? 'bg-orange'
                  : 'bg-grey-12'
              }`}
            >
              {node.status === 'done' && <CheckIcon />}
              {node.status === 'pending' && (
                <div className="w-[6px] h-[6px] rounded-full bg-white" />
              )}
              {node.status === 'waiting' && (
                <div className="w-[6px] h-[6px] rounded-full bg-grey-08" />
              )}
            </div>
            <span
              className={`text-12-regular ${
                node.status === 'pending'
                  ? 'text-orange font-medium'
                  : node.status === 'waiting'
                  ? 'text-grey-08'
                  : 'text-grey-06'
              }`}
            >
              {node.label}
            </span>
          </div>
          {i < chain.length - 1 && <ChevronArrow />}
        </div>
      ))}
    </div>
  )
}
