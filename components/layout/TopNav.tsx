'use client'

import { usePathname } from 'next/navigation'
import { useClient } from '@/lib/client-context'
import { clients } from '@/lib/data'
import { Avatar } from '@/components/ui/Avatar'

const titleMap: Record<string, string> = {
  '/clients': '客户列表',
  '/kanban': 'Onboarding',
  '/intake': '录入客户',
  '/io-orders': 'IO 单管理',
  '/io-orders/new': 'IO 确认单',
  '/dashboard': '投放数据',
  '/assets': '资产管理',
  '/proposal': '测试期投放计划',
  '/changes': '变更管理',
  '/finance': '财务工作台',
  '/permissions': '权限配置',
  '/approvals': '审批工作台',
  '/clock-config': 'Clock 配置',
  '/learning-notes': 'Agent 学习笔记',
}

export function TopNav() {
  const pathname = usePathname()
  const { client, setClient } = useClient()

  const title = titleMap[pathname]
    || (pathname.startsWith('/client/') ? '客户详情' : 'Lanbow 3.0')

  const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = clients.find((c) => c.id === e.target.value)
    if (selected) {
      setClient({
        id: selected.id,
        name: selected.name,
        industry: selected.industry,
        grade: selected.grade,
      })
    } else {
      setClient(null)
    }
  }

  return (
    <header className="flex items-center justify-between px-[var(--space-6)] shrink-0 h-[var(--height-topnav)] bg-white border-b border-grey-12">
      <h1 className="text-16-bold">{title}</h1>

      <div className="flex items-center gap-[var(--space-3)]">
        <select
          className="text-14-regular rounded-md px-3 py-1 h-[var(--size-avatar-md)] border border-grey-12 bg-white text-grey-01 outline-none focus:border-grey-01 transition-colors"
          value={client?.id || ''}
          onChange={handleClientChange}
          aria-label="选择客户"
        >
          <option value="">选择客户</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <Avatar name="U" size="md" />
      </div>
    </header>
  )
}
