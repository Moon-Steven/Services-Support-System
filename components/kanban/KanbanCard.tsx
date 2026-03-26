'use client'

import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import type { CardData } from './types'

interface KanbanCardProps {
  card: CardData
  visible: boolean
  expanded: boolean
  onToggle: () => void
  onNavigate: (clientId: string, page: string) => void
}

const gradeColorMap: Record<string, { bg: string; text: string }> = {
  S: { bg: 'bg-orange-tint-10', text: 'text-orange' },
  A: { bg: 'bg-cyan-tint-08', text: 'text-l-cyan' },
  B: { bg: 'bg-selected', text: 'text-grey-06' },
  C: { bg: 'bg-selected', text: 'text-grey-08' },
}

export function KanbanCard({ card, visible, expanded, onToggle, onNavigate }: KanbanCardProps) {
  const router = useRouter()
  const opacity = visible ? (card.completed ? 0.5 : 1) : 0.15
  const gradeStyle = gradeColorMap[card.grade] || gradeColorMap.B

  return (
    <div
      onClick={onToggle}
      className="bg-white rounded-lg p-3 border border-stroke cursor-pointer transition-opacity duration-200"
      style={{ opacity }}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Avatar
            name={card.clientInitial}
            size="sm"
            className="!w-[22px] !h-[22px] !text-[10px]"
          />
          <span
            className="text-14-medium text-grey-01 hover:text-l-cyan hover:underline transition-colors"
            onClick={(e) => { e.stopPropagation(); onNavigate(card.clientId, `client/${card.clientId}`) }}
            title="查看客户详情"
          >
            {card.clientName}
          </span>
          <span className={`inline-flex items-center justify-center w-[18px] h-[18px] rounded-[4px] text-10-regular font-semibold ${gradeStyle.bg} ${gradeStyle.text}`}>
            {card.grade}
          </span>
        </div>
        <Badge variant={card.badge}>{card.badgeText}</Badge>
      </div>

      {/* Title + desc */}
      <div className="text-14-bold">{card.title}</div>
      {card.desc && (
        <p className="text-12-regular text-grey-08 mt-1">
          {card.desc}
        </p>
      )}

      {/* Metrics (for test phase cards) */}
      {card.metrics && (
        <div className="flex items-center gap-3 mt-2">
          {card.metrics.map((m) => (
            <span
              key={m.label}
              className={`text-12-regular ${m.positive ? 'text-l-cyan font-medium' : 'text-grey-08'}`}
            >
              {m.label} {m.value}
            </span>
          ))}
        </div>
      )}

      {/* Progress bar */}
      {card.progress !== undefined && (
        <div className="w-full h-[4px] bg-grey-12 rounded-full mt-2 overflow-hidden">
          <div
            className="h-full bg-grey-01 rounded-full transition-[width] duration-600"
            style={{ width: `${card.progress}%` }}
          />
        </div>
      )}

      {/* Expandable Details */}
      {expanded && card.details && (
        <div className="mt-3 pt-3 border-t border-stroke">
          {card.details.map((d) => (
            <div key={d.label} className="flex justify-between py-[3px] text-12-regular">
              <span className="text-grey-08">{d.label}</span>
              <span style={{ color: d.color || 'var(--grey-06)' }}>{d.value}</span>
            </div>
          ))}

          {/* Action buttons */}
          {card.actions && card.actions.length > 0 && (
            <div className="flex flex-wrap gap-[var(--space-1-5)] mt-3">
              {card.actions.map((action) => (
                <button
                  key={action.label}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (action.type === 'approval') {
                      router.push(`/approvals?task=${action.taskId}`)
                    } else if (action.href) {
                      router.push(action.href)
                    }
                  }}
                  className={`inline-flex items-center gap-1 px-[var(--space-2)] py-[3px] rounded-md text-12-medium border-none cursor-pointer font-[inherit] transition-colors ${
                    action.type === 'approval'
                      ? 'bg-cyan-tint-08 text-l-cyan hover:bg-cyan-tint-12'
                      : 'bg-selected text-grey-06 hover:text-grey-01 hover:bg-grey-12'
                  }`}
                >
                  {action.type === 'approval' && (
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 8l4 4 6-6" />
                    </svg>
                  )}
                  {action.label}
                </button>
              ))}
            </div>
          )}

          {/* Client detail link */}
          <div className="mt-2 pt-2 border-t border-stroke">
            <button
              onClick={(e) => { e.stopPropagation(); onNavigate(card.clientId, `client/${card.clientId}`) }}
              className="bg-transparent border-none cursor-pointer text-12-regular text-grey-08 hover:text-l-cyan font-[inherit] transition-colors"
            >
              查看客户详情 →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
