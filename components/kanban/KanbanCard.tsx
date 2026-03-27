'use client'

import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import type { CardData, DisplayCard, MergedCard } from './types'
import { isMergedCard } from './types'

interface KanbanCardProps {
  card: DisplayCard
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

function SingleCardContent({ card }: { card: CardData }) {
  return (
    <>
      {/* Title + desc */}
      <div className="text-14-bold">{card.title}</div>
      {card.desc && (
        <p className="text-12-regular text-grey-08 mt-1">{card.desc}</p>
      )}

      {/* Change diff indicator */}
      {card.cardType === 'change' && card.changeDiff && (
        <div className="mt-2 flex flex-col gap-1">
          {card.changeDiff.slice(0, 2).map((d) => (
            <div key={d.field} className="flex items-center gap-1 text-10-regular">
              <span className="text-grey-08">{d.field}:</span>
              <span className="text-red line-through">{d.from}</span>
              <span className="text-grey-08">→</span>
              <span className="text-l-cyan">{d.to}</span>
            </div>
          ))}
        </div>
      )}

      {/* Metrics */}
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
    </>
  )
}

function MergedCardContent({ merged }: { merged: MergedCard }) {
  return (
    <>
      <div className="text-14-bold text-grey-01">{merged.tasks.length} 个任务</div>
      <div className="mt-2 flex flex-col gap-1.5">
        {merged.tasks.slice(0, 3).map((task) => (
          <div key={task.id} className="flex items-center gap-1.5">
            <span className={`w-[5px] h-[5px] rounded-full shrink-0 ${
              task.badge === 'orange' ? 'bg-orange'
                : task.badge === 'red' ? 'bg-red'
                  : task.badge === 'cyan' ? 'bg-l-cyan'
                    : task.badge === 'dark' ? 'bg-grey-01'
                      : 'bg-grey-08'
            }`} />
            <span className="text-12-regular text-grey-06 truncate">
              {task.cardType === 'change' ? '🔄 ' : ''}{task.title}
            </span>
            <span className="text-10-regular text-grey-08 shrink-0 ml-auto">{task.badgeText}</span>
          </div>
        ))}
        {merged.tasks.length > 3 && (
          <span className="text-10-regular text-grey-08 pl-3">
            +{merged.tasks.length - 3} 更多...
          </span>
        )}
      </div>
    </>
  )
}

export function KanbanCard({ card, visible, expanded, onToggle, onNavigate }: KanbanCardProps) {
  const router = useRouter()
  const merged = isMergedCard(card)
  const clientId = merged ? card.clientId : card.clientId
  const clientName = merged ? card.clientName : card.clientName
  const clientInitial = merged ? card.clientInitial : card.clientInitial
  const grade = merged ? card.grade : card.grade
  const badge = merged ? card.badge : card.badge
  const badgeText = merged ? card.badgeText : card.badgeText
  const isCompleted = merged ? false : card.completed
  const isChange = !merged && card.cardType === 'change'

  const opacity = visible ? (isCompleted ? 0.5 : 1) : 0.15
  const gradeStyle = gradeColorMap[grade] || gradeColorMap.B

  return (
    <div
      onClick={onToggle}
      className={`bg-white rounded-lg p-3 border cursor-pointer transition-opacity duration-200 ${
        isChange ? 'border-orange/30' : 'border-stroke'
      }`}
      style={{ opacity }}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Avatar
            name={clientInitial}
            size="sm"
            className="!w-[22px] !h-[22px] !text-[10px]"
          />
          <span
            className="text-14-medium text-grey-01 hover:text-l-cyan hover:underline transition-colors"
            onClick={(e) => { e.stopPropagation(); onNavigate(clientId, `client/${clientId}`) }}
            title="查看客户详情"
          >
            {clientName}
          </span>
          <span className={`inline-flex items-center justify-center w-[18px] h-[18px] rounded-[4px] text-10-regular font-semibold ${gradeStyle.bg} ${gradeStyle.text}`}>
            {grade}
          </span>
          {isChange && (
            <span className="text-10-regular text-orange bg-orange-tint-10 px-1.5 py-0.5 rounded">变更</span>
          )}
        </div>
        {!merged && card.actions && card.actions.length > 0 ? (
          <button
            onClick={(e) => {
              e.stopPropagation()
              const primary = (card as CardData).actions![0]
              if (primary.type === 'approval') {
                router.push(`/approvals?task=${primary.taskId}`)
              } else if (primary.href) {
                router.push(primary.href)
              }
            }}
            className="border-none cursor-pointer font-[inherit] transition-all hover:scale-105"
            title={(card as CardData).actions![0].label}
          >
            <Badge variant={badge}>{badgeText}</Badge>
          </button>
        ) : (
          <Badge variant={badge}>{badgeText}</Badge>
        )}
      </div>

      {/* Content */}
      {merged ? (
        <MergedCardContent merged={card as MergedCard} />
      ) : (
        <SingleCardContent card={card as CardData} />
      )}
    </div>
  )
}
