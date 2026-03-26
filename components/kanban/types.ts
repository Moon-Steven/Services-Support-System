/* ── Kanban Types & Mock Data ── */

export type CardDetail = {
  label: string
  value: string
  color?: string
}

export type CardMetric = {
  label: string
  value: string
  positive?: boolean
}

export type CardData = {
  id: string
  clientId: string
  clientName: string
  clientInitial: string
  grade: string
  badge: 'orange' | 'grey' | 'cyan' | 'dark'
  badgeText: string
  title: string
  desc: string
  completed?: boolean
  details?: CardDetail[]
  metrics?: CardMetric[]
  progress?: number
}

export type Phase = {
  id: number
  name: string
  owner: string
  opacity: number
}
