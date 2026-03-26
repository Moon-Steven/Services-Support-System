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

export type CardAction = {
  label: string
  type: 'approval' | 'link'
  /** For approval type: the task ID to open in approvals page */
  taskId?: string
  /** For link type: the target path */
  href?: string
}

export type CardData = {
  id: string
  clientId: string
  clientName: string
  clientInitial: string
  grade: string
  badge: 'orange' | 'grey' | 'cyan' | 'dark' | 'red'
  badgeText: string
  title: string
  desc: string
  completed?: boolean
  details?: CardDetail[]
  metrics?: CardMetric[]
  progress?: number
  actions?: CardAction[]
}

export type Phase = {
  id: number
  name: string
  owner: string
  opacity: number
}
