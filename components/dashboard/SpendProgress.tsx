'use client'

import { useMemo } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { Card } from '@/components/ui/Card'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip)

interface SpendProgressProps {
  totalSpend: number
  budget: number
  dailySpend: number[]
  labels: string[]
  daysElapsed: number
  totalDays: number
}

export function SpendProgress({ totalSpend, budget, dailySpend, labels, daysElapsed, totalDays }: SpendProgressProps) {
  const pct = Math.round((totalSpend / budget) * 100)
  const timePct = Math.round((daysElapsed / totalDays) * 100)

  const data = useMemo(() => ({
    labels,
    datasets: [{
      data: dailySpend,
      borderColor: '#00B1A2',
      backgroundColor: 'rgba(0,177,162,0.08)',
      borderWidth: 2,
      pointRadius: 0,
      fill: true,
      tension: 0.3,
    }],
  }), [labels, dailySpend])

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
      <div className="flex items-start justify-between mb-[var(--space-3)]">
        <div>
          <div className="text-12-regular text-grey-08">Spend Progress</div>
          <div className="flex items-baseline gap-[var(--space-2)] mt-1">
            <span className="text-24-bold text-l-cyan">${totalSpend.toLocaleString()}</span>
            <span className="text-14-regular text-grey-08">/${budget.toLocaleString()}</span>
          </div>
        </div>
        <span className="text-12-medium text-grey-06">{pct}%</span>
      </div>
      <div style={{ height: 120 }}>
        <Line data={data} options={options} />
      </div>
      {/* Time Elapsed */}
      <div className="mt-[var(--space-3)] pt-[var(--space-3)] border-t border-stroke">
        <div className="flex items-center justify-between mb-1">
          <span className="text-10-regular text-grey-08">Time Elapsed</span>
          <span className="text-10-regular text-grey-06">{daysElapsed}/{totalDays} days</span>
        </div>
        <div className="flex gap-[2px]">
          <div className="h-[6px] rounded-l-full bg-l-cyan transition-all" style={{ width: `${timePct}%` }} />
          <div className="h-[6px] rounded-r-full bg-orange transition-all" style={{ width: `${100 - timePct}%` }} />
        </div>
        <div className="flex justify-between mt-[2px]">
          <span className="text-10-regular text-l-cyan">Spend Progress</span>
          <span className="text-10-regular text-orange">Time Elapsed</span>
        </div>
      </div>
    </Card>
  )
}
