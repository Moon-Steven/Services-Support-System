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
  Legend,
  type ChartData,
  type ChartOptions,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { Card } from '@/components/ui/Card'

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Filler, Tooltip, Legend)

interface SpendInstallChartProps {
  days: string[]
  spend: number[]
  installs: number[]
}

export function SpendInstallChart({ days, spend, installs }: SpendInstallChartProps) {
  const totalSpend = spend.reduce((a, b) => a + b, 0)
  const totalInstalls = installs.reduce((a, b) => a + b, 0)

  const chartData = useMemo<ChartData<'line', number[], string>>(() => ({
    labels: days,
    datasets: [
      {
        label: '花费 ($)',
        data: spend,
        borderColor: '#181818',
        backgroundColor: 'rgba(24,24,24,0.12)',
        borderWidth: 2,
        pointRadius: spend.map((_, i) => i === spend.length - 1 ? 4 : 0),
        pointHoverRadius: 5,
        pointBackgroundColor: '#181818',
        fill: true,
        tension: 0.4,
        yAxisID: 'y',
      },
      {
        label: '安装量',
        data: installs,
        borderColor: '#00B1A2',
        backgroundColor: 'rgba(0,177,162,0.10)',
        borderWidth: 2,
        pointRadius: installs.map((_, i) => i === installs.length - 1 ? 4 : 0),
        pointHoverRadius: 5,
        pointBackgroundColor: '#00B1A2',
        fill: true,
        tension: 0.4,
        yAxisID: 'y1',
      },
    ],
  }), [days, spend, installs])

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: {
        position: 'bottom',
        labels: { boxWidth: 10, boxHeight: 10, usePointStyle: true, pointStyle: 'circle', font: { size: 11 }, color: '#626262', padding: 16 },
      },
    },
    scales: {
      y: { position: 'left', grid: { color: 'rgba(0,0,0,0.04)' }, border: { display: false }, ticks: { font: { size: 10 }, color: '#999', callback: (v) => '$' + v } },
      y1: { position: 'right', grid: { display: false }, border: { display: false }, ticks: { font: { size: 10 }, color: '#999' } },
      x: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 10 }, color: '#999' } },
    },
  }

  return (
    <Card>
      <div className="flex items-start justify-between mb-[var(--space-4)]">
        <h3 className="text-14-bold">花费 & 安装量趋势</h3>
        <div className="flex items-center gap-[var(--space-4)]">
          <div className="text-right">
            <div className="text-10-regular text-grey-08">总花费</div>
            <div className="text-14-bold text-grey-01">${totalSpend.toLocaleString()}</div>
          </div>
          <div className="text-right">
            <div className="text-10-regular text-grey-08">总安装</div>
            <div className="text-14-bold text-l-cyan">{totalInstalls.toLocaleString()}</div>
          </div>
        </div>
      </div>
      <div style={{ height: 200 }}>
        <Line data={chartData} options={options} />
      </div>
    </Card>
  )
}
