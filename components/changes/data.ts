import { ReactNode } from 'react'

/* ─── Types ─── */
export interface DiffLine {
  type: 'add' | 'del'
  text: string
}

export interface DiffSection {
  title: string
  lines: DiffLine[]
}

export interface ApprovalNode {
  label: string
  status: 'done' | 'pending' | 'waiting'
}

export interface HistoryItem {
  id: string
  title: string
  date: string
  dotColor: string
  badge: { label: string; variant: 'cyan' | 'grey' | 'red' | 'orange' | 'dark' }
  content: ReactNode
}

export interface StatItem {
  label: string
  value: string
  color: string
}

export interface ConfigRow {
  label: string
  value: string
  pending: string | null
}
