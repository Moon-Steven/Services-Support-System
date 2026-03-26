'use client'

import { useMemo } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { Card } from '@/components/ui/Card'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend)

/* Chart color constants from CSS variables */
const CHART_COLORS = {
  dark: '#181818',       /* var(--grey-01) */
  cyan: '#00B1A2',       /* var(--l-cyan) */
  label: '#626262',      /* var(--grey-06) */
  tick: '#999999',       /* var(--grey-08) */
  gridLine: 'rgba(0,0,0,0.1)', /* var(--grid-line) */
} as const

interface SpendInstallChartProps {
  days: string[]
  spend: number[]
  installs: number[]
}

export function SpendInstallChart({ days, spend, installs }: SpendInstallChartProps) {
  const combinedData = useMemo<ChartData<'bar', number[], string>>(() => ({
    labels: days,
    datasets: [
      {
        label: '花费 ($)',
        data: spend,
        backgroundColor: CHART_COLORS.dark,
        borderColor: CHART_COLORS.dark,
        borderWidth: 0,
        borderRadius: 4,
        yAxisID: 'y',
      },
      {
        label: '安装量',
        data: installs,
        type: 'line' as const,
        borderColor: CHART_COLORS.cyan,
        backgroundColor: 'transparent',
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: CHART_COLORS.cyan,
        fill: false,
        tension: 0.3,
        yAxisID: 'y1',
      } as unknown as ChartData<'bar', number[], string>['datasets'][0],
    ],
  }), [days, spend, installs])

  const options: ChartOptions<'bar'> = {
    responsive: true,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 }, color: CHART_COLORS.label } },
    },
    scales: {
      y: { position: 'left', grid: { color: CHART_COLORS.gridLine }, ticks: { font: { size: 10 }, color: CHART_COLORS.tick, callback: (v) => '$' + v } },
      y1: { position: 'right', grid: { display: false }, ticks: { font: { size: 10 }, color: CHART_COLORS.tick } },
      x: { grid: { display: false }, ticks: { font: { size: 10 }, color: CHART_COLORS.tick } },
    },
  }

  return (
    <Card>
      <h3 className="text-14-bold mb-[var(--space-4)]">花费 & 安装量趋势</h3>
      <Bar data={combinedData} options={options} height={200} />
    </Card>
  )
}
