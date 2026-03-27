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

export type ChangeDiff = {
  field: string
  from: string
  to: string
}

export type ApprovalStep = {
  role: string
  person: string
  status: 'done' | 'current' | 'pending'
  date?: string
  comment?: string
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
  /** Card category: task (default) or change request */
  cardType?: 'task' | 'change'
  /** For change-type cards: diff showing what changed */
  changeDiff?: ChangeDiff[]
  /** Approval flow steps: who submits → who reviews */
  approvalSteps?: ApprovalStep[]
}

export type Phase = {
  id: number
  name: string
  owner: string
  opacity: number
}

/** Merged card: groups multiple tasks from the same client in the same phase */
export type MergedCard = {
  isMerged: true
  clientId: string
  clientName: string
  clientInitial: string
  grade: string
  tasks: CardData[]
  /** Primary badge from highest-priority task */
  badge: CardData['badge']
  badgeText: string
}

/** Display item: either a single card or a merged group */
export type DisplayCard = CardData | MergedCard

export function isMergedCard(card: DisplayCard): card is MergedCard {
  return 'isMerged' in card && card.isMerged === true
}
