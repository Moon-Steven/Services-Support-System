'use client'

import { ReactNode } from 'react'

interface Tab {
  key: string
  label: string
  count?: number
}

interface TabsProps {
  tabs: Tab[]
  activeKey: string
  onChange: (key: string) => void
  children?: ReactNode
}

export function Tabs({ tabs, activeKey, onChange, children }: TabsProps) {
  return (
    <div>
      <div role="tablist" className="flex gap-[var(--space-6)] border-b border-grey-12">
        {tabs.map((tab) => {
          const isActive = tab.key === activeKey
          return (
            <button
              key={tab.key}
              role="tab"
              aria-selected={isActive}
              className={`relative pb-[var(--space-2)] text-14-medium transition-colors ${
                isActive ? 'text-grey-01' : 'text-grey-08 hover:text-grey-06'
              }`}
              onClick={() => onChange(tab.key)}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className="ml-[var(--space-1)] text-12-regular text-grey-08">
                  {tab.count}
                </span>
              )}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-grey-01 rounded-full" />
              )}
            </button>
          )
        })}
      </div>
      {children && (
        <div role="tabpanel" className="pt-[var(--space-4)]">
          {children}
        </div>
      )}
    </div>
  )
}
