'use client'

import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import type { Client } from '@/lib/data'
import { gradeVariant } from './data'

interface ClientChipsProps {
  clients: Client[]
  filteredIds: Set<string>
  search: string
  activeClientId: string | null
  activePhase: number | null
  chipsExpanded: boolean
  onClientClick: (clientId: string) => void
  onToggleExpand: () => void
}

export function ClientChips({
  clients,
  filteredIds,
  search,
  activeClientId,
  activePhase,
  chipsExpanded,
  onClientClick,
  onToggleExpand,
}: ClientChipsProps) {
  const router = useRouter()

  return (
    <div className="mt-3 relative">
      <div
        className="flex flex-wrap gap-2 overflow-hidden transition-all duration-300"
        style={{ maxHeight: chipsExpanded ? 600 : 76 }}
      >
        {clients.map((c) => {
          if (search && !filteredIds.has(c.id)) return null
          const isActive = activeClientId === c.id || (activePhase !== null && c.phase === activePhase)

          return (
            <div
              key={c.id}
              onClick={() => onClientClick(c.id)}
              className={`group inline-flex items-center gap-1-5 py-1-5 pr-1-5 pl-1-5 rounded-full cursor-pointer transition-all duration-150 border ${
                isActive
                  ? 'bg-selected border-grey-01'
                  : 'bg-white border-stroke'
              }`}
            >
              <Avatar name={c.name} size="sm" className="!w-[20px] !h-[20px] !text-[9px]" />
              <span className="text-12-medium">{c.name}</span>
              <Badge
                variant={gradeVariant(c.grade)}
                className="!text-[10px] !px-1-5 !py-[1px]"
              >
                {c.grade}
              </Badge>
              <span className="text-12-regular text-grey-08 text-[11px]">{c.status}</span>
              {/* Detail entry icon */}
              <span
                onClick={(e) => { e.stopPropagation(); router.push(`/client/${c.id}`) }}
                title="查看客户详情"
                className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-full bg-transparent hover:bg-grey-12 transition-colors ml-0.5"
              >
                <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-grey-08">
                  <path d="M6 4l4 4-4 4" />
                </svg>
              </span>
            </div>
          )
        })}
      </div>
      {clients.length > 8 && (
        <div className="mt-2 text-center">
          <button
            onClick={onToggleExpand}
            className="bg-transparent border-none cursor-pointer text-12-regular text-grey-08 font-[inherit]"
          >
            {chipsExpanded ? '收起' : '展开更多'}
          </button>
        </div>
      )}
    </div>
  )
}
