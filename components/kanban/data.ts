import type { Phase, CardData, MergedCard, DisplayCard } from './types'
import { isMergedCard } from './types'

export const phases: Phase[] = [
  { id: 1, name: '客户触达', owner: '王斯琼', opacity: 1 },
  { id: 2, name: '需求沟通', owner: '王斯琼 / 郭晋光', opacity: 0.75 },
  { id: 3, name: '测试期', owner: '罗依桐', opacity: 0.5 },
  { id: 4, name: '转正续约', owner: '王斯琼', opacity: 0.35 },
  { id: 5, name: '终止/退款', owner: '明虎', opacity: 0.2 },
]

export const kanbanCards: Record<number, CardData[]> = {
  1: [
    {
      id: 'c1-1', clientId: 'shopmax', clientName: 'ShopMax', clientInitial: 'S', grade: 'B',
      badge: 'orange', badgeText: '进行中', title: '行业合规审查', desc: '电商行业合规审查进行中',
      details: [
        { label: '产出', value: '合规资料 + 评估结果' },
        { label: '系统', value: '离线工单 · 支持系统' },
        { label: '销售', value: '王斯琼' },
      ],
      actions: [
        { label: '审批合规', type: 'approval', taskId: 'onboard-shopmax-compliance' },
        { label: 'IO 单', type: 'link', href: '/io-orders?client=shopmax' },
      ],
    },
    {
      id: 'c1-1b', clientId: 'shopmax', clientName: 'ShopMax', clientInitial: 'S', grade: 'B',
      badge: 'grey', badgeText: '待处理', title: 'Meta 账户资质提交', desc: '电商行业 Meta 广告账户开户资质材料',
      details: [
        { label: '材料', value: '营业执照 + 授权书' },
        { label: '负责人', value: '陶阳阳' },
      ],
      actions: [
        { label: '资产管理', type: 'link', href: '/assets?client=shopmax' },
      ],
    },
    {
      id: 'c1-2', clientId: 'brightpath', clientName: 'BrightPath', clientInitial: 'B', grade: 'C',
      badge: 'grey', badgeText: '待处理', title: '初次客户沟通', desc: '教育行业客户首次接触',
      details: [
        { label: '产出', value: '客户需求文档' },
        { label: '负责人', value: '王斯琼' },
      ],
      actions: [
        { label: '发起入驻', type: 'approval', taskId: 'onboard-brightpath-contact' },
      ],
    },
    {
      id: 'c1-3', clientId: 'luxevibe', clientName: 'LuxeVibe', clientInitial: 'L', grade: 'B',
      badge: 'orange', badgeText: '进行中', title: '资质审查', desc: '电商品牌资质审查中',
      details: [
        { label: '产出', value: '合规报告' },
        { label: '审批', value: '行运 + HUI + 交付 + 销售' },
      ],
      actions: [
        { label: '审批资质', type: 'approval', taskId: 'onboard-luxevibe-compliance' },
      ],
    },
    {
      id: 'c1-4', clientId: 'wavebone', clientName: 'Wavebone', clientInitial: 'W', grade: 'A',
      badge: 'orange', badgeText: '进行中', title: 'TikTok 渠道合规补审', desc: '追加 TikTok 渠道，需补充合规材料',
      details: [
        { label: '原因', value: '新增投放渠道' },
        { label: '渠道', value: 'TikTok Ads' },
        { label: '预计完成', value: '2026-03-28' },
      ],
      actions: [
        { label: '提交合规材料', type: 'approval', taskId: 'onboard-wavebone-compliance' },
        { label: '查看投放', type: 'link', href: '/dashboard?client=wavebone' },
      ],
    },
    {
      id: 'c1-4b', clientId: 'wavebone', clientName: 'Wavebone', clientInitial: 'W', grade: 'A',
      badge: 'grey', badgeText: '待处理', title: 'Meta 渠道资质年审', desc: '年度资质复审，需更新营业资料',
      details: [
        { label: '截止日期', value: '2026-04-15' },
        { label: '负责人', value: '陶阳阳' },
      ],
      actions: [
        { label: '资产管理', type: 'link', href: '/assets?client=wavebone' },
      ],
    },
  ],
  2: [
    {
      id: 'c2-1', clientId: 'fintech', clientName: 'FinTech Pro', clientInitial: 'F', grade: 'S',
      badge: 'orange', badgeText: '进行中', title: '首次 IO 单考核', desc: '金融行业需额外牌照审核',
      details: [
        { label: '产出', value: '可执行标准' },
        { label: '系统', value: '430 · 交付系统/HUI' },
        { label: '特殊要求', value: '金融牌照验证', color: 'var(--red)' },
      ],
      actions: [
        { label: '审批 IO 单', type: 'approval', taskId: 'io-IO-2026-008-finance_review' },
        { label: '查看 IO 单', type: 'link', href: '/io-orders?client=fintech' },
      ],
    },
    {
      id: 'c2-1b', clientId: 'fintech', clientName: 'FinTech Pro', clientInitial: 'F', grade: 'S',
      badge: 'grey', badgeText: '待处理', title: '投放素材准备', desc: 'Google Ads 素材制作与审核',
      details: [
        { label: '渠道', value: 'Google Ads' },
        { label: '素材类型', value: '搜索广告文案 × 10 + 展示素材 × 5' },
      ],
      actions: [
        { label: '资产管理', type: 'link', href: '/assets?client=fintech' },
      ],
    },
    {
      id: 'c2-2', clientId: 'readnow', clientName: 'ReadNow', clientInitial: 'R', grade: 'A',
      badge: 'grey', badgeText: '待处理', title: '投放资产准备', desc: '账户 / Pixel / 素材确认',
      details: [
        { label: '渠道', value: 'Meta + TikTok' },
        { label: '预算', value: '$30,000' },
      ],
      actions: [
        { label: '资产确认', type: 'link', href: '/assets?client=readnow' },
      ],
    },
    {
      id: 'c2-3', clientId: 'payeasy', clientName: 'PayEasy', clientInitial: 'P', grade: 'S',
      badge: 'orange', badgeText: '打款中', title: '预算打款 & 测试计划', desc: '预算 $80,000 · 测试期14天',
      details: [
        { label: '预算', value: '$80,000' },
        { label: '测试期', value: '14 天' },
      ],
      actions: [
        { label: '审批打款', type: 'approval', taskId: 'io-IO-2026-006-finance_review' },
        { label: '查看 IO 单', type: 'link', href: '/io-orders?client=payeasy' },
      ],
    },
    {
      id: 'c2-4', clientId: 'travelgo', clientName: 'TravelGo', clientInitial: 'T', grade: 'B',
      badge: 'grey', badgeText: '待处理', title: '测试计划制定', desc: '旅游行业投放方案规划',
      details: [
        { label: '目标市场', value: '东南亚' },
        { label: '负责人', value: '郭晋光' },
      ],
      actions: [
        { label: '投放提案', type: 'link', href: '/proposal?client=travelgo' },
      ],
    },
    {
      id: 'c2-5', clientId: 'shopmax', clientName: 'ShopMax', clientInitial: 'S', grade: 'B',
      badge: 'grey', badgeText: '待处理', title: '投放素材与账户准备', desc: '合规审查通过后立即启动素材制作',
      details: [
        { label: '渠道', value: 'Meta Ads' },
        { label: '素材类型', value: '爆品展示图 × 5 + 短视频 × 3' },
        { label: '依赖', value: '合规审查通过', color: 'var(--orange)' },
      ],
      actions: [
        { label: '资产管理', type: 'link', href: '/assets?client=shopmax' },
      ],
    },
    {
      id: 'c2-6', clientId: 'medplus', clientName: 'MedPlus', clientInitial: 'M', grade: 'S',
      badge: 'orange', badgeText: '审批中', title: '追加预算申请', desc: '测试效果良好，申请追加 $15,000',
      details: [
        { label: '当前预算', value: '$18,500' },
        { label: '追加金额', value: '$15,000' },
        { label: '审批状态', value: '财务审核中', color: 'var(--orange)' },
      ],
      actions: [
        { label: '审批追加', type: 'approval', taskId: 'io-IO-2026-010-finance_review' },
        { label: '查看投放', type: 'link', href: '/dashboard?client=medplus' },
      ],
    },
  ],
  3: [
    {
      id: 'c3-1', clientId: 'wavebone', clientName: 'Wavebone', clientInitial: 'W', grade: 'A',
      badge: 'dark', badgeText: 'D8/14', title: '投放测试中', desc: '',
      metrics: [
        { label: 'CPA', value: '$3.80' },
        { label: 'ROAS', value: '186%', positive: true },
      ],
      progress: 57,
      details: [
        { label: '日均花费', value: '$1,580' },
        { label: '累计安装', value: '3,280' },
        { label: '投手', value: '陶阳阳' },
        { label: '下次复盘', value: '2026-03-28' },
      ],
      actions: [
        { label: '查看投放', type: 'link', href: '/dashboard?client=wavebone' },
        { label: 'Clock', type: 'link', href: '/clock-config?client=wavebone' },
      ],
    },
    // Change card: Wavebone budget change
    {
      id: 'c3-1c', clientId: 'wavebone', clientName: 'Wavebone', clientInitial: 'W', grade: 'A',
      badge: 'orange', badgeText: '审批中', title: '预算变更 #003', desc: '日均预算调整，测试表现良好',
      cardType: 'change',
      changeDiff: [
        { field: '日均预算', from: '$1,500', to: '$2,200' },
        { field: '总预算', from: '$21,000', to: '$30,800' },
      ],
      details: [
        { label: '变更类型', value: '预算调整' },
        { label: '发起人', value: '罗依桐' },
        { label: '审批进度', value: '行运审核中', color: 'var(--orange)' },
      ],
      actions: [
        { label: '审批变更', type: 'approval', taskId: 'change-wavebone-budget-003' },
      ],
    },
    {
      id: 'c3-2', clientId: 'quickbuy', clientName: 'QuickBuy', clientInitial: 'Q', grade: 'B',
      badge: 'dark', badgeText: 'D3/14', title: '投放测试中', desc: '',
      metrics: [
        { label: 'CPA', value: '$5.10' },
        { label: 'ROAS', value: '132%' },
      ],
      progress: 21,
      details: [
        { label: '日均花费', value: '$1,200' },
        { label: '累计安装', value: '680' },
      ],
      actions: [
        { label: '查看投放', type: 'link', href: '/dashboard?client=quickbuy' },
        { label: 'Clock', type: 'link', href: '/clock-config?client=quickbuy' },
      ],
    },
    {
      id: 'c3-2b', clientId: 'quickbuy', clientName: 'QuickBuy', clientInitial: 'Q', grade: 'B',
      badge: 'grey', badgeText: '待处理', title: '新素材测试', desc: '电商短视频素材 A/B 测试',
      details: [
        { label: '素材', value: '竖版短视频 × 4' },
        { label: '预期', value: 'CPA 降至 $4.50 以下' },
      ],
      actions: [
        { label: '查看投放', type: 'link', href: '/dashboard?client=quickbuy' },
      ],
    },
    {
      id: 'c3-3', clientId: 'medplus', clientName: 'MedPlus', clientInitial: 'M', grade: 'S',
      badge: 'dark', badgeText: 'D11/14', title: '投放测试中', desc: '',
      metrics: [
        { label: 'CPA', value: '$6.20' },
        { label: 'ROAS', value: '145%' },
      ],
      progress: 79,
      details: [
        { label: '日均花费', value: '$2,100' },
        { label: '累计安装', value: '3,750' },
        { label: '特殊', value: '高风险行业 · 医疗', color: 'var(--orange)' },
      ],
      actions: [
        { label: '查看投放', type: 'link', href: '/dashboard?client=medplus' },
        { label: '学习笔记', type: 'link', href: '/learning-notes?client=medplus' },
      ],
    },
    // Change card: MedPlus targeting change
    {
      id: 'c3-3c', clientId: 'medplus', clientName: 'MedPlus', clientInitial: 'M', grade: 'S',
      badge: 'cyan', badgeText: '已通过', title: '定向策略变更 #002', desc: '调整人群定向，扩大受众范围',
      cardType: 'change',
      completed: true,
      changeDiff: [
        { field: '受众范围', from: '25-45 健康爱好者', to: '18-55 广泛兴趣' },
        { field: '排除人群', from: '无', to: '已安装用户' },
      ],
      details: [
        { label: '变更类型', value: '定向策略' },
        { label: '发起人', value: '罗依桐' },
        { label: '状态', value: '已生效', color: 'var(--l-cyan)' },
      ],
      actions: [
        { label: '查看投放', type: 'link', href: '/dashboard?client=medplus' },
      ],
    },
    {
      id: 'c3-4', clientId: 'gameon', clientName: 'GameOn', clientInitial: 'G', grade: 'B',
      badge: 'dark', badgeText: 'D2/7', title: 'TikTok 新渠道测试', desc: '',
      metrics: [
        { label: 'CPA', value: '$4.50' },
        { label: 'ROAS', value: '110%' },
      ],
      progress: 28,
      details: [
        { label: '渠道', value: 'TikTok Ads（新增）' },
        { label: '日均花费', value: '$800' },
        { label: '说明', value: '续约期间测试新渠道可行性' },
      ],
      actions: [
        { label: '查看投放', type: 'link', href: '/dashboard?client=gameon' },
        { label: 'Clock', type: 'link', href: '/clock-config?client=gameon' },
      ],
    },
    {
      id: 'c3-5', clientId: 'novelking', clientName: 'NovelKing', clientInitial: 'N', grade: 'A',
      badge: 'dark', badgeText: 'D5/14', title: '新素材 A/B 测试', desc: '',
      metrics: [
        { label: 'CPA', value: '$1.45' },
        { label: 'ROAS', value: '320%', positive: true },
      ],
      progress: 36,
      details: [
        { label: '测试内容', value: '竖版短视频 vs 图文轮播' },
        { label: '投手', value: '陶阳阳' },
        { label: '说明', value: '续约后新素材效果验证' },
      ],
      actions: [
        { label: '查看投放', type: 'link', href: '/dashboard?client=novelking' },
        { label: '学习笔记', type: 'link', href: '/learning-notes?client=novelking' },
      ],
    },
  ],
  4: [
    {
      id: 'c4-1', clientId: 'gameon', clientName: 'GameOn', clientInitial: 'G', grade: 'B',
      badge: 'orange', badgeText: '评估中', title: '续约评估', desc: '测试期 ROAS 142%，达到目标 150% 的 95%',
      details: [
        { label: '测试期花费', value: '$20,000' },
        { label: '最终 CPA', value: '$5.20（目标 $5.50）' },
        { label: '客户意向', value: '倾向续约', color: 'var(--l-cyan)' },
        { label: '决策日期', value: '2026-03-28' },
      ],
      actions: [
        { label: '续约审批', type: 'approval', taskId: 'onboard-gameon-renewal' },
        { label: '评级变更', type: 'link', href: '/client/gameon' },
      ],
    },
    // Change card: GameOn creative direction change during renewal
    {
      id: 'c4-1c', clientId: 'gameon', clientName: 'GameOn', clientInitial: 'G', grade: 'B',
      badge: 'orange', badgeText: '审批中', title: '素材方向变更 #001', desc: '续约前调整素材创意方向',
      cardType: 'change',
      changeDiff: [
        { field: '素材风格', from: '写实截图', to: '动画 CG + 玩法展示' },
        { field: '投放比例', from: 'Meta 100%', to: 'Meta 60% + TikTok 40%' },
      ],
      details: [
        { label: '变更类型', value: '素材策略' },
        { label: '发起人', value: '郭晋光' },
        { label: '审批进度', value: '运营审核中', color: 'var(--orange)' },
      ],
      actions: [
        { label: '审批变更', type: 'approval', taskId: 'change-gameon-creative-001' },
      ],
    },
    {
      id: 'c4-2', clientId: 'novelking', clientName: 'NovelKing', clientInitial: 'N', grade: 'A',
      badge: 'cyan', badgeText: '已续约', title: '正式合作已启动', desc: '小说/阅读行业，月预算 $50K',
      completed: true,
      details: [
        { label: '月预算', value: '$50,000' },
        { label: '合作模式', value: '全托管' },
      ],
      actions: [
        { label: '查看投放', type: 'link', href: '/dashboard?client=novelking' },
        { label: 'IO 单', type: 'link', href: '/io-orders?client=novelking' },
      ],
    },
    {
      id: 'c4-3', clientId: 'wavebone', clientName: 'Wavebone', clientInitial: 'W', grade: 'A',
      badge: 'orange', badgeText: '待讨论', title: '续约方案预沟通', desc: '测试期 D8 表现优秀，提前启动续约沟通',
      details: [
        { label: 'CPA 达成', value: '$3.80（目标 $4.50）', color: 'var(--l-cyan)' },
        { label: 'ROAS', value: '186%（目标 150%）', color: 'var(--l-cyan)' },
        { label: '预计续约', value: '2026-04-02' },
        { label: '拟定月预算', value: '$40,000' },
      ],
      actions: [
        { label: '投放提案', type: 'link', href: '/proposal?client=wavebone' },
        { label: '评级变更', type: 'link', href: '/client/wavebone' },
      ],
    },
    // Change card: Wavebone channel expansion for renewal
    {
      id: 'c4-3c', clientId: 'wavebone', clientName: 'Wavebone', clientInitial: 'W', grade: 'A',
      badge: 'cyan', badgeText: '已通过', title: '渠道扩展变更 #004', desc: '续约后扩展 TikTok 渠道',
      cardType: 'change',
      completed: true,
      changeDiff: [
        { field: '投放渠道', from: 'Meta', to: 'Meta + TikTok' },
        { field: '月预算分配', from: 'Meta $40K', to: 'Meta $28K + TikTok $12K' },
      ],
      details: [
        { label: '变更类型', value: '渠道扩展' },
        { label: '发起人', value: '罗依桐' },
        { label: '状态', value: '已生效', color: 'var(--l-cyan)' },
      ],
      actions: [
        { label: '查看投放', type: 'link', href: '/dashboard?client=wavebone' },
      ],
    },
  ],
  5: [
    {
      id: 'c5-1', clientId: 'brightpath', clientName: 'BrightPath', clientInitial: 'B', grade: 'C',
      badge: 'red', badgeText: '退款中', title: '终止合作 · 退款处理', desc: '客户主动终止，测试期效果不达标',
      details: [
        { label: '终止类型', value: '效果不达标', color: 'var(--red)' },
        { label: '充值总额', value: '$15,000' },
        { label: '已消耗', value: '$4,500' },
        { label: '预估退款', value: '$8,750', color: 'var(--orange)' },
        { label: '审批进度', value: '财务确认中' },
      ],
      actions: [
        { label: '退款审批', type: 'approval', taskId: 'io-IO-2026-009-finance_review' },
      ],
    },
    {
      id: 'c5-2', clientId: 'brightpath', clientName: 'BrightPath', clientInitial: 'B', grade: 'C',
      badge: 'grey', badgeText: '待处理', title: '账户资产回收', desc: '广告账户余额清算与 Pixel 权限回收',
      details: [
        { label: '待回收', value: 'Meta 广告账户 × 1' },
        { label: 'Pixel', value: '权限移除待确认' },
        { label: '负责人', value: '罗依桐' },
      ],
      actions: [
        { label: '资产管理', type: 'link', href: '/assets?client=brightpath' },
      ],
    },
  ],
}

