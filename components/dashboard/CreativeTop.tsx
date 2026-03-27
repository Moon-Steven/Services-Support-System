'use client'

import { Card } from '@/components/ui/Card'

export type Creative = {
  id: string
  name: string
  type: string
  description: string
  thumbnail: string
  ctr: number
  cpa: number
  installs: number
  top: boolean
}

interface CreativeTopProps {
  creatives: Creative[]
}

export function CreativeTop({ creatives }: CreativeTopProps) {
  const maxCtr = Math.max(...creatives.map(c => c.ctr))

  return (
    <Card>
      <h3 className="text-14-bold mb-[var(--space-4)]">素材效果排行</h3>
      <div className="flex flex-col gap-[var(--space-4)]">
        {creatives.map((c, i) => (
          <div key={c.id} className="flex gap-[var(--space-3)]">
            {/* Thumbnail */}
            <div
              className="w-[72px] h-[72px] rounded-lg shrink-0 flex items-end p-[6px] relative overflow-hidden"
              style={{ backgroundColor: c.thumbnail }}
            >
              {/* Play icon for video */}
              {c.type === '视频' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-[24px] h-[24px] rounded-full bg-white/80 flex items-center justify-center">
                    <svg width="10" height="12" viewBox="0 0 10 12" fill="none">
                      <path d="M1 1.5V10.5L9 6L1 1.5Z" fill="#181818" stroke="#181818" strokeWidth="1.5" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              )}
              {/* Type badge */}
              <span className="text-[9px] font-medium text-white bg-black/40 px-[5px] py-[1px] rounded-full relative z-10">{c.type}</span>
            </div>

            <div className="flex-1 min-w-0">
              {/* Rank + Name */}
              <div className="flex items-center gap-[var(--space-2)] mb-[3px]">
                <span className={`text-10-regular w-[16px] h-[16px] rounded-full flex items-center justify-center shrink-0 ${
                  i === 0 ? 'bg-grey-01 text-white' : 'bg-grey-12 text-grey-06'
                }`}>{i + 1}</span>
                <span className="text-12-medium text-grey-01 truncate">{c.name}</span>
              </div>

              {/* Description */}
              <div className="text-10-regular text-grey-08 mb-[var(--space-2)] line-clamp-1">{c.description}</div>

              {/* CTR bar */}
              <div className="flex items-center gap-[var(--space-2)] mb-[3px]">
                <span className="text-10-regular text-grey-08 w-[28px] shrink-0">CTR</span>
                <div className="flex-1 h-[4px] bg-grey-12 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${i === 0 ? 'bg-l-cyan' : 'bg-grey-06'}`}
                    style={{ width: `${(c.ctr / maxCtr) * 100}%` }}
                  />
                </div>
                <span className={`text-10-regular w-[36px] text-right shrink-0 ${i === 0 ? 'text-l-cyan' : 'text-grey-06'}`}>{c.ctr}%</span>
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-[var(--space-3)] text-10-regular text-grey-08">
                <span>CPA ${c.cpa.toFixed(2)}</span>
                <span>·</span>
                <span>{c.installs.toLocaleString()} 安装</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
