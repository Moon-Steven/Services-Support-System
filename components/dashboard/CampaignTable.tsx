'use client'

import { Badge } from '@/components/ui/Badge'
import { Table } from '@/components/ui/Table'
import { Card } from '@/components/ui/Card'

export type Campaign = {
  id: string
  name: string
  spend: string
  installs: string
  cpa: string
  roas: string
  roasColor: string
  status: string
  statusVariant: 'cyan' | 'orange' | 'red'
}

interface CampaignTableProps {
  campaigns: Campaign[]
}

const columns = [
  { key: 'name', header: '广告系列', render: (row: Campaign) => <span className="text-14-medium">{row.name}</span> },
  { key: 'spend', header: '花费', render: (row: Campaign) => <span className="text-right">{row.spend}</span> },
  { key: 'installs', header: '安装', render: (row: Campaign) => row.installs },
  { key: 'cpa', header: 'CPA', render: (row: Campaign) => row.cpa },
  { key: 'roas', header: 'ROAS', render: (row: Campaign) => <span style={{ color: row.roasColor }} className="text-14-medium">{row.roas}</span> },
  { key: 'status', header: '状态', render: (row: Campaign) => <Badge variant={row.statusVariant}>{row.status}</Badge> },
]

export function CampaignTable({ campaigns }: CampaignTableProps) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-[var(--space-4)]">
        <h3 className="text-14-bold">广告系列明细</h3>
        <span className="text-12-regular text-grey-08">按花费排序</span>
      </div>
      <Table
        columns={columns}
        data={campaigns}
        rowKey={(r) => r.id}
      />
    </Card>
  )
}
