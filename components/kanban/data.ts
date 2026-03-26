import type { Phase, CardData } from './types'

export const phases: Phase[] = [
  { id: 1, name: '客户触达', owner: '王斯琼', opacity: 1 },
  { id: 2, name: '需求沟通', owner: '王斯琼 / 郭晋光', opacity: 0.75 },
  { id: 3, name: '测试期', owner: '罗依桐', opacity: 0.5 },
  { id: 4, name: '转正续约', owner: '王斯琼', opacity: 0.35 },
  { id: 5, name: '终止/退款', owner: '明虎', opacity: 0.2 },
]

/* 12 clients across 4 phases: 3+4+3+2 */
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
    },
    {
      id: 'c1-2', clientId: 'brightpath', clientName: 'BrightPath', clientInitial: 'B', grade: 'C',
      badge: 'grey', badgeText: '待处理', title: '初次客户沟通', desc: '教育行业客户首次接触',
      details: [
        { label: '产出', value: '客户需求文档' },
        { label: '负责人', value: '王斯琼' },
      ],
    },
    {
      id: 'c1-3', clientId: 'luxevibe', clientName: 'LuxeVibe', clientInitial: 'L', grade: 'B',
      badge: 'orange', badgeText: '进行中', title: '资质审查', desc: '电商品牌资质审查中',
      details: [
        { label: '产出', value: '合规报告' },
        { label: '审批', value: '行运 + HUI + 交付 + 销售' },
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
    },
    {
      id: 'c2-2', clientId: 'readnow', clientName: 'ReadNow', clientInitial: 'R', grade: 'A',
      badge: 'grey', badgeText: '待处理', title: '投放资产准备', desc: '账户 / Pixel / 素材确认',
      details: [
        { label: '渠道', value: 'Meta + TikTok' },
        { label: '预算', value: '$30,000' },
      ],
    },
    {
      id: 'c2-3', clientId: 'payeasy', clientName: 'PayEasy', clientInitial: 'P', grade: 'S',
      badge: 'orange', badgeText: '打款中', title: '预算打款 & 测试计划', desc: '预算 $80,000 · 测试期14天',
      details: [
        { label: '预算', value: '$80,000' },
        { label: '测试期', value: '14 天' },
      ],
    },
    {
      id: 'c2-4', clientId: 'travelgo', clientName: 'TravelGo', clientInitial: 'T', grade: 'B',
      badge: 'grey', badgeText: '待处理', title: '测试计划制定', desc: '旅游行业投放方案规划',
      details: [
        { label: '目标市场', value: '东南亚' },
        { label: '负责人', value: '郭晋光' },
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
    },
    {
      id: 'c4-2', clientId: 'novelking', clientName: 'NovelKing', clientInitial: 'N', grade: 'A',
      badge: 'cyan', badgeText: '已续约', title: '正式合作已启动', desc: '小说/阅读行业，月预算 $50K',
      completed: true,
      details: [
        { label: '月预算', value: '$50,000' },
        { label: '合作模式', value: '全托管' },
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
    },
  ],
}

export const phaseCounts = phases.map((p) => kanbanCards[p.id]?.length || 0)

export function gradeVariant(grade: string): 'cyan' | 'grey' | 'orange' | 'dark' {
  if (grade === 'S') return 'orange'
  if (grade === 'A') return 'cyan'
  return 'grey'
}
