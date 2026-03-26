'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useClient } from '@/lib/client-context'
import { clients } from '@/lib/data'
import {
  KanbanColumn,
  PipelineBar,
  ClientChips,
  phases,
  kanbanCards,
  phaseCounts,
} from '@/components/kanban'
import type { CardData } from '@/components/kanban'

export default function KanbanPage() {
  const router = useRouter()
  const { setClient } = useClient()
  const [search, setSearch] = useState('')
  const [activePhase, setActivePhase] = useState<number | null>(null)
  const [activeClientId, setActiveClientId] = useState<string | null>(null)
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())
  const [chipsExpanded, setChipsExpanded] = useState(false)

  /* ── Filter logic ── */
  const matchesSearch = (name: string, industry: string) => {
    if (!search) return true
    const q = search.toLowerCase()
    return name.toLowerCase().includes(q) || industry.toLowerCase().includes(q)
  }

  const filteredClients = clients.filter((c) => matchesSearch(c.name, c.industry))
  const filteredIds = new Set(filteredClients.map((c) => c.id))

  const isCardVisible = (card: CardData) => {
    if (search && !filteredIds.has(card.clientId)) return false
    if (activeClientId && card.clientId !== activeClientId) return false
    return true
  }

  const isColDimmed = (phaseId: number) =>
    activePhase !== null && activePhase !== phaseId

  /* ── Handlers ── */
  const handlePhaseClick = (phaseId: number) => {
    setActiveClientId(null)
    setActivePhase(activePhase === phaseId ? null : phaseId)
  }

  const handleClientClick = (clientId: string) => {
    setActivePhase(null)
    setSearch('')
    setActiveClientId(activeClientId === clientId ? null : clientId)
  }

  const toggleCard = (cardId: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev)
      if (next.has(cardId)) next.delete(cardId)
      else next.add(cardId)
      return next
    })
  }

  const navigateToClient = (clientId: string, page: string) => {
    const c = clients.find((cl) => cl.id === clientId)
    if (c) setClient({ id: c.id, name: c.name, industry: c.industry, grade: c.grade })
    router.push(`/${page}?client=${clientId}`)
  }

  const hasActiveFilter = activePhase !== null || activeClientId !== null || search
  const totalTasks = Object.values(kanbanCards).flat().length

  return (
    <div className="min-w-0">
      {/* ═══ Section 1: Pipeline Overview ═══ */}
      <section className="mb-4">
        {/* Section header row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <h2 className="text-16-bold text-grey-01">客户总览</h2>
            <span className="text-12-regular text-grey-08">
              {clients.length} 个客户 · {totalTasks} 个进行中任务
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <svg
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-grey-08 pointer-events-none"
                width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" strokeWidth="2" />
                <path d="M21 21l-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <Input
                placeholder="搜索客户..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setActivePhase(null)
                  setActiveClientId(null)
                }}
                className="!h-[30px] !pl-[28px] !text-[12px] !rounded-full !w-[180px] !border-grey-12"
              />
            </div>
            {hasActiveFilter && (
              <Button
                variant="ghost"
                onClick={() => { setActivePhase(null); setActiveClientId(null); setSearch('') }}
                className="!h-[30px] !text-[12px] !px-2"
              >
                清除筛选
              </Button>
            )}
            <Link href="/intake">
              <Button className="!h-[30px] !text-[12px] !px-3">
                + 新增客户
              </Button>
            </Link>
          </div>
        </div>

        {/* Pipeline bar */}
        <PipelineBar
          phases={phases}
          phaseCounts={phaseCounts}
          activePhase={activePhase}
          onPhaseClick={handlePhaseClick}
        />

        {/* Client chips */}
        <ClientChips
          clients={clients}
          filteredIds={filteredIds}
          search={search}
          activeClientId={activeClientId}
          activePhase={activePhase}
          chipsExpanded={chipsExpanded}
          onClientClick={handleClientClick}
          onToggleExpand={() => setChipsExpanded(!chipsExpanded)}
        />
      </section>

      {/* ═══ Section 2: Task Board ═══ */}
      <section>
        <div className="flex items-center gap-3 mb-3">
          <h2 className="text-16-bold text-grey-01">任务看板</h2>
          <span className="text-12-regular text-grey-08">
            按阶段查看各客户当前任务进度
          </span>
        </div>

        <div className="grid grid-cols-5 gap-3 pb-4">
          {phases.map((phase) => (
            <KanbanColumn
              key={phase.id}
              phase={phase}
              cards={kanbanCards[phase.id] || []}
              dimmed={isColDimmed(phase.id)}
              expandedCards={expandedCards}
              isCardVisible={isCardVisible}
              onToggleCard={toggleCard}
              onNavigate={navigateToClient}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
