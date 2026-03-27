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

interface CpaRoasChartProps {
  days: string[]
  cpaData: number[]
  roasData: number[]
}

export function CpaRoasChart({ days, cpaData, roasData }: CpaRoasChartProps) {
  const latestCpa = cpaData[cpaData.length - 1]
  const latestRoas = roasData[roasData.length - 1]
  const prevCpa = cpaData[cpaData.length - 2]
  const cpaChange = ((latestCpa - prevCpa) / prevCpa * 100).toFixed(1)
  const cpaUp = latestCpa >= prevCpa

  const chartData = useMemo<ChartData<'line', number[], string>>(() => ({
    labels: days,
    datasets: [
      {
        label: 'CPA ($)',
        data: cpaData,
        borderColor: '#181818',
        backgroundColor: 'rgba(24,24,24,0.12)',
        borderWidth: 2,
        pointRadius: cpaData.map((_, i) => i === cpaData.length - 1 ? 4 : 0),
        pointHoverRadius: 5,
        pointBackgroundColor: '#181818',
        fill: true,
        tension: 0.4,
        yAxisID: 'y',
      },
      {
        label: 'ROAS (%)',
        data: roasData,
        borderColor: '#00B1A2',
        backgroundColor: 'rgba(0,177,162,0.10)',
        borderWidth: 2,
        pointRadius: roasData.map((_, i) => i === roasData.length - 1 ? 4 : 0),
        pointHoverRadius: 5,
        pointBackgroundColor: '#00B1A2',
        fill: true,
        tension: 0.4,
        yAxisID: 'y1',
      },
    ],
  }), [days, cpaData, roasData])

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
      y: { position: 'left', grid: { color: 'rgba(0,0,0,0.04)' }, border: { display: false }, ticks: { font: { size: 10 }, color: '#999', callback: (v) => '$' + Number(v).toFixed(2) } },
      y1: { position: 'right', grid: { display: false }, border: { display: false }, ticks: { font: { size: 10 }, color: '#999', callback: (v) => v + '%' } },
      x: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 10 }, color: '#999' } },
    },
  }

  return (
    <Card>
      <div className="flex items-start justify-between mb-[var(--space-4)]">
        <h3 className="text-14-bold">CPA & ROAS 趋势</h3>
        <div className="flex items-center gap-[var(--space-4)]">
          <div className="text-right">
            <div className="text-10-regular text-grey-08">当前 CPA</div>
            <div className="flex items-baseline gap-1">
              <span className="text-14-bold text-grey-01">${latestCpa.toFixed(2)}</span>
              <span className={`text-10-regular ${cpaUp ? 'text-red' : 'text-l-cyan'}`}>{cpaUp ? '↑' : '↓'}{Math.abs(Number(cpaChange))}%</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-10-regular text-grey-08">当前 ROAS</div>
            <div className="text-14-bold text-l-cyan">{latestRoas}%</div>
          </div>
        </div>
      </div>
      <div style={{ height: 200 }}>
        <Line data={chartData} options={options} />
      </div>
    </Card>
  )
}
