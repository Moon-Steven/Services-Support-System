'use client'

import { useMemo } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Filler,
  Tooltip,
  type ChartData,
  type ChartOptions,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { Card } from '@/components/ui/Card'
import type { ClientPerformance } from '@/lib/data'

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Filler, Tooltip)

const COLORS = {
  dark: '#181818',
  cyan: '#00B1A2',
  cyanFill: 'rgba(0,177,162,0.08)',
  orange: '#FF8C00',
  orangeFill: 'rgba(255,140,0,0.08)',
  red: '#E53E3E',
  grey08: '#999999',
  gridLine: 'rgba(0,0,0,0.06)',
} as const

/* ── Mini Sparkline ── */
function Sparkline({
  data,
  color,
  fillColor,
  height = 44,
  labels,
  prefix = '',
  suffix = '',
}: {
  data: number[]
  color: string
  fillColor: string
  height?: number
  labels: string[]
  prefix?: string
  suffix?: string
}) {
  const chartData: ChartData<'line', number[], string> = {
    labels,
    datasets: [{
      data,
      borderColor: color,
      backgroundColor: fillColor,
      borderWidth: 1.5,
      pointRadius: 0,
      pointHoverRadius: 3,
      pointHoverBackgroundColor: color,
      fill: true,
      tension: 0.4,
    }],
  }

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        padding: 6,
        titleFont: { size: 10 },
        bodyFont: { size: 11 },
        callbacks: {
          label: (ctx) => `${prefix}${(ctx.parsed.y ?? 0).toLocaleString()}${suffix}`,
        },
      },
    },
    scales: {
      x: { display: false },
      y: { display: false },
    },
  }

  return (
    <div style={{ height }}>
      <Line data={chartData} options={options} />
    </div>
  )
}

/**
 * deviation: positive = better than target, negative = worse than target
 * e.g. CPA actual $3.80 vs target $4.50 → deviation = +15.6% (good, under budget)
 *      ROAS actual 118% vs target 150%  → deviation = -21.3% (bad, below target)
 *
 * Color rules:
 *   deviation > +30%  → green (text-l-cyan) — significantly exceeding target
 *   deviation >= -30%  → black (text-grey-01) — within 30% of target
 *   deviation < -30%  → red (text-red) — significantly below target
 */
function deviationColor(deviation: number): string {
  if (deviation > 30) return 'text-l-cyan'
  if (deviation >= -30) return 'text-grey-01'
  return 'text-red'
}

function deviationIcon(deviation: number): string {
  if (deviation > 30) return '↑'
  if (deviation >= -30) return '·'
  return '↓'
}

