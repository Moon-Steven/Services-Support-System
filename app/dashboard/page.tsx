'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useClient } from '@/lib/client-context'
import { clients } from '@/lib/data'
import {
  DashboardToolbar,
  KpiCards,
  TestProgress,
  SpendInstallChart,
  CpaRoasChart,
  CampaignTable,
  StrategyTimeline,
  CreativeTop,
} from '@/components/dashboard'
import type { Campaign, Creative, StrategyNote } from '@/components/dashboard'

/* ── Mock Data ── */
const days = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7', 'Day 8']
const spend = [1500, 1650, 1580, 1720, 1450, 1680, 1520, 1580]
const installs = [320, 380, 360, 420, 390, 450, 410, 480]
const cpaData = [4.69, 4.34, 4.39, 4.10, 3.72, 3.73, 3.71, 3.80]
const roasData = [145, 155, 158, 168, 172, 180, 182, 186]

const kpis = [
  { label: '总花费', value: '$12,450', trend: '+8.2%', trendType: 'positive' as const, note: 'vs 昨日', sparkline: spend },
  { label: '安装量', value: '3,280', trend: '+12.5%', trendType: 'positive' as const, note: 'vs 昨日', sparkline: installs },
  { label: 'CPA', value: '$3.80', trend: '-5.0%', trendType: 'positive' as const, note: '目标 $4.50', sparkline: cpaData },
  { label: 'ROAS', value: '186%', trend: '+3.2%', trendType: 'positive' as const, note: '目标 150%', sparkline: roasData },
  { label: 'CTR', value: '2.4%', trend: '-0.3%', trendType: 'negative' as const, note: 'vs 昨日', sparkline: [2.8, 2.6, 2.7, 2.5, 2.4, 2.3, 2.5, 2.4] },
]

const campaigns: Campaign[] = [
  { id: '1', name: '获客_LAL_高价值', spend: '$4,200', installs: '1,235', cpa: '$3.40', roas: '210%', roasColor: 'var(--l-cyan)', status: '优秀', statusVariant: 'cyan' },
  { id: '2', name: '获客_兴趣_阅读', spend: '$3,800', installs: '980', cpa: '$3.88', roas: '175%', roasColor: 'var(--l-cyan)', status: '达标', statusVariant: 'cyan' },
  { id: '3', name: '再营销_付费用户', spend: '$2,600', installs: '620', cpa: '$4.19', roas: '155%', roasColor: 'var(--orange)', status: '观察', statusVariant: 'orange' },
  { id: '4', name: '品牌_视频_认知', spend: '$1,850', installs: '445', cpa: '$4.16', roas: '120%', roasColor: 'var(--red)', status: '待优化', statusVariant: 'red' },
]

const creatives: Creative[] = [
  { id: 'V1', name: '阅读场景_沉浸式体验', type: '视频', description: '15s 竖版，用户翻书→沉浸阅读→满意微笑', thumbnail: '#3B82A0', ctr: 3.2, cpa: 3.10, installs: 820, top: true },
  { id: 'I2', name: '功能展示_核心卖点', type: '图片', description: '1200x628 横版，3屏轮播突出AI推荐+离线阅读', thumbnail: '#6B7280', ctr: 2.8, cpa: 3.55, installs: 650, top: false },
  { id: 'V3', name: '用户证言_真实反馈', type: '视频', description: '30s 用户访谈，3位真实用户分享使用感受', thumbnail: '#8B5CF6', ctr: 2.5, cpa: 3.80, installs: 480, top: false },
]

const strategyNotes: StrategyNote[] = [
  { day: 'Day 8 · 今日', text: 'LAL 人群包持续表现优异，建议追加预算至 $5K/日', today: true, tag: '优化', result: 'CPA $3.40，ROAS 210%，为最优系列', resultType: 'positive' },
  { day: 'Day 5', text: '新增再营销广告系列，针对 D3 付费用户', today: false, tag: '新增', result: 'D5-D8 再营销 ROAS 155%，高于基准', resultType: 'positive' },
  { day: 'Day 3', text: '暂停品牌_视频_认知系列，CPA 偏高待优化素材', today: false, tag: '暂停', result: '暂停后整体 CPA 从 $4.39 降至 $3.72', resultType: 'positive' },
  { day: 'Day 1', text: '启动测试，3组获客 + 1组品牌，日预算 $1.5K', today: false, tag: '启动', result: 'D1 冷启动 CPA $4.69，符合预期', resultType: 'neutral' },
]

/* ── Inner component that uses useSearchParams ── */
function DashboardInner() {
  const searchParams = useSearchParams()
  const { client, setClient } = useClient()
  const [view, setView] = useState<'daily' | 'weekly'>('daily')
  const [platform, setPlatform] = useState('meta')

  /* Sync URL param to context */
  useEffect(() => {
    const urlClient = searchParams.get('client')
    if (urlClient && (!client || client.id !== urlClient)) {
      const found = clients.find((c) => c.id === urlClient)
      if (found) {
        setClient({ id: found.id, name: found.name, industry: found.industry, grade: found.grade })
      }
    }
  }, [searchParams, client, setClient])

  const clientName = client?.name || 'Wavebone'

  return (
    <div className="flex flex-col gap-[var(--space-5)]">
      {/* ═══ Toolbar ═══ */}
      <DashboardToolbar
        clientName={clientName}
        view={view}
        onViewChange={setView}
        platform={platform}
        onPlatformChange={setPlatform}
      />

      {/* ═══ 1. 测试周期进度条 ═══ */}
      <TestProgress />

      {/* ═══ 2. 核心指标（带 Sparkline） ═══ */}
      <KpiCards kpis={kpis} />

      {/* ═══ 3. 投放策略 & 素材 ═══ */}
      <section>
        <h2 className="text-16-bold text-grey-01 mb-[var(--space-3)]">投放策略 & 素材</h2>
        <div className="grid grid-cols-2 gap-[var(--space-4)]">
          <StrategyTimeline notes={strategyNotes} />
          <CreativeTop creatives={creatives} />
        </div>
      </section>

      {/* ═══ 4. 投放数据趋势（验证策略和素材效果） ═══ */}
      <section>
        <h2 className="text-16-bold text-grey-01 mb-[var(--space-3)]">投放数据趋势</h2>
        <div className="grid grid-cols-2 gap-[var(--space-4)]">
          <SpendInstallChart days={days} spend={spend} installs={installs} />
          <CpaRoasChart days={days} cpaData={cpaData} roasData={roasData} />
        </div>
      </section>

      {/* ═══ 5. 广告系列明细 ═══ */}
      <CampaignTable campaigns={campaigns} />
    </div>
  )
}

/* ── Main export wrapped in Suspense for useSearchParams ── */
export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-[var(--space-6)] text-grey-08">加载中...</div>}>
      <DashboardInner />
    </Suspense>
  )
}
