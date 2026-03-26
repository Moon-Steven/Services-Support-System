'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  IconKanban,
  IconFileText,
  IconChart,
  IconDoc,
  IconCard,
  IconSliders,
  IconDollar,
  IconSettings,
  IconClipboardCheck,
  IconClock,
  IconNote,
  IconUsers,
} from '@/components/icons'
import type { IconProps } from '@/components/icons'

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<IconProps>
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    label: '客户流程',
    items: [
      { name: 'Onboarding', href: '/kanban', icon: IconKanban },
      { name: '客户列表', href: '/clients', icon: IconUsers },
      { name: '审批工作台', href: '/approvals', icon: IconClipboardCheck },
    ],
  },
  {
    label: '业务管理',
    items: [
      { name: 'IO 单管理', href: '/io-orders', icon: IconFileText },
      { name: '投放数据', href: '/dashboard', icon: IconChart },
      { name: '投放提案', href: '/proposal', icon: IconDoc },
    ],
  },
  {
    label: '交付运营',
    items: [
      { name: '资产管理', href: '/assets', icon: IconCard },
      { name: '变更管理', href: '/changes', icon: IconSliders },
      { name: 'Clock 配置', href: '/clock-config', icon: IconClock },
      { name: '学习笔记', href: '/learning-notes', icon: IconNote },
    ],
  },
  {
    label: '财务',
    items: [
      { name: '财务工作台', href: '/finance', icon: IconDollar },
    ],
  },
  {
    label: '系统设置',
    items: [
      { name: '权限配置', href: '/permissions', icon: IconSettings },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 bottom-0 flex flex-col w-[var(--width-sidebar)] bg-grey-01">
      {/* Brand */}
      <div className="flex items-center gap-[var(--space-2)] px-[var(--space-5)] py-[var(--space-4)]">
        <span className="inline-block w-2 h-2 rounded-full bg-l-cyan" />
        <span className="text-14-bold text-white">Lanbow 3.0</span>
      </div>

      {/* Navigation */}
      <nav aria-label="主导航" className="flex-1 overflow-y-auto px-[var(--space-3)] py-[var(--space-2)]">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-[var(--space-4)]">
            <div className="text-10-regular text-grey-08 px-[var(--space-2)] mb-[var(--space-1)]">
              {group.label}
            </div>
            {group.items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                || (item.href === '/clients' && pathname.startsWith('/client/'))
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-[var(--space-2)] px-[var(--space-2)] py-[var(--space-2)] rounded-md text-14-medium transition-colors border-l-[3px] ${
                    isActive
                      ? 'text-white bg-white/[0.06] border-l-cyan'
                      : 'text-grey-08 bg-transparent border-transparent hover:text-white'
                  }`}
                >
                  <Icon size={16} />
                  {item.name}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>
    </aside>
  )
}