/* ── KPI Stat Block ── */
function KpiStat({
  label,
  value,
  target,
  deviation,
  trend,
  trendGood,
}: {
  label: string
  value: string
  target?: string
  deviation?: number
  trend?: string
  trendGood?: boolean
}) {
  const color = deviation !== undefined ? deviationColor(deviation) : 'text-grey-01'
  const icon = deviation !== undefined ? deviationIcon(deviation) : ''

  return (
    <div className="flex flex-col">
      <span className="text-10-regular text-grey-08">{label}</span>
      <span className={`text-16-bold mt-[1px] ${color}`}>{value}</span>
      {target && (
        <div className="flex items-center gap-[3px] mt-[1px]">
          <span className={`text-10-regular ${color}`}>
            {icon} 目标 {target}
          </span>
          {trend && (
            <span className={`text-10-regular ${trendGood ? 'text-l-cyan' : 'text-red'}`}>
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Main Component ── */
interface CampaignSnapshotProps {
  perf: ClientPerformance
  clientId: string
}

export function CampaignSnapshot({ perf, clientId }: CampaignSnapshotProps) {
  const { summary: s, daily } = perf
  const labels = daily.map((d) => d.date)

  const cpaTrendPct = useMemo(() => {
    if (daily.length < 2) return 0
    const first = daily[0].cpa
    const last = daily[daily.length - 1].cpa
    return Number(((last - first) / first * 100).toFixed(1))
  }, [daily])

  const roasTrendPct = useMemo(() => {
    if (daily.length < 2) return 0
    const first = daily[0].roas
    const last = daily[daily.length - 1].roas
    return Number(((last - first) / first * 100).toFixed(1))
  }, [daily])

  const cpaTrend = daily.length < 2 ? '' : (cpaTrendPct > 0 ? `+${cpaTrendPct}%` : `${cpaTrendPct}%`)
  const roasTrend = daily.length < 2 ? '' : (roasTrendPct > 0 ? `+${roasTrendPct}%` : `${roasTrendPct}%`)

  // deviation: positive = better than target
  // CPA: lower is better, so (target - actual) / target * 100
  const cpaDeviation = s.cpaTarget > 0 ? ((s.cpaTarget - s.cpa) / s.cpaTarget * 100) : 0
  // ROAS: higher is better, so (actual - target) / target * 100
  const roasDeviation = s.roasTarget > 0 ? ((s.roas - s.roasTarget) / s.roasTarget * 100) : 0
  const cpaTrendGood = cpaTrendPct <= 0   // CPA going down = good
  const roasTrendGood = roasTrendPct >= 0  // ROAS going up = good

  return (
    <Card>
      <div className="flex items-center justify-between mb-[var(--space-3)]">
        <div className="text-14-bold text-grey-01">投放数据</div>
        <a
          href={`/dashboard?client=${clientId}`}
          className="text-12-regular text-l-cyan hover:underline"
        >
          查看完整报表
        </a>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-4 gap-[var(--space-3)] pb-[var(--space-3)] border-b border-stroke">
        <KpiStat
          label="总花费"
          value={`$${s.totalSpend.toLocaleString()}`}
        />
        <KpiStat
          label="安装量"
          value={s.totalInstalls.toLocaleString()}
        />
        <KpiStat
          label="CPA"
          value={`$${s.cpa.toFixed(2)}`}
          target={`$${s.cpaTarget.toFixed(2)}`}
          deviation={cpaDeviation}
          trend={cpaTrend}
          trendGood={cpaTrendGood}
        />
        <KpiStat
          label="ROAS"
          value={`${s.roas}%`}
          target={`${s.roasTarget}%`}
          deviation={roasDeviation}
          trend={roasTrend}
          trendGood={roasTrendGood}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-[var(--space-4)] pt-[var(--space-3)]">
        {/* Spend + Installs trend */}
        <div>
          <div className="flex items-center justify-between mb-[var(--space-1)]">
            <span className="text-10-regular text-grey-08">花费趋势</span>
            <div className="flex items-center gap-[var(--space-2)]">
              <span className="flex items-center gap-1 text-10-regular text-grey-08">
                <span className="w-[8px] h-[2px] rounded-full bg-grey-01 inline-block" />花费
              </span>
              <span className="flex items-center gap-1 text-10-regular text-grey-08">
                <span className="w-[8px] h-[2px] rounded-full bg-l-cyan inline-block" />安装
              </span>
            </div>
          </div>
          <SpendInstallSparkline daily={daily} labels={labels} />
        </div>

        {/* CPA + ROAS trend */}
        <div>
          <div className="flex items-center justify-between mb-[var(--space-1)]">
            <span className="text-10-regular text-grey-08">效率趋势</span>
            <div className="flex items-center gap-[var(--space-2)]">
              <span className="flex items-center gap-1 text-10-regular text-grey-08">
                <span className="w-[8px] h-[2px] rounded-full bg-grey-01 inline-block" />CPA
              </span>
              <span className="flex items-center gap-1 text-10-regular text-grey-08">
                <span className="w-[8px] h-[2px] rounded-full bg-l-cyan inline-block" />ROAS
              </span>
            </div>
          </div>
          <CpaRoasSparkline daily={daily} labels={labels} cpaTarget={s.cpaTarget} />
        </div>
      </div>

      {/* Bottom: Feature Indicators */}
      <div className="grid grid-cols-3 gap-[var(--space-3)] mt-[var(--space-3)] pt-[var(--space-3)] border-t border-stroke">
        <div className="bg-bg rounded-lg px-[var(--space-3)] py-[var(--space-2)]">
          <div className="text-10-regular text-grey-08">CTR</div>
          <div className="text-14-bold text-grey-01 mt-[1px]">{s.ctr}%</div>
          <div className="text-10-regular text-grey-08 mt-[1px]">
            {s.impressions >= 1000000 ? `${(s.impressions / 1000000).toFixed(1)}M` : `${(s.impressions / 1000).toFixed(0)}K`} 曝光
          </div>
        </div>
        <div className="bg-bg rounded-lg px-[var(--space-3)] py-[var(--space-2)]">
          <div className="text-10-regular text-grey-08">最佳素材</div>
          <div className="text-12-medium text-grey-01 mt-[1px] truncate">{perf.topCreative.name}</div>
          <div className="text-10-regular text-grey-08 mt-[1px]">
            CTR {perf.topCreative.ctr}% · CPA ${perf.topCreative.cpa.toFixed(2)}
          </div>
        </div>
        <div className="bg-bg rounded-lg px-[var(--space-3)] py-[var(--space-2)]">
          <div className="text-10-regular text-grey-08">最佳人群</div>
          <div className="text-12-medium text-grey-01 mt-[1px] truncate">{perf.topAudience.name}</div>
          <div className="text-10-regular text-grey-08 mt-[1px]">
            {perf.topAudience.installs.toLocaleString()} 安装 · CPA ${perf.topAudience.cpa.toFixed(2)}
          </div>
        </div>
      </div>
    </Card>
  )
}

/* ── Dual-axis Spend + Install sparkline ── */
function SpendInstallSparkline({ daily, labels }: { daily: ClientPerformance['daily']; labels: string[] }) {
  const chartData: ChartData<'line', number[], string> = {
    labels,
    datasets: [
      {
        data: daily.map((d) => d.spend),
        borderColor: COLORS.dark,
        backgroundColor: 'rgba(24,24,24,0.04)',
        borderWidth: 1.5,
        pointRadius: 0,
        pointHoverRadius: 3,
        pointHoverBackgroundColor: COLORS.dark,
        fill: true,
        tension: 0.4,
        yAxisID: 'y',
      },
      {
        data: daily.map((d) => d.installs),
        borderColor: COLORS.cyan,
        backgroundColor: COLORS.cyanFill,
        borderWidth: 1.5,
        pointRadius: 0,
        pointHoverRadius: 3,
        pointHoverBackgroundColor: COLORS.cyan,
        fill: true,
        tension: 0.4,
        yAxisID: 'y1',
      },
    ],
  }

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        padding: 6,
        titleFont: { size: 10 },
        bodyFont: { size: 11 },
        callbacks: {
          label: (ctx) => {
            const isSpend = ctx.datasetIndex === 0
            return isSpend
              ? `花费: $${(ctx.parsed.y ?? 0).toLocaleString()}`
              : `安装: ${(ctx.parsed.y ?? 0).toLocaleString()}`
          },
        },
      },
    },
    scales: {
      x: { display: false },
      y: { display: false },
      y1: { display: false },
    },
  }

  return (
    <div style={{ height: 52 }}>
      <Line data={chartData} options={options} />
    </div>
  )
}

/* ── Dual-axis CPA + ROAS sparkline ── */
function CpaRoasSparkline({
  daily,
  labels,
  cpaTarget,
}: {
  daily: ClientPerformance['daily']
  labels: string[]
  cpaTarget: number
}) {
  const chartData: ChartData<'line', number[], string> = {
    labels,
    datasets: [
      {
        data: daily.map((d) => d.cpa),
        borderColor: COLORS.dark,
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        pointRadius: 0,
        pointHoverRadius: 3,
        pointHoverBackgroundColor: COLORS.dark,
        fill: false,
        tension: 0.4,
        yAxisID: 'y',
      },
      {
        data: daily.map((d) => d.roas),
        borderColor: COLORS.cyan,
        backgroundColor: COLORS.cyanFill,
        borderWidth: 1.5,
        pointRadius: 0,
        pointHoverRadius: 3,
        pointHoverBackgroundColor: COLORS.cyan,
        fill: true,
        tension: 0.4,
        yAxisID: 'y1',
      },
    ],
  }

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        padding: 6,
        titleFont: { size: 10 },
        bodyFont: { size: 11 },
        callbacks: {
          label: (ctx) => {
            const isCpa = ctx.datasetIndex === 0
            return isCpa
              ? `CPA: $${(ctx.parsed.y ?? 0).toFixed(2)}`
              : `ROAS: ${(ctx.parsed.y ?? 0)}%`
          },
        },
      },
    },
    scales: {
      x: { display: false },
      y: { display: false },
      y1: { display: false },
    },
  }

  return (
    <div style={{ height: 52 }}>
      <Line data={chartData} options={options} />
    </div>
  )
}
