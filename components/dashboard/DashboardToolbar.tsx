'use client'

import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'

interface DashboardToolbarProps {
  clientName: string
  view: 'daily' | 'weekly'
  onViewChange: (view: 'daily' | 'weekly') => void
  platform: string
  onPlatformChange: (platform: string) => void
}

export function DashboardToolbar({
  clientName,
  view,
  onViewChange,
  platform,
  onPlatformChange,
}: DashboardToolbarProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-12-regular text-grey-08">
          客户：{clientName} · 测试期第 8 天
        </p>
      </div>
      <div className="flex items-center gap-[var(--space-3)]">
        {/* Daily/Weekly toggle */}
        <div className="inline-flex bg-grey-12 rounded-lg p-0.5">
          <button
            onClick={() => onViewChange('daily')}
            className={`px-[var(--space-3)] h-9 text-14-medium border-none rounded-md cursor-pointer transition-all font-[inherit] ${
              view === 'daily'
                ? 'bg-white text-grey-01'
                : 'bg-transparent text-grey-06'
            }`}
          >
            日报
          </button>
          <button
            onClick={() => onViewChange('weekly')}
            className={`px-[var(--space-3)] h-9 text-14-medium border-none rounded-md cursor-pointer transition-all font-[inherit] ${
              view === 'weekly'
                ? 'bg-white text-grey-01'
                : 'bg-transparent text-grey-06'
            }`}
          >
            周报
          </button>
        </div>

        <Select
          options={[
            { value: 'meta', label: 'Meta (Facebook)' },
            { value: 'google', label: 'Google Ads' },
            { value: 'tiktok', label: 'TikTok' },
          ]}
          value={platform}
          onChange={(e) => onPlatformChange(e.target.value)}
          style={{ width: 'auto', paddingRight: 36 }}
        />

        <Button>推送客户</Button>
      </div>
    </div>
  )
}
