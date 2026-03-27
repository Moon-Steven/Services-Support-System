'use client'

import { useMemo } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { Card } from '@/components/ui/Card'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)

interface RoiTrendProps {
  currentRoi: number
  roiChange: number
  weeklyRoi: number[]
  labels: string[]
}

export function RoiTrend({ currentRoi, roiChange, weeklyRoi, labels }: RoiTrendProps) {
  const data = useMemo(() => ({
    labels,
    datasets: [{
      data: weeklyRoi,
      backgroundColor: weeklyRoi.map((_, i) =>
        i === weeklyRoi.length - 1 ? '#00B1A2' : 'rgba(0,177,162,0.25)'
      ),
      borderRadius: 4,
      barPercentage: 0.6,
    }],
  }), [labels, weeklyRoi])

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { enabled: true } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#999' } },
      y: { display: false },
    },
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-[var(--space-3)]">
        <div className="text-12-regular text-grey-08">ROI Trend</div>
      </div>
      <div className="flex items-baseline gap-[var(--space-3)] mb-[var(--space-3)]">
        <span className="text-24-bold text-grey-01">{currentRoi.toFixed(2)}</span>
        <span className={`text-12-medium ${roiChange >= 0 ? 'text-l-cyan' : 'text-red'}`}>
          {roiChange >= 0 ? '↑' : '↓'} {Math.abs(roiChange).toFixed(2)} vs last week
        </span>
      </div>
      <div style={{ height: 100 }}>
        <Bar data={data} options={options} />
      </div>
    </Card>
  )
}
