'use client'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { Card } from '@/components/ui/Card'

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend)

/* Chart color constants from CSS variables */
const CHART_COLORS = {
  dark: '#181818',       /* var(--grey-01) */
  cyan: '#00B1A2',       /* var(--l-cyan) */
  label: '#626262',      /* var(--grey-06) */
  tick: '#999999',       /* var(--grey-08) */
  gridLine: 'rgba(0,0,0,0.1)', /* var(--grid-line) */
} as const

interface CpaRoasChartProps {
  days: string[]
  cpaData: number[]
  roasData: number[]
}

export function CpaRoasChart({ days, cpaData, roasData }: CpaRoasChartProps) {
  const chartData: ChartData<'line', number[], string> = {
    labels: days,
    datasets: [
      {
        label: 'CPA ($)',
        data: cpaData,
        borderColor: CHART_COLORS.dark,
        backgroundColor: 'transparent',
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: CHART_COLORS.dark,
        fill: false,
        tension: 0.3,
        yAxisID: 'y',
      },
      {
        label: 'ROAS (%)',
        data: roasData,
        borderColor: CHART_COLORS.cyan,
        backgroundColor: 'transparent',
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: CHART_COLORS.cyan,
        fill: false,
        tension: 0.3,
        yAxisID: 'y1',
      },
    ],
  }

  const options: ChartOptions<'line'> = {
    responsive: true,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 }, color: CHART_COLORS.label } },
    },
    scales: {
      y: { position: 'left', grid: { color: CHART_COLORS.gridLine }, ticks: { font: { size: 10 }, color: CHART_COLORS.tick, callback: (v) => '$' + Number(v).toFixed(2) } },
      y1: { position: 'right', grid: { display: false }, ticks: { font: { size: 10 }, color: CHART_COLORS.tick, callback: (v) => v + '%' } },
      x: { grid: { display: false }, ticks: { font: { size: 10 }, color: CHART_COLORS.tick } },
    },
  }

  return (
    <Card>
      <h3 className="text-14-bold mb-[var(--space-4)]">CPA & ROAS 趋势</h3>
      <Line data={chartData} options={options} height={200} />
    </Card>
  )
}