/* ── Merge same-client-same-phase cards into one display card ── */
const badgePriority: Record<string, number> = {
  red: 5,
  orange: 4,
  dark: 3,
  cyan: 2,
  grey: 1,
}

export function mergeCards(cards: CardData[]): DisplayCard[] {
  const groups = new Map<string, CardData[]>()

  for (const card of cards) {
    const existing = groups.get(card.clientId)
    if (existing) {
      existing.push(card)
    } else {
      groups.set(card.clientId, [card])
    }
  }

  const result: DisplayCard[] = []
  for (const [, group] of groups) {
    if (group.length === 1) {
      result.push(group[0])
    } else {
      // Sort by badge priority (highest first) for primary display
      const sorted = [...group].sort((a, b) =>
        (badgePriority[b.badge] || 0) - (badgePriority[a.badge] || 0)
      )
      const primary = sorted[0]
      const merged: MergedCard = {
        isMerged: true,
        clientId: primary.clientId,
        clientName: primary.clientName,
        clientInitial: primary.clientInitial,
        grade: primary.grade,
        tasks: group, // keep original order
        badge: primary.badge,
        badgeText: `${group.length} 个任务`,
      }
      result.push(merged)
    }
  }
  return result
}

export const phaseCounts = phases.map((p) => kanbanCards[p.id]?.length || 0)

export function gradeVariant(grade: string): 'cyan' | 'grey' | 'orange' | 'dark' {
  if (grade === 'S') return 'orange'
  if (grade === 'A') return 'cyan'
  return 'grey'
}
