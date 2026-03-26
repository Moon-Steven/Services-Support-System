import { DiffSection, ApprovalNode, HistoryItem, StatItem, ConfigRow } from './data'

/* ─── Mock Data ─── */
export const diffSections: DiffSection[] = [
  {
    title: '投放预算',
    lines: [
      { type: 'del', text: '日均预算: $1,500/天' },
      { type: 'add', text: '日均预算: $2,500/天 (+66.7%)' },
    ],
  },
  {
    title: '广告系列',
    lines: [
      { type: 'add', text: '新增: 再营销_高价值流失用户' },
    ],
  },
  {
    title: '成效要求',
    lines: [
      { type: 'del', text: '目标 CPA: $4.50' },
      { type: 'add', text: '目标 CPA: $4.00 (下调 11%)' },
    ],
  },
]

export const approvalChain: ApprovalNode[] = [
  { label: '投手', status: 'done' },
  { label: '行业运营', status: 'done' },
  { label: '王斯琼 待审', status: 'pending' },
  { label: '销售', status: 'waiting' },
]

export const historyItems: HistoryItem[] = [
  {
    id: '#002',
    title: '变更 #002 · 素材方向调整',
    date: '2026-03-22',
    dotColor: 'var(--grey-01)',
    badge: { label: '已生效', variant: 'cyan' as const },
    content: (
      <div className="text-12-regular text-grey-06">
        <div>
          素材关键词:{' '}
          <span className="bg-red-tint-08 text-grey-06 line-through rounded-xs px-[var(--space-1)] py-[1px] text-[12px]">
            效率 · 功能
          </span>{' '}
          <span className="bg-cyan-tint-08 text-grey-01 rounded-xs px-[var(--space-1)] py-[1px] text-[12px]">
            沉浸 · 情感 · 场景化
          </span>
        </div>
        <div className="text-grey-08 mt-[var(--space-2)]">发起人: 罗依桐 · 审批耗时: 4h</div>
      </div>
    ),
  },
  {
    id: '#001',
    title: '变更 #001 · 投放周期延长',
    date: '2026-03-20',
    dotColor: 'var(--grey-01)',
    badge: { label: '已生效', variant: 'cyan' as const },
    content: (
      <div className="text-12-regular text-grey-06">
        <div>
          投放周期:{' '}
          <span className="bg-red-tint-08 text-grey-06 line-through rounded-xs px-[var(--space-1)] py-[1px] text-[12px]">
            7 天
          </span>{' '}
          <span className="bg-cyan-tint-08 text-grey-01 rounded-xs px-[var(--space-1)] py-[1px] text-[12px]">
            14 天
          </span>
        </div>
        <div className="text-grey-08 mt-[var(--space-2)]">发起人: 王斯琼 · 审批耗时: 2h</div>
      </div>
    ),
  },
  {
    id: '#000',
    title: '测试期初始配置',
    date: '2026-03-17',
    dotColor: 'var(--l-cyan)',
    badge: { label: '初始版本', variant: 'grey' as const },
    content: (
      <div className="text-12-regular text-grey-06">
        日预算 $1,500 · CPA 目标 $4.50 · 7天测试 · 3组获客+1组品牌
      </div>
    ),
  },
]

export const statsData: StatItem[] = [
  { label: '累计变更', value: '3 次', color: 'var(--grey-01)' },
  { label: '审批中', value: '1 次', color: 'var(--orange)' },
  { label: '已生效', value: '2 次', color: 'var(--l-cyan)' },
  { label: '平均审批耗时', value: '3h', color: 'var(--grey-01)' },
]

export const configRows: ConfigRow[] = [
  { label: '日均预算', value: '$1,500', pending: '(待变更→$2,500)' },
  { label: '投放周期', value: '14 天', pending: null },
  { label: '目标 CPA', value: '$4.50', pending: '(待变更→$4.00)' },
  { label: '素材方向', value: '沉浸 · 情感 · 场景化', pending: null },
  { label: '广告系列数', value: '4 个', pending: '(待新增1个)' },
]

export const changeTypes = ['投放预算', '投放周期', '成效要求', '素材方向', '广告系列']
