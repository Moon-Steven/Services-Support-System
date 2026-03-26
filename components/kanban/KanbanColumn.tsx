'use client'

import { Badge } from '@/components/ui/Badge'
import type { Phase, CardData } from './types'
import { KanbanCard } from './KanbanCard'

interface KanbanColumnProps {
  phase: Phase
  cards: CardData[]
  dimmed: boolean
  expandedCards: Set<string>
  isCardVisible: (card: CardData) => boolean
  onToggleCard: (cardId: string) => void
  onNavigate: (clientId: string, page: string) => void
}

export function KanbanColumn({
  phase,
  cards,
  dimmed,
  expandedCards,
  isCardVisible,
  onToggleCard,
  onNavigate,
}: KanbanColumnProps) {
  return (
    <div
      className="min-w-[270px] flex-1 shrink-0 transition-opacity duration-250"
      style={{
        opacity: dimmed ? 0.15 : 1,
        pointerEvents: dimmed ? 'none' : 'auto',
      }}
    >
      <div className="bg-selected rounded-xl p-3.5">
        {/* Column Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-[28px] h-[28px] rounded-lg bg-grey-01 text-white text-12-bold">
              {phase.id}
            </div>
            <div>
              <div className="text-14-bold">{phase.name}</div>
              <p className="text-12-regular text-grey-08 mt-[1px]">
                负责人：{phase.owner}
              </p>
            </div>
          </div>
          <Badge variant="grey">{cards.length} 任务</Badge>
        </div>

        {/* Cards */}
        <div className="flex flex-col gap-2-5">
          {cards.map((card) => (
            <KanbanCard
              key={card.id}
              card={card}
              visible={isCardVisible(card)}
              expanded={expandedCards.has(card.id)}
              onToggle={() => onToggleCard(card.id)}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
