/* ── Approval Workflow Types ── */
export type ApprovalStepStatus = 'completed' | 'current' | 'pending' | 'skipped'

export type ApprovalRole = '销售' | '运营' | '财务' | 'CEO' | '系统' | '合规'

export type ApprovalAttachment = {
  name: string
  type: 'image' | 'pdf' | 'doc' | 'other'
  size: string
  url?: string
}

export type ApprovalStep = {
  key: string
  label: string
  status: ApprovalStepStatus
  role?: ApprovalRole
  person?: string
  date?: string
  note?: string
  attachments?: ApprovalAttachment[]
}

/**
 * Steps that require or support file uploads during approval.
 * `required` means the step cannot be approved without at least one attachment.
 * `hint` describes what kind of file is expected.
 */
export const STEP_ATTACHMENT_CONFIG: Record<string, { required: boolean; hint: string; accept: string }> = {
  /* Onboarding steps */
  'compliance': { required: true, hint: '请上传合规资质文件（营业执照、行业许可证等）', accept: '.pdf,.jpg,.jpeg,.png' },
  'ops-eval': { required: false, hint: '可上传行运评估报告', accept: '.pdf,.doc,.docx' },
  'rating': { required: false, hint: '可上传评级依据截图', accept: '.pdf,.jpg,.jpeg,.png' },
  /* IO order steps */
  'contract': { required: true, hint: '请上传签约合同扫描件或截图', accept: '.pdf,.jpg,.jpeg,.png' },
  'payment-req': { required: false, hint: '可上传打款请求截图', accept: '.jpg,.jpeg,.png,.pdf' },
  'subsidy': { required: false, hint: '可上传补贴评估材料', accept: '.pdf,.doc,.docx,.xlsx' },
  'ceo': { required: false, hint: '可上传审批备注文件', accept: '.pdf,.doc,.docx' },
  'finance': { required: true, hint: '请上传打款凭证截图', accept: '.jpg,.jpeg,.png,.pdf' },
  'asset-bind': { required: false, hint: '可上传账户绑定截图', accept: '.jpg,.jpeg,.png' },
}

/* Client onboarding 9-step template */
export const ONBOARDING_STEPS: { key: string; label: string; role: ApprovalRole }[] = [
  { key: 'entry', label: '录入', role: '销售' },
  { key: 'pool', label: '公海分配', role: '系统' },
  { key: 'bd', label: 'BD归属', role: '销售' },
  { key: 'contact', label: '建联沟通', role: '销售' },
  { key: 'assess', label: '客户摸排', role: '销售' },
  { key: 'compliance', label: '合规材料', role: '合规' },
  { key: 'ops-eval', label: '行运评估', role: '运营' },
  { key: 'rating', label: '潜力评级', role: '销售' },
  { key: 'plan', label: '计划合作', role: '销售' },
]

/* IO order 9-step template */
export const IO_APPROVAL_STEPS: { key: string; label: string; role: ApprovalRole }[] = [
  { key: 'submit', label: 'IO单提交', role: '销售' },
  { key: 'contract', label: '签约确认', role: '销售' },
  { key: 'payment-req', label: '客户催款', role: '销售' },
  { key: 'subsidy', label: '补贴评估', role: '运营' },
  { key: 'ceo', label: 'CEO审批', role: 'CEO' },
  { key: 'finance', label: '财务打款', role: '财务' },
  { key: 'asset-bind', label: '资产绑定', role: '运营' },
  { key: 'test-plan', label: '测试期计划', role: '运营' },
  { key: 'launch', label: '投放启动', role: '运营' },
]

export type OnboardingFlow = {
  steps: ApprovalStep[]
  currentStepIndex: number
}

export type Client = {
  id: string
  name: string
  industry: string
  grade: string
  phase: number
  status: string
  salesOwner?: string
  contact?: string
  phone?: string
  email?: string
  budget?: number
  testBudget?: number
  channels?: string[]
  onboarding?: OnboardingFlow
}

/* ══ Clock Module & Learning Notes Types ══ */

export type ClockCategory = 'Bidding' | 'Monitor' | 'Strategy' | 'Creative'
export const CLOCK_CATEGORIES: ClockCategory[] = ['Bidding', 'Monitor', 'Strategy', 'Creative']

export type ClockEffectType = 'saved' | 'blocked' | 'none'

export type ClockEntry = {
  id: string
  time: string
  category: ClockCategory
  description: string
  effect: { type: ClockEffectType; amount?: number; currency?: string }
  active: boolean
  order: number
}

export type ToneVariant = 'professional' | 'witty' | 'casual'
export const TONE_OPTIONS: { value: ToneVariant; label: string }[] = [
  { value: 'professional', label: '专业版' },
  { value: 'witty', label: '幽默版' },
  { value: 'casual', label: '轻松版' },
]

export type IndustryTemplate = {
  id: string
  industry: string
  name: string
  tone: ToneVariant
  entries: ClockEntry[]
}

export type ClientClockConfig = {
  clientId: string
  templateId: string
  tone: ToneVariant
  entries: ClockEntry[]
  lastPublished?: string
}

export type NoteType = 'LIVE CAMPAIGN' | 'A/B TEST RESULT' | 'OPTIMIZATION'
export const NOTE_TYPES: NoteType[] = ['LIVE CAMPAIGN', 'A/B TEST RESULT', 'OPTIMIZATION']

export type CapabilityTag = { skill: string; delta: number }
export type NoteStatus = 'draft' | 'published'

export type LearningNote = {
  id: string
  clientId: string
  date: string
  type: NoteType
  title: string
  description: string
  capabilityTags: CapabilityTag[]
  status: NoteStatus
  createdBy: string
  createdAt: string
}

/* ── Industry Templates Mock Data ── */
export const industryTemplates: IndustryTemplate[] = [
  {
    id: 'tpl-gaming', industry: '游戏', name: '游戏行业标准', tone: 'witty',
    entries: [
      { id: 'g1', time: '00:30', category: 'Monitor', description: 'Midnight gamer surge detected, monitoring CPI spike pattern', effect: { type: 'blocked', amount: 2400, currency: '¥' }, active: true, order: 0 },
      { id: 'g2', time: '02:17', category: 'Bidding', description: 'Detected bidding env change, auto-reduced bid 8%', effect: { type: 'saved', amount: 3200, currency: '¥' }, active: true, order: 1 },
      { id: 'g3', time: '06:30', category: 'Strategy', description: 'Morning data review complete, adjusted daily budget allocation', effect: { type: 'none' }, active: true, order: 2 },
      { id: 'g4', time: '08:00', category: 'Creative', description: 'New playable ad variant queued for A/B test launch', effect: { type: 'none' }, active: true, order: 3 },
      { id: 'g5', time: '09:15', category: 'Bidding', description: 'Rush hour bidding surge, switched to smart pricing', effect: { type: 'saved', amount: 1800, currency: '¥' }, active: true, order: 4 },
      { id: 'g6', time: '12:08', category: 'Strategy', description: 'Midday traffic valley, auto-reduced intensity 30%', effect: { type: 'saved', amount: 2100, currency: '¥' }, active: true, order: 5 },
      { id: 'g7', time: '14:22', category: 'Creative', description: 'B group CTR +31% over A group, switched to primary', effect: { type: 'none' }, active: true, order: 6 },
      { id: 'g8', time: '16:55', category: 'Bidding', description: 'Afternoon conversion peak, auto-increased bids', effect: { type: 'none' }, active: true, order: 7 },
      { id: 'g9', time: '19:30', category: 'Monitor', description: 'Daily budget at 78%, projected depletion by 23:00', effect: { type: 'none' }, active: true, order: 8 },
      { id: 'g10', time: '22:00', category: 'Strategy', description: 'Night session peak approaching, reallocating budget to TikTok', effect: { type: 'none' }, active: true, order: 9 },
    ],
  },
  {
    id: 'tpl-ecom', industry: '电商', name: '电商行业标准', tone: 'professional',
    entries: [
      { id: 'e1', time: '01:00', category: 'Monitor', description: '夜间流量监控，异常点击率来源已标记', effect: { type: 'blocked', amount: 1500, currency: '¥' }, active: true, order: 0 },
      { id: 'e2', time: '06:00', category: 'Strategy', description: '早间数据回顾，调整今日出价策略', effect: { type: 'none' }, active: true, order: 1 },
      { id: 'e3', time: '08:30', category: 'Bidding', description: '通勤高峰，提升移动端出价权重 15%', effect: { type: 'none' }, active: true, order: 2 },
      { id: 'e4', time: '10:00', category: 'Creative', description: '商品素材自动优化，替换低转化主图', effect: { type: 'none' }, active: true, order: 3 },
      { id: 'e5', time: '12:30', category: 'Bidding', description: '午休流量高峰，智能加价 12%', effect: { type: 'saved', amount: 2800, currency: '¥' }, active: true, order: 4 },
      { id: 'e6', time: '15:00', category: 'Monitor', description: 'ROAS 低于阈值，暂停低效广告组', effect: { type: 'saved', amount: 4200, currency: '¥' }, active: true, order: 5 },
      { id: 'e7', time: '18:00', category: 'Strategy', description: '晚间购物高峰预热，提前扩大预算池', effect: { type: 'none' }, active: true, order: 6 },
      { id: 'e8', time: '20:30', category: 'Bidding', description: '黄金时段自动竞价，CPA 下降 18%', effect: { type: 'saved', amount: 5600, currency: '¥' }, active: true, order: 7 },
      { id: 'e9', time: '23:00', category: 'Monitor', description: '日预算消耗 92%，明日预算建议已生成', effect: { type: 'none' }, active: true, order: 8 },
    ],
  },
  {
    id: 'tpl-reading', industry: '小说/阅读', name: '阅读行业标准', tone: 'witty',
    entries: [
      { id: 'r1', time: '03:42', category: 'Monitor', description: 'Abnormal traffic alert, paused suspicious source 45min', effect: { type: 'blocked', amount: 1800, currency: '¥' }, active: true, order: 0 },
      { id: 'r2', time: '05:03', category: 'Monitor', description: 'Creative A3 CTR below threshold, auto-paused', effect: { type: 'none' }, active: true, order: 1 },
      { id: 'r3', time: '07:00', category: 'Strategy', description: 'Morning commute push: boosted short-form content ads', effect: { type: 'none' }, active: true, order: 2 },
      { id: 'r4', time: '09:15', category: 'Bidding', description: 'Rush hour bidding surge, switched to smart pricing', effect: { type: 'saved', amount: 3200, currency: '¥' }, active: true, order: 3 },
      { id: 'r5', time: '10:44', category: 'Creative', description: 'Launched Creative B group A/B test, monitoring...', effect: { type: 'none' }, active: true, order: 4 },
      { id: 'r6', time: '12:08', category: 'Strategy', description: 'Midday traffic valley, auto-reduced intensity 30%', effect: { type: 'saved', amount: 2100, currency: '¥' }, active: true, order: 5 },
      { id: 'r7', time: '14:22', category: 'Creative', description: 'B group CTR +31% over A group, switched to primary', effect: { type: 'none' }, active: true, order: 6 },
      { id: 'r8', time: '16:55', category: 'Bidding', description: 'Afternoon conversion peak, auto-increased bids', effect: { type: 'none' }, active: true, order: 7 },
      { id: 'r9', time: '19:30', category: 'Monitor', description: 'Daily budget at 78%, projected depletion by 23:00', effect: { type: 'none' }, active: true, order: 8 },
      { id: 'r10', time: '22:30', category: 'Strategy', description: 'Bedtime reading peak: max bid on novel discovery ads', effect: { type: 'saved', amount: 1400, currency: '¥' }, active: true, order: 9 },
    ],
  },
  {
    id: 'tpl-fintech', industry: '金融', name: '金融行业标准', tone: 'professional',
    entries: [
      { id: 'f1', time: '02:00', category: 'Monitor', description: '夜间合规扫描完成，所有素材通过审查', effect: { type: 'none' }, active: true, order: 0 },
      { id: 'f2', time: '07:30', category: 'Strategy', description: '工作日开盘前投放策略部署', effect: { type: 'none' }, active: true, order: 1 },
      { id: 'f3', time: '09:00', category: 'Bidding', description: '开盘时段精准出价，金融关键词溢价 20%', effect: { type: 'none' }, active: true, order: 2 },
      { id: 'f4', time: '11:00', category: 'Monitor', description: '竞品异常投放检测，已调整防御策略', effect: { type: 'blocked', amount: 3600, currency: '¥' }, active: true, order: 3 },
      { id: 'f5', time: '14:00', category: 'Creative', description: '合规素材自动替换，下架到期版本', effect: { type: 'none' }, active: true, order: 4 },
      { id: 'f6', time: '17:00', category: 'Strategy', description: '收盘后降低出价强度，切换长尾词策略', effect: { type: 'saved', amount: 2800, currency: '¥' }, active: true, order: 5 },
      { id: 'f7', time: '20:00', category: 'Bidding', description: '理财APP用户活跃时段，精准定投', effect: { type: 'none' }, active: true, order: 6 },
      { id: 'f8', time: '23:30', category: 'Monitor', description: '日终报告生成，次日预算建议 ¥42,000', effect: { type: 'none' }, active: true, order: 7 },
    ],
  },
]

/* ── Client Clock Configs Mock Data ── */
export const clientClockConfigs: ClientClockConfig[] = [
  {
    clientId: 'wavebone', templateId: 'tpl-reading', tone: 'witty',
    lastPublished: '2026-03-25',
    entries: industryTemplates.find((t) => t.id === 'tpl-reading')!.entries,
  },
  {
    clientId: 'gameon', templateId: 'tpl-gaming', tone: 'witty',
    lastPublished: '2026-03-24',
    entries: industryTemplates.find((t) => t.id === 'tpl-gaming')!.entries,
  },
  {
    clientId: 'shopmax', templateId: 'tpl-ecom', tone: 'professional',
    entries: industryTemplates.find((t) => t.id === 'tpl-ecom')!.entries.slice(0, 6),
  },
  {
    clientId: 'fintech', templateId: 'tpl-fintech', tone: 'professional',
    entries: industryTemplates.find((t) => t.id === 'tpl-fintech')!.entries,
  },
  {
    clientId: 'medplus', templateId: 'tpl-ecom', tone: 'professional',
    lastPublished: '2026-03-23',
    entries: [
      { id: 'mp1', time: '01:30', category: 'Monitor', description: 'Compliance scan completed — all active creatives passed health-category review', effect: { type: 'none' }, active: true, order: 0 },
      { id: 'mp2', time: '04:15', category: 'Monitor', description: 'Detected abnormal click pattern from IP cluster, auto-blocked 23 sources', effect: { type: 'blocked', amount: 2200, currency: '¥' }, active: true, order: 1 },
      { id: 'mp3', time: '06:30', category: 'Strategy', description: 'Morning health-search peak approaching, pre-loaded keyword bids for top 15 conditions', effect: { type: 'none' }, active: true, order: 2 },
      { id: 'mp4', time: '08:45', category: 'Bidding', description: 'Commute hours: boosted mobile CPC by 18% on symptom-checker keywords', effect: { type: 'none' }, active: true, order: 3 },
      { id: 'mp5', time: '10:00', category: 'Creative', description: 'Rotated new doctor-testimonial video ad into primary slot, monitoring CTR', effect: { type: 'none' }, active: true, order: 4 },
      { id: 'mp6', time: '12:30', category: 'Bidding', description: 'Lunch break surge — smart bidding activated, CPA dropped 14%', effect: { type: 'saved', amount: 3400, currency: '¥' }, active: true, order: 5 },
      { id: 'mp7', time: '15:00', category: 'Monitor', description: 'Creative B7 flagged by platform review, auto-paused and replaced with backup', effect: { type: 'none' }, active: true, order: 6 },
      { id: 'mp8', time: '17:30', category: 'Strategy', description: 'After-work wellness interest peak, shifted 25% budget to TikTok health content', effect: { type: 'none' }, active: true, order: 7 },
      { id: 'mp9', time: '20:00', category: 'Creative', description: 'A/B test result: patient-story format +42% conversion vs product-feature format', effect: { type: 'none' }, active: true, order: 8 },
      { id: 'mp10', time: '22:30', category: 'Monitor', description: 'Daily budget 86% consumed, ROAS at 145%, projected next-day budget: ¥6,200', effect: { type: 'none' }, active: true, order: 9 },
    ],
  },
  {
    clientId: 'quickbuy', templateId: 'tpl-ecom', tone: 'witty',
    lastPublished: '2026-03-24',
    entries: [
      { id: 'qb1', time: '00:15', category: 'Monitor', description: 'Late-night impulse buyers detected — flash sale ad group auto-activated', effect: { type: 'none' }, active: true, order: 0 },
      { id: 'qb2', time: '03:00', category: 'Monitor', description: 'Bot traffic from 3 new sources blocked, saved wasted spend overnight', effect: { type: 'blocked', amount: 1600, currency: '¥' }, active: true, order: 1 },
      { id: 'qb3', time: '07:00', category: 'Strategy', description: 'Good morning! Reviewed overnight data, top 3 SKU ads budget +30%', effect: { type: 'none' }, active: true, order: 2 },
      { id: 'qb4', time: '09:30', category: 'Bidding', description: 'Office hours begin, desktop conversion rate up — shifted 20% budget to desktop', effect: { type: 'none' }, active: true, order: 3 },
      { id: 'qb5', time: '11:00', category: 'Creative', description: 'Carousel ad with lifestyle photos outperforming product-only by 28%, scaling up', effect: { type: 'none' }, active: true, order: 4 },
      { id: 'qb6', time: '12:45', category: 'Bidding', description: 'Lunch rush! Smart bidding kicked in, CPA down to $5.10 from $5.80', effect: { type: 'saved', amount: 2100, currency: '¥' }, active: true, order: 5 },
      { id: 'qb7', time: '14:30', category: 'Strategy', description: 'Competitor price drop detected on Google Shopping, adjusted bid floor +8%', effect: { type: 'none' }, active: true, order: 6 },
      { id: 'qb8', time: '18:00', category: 'Creative', description: 'Swapped hero banner to "evening deals" theme, CTR improved 15% in first hour', effect: { type: 'none' }, active: true, order: 7 },
      { id: 'qb9', time: '20:30', category: 'Bidding', description: 'Prime shopping hours — aggressive bidding on high-intent keywords, ROAS 168%', effect: { type: 'saved', amount: 4800, currency: '¥' }, active: true, order: 8 },
      { id: 'qb10', time: '23:00', category: 'Monitor', description: 'Day complete: $4,200 spent, 812 installs, CPA $5.17 — under target!', effect: { type: 'none' }, active: true, order: 9 },
    ],
  },
  {
    clientId: 'novelking', templateId: 'tpl-reading', tone: 'witty',
    lastPublished: '2026-03-25',
    entries: [
      { id: 'nk1', time: '02:00', category: 'Bidding', description: 'Night owls reading session peak — auto-increased bids on novel discovery ads 15%', effect: { type: 'none' }, active: true, order: 0 },
      { id: 'nk2', time: '04:30', category: 'Monitor', description: 'Fraud detection: 156 suspicious installs from single device farm, auto-reported', effect: { type: 'blocked', amount: 2800, currency: '¥' }, active: true, order: 1 },
      { id: 'nk3', time: '06:45', category: 'Strategy', description: 'Early bird readers online! Activated "morning chapter" push notification creative', effect: { type: 'none' }, active: true, order: 2 },
      { id: 'nk4', time: '08:30', category: 'Creative', description: 'New cliffhanger-style ad copy test launched: "Chapter 7 will shock you..."', effect: { type: 'none' }, active: true, order: 3 },
      { id: 'nk5', time: '10:15', category: 'Bidding', description: 'Mid-morning dip in reading app installs, reduced CPI bids by 10%', effect: { type: 'saved', amount: 1200, currency: '¥' }, active: true, order: 4 },
      { id: 'nk6', time: '12:00', category: 'Strategy', description: 'Lunch break = reading time! Boosted "free chapter" ads on TikTok by 40%', effect: { type: 'none' }, active: true, order: 5 },
      { id: 'nk7', time: '14:00', category: 'Creative', description: 'Genre-targeted A/B result: romance covers +55% CTR vs mystery for F25-34', effect: { type: 'none' }, active: true, order: 6 },
      { id: 'nk8', time: '17:30', category: 'Monitor', description: 'Budget pacing on track, 72% consumed with 6.5 hours remaining', effect: { type: 'none' }, active: true, order: 7 },
      { id: 'nk9', time: '20:00', category: 'Bidding', description: 'Evening reading prime time! Max bid activated, conversion rate +35%', effect: { type: 'saved', amount: 3600, currency: '¥' }, active: true, order: 8 },
      { id: 'nk10', time: '23:30', category: 'Monitor', description: 'Day summary: 1,847 new readers acquired, CPA $3.20, best day this week!', effect: { type: 'none' }, active: true, order: 9 },
    ],
  },
  {
    clientId: 'payeasy', templateId: 'tpl-fintech', tone: 'professional',
    lastPublished: '2026-03-22',
    entries: industryTemplates.find((t) => t.id === 'tpl-fintech')!.entries.map((e) => ({
      ...e,
      id: `pe-${e.id}`,
      description: e.description.replace('理财APP', 'PayEasy').replace('金融', '支付'),
    })),
  },
]

/* ── Learning Notes Mock Data ── */
export const learningNotes: LearningNote[] = [
  {
    id: 'note-1', clientId: 'wavebone', date: '2026-03-19', type: 'LIVE CAMPAIGN',
    title: 'Short-form video hooks must land in 1.2 seconds',
    description: 'Analyzed 3,400 video creatives — the highest-performing 5% all delivered their core value proposition within the first 1.2 seconds. Beyond 1.5s, scroll-through rate increases 340%.',
    capabilityTags: [{ skill: 'Creativity', delta: 5 }, { skill: 'Precision', delta: 3 }],
    status: 'published', createdBy: '罗依桐', createdAt: '2026-03-19',
  },
  {
    id: 'note-2', clientId: 'wavebone', date: '2026-03-18', type: 'A/B TEST RESULT',
    title: 'Emoji in headlines: effective only for under-30 female audiences',
    description: 'Ran 24 parallel A/B tests on emoji usage. Net positive for women 18-29 (+18% CTR), net negative for men 35+ (-12% CTR). Updated targeting matrix accordingly.',
    capabilityTags: [{ skill: 'Precision', delta: 4 }, { skill: 'Exploration', delta: 2 }],
    status: 'published', createdBy: '罗依桐', createdAt: '2026-03-18',
  },
  {
    id: 'note-3', clientId: 'wavebone', date: '2026-03-22', type: 'OPTIMIZATION',
    title: 'LAL 相似人群扩展策略优化',
    description: '将种子人群从付费用户扩展到「连续3天阅读>30分钟」的用户后，CPA 从 $4.50 降至 $3.40，同时保持 ROAS 150%+。',
    capabilityTags: [{ skill: 'Strategy', delta: 4 }],
    status: 'published', createdBy: '陶阳阳', createdAt: '2026-03-22',
  },
  {
    id: 'note-4', clientId: 'gameon', date: '2026-03-20', type: 'LIVE CAMPAIGN',
    title: 'Playable ad completion rate predicts D7 retention',
    description: 'Users who completed the playable ad demo had 2.3x higher D7 retention. Shifted 40% of creative budget to playable formats.',
    capabilityTags: [{ skill: 'Analysis', delta: 6 }, { skill: 'Creativity', delta: 3 }],
    status: 'published', createdBy: '罗依桐', createdAt: '2026-03-20',
  },
  {
    id: 'note-5', clientId: 'gameon', date: '2026-03-24', type: 'A/B TEST RESULT',
    title: 'Weekend vs weekday CPI差异验证',
    description: '周末 CPI 比工作日低 22%，但 D3 留存仅低 3%。建议将 60% 预算集中在周五晚至周日投放。',
    capabilityTags: [{ skill: 'Strategy', delta: 3 }, { skill: 'Precision', delta: 2 }],
    status: 'draft', createdBy: '陶阳阳', createdAt: '2026-03-24',
  },
  {
    id: 'note-6', clientId: 'medplus', date: '2026-03-21', type: 'OPTIMIZATION',
    title: '医疗健康素材合规率提升至 98%',
    description: 'AI 自动审查系统将素材合规率从 82% 提升至 98%，驳回素材中 70% 为夸大疗效描述，已建立行业敏感词库。',
    capabilityTags: [{ skill: 'Compliance', delta: 8 }, { skill: 'Precision', delta: 2 }],
    status: 'published', createdBy: '罗依桐', createdAt: '2026-03-21',
  },
  {
    id: 'note-7', clientId: 'medplus', date: '2026-03-24', type: 'LIVE CAMPAIGN',
    title: 'Patient-story format converts 42% better than product features',
    description: 'Real patient testimonial videos outperform product-feature ads across all channels. Average watch time 2.8x longer, conversion rate 42% higher. Reallocated 60% creative budget to story-driven formats.',
    capabilityTags: [{ skill: 'Creativity', delta: 7 }, { skill: 'Analysis', delta: 3 }],
    status: 'published', createdBy: '罗依桐', createdAt: '2026-03-24',
  },
  {
    id: 'note-8', clientId: 'medplus', date: '2026-03-25', type: 'A/B TEST RESULT',
    title: 'TikTok 健康科普短视频 vs 传统广告: CPA 降低 31%',
    description: '15秒科普短视频（"你知道吗"系列）在 TikTok 上 CPA 仅 $4.80，比传统产品广告低 31%。用户互动率提升 4.2 倍，评论区自然传播带来额外 12% 免费流量。',
    capabilityTags: [{ skill: 'Creativity', delta: 5 }, { skill: 'Exploration', delta: 4 }],
    status: 'draft', createdBy: '陶阳阳', createdAt: '2026-03-25',
  },
  {
    id: 'note-9', clientId: 'quickbuy', date: '2026-03-22', type: 'LIVE CAMPAIGN',
    title: 'Carousel ads beat single-image by 28% on conversion',
    description: 'Lifestyle carousel showing products in real-use scenarios achieved 28% higher conversion than isolated product shots. Best-performing carousel: 4 slides with progressive engagement (hook → benefit → social proof → CTA).',
    capabilityTags: [{ skill: 'Creativity', delta: 4 }, { skill: 'Precision', delta: 3 }],
    status: 'published', createdBy: '陶阳阳', createdAt: '2026-03-22',
  },
  {
    id: 'note-10', clientId: 'quickbuy', date: '2026-03-24', type: 'OPTIMIZATION',
    title: 'Google Shopping feed 优化: ROAS 从 132% 提升至 168%',
    description: '通过优化商品标题（加入长尾关键词）、补全 5 项缺失属性、改善主图质量，Google Shopping ROAS 从 132% 跃升至 168%。Top 3 SKU 贡献了 55% 收入。',
    capabilityTags: [{ skill: 'Strategy', delta: 5 }, { skill: 'Analysis', delta: 3 }],
    status: 'published', createdBy: '罗依桐', createdAt: '2026-03-24',
  },
  {
    id: 'note-11', clientId: 'novelking', date: '2026-03-20', type: 'LIVE CAMPAIGN',
    title: 'Cliffhanger ad copies increase install rate by 67%',
    description: 'Ad copies ending with chapter cliffhangers ("He opened the door and saw...") generated 67% more installs than standard promotional copies. Top genre for this format: suspense/thriller.',
    capabilityTags: [{ skill: 'Creativity', delta: 8 }, { skill: 'Precision', delta: 2 }],
    status: 'published', createdBy: '罗依桐', createdAt: '2026-03-20',
  },
  {
    id: 'note-12', clientId: 'novelking', date: '2026-03-23', type: 'A/B TEST RESULT',
    title: 'Romance cover art: illustrated vs photo-realistic',
    description: 'Illustrated romance covers outperform photo-realistic by 55% CTR for F25-34 audience, but photo-realistic wins for F35-44 (+22%). Age-based creative routing now automated.',
    capabilityTags: [{ skill: 'Precision', delta: 6 }, { skill: 'Exploration', delta: 3 }],
    status: 'published', createdBy: '陶阳阳', createdAt: '2026-03-23',
  },
  {
    id: 'note-13', clientId: 'novelking', date: '2026-03-25', type: 'OPTIMIZATION',
    title: '夜间投放策略: 22:00-01:00 是阅读类 App 黄金时段',
    description: '分析 30 天数据发现 22:00-01:00 时段 CPI 最低（$2.80），D1 留存最高（48%）。将该时段预算占比从 15% 提升至 35%，整体 CPA 下降 18%。',
    capabilityTags: [{ skill: 'Strategy', delta: 6 }, { skill: 'Analysis', delta: 4 }],
    status: 'draft', createdBy: '罗依桐', createdAt: '2026-03-25',
  },
  {
    id: 'note-14', clientId: 'fintech', date: '2026-03-23', type: 'OPTIMIZATION',
    title: '金融行业关键词竞价策略重构',
    description: '将核心词分为品牌词/行业词/竞品词三层，差异化出价。品牌词 CPC 降低 40%，行业词精准匹配 CTR 提升 25%，竞品词防御性投放 ROI 从 0.8 提升至 1.5。',
    capabilityTags: [{ skill: 'Strategy', delta: 7 }, { skill: 'Precision', delta: 4 }],
    status: 'published', createdBy: '罗依桐', createdAt: '2026-03-23',
  },
  {
    id: 'note-15', clientId: 'fintech', date: '2026-03-25', type: 'A/B TEST RESULT',
    title: 'Trust signals in landing page: +38% conversion',
    description: 'Adding security badges, bank partner logos, and real-time user count to landing page increased form completion by 38%. Bounce rate dropped from 62% to 41%.',
    capabilityTags: [{ skill: 'Creativity', delta: 3 }, { skill: 'Analysis', delta: 5 }],
    status: 'draft', createdBy: '陶阳阳', createdAt: '2026-03-25',
  },
  {
    id: 'note-16', clientId: 'wavebone', date: '2026-03-24', type: 'LIVE CAMPAIGN',
    title: 'Push notification re-engagement: dormant readers reactivated at $0.80/user',
    description: 'Personalized "Your bookmarked novel has 3 new chapters" push notifications reactivated 23% of dormant D7+ users at just $0.80 per reactivation. Re-engaged users showed 2.1x higher LTV than fresh installs.',
    capabilityTags: [{ skill: 'Strategy', delta: 5 }, { skill: 'Precision', delta: 4 }],
    status: 'published', createdBy: '陶阳阳', createdAt: '2026-03-24',
  },
  {
    id: 'note-17', clientId: 'gameon', date: '2026-03-22', type: 'OPTIMIZATION',
    title: 'Playable ad 时长从 30s 压缩到 15s: CPI 降 28%',
    description: '将试玩广告从 30 秒精简至 15 秒核心玩法展示，完成率从 34% 提升至 71%，CPI 从 $1.80 降至 $1.30。关键发现: 前 5 秒必须让用户触发第一次交互。',
    capabilityTags: [{ skill: 'Creativity', delta: 6 }, { skill: 'Precision', delta: 4 }],
    status: 'published', createdBy: '罗依桐', createdAt: '2026-03-22',
  },
]

export const clients: Client[] = [
  {
    id: 'wavebone', name: 'Wavebone', industry: '小说/阅读', grade: 'A', phase: 3, status: '测试期 D8', salesOwner: '王斯琼', contact: '张明', phone: '138-2201-8876', email: 'zhangming@wavebone.io', budget: 50000, testBudget: 30000, channels: ['Meta', 'TikTok'],
    onboarding: { currentStepIndex: 8, steps: [
      { key: 'entry', label: '录入', status: 'completed', person: '王斯琼', date: '03-10' },
      { key: 'pool', label: '公海分配', status: 'completed', person: '系统', date: '03-10' },
      { key: 'bd', label: 'BD归属', status: 'completed', person: '王斯琼', date: '03-10' },
      { key: 'contact', label: '建联沟通', status: 'completed', person: '王斯琼', date: '03-11' },
      { key: 'assess', label: '客户摸排', status: 'completed', person: '王斯琼', date: '03-12' },
      { key: 'compliance', label: '合规材料', status: 'completed', person: '陶阳阳', date: '03-12', attachments: [
        { name: '营业执照_wavebone.pdf', type: 'pdf', size: '2.1 MB' },
        { name: '阅读类App运营许可.pdf', type: 'pdf', size: '856 KB' },
      ] },
      { key: 'ops-eval', label: '行运评估', status: 'completed', person: '罗依桐', date: '03-13' },
      { key: 'rating', label: '潜力评级', status: 'completed', person: '王斯琼', date: '03-13' },
      { key: 'plan', label: '计划合作', status: 'completed', person: '王斯琼', date: '03-14' },
    ] },
  },
  {
    id: 'fintech', name: 'FinTech Pro', industry: '金融', grade: 'S', phase: 2, status: 'IO 单审核', salesOwner: '王斯琼', contact: '李伟', phone: '139-0101-6622', email: 'liwei@fintechpro.com', budget: 100000, testBudget: 50000, channels: ['Google Ads', 'Meta'],
    onboarding: { currentStepIndex: 8, steps: [
      { key: 'entry', label: '录入', status: 'completed', person: '王斯琼', date: '03-18' },
      { key: 'pool', label: '公海分配', status: 'completed', person: '系统', date: '03-18' },
      { key: 'bd', label: 'BD归属', status: 'completed', person: '王斯琼', date: '03-18' },
      { key: 'contact', label: '建联沟通', status: 'completed', person: '王斯琼', date: '03-19' },
      { key: 'assess', label: '客户摸排', status: 'completed', person: '王斯琼', date: '03-19' },
      { key: 'compliance', label: '合规材料', status: 'completed', person: '陶阳阳', date: '03-20' },
      { key: 'ops-eval', label: '行运评估', status: 'completed', person: '罗依桐', date: '03-21' },
      { key: 'rating', label: '潜力评级', status: 'completed', person: '王斯琼', date: '03-20' },
      { key: 'plan', label: '计划合作', status: 'completed', person: '王斯琼', date: '03-22' },
    ] },
  },
  {
    id: 'shopmax', name: 'ShopMax', industry: '电商', grade: 'B', phase: 1, status: '合规审查', salesOwner: '王斯琼', contact: '陈丽', phone: '135-7700-4412', email: 'chenli@shopmax.cn', budget: 6000, testBudget: 50000, channels: ['Meta'],
    onboarding: { currentStepIndex: 5, steps: [
      { key: 'entry', label: '录入', status: 'completed', person: '王斯琼', date: '03-22' },
      { key: 'pool', label: '公海分配', status: 'completed', person: '系统', date: '03-22' },
      { key: 'bd', label: 'BD归属', status: 'completed', person: '王斯琼', date: '03-22' },
      { key: 'contact', label: '建联沟通', status: 'completed', person: '王斯琼', date: '03-23' },
      { key: 'assess', label: '客户摸排', status: 'completed', person: '王斯琼', date: '03-24' },
      { key: 'compliance', label: '合规材料', status: 'current', person: '陶阳阳', note: '资质审核中' },
      { key: 'ops-eval', label: '行运评估', status: 'pending' },
      { key: 'rating', label: '潜力评级', status: 'pending' },
      { key: 'plan', label: '计划合作', status: 'pending' },
    ] },
  },
  {
    id: 'gameon', name: 'GameOn', industry: '游戏', grade: 'B', phase: 4, status: '续约评估', salesOwner: '郭晋光', contact: '王军', phone: '186-5522-3301', email: 'wangjun@gameon.gg', budget: 30000, testBudget: 20000, channels: ['Meta', 'TikTok', 'Google Ads'],
    onboarding: { currentStepIndex: 8, steps: [
      { key: 'entry', label: '录入', status: 'completed', person: '郭晋光', date: '02-15' },
      { key: 'pool', label: '公海分配', status: 'completed', person: '系统', date: '02-15' },
      { key: 'bd', label: 'BD归属', status: 'completed', person: '郭晋光', date: '02-15' },
      { key: 'contact', label: '建联沟通', status: 'completed', person: '郭晋光', date: '02-16' },
      { key: 'assess', label: '客户摸排', status: 'completed', person: '郭晋光', date: '02-17' },
      { key: 'compliance', label: '合规材料', status: 'completed', person: '陶阳阳', date: '02-18' },
      { key: 'ops-eval', label: '行运评估', status: 'completed', person: '罗依桐', date: '02-19' },
      { key: 'rating', label: '潜力评级', status: 'completed', person: '郭晋光', date: '02-19' },
      { key: 'plan', label: '计划合作', status: 'completed', person: '郭晋光', date: '02-20' },
    ] },
  },
  {
    id: 'brightpath', name: 'BrightPath', industry: '教育', grade: 'C', phase: 5, status: '终止处理中', salesOwner: '王斯琼', contact: '赵磊', phone: '152-8833-9900', email: 'zhaolei@brightpath.edu', budget: 15000, channels: ['Meta'],
    onboarding: { currentStepIndex: 8, steps: [
      { key: 'entry', label: '录入', status: 'completed', person: '王斯琼', date: '02-15' },
      { key: 'pool', label: '公海分配', status: 'completed', person: '系统', date: '02-15' },
      { key: 'bd', label: 'BD归属', status: 'completed', person: '王斯琼', date: '02-15' },
      { key: 'contact', label: '建联沟通', status: 'completed', person: '王斯琼', date: '02-16' },
      { key: 'assess', label: '客户摸排', status: 'completed', person: '王斯琼', date: '02-16' },
      { key: 'compliance', label: '合规材料', status: 'skipped', note: '教育行业免合规' },
      { key: 'ops-eval', label: '行运评估', status: 'completed', person: '陶阳阳', date: '02-17' },
      { key: 'rating', label: '潜力评级', status: 'completed', person: '王斯琼', date: '02-17' },
      { key: 'plan', label: '计划合作', status: 'completed', person: '王斯琼', date: '02-18' },
    ] },
  },
  {
    id: 'luxevibe', name: 'LuxeVibe', industry: '电商', grade: 'B', phase: 1, status: '资质审查', salesOwner: '王斯琼', contact: '林芳', phone: '131-6699-2200', email: 'linfang@luxevibe.com', budget: 25000, testBudget: 15000, channels: ['Meta', 'TikTok'],
    onboarding: { currentStepIndex: 4, steps: [
      { key: 'entry', label: '录入', status: 'completed', person: '王斯琼', date: '03-23' },
      { key: 'pool', label: '公海分配', status: 'completed', person: '系统', date: '03-23' },
      { key: 'bd', label: 'BD归属', status: 'completed', person: '王斯琼', date: '03-23' },
      { key: 'contact', label: '建联沟通', status: 'completed', person: '王斯琼', date: '03-24' },
      { key: 'assess', label: '客户摸排', status: 'current', person: '王斯琼', note: '品牌资质核验中' },
      { key: 'compliance', label: '合规材料', status: 'pending' },
      { key: 'ops-eval', label: '行运评估', status: 'pending' },
      { key: 'rating', label: '潜力评级', status: 'pending' },
      { key: 'plan', label: '计划合作', status: 'pending' },
    ] },
  },
  {
    id: 'readnow', name: 'ReadNow', industry: '小说/阅读', grade: 'A', phase: 2, status: '资产准备', salesOwner: '郭晋光', contact: '周华', phone: '188-2233-5577', email: 'zhouhua@readnow.app', budget: 30000, testBudget: 20000, channels: ['Meta', 'TikTok'],
    onboarding: { currentStepIndex: 8, steps: [
      { key: 'entry', label: '录入', status: 'completed', person: '郭晋光', date: '03-20' },
      { key: 'pool', label: '公海分配', status: 'completed', person: '系统', date: '03-20' },
      { key: 'bd', label: 'BD归属', status: 'completed', person: '郭晋光', date: '03-20' },
      { key: 'contact', label: '建联沟通', status: 'completed', person: '郭晋光', date: '03-21' },
      { key: 'assess', label: '客户摸排', status: 'completed', person: '郭晋光', date: '03-21' },
      { key: 'compliance', label: '合规材料', status: 'completed', person: '陶阳阳', date: '03-22' },
      { key: 'ops-eval', label: '行运评估', status: 'completed', person: '罗依桐', date: '03-22' },
      { key: 'rating', label: '潜力评级', status: 'completed', person: '郭晋光', date: '03-22' },
      { key: 'plan', label: '计划合作', status: 'completed', person: '郭晋光', date: '03-23' },
    ] },
  },
  {
    id: 'payeasy', name: 'PayEasy', industry: '金融', grade: 'S', phase: 2, status: '打款中', salesOwner: '王斯琼', contact: '吴强', phone: '137-0011-8899', email: 'wuqiang@payeasy.com', budget: 80000, testBudget: 50000, channels: ['Google Ads'],
    onboarding: { currentStepIndex: 8, steps: [
      { key: 'entry', label: '录入', status: 'completed', person: '王斯琼', date: '03-12' },
      { key: 'pool', label: '公海分配', status: 'completed', person: '系统', date: '03-12' },
      { key: 'bd', label: 'BD归属', status: 'completed', person: '王斯琼', date: '03-12' },
      { key: 'contact', label: '建联沟通', status: 'completed', person: '王斯琼', date: '03-13' },
      { key: 'assess', label: '客户摸排', status: 'completed', person: '王斯琼', date: '03-14' },
      { key: 'compliance', label: '合规材料', status: 'completed', person: '陶阳阳', date: '03-15' },
      { key: 'ops-eval', label: '行运评估', status: 'completed', person: '罗依桐', date: '03-16' },
      { key: 'rating', label: '潜力评级', status: 'completed', person: '王斯琼', date: '03-15' },
      { key: 'plan', label: '计划合作', status: 'completed', person: '王斯琼', date: '03-17' },
    ] },
  },
  {
    id: 'travelgo', name: 'TravelGo', industry: '旅游', grade: 'B', phase: 2, status: '测试计划', salesOwner: '郭晋光', contact: '黄丽', phone: '155-3344-7788', email: 'huangli@travelgo.cn', budget: 20000, testBudget: 10000, channels: ['Meta'],
    onboarding: { currentStepIndex: 8, steps: [
      { key: 'entry', label: '录入', status: 'completed', person: '郭晋光', date: '03-18' },
      { key: 'pool', label: '公海分配', status: 'completed', person: '系统', date: '03-18' },
      { key: 'bd', label: 'BD归属', status: 'completed', person: '郭晋光', date: '03-18' },
      { key: 'contact', label: '建联沟通', status: 'completed', person: '郭晋光', date: '03-19' },
      { key: 'assess', label: '客户摸排', status: 'completed', person: '郭晋光', date: '03-20' },
      { key: 'compliance', label: '合规材料', status: 'skipped', note: '旅游行业免合规' },
      { key: 'ops-eval', label: '行运评估', status: 'completed', person: '陶阳阳', date: '03-20' },
      { key: 'rating', label: '潜力评级', status: 'completed', person: '郭晋光', date: '03-20' },
      { key: 'plan', label: '计划合作', status: 'completed', person: '郭晋光', date: '03-21' },
    ] },
  },
  {
    id: 'quickbuy', name: 'QuickBuy', industry: '电商', grade: 'B', phase: 3, status: '测试期 D3', salesOwner: '郭晋光', contact: '刘峰', phone: '180-4455-6677', email: 'liufeng@quickbuy.shop', budget: 25000, testBudget: 15000, channels: ['Meta', 'Google Ads'],
    onboarding: { currentStepIndex: 8, steps: [
      { key: 'entry', label: '录入', status: 'completed', person: '郭晋光', date: '03-15' },
      { key: 'pool', label: '公海分配', status: 'completed', person: '系统', date: '03-15' },
      { key: 'bd', label: 'BD归属', status: 'completed', person: '郭晋光', date: '03-15' },
      { key: 'contact', label: '建联沟通', status: 'completed', person: '郭晋光', date: '03-16' },
      { key: 'assess', label: '客户摸排', status: 'completed', person: '郭晋光', date: '03-17' },
      { key: 'compliance', label: '合规材料', status: 'completed', person: '陶阳阳', date: '03-17' },
      { key: 'ops-eval', label: '行运评估', status: 'completed', person: '罗依桐', date: '03-18' },
      { key: 'rating', label: '潜力评级', status: 'completed', person: '郭晋光', date: '03-18' },
      { key: 'plan', label: '计划合作', status: 'completed', person: '郭晋光', date: '03-19' },
    ] },
  },
  {
    id: 'medplus', name: 'MedPlus', industry: '医疗健康', grade: 'S', phase: 3, status: '测试期 D11', salesOwner: '王斯琼', contact: '孙丽', phone: '139-8899-1100', email: 'sunli@medplus.health', budget: 60000, testBudget: 35000, channels: ['Meta', 'TikTok'],
    onboarding: { currentStepIndex: 8, steps: [
      { key: 'entry', label: '录入', status: 'completed', person: '王斯琼', date: '03-05' },
      { key: 'pool', label: '公海分配', status: 'completed', person: '系统', date: '03-05' },
      { key: 'bd', label: 'BD归属', status: 'completed', person: '王斯琼', date: '03-05' },
      { key: 'contact', label: '建联沟通', status: 'completed', person: '王斯琼', date: '03-06' },
      { key: 'assess', label: '客户摸排', status: 'completed', person: '王斯琼', date: '03-07' },
      { key: 'compliance', label: '合规材料', status: 'completed', person: '陶阳阳', date: '03-08' },
      { key: 'ops-eval', label: '行运评估', status: 'completed', person: '罗依桐', date: '03-09' },
      { key: 'rating', label: '潜力评级', status: 'completed', person: '王斯琼', date: '03-09' },
      { key: 'plan', label: '计划合作', status: 'completed', person: '王斯琼', date: '03-10' },
    ] },
  },
  {
    id: 'novelking', name: 'NovelKing', industry: '小说/阅读', grade: 'A', phase: 4, status: '已续约', salesOwner: '王斯琼', contact: '郑伟', phone: '136-5566-7788', email: 'zhengwei@novelking.com', budget: 50000, testBudget: 30000, channels: ['Meta', 'TikTok', 'Google Ads'],
    onboarding: { currentStepIndex: 8, steps: [
      { key: 'entry', label: '录入', status: 'completed', person: '王斯琼', date: '02-01' },
      { key: 'pool', label: '公海分配', status: 'completed', person: '系统', date: '02-01' },
      { key: 'bd', label: 'BD归属', status: 'completed', person: '王斯琼', date: '02-01' },
      { key: 'contact', label: '建联沟通', status: 'completed', person: '王斯琼', date: '02-02' },
      { key: 'assess', label: '客户摸排', status: 'completed', person: '王斯琼', date: '02-03' },
      { key: 'compliance', label: '合规材料', status: 'completed', person: '陶阳阳', date: '02-04' },
      { key: 'ops-eval', label: '行运评估', status: 'completed', person: '罗依桐', date: '02-05' },
      { key: 'rating', label: '潜力评级', status: 'completed', person: '王斯琼', date: '02-05' },
      { key: 'plan', label: '计划合作', status: 'completed', person: '王斯琼', date: '02-06' },
    ] },
  },
]

/* ── IO Order Types ── */

export type IOOrderStatus = '审批中' | '待打款' | '已打款' | '投放中' | '已完成' | '终止退款中' | '已终止' | '已退款'
export type IOOrderType = '新建投放' | '变更需求' | '终止退款'

export type IOOrder = {
  id: string
  clientId: string
  clientName: string
  type: IOOrderType
  status: IOOrderStatus
  amount: number
  period: string
  channels: string[]
  createdAt: string
  createdBy: string
  approvals: { role: string; person: string; status: 'approved' | 'pending' | 'rejected'; date?: string }[]
  fullApprovalChain?: ApprovalStep[]
  /* termination specific */
  terminationReason?: string
  terminationType?: string
  refundAmount?: number
  consumed?: number
  serviceFee?: number
  /* detail fields (matching creation form) */
  objective?: string
  description?: string
  ownerName?: string
  ownerRole?: string
  startDate?: string
  endDate?: string
  duration?: number
  relatedDoc?: string
}

export const ioOrders: IOOrder[] = [
  {
    id: 'IO-2026-001', clientId: 'wavebone', clientName: 'Wavebone', type: '新建投放',
    status: '投放中', amount: 30000, period: '2026-03-18 ~ 2026-04-01', channels: ['Meta', 'TikTok'],
    createdAt: '2026-03-15', createdBy: '王斯琼',
    objective: '效果转化', description: '北美市场阅读APP获客，核心关注CPA与ROAS', ownerName: '罗依桐', ownerRole: '投手', startDate: '2026-03-18', endDate: '2026-04-01', duration: 14, relatedDoc: '框架协议',
    approvals: [
      { role: '销售', person: '王斯琼', status: 'approved', date: '03-15' },
      { role: '运营', person: '罗依桐', status: 'approved', date: '03-15' },
      { role: '财务', person: '明虎', status: 'approved', date: '03-16' },
    ],
    fullApprovalChain: [
      { key: 'submit', label: 'IO单提交', status: 'completed', person: '王斯琼', date: '03-15' },
      { key: 'contract', label: '签约确认', status: 'completed', person: '王斯琼', date: '03-15', attachments: [
        { name: 'Wavebone_IO合同_2026Q1.pdf', type: 'pdf', size: '1.8 MB' },
      ] },
      { key: 'payment-req', label: '客户催款', status: 'completed', person: '王斯琼', date: '03-15' },
      { key: 'subsidy', label: '补贴评估', status: 'skipped', note: '无需补贴' },
      { key: 'ceo', label: 'CEO审批', status: 'completed', person: '张总', date: '03-15' },
      { key: 'finance', label: '财务打款', status: 'completed', person: '明虎', date: '03-16', attachments: [
        { name: '打款凭证_wavebone_0316.png', type: 'image', size: '320 KB' },
      ] },
      { key: 'asset-bind', label: '资产绑定', status: 'completed', person: '陶阳阳', date: '03-17', attachments: [
        { name: 'Meta账户绑定截图.jpg', type: 'image', size: '186 KB' },
      ] },
      { key: 'test-plan', label: '测试期计划', status: 'completed', person: '罗依桐', date: '03-17' },
      { key: 'launch', label: '投放启动', status: 'completed', person: '罗依桐', date: '03-18' },
    ],
  },
  {
    id: 'IO-2026-002', clientId: 'fintech', clientName: 'FinTech Pro', type: '新建投放',
    status: '审批中', amount: 50000, period: '2026-04-01 ~ 2026-04-14', channels: ['Google Ads', 'Meta'],
    createdAt: '2026-03-24', createdBy: '王斯琼',
    objective: '用户增长', description: '金融行业海外用户拓展，需额外牌照审核', ownerName: '郭晋光', ownerRole: '运营', startDate: '2026-04-01', endDate: '2026-04-14', duration: 14, relatedDoc: '框架协议',
    approvals: [
      { role: '销售', person: '王斯琼', status: 'approved', date: '03-24' },
      { role: '运营', person: '郭晋光', status: 'pending' },
      { role: '财务', person: '明虎', status: 'pending' },
    ],
    fullApprovalChain: [
      { key: 'submit', label: 'IO单提交', status: 'completed', person: '王斯琼', date: '03-24' },
      { key: 'contract', label: '签约确认', status: 'completed', person: '王斯琼', date: '03-24' },
      { key: 'payment-req', label: '客户催款', status: 'current', person: '王斯琼', note: '等待客户确认付款' },
      { key: 'subsidy', label: '补贴评估', status: 'pending' },
      { key: 'ceo', label: 'CEO审批', status: 'pending' },
      { key: 'finance', label: '财务打款', status: 'pending' },
      { key: 'asset-bind', label: '资产绑定', status: 'pending' },
      { key: 'test-plan', label: '测试期计划', status: 'pending' },
      { key: 'launch', label: '投放启动', status: 'pending' },
    ],
  },
  {
    id: 'IO-2026-003', clientId: 'payeasy', clientName: 'PayEasy', type: '新建投放',
    status: '待打款', amount: 80000, period: '2026-04-01 ~ 2026-04-14', channels: ['Google Ads'],
    createdAt: '2026-03-20', createdBy: '王斯琼',
    objective: '用户增长', description: '支付工具推广，核心市场东南亚', ownerName: '罗依桐', ownerRole: '投手', startDate: '2026-04-01', endDate: '2026-04-14', duration: 14, relatedDoc: '框架协议',
    approvals: [
      { role: '销售', person: '王斯琼', status: 'approved', date: '03-20' },
      { role: '运营', person: '罗依桐', status: 'approved', date: '03-21' },
      { role: '财务', person: '明虎', status: 'pending' },
    ],
    fullApprovalChain: [
      { key: 'submit', label: 'IO单提交', status: 'completed', person: '王斯琼', date: '03-20' },
      { key: 'contract', label: '签约确认', status: 'completed', person: '王斯琼', date: '03-20' },
      { key: 'payment-req', label: '客户催款', status: 'completed', person: '王斯琼', date: '03-20' },
      { key: 'subsidy', label: '补贴评估', status: 'skipped', note: 'S级客户免补贴评估' },
      { key: 'ceo', label: 'CEO审批', status: 'completed', person: '张总', date: '03-21' },
      { key: 'finance', label: '财务打款', status: 'current', person: '明虎', note: '打款处理中' },
      { key: 'asset-bind', label: '资产绑定', status: 'pending' },
      { key: 'test-plan', label: '测试期计划', status: 'pending' },
      { key: 'launch', label: '投放启动', status: 'pending' },
    ],
  },
  {
    id: 'IO-2026-004', clientId: 'medplus', clientName: 'MedPlus', type: '新建投放',
    status: '投放中', amount: 35000, period: '2026-03-15 ~ 2026-03-29', channels: ['Meta', 'TikTok'],
    createdAt: '2026-03-12', createdBy: '王斯琼',
    objective: '效果转化', description: '医疗健康APP海外推广，高风险行业需合规配合', ownerName: '罗依桐', ownerRole: '投手', startDate: '2026-03-15', endDate: '2026-03-29', duration: 14, relatedDoc: '补充协议',
    approvals: [
      { role: '销售', person: '王斯琼', status: 'approved', date: '03-12' },
      { role: '运营', person: '罗依桐', status: 'approved', date: '03-13' },
      { role: '财务', person: '明虎', status: 'approved', date: '03-14' },
    ],
    fullApprovalChain: [
      { key: 'submit', label: 'IO单提交', status: 'completed', person: '王斯琼', date: '03-12' },
      { key: 'contract', label: '签约确认', status: 'completed', person: '王斯琼', date: '03-12', attachments: [
        { name: 'MedPlus_投放合同_v2.pdf', type: 'pdf', size: '2.3 MB' },
      ] },
      { key: 'payment-req', label: '客户催款', status: 'completed', person: '王斯琼', date: '03-12' },
      { key: 'subsidy', label: '补贴评估', status: 'completed', person: '罗依桐', date: '03-13', attachments: [
        { name: '补贴评估报告_MedPlus.pdf', type: 'pdf', size: '456 KB' },
      ] },
      { key: 'ceo', label: 'CEO审批', status: 'completed', person: '张总', date: '03-13' },
      { key: 'finance', label: '财务打款', status: 'completed', person: '明虎', date: '03-14', attachments: [
        { name: '打款凭证_medplus_0314.png', type: 'image', size: '285 KB' },
      ] },
      { key: 'asset-bind', label: '资产绑定', status: 'completed', person: '陶阳阳', date: '03-14' },
      { key: 'test-plan', label: '测试期计划', status: 'completed', person: '罗依桐', date: '03-14' },
      { key: 'launch', label: '投放启动', status: 'completed', person: '罗依桐', date: '03-15' },
    ],
  },
  {
    id: 'IO-2026-005', clientId: 'gameon', clientName: 'GameOn', type: '变更需求',
    status: '审批中', amount: 5000, period: '2026-03-25 ~ 2026-04-01', channels: ['Meta'],
    createdAt: '2026-03-25', createdBy: '郭晋光',
    objective: '效果转化', description: 'TikTok新渠道追加测试预算', ownerName: '罗依桐', ownerRole: '投手', startDate: '2026-03-25', endDate: '2026-04-01', duration: 7, relatedDoc: '补充协议',
    approvals: [
      { role: '销售', person: '郭晋光', status: 'approved', date: '03-25' },
      { role: '运营', person: '罗依桐', status: 'pending' },
      { role: '财务', person: '明虎', status: 'pending' },
    ],
    fullApprovalChain: [
      { key: 'submit', label: 'IO单提交', status: 'completed', person: '郭晋光', date: '03-25' },
      { key: 'contract', label: '签约确认', status: 'current', person: '郭晋光', note: '变更签约确认中' },
      { key: 'payment-req', label: '客户催款', status: 'pending' },
      { key: 'subsidy', label: '补贴评估', status: 'pending' },
      { key: 'ceo', label: 'CEO审批', status: 'pending' },
      { key: 'finance', label: '财务打款', status: 'pending' },
      { key: 'asset-bind', label: '资产绑定', status: 'pending' },
      { key: 'test-plan', label: '测试期计划', status: 'pending' },
      { key: 'launch', label: '投放启动', status: 'pending' },
    ],
  },
  {
    id: 'IO-2026-006', clientId: 'quickbuy', clientName: 'QuickBuy', type: '新建投放',
    status: '投放中', amount: 15000, period: '2026-03-23 ~ 2026-04-06', channels: ['Meta', 'Google Ads'],
    createdAt: '2026-03-20', createdBy: '郭晋光',
    objective: '效果转化', description: '电商行业获客投放，多渠道测试策略', ownerName: '罗依桐', ownerRole: '投手', startDate: '2026-03-23', endDate: '2026-04-06', duration: 14, relatedDoc: '框架协议',
    approvals: [
      { role: '销售', person: '郭晋光', status: 'approved', date: '03-20' },
      { role: '运营', person: '罗依桐', status: 'approved', date: '03-21' },
      { role: '财务', person: '明虎', status: 'approved', date: '03-22' },
    ],
    fullApprovalChain: [
      { key: 'submit', label: 'IO单提交', status: 'completed', person: '郭晋光', date: '03-20' },
      { key: 'contract', label: '签约确认', status: 'completed', person: '郭晋光', date: '03-20' },
      { key: 'payment-req', label: '客户催款', status: 'completed', person: '郭晋光', date: '03-20' },
      { key: 'subsidy', label: '补贴评估', status: 'skipped', note: '无需补贴' },
      { key: 'ceo', label: 'CEO审批', status: 'completed', person: '张总', date: '03-21' },
      { key: 'finance', label: '财务打款', status: 'completed', person: '明虎', date: '03-22' },
      { key: 'asset-bind', label: '资产绑定', status: 'completed', person: '陶阳阳', date: '03-22' },
      { key: 'test-plan', label: '测试期计划', status: 'completed', person: '罗依桐', date: '03-22' },
      { key: 'launch', label: '投放启动', status: 'completed', person: '罗依桐', date: '03-23' },
    ],
  },
  {
    id: 'IO-2026-007', clientId: 'novelking', clientName: 'NovelKing', type: '新建投放',
    status: '已完成', amount: 30000, period: '2026-02-15 ~ 2026-03-15', channels: ['Meta', 'TikTok'],
    createdAt: '2026-02-10', createdBy: '王斯琼',
    objective: '效果转化', description: '小说阅读APP海外获客，已完成测试期', ownerName: '罗依桐', ownerRole: '投手', startDate: '2026-02-15', endDate: '2026-03-15', duration: 28, relatedDoc: '续约协议',
    approvals: [
      { role: '销售', person: '王斯琼', status: 'approved', date: '02-10' },
      { role: '运营', person: '罗依桐', status: 'approved', date: '02-11' },
      { role: '财务', person: '明虎', status: 'approved', date: '02-12' },
    ],
    fullApprovalChain: [
      { key: 'submit', label: 'IO单提交', status: 'completed', person: '王斯琼', date: '02-10' },
      { key: 'contract', label: '签约确认', status: 'completed', person: '王斯琼', date: '02-10' },
      { key: 'payment-req', label: '客户催款', status: 'completed', person: '王斯琼', date: '02-10' },
      { key: 'subsidy', label: '补贴评估', status: 'skipped', note: '无需补贴' },
      { key: 'ceo', label: 'CEO审批', status: 'completed', person: '张总', date: '02-11' },
      { key: 'finance', label: '财务打款', status: 'completed', person: '明虎', date: '02-12' },
      { key: 'asset-bind', label: '资产绑定', status: 'completed', person: '陶阳阳', date: '02-13' },
      { key: 'test-plan', label: '测试期计划', status: 'completed', person: '罗依桐', date: '02-13' },
      { key: 'launch', label: '投放启动', status: 'completed', person: '罗依桐', date: '02-15' },
    ],
  },
  /* ── New IO orders for previously missing clients ── */
  {
    id: 'IO-2026-008', clientId: 'brightpath', clientName: 'BrightPath', type: '终止退款',
    status: '终止退款中', amount: 15000, period: '2026-02-20 ~ 2026-03-20', channels: ['Meta'],
    createdAt: '2026-03-22', createdBy: '王斯琼',
    objective: '品牌曝光', description: '教育行业推广，因效果不达标终止', ownerName: '陶阳阳', ownerRole: '投手', startDate: '2026-02-20', endDate: '2026-03-20', duration: 28, relatedDoc: '框架协议',
    terminationType: '效果不达标', terminationReason: '测试期 CPA 持续高于目标值 40%，客户沟通后决定终止',
    refundAmount: 8750, consumed: 4500, serviceFee: 675,
    approvals: [
      { role: '销售', person: '王斯琼', status: 'approved', date: '03-22' },
      { role: '运营', person: '陶阳阳', status: 'approved', date: '03-23' },
      { role: '财务', person: '明虎', status: 'pending' },
    ],
    fullApprovalChain: [
      { key: 'submit', label: 'IO单提交', status: 'completed', person: '王斯琼', date: '03-22' },
      { key: 'contract', label: '签约确认', status: 'completed', person: '王斯琼', date: '03-22' },
      { key: 'payment-req', label: '客户催款', status: 'completed', person: '王斯琼', date: '03-22' },
      { key: 'subsidy', label: '补贴评估', status: 'skipped' },
      { key: 'ceo', label: 'CEO审批', status: 'completed', person: '张总', date: '03-23' },
      { key: 'finance', label: '财务打款', status: 'current', person: '明虎', note: '退款处理中' },
      { key: 'asset-bind', label: '资产绑定', status: 'pending' },
      { key: 'test-plan', label: '测试期计划', status: 'pending' },
      { key: 'launch', label: '投放启动', status: 'pending' },
    ],
  },
  {
    id: 'IO-2026-009', clientId: 'readnow', clientName: 'ReadNow', type: '新建投放',
    status: '审批中', amount: 20000, period: '2026-04-01 ~ 2026-04-14', channels: ['Meta', 'TikTok'],
    createdAt: '2026-03-25', createdBy: '郭晋光',
    objective: '用户增长', description: '阅读APP新客获取，双渠道同步测试', ownerName: '罗依桐', ownerRole: '投手', startDate: '2026-04-01', endDate: '2026-04-14', duration: 14, relatedDoc: '框架协议',
    approvals: [
      { role: '销售', person: '郭晋光', status: 'approved', date: '03-25' },
      { role: '运营', person: '罗依桐', status: 'pending' },
      { role: '财务', person: '明虎', status: 'pending' },
    ],
    fullApprovalChain: [
      { key: 'submit', label: 'IO单提交', status: 'completed', person: '郭晋光', date: '03-25' },
      { key: 'contract', label: '签约确认', status: 'current', person: '郭晋光', note: '等待客户签约' },
      { key: 'payment-req', label: '客户催款', status: 'pending' },
      { key: 'subsidy', label: '补贴评估', status: 'pending' },
      { key: 'ceo', label: 'CEO审批', status: 'pending' },
      { key: 'finance', label: '财务打款', status: 'pending' },
      { key: 'asset-bind', label: '资产绑定', status: 'pending' },
      { key: 'test-plan', label: '测试期计划', status: 'pending' },
      { key: 'launch', label: '投放启动', status: 'pending' },
    ],
  },
  {
    id: 'IO-2026-010', clientId: 'travelgo', clientName: 'TravelGo', type: '新建投放',
    status: '待打款', amount: 10000, period: '2026-04-05 ~ 2026-04-19', channels: ['Meta'],
    createdAt: '2026-03-23', createdBy: '郭晋光',
    approvals: [
      { role: '销售', person: '郭晋光', status: 'approved', date: '03-23' },
      { role: '运营', person: '陶阳阳', status: 'approved', date: '03-24' },
      { role: '财务', person: '明虎', status: 'pending' },
    ],
    fullApprovalChain: [
      { key: 'submit', label: 'IO单提交', status: 'completed', person: '郭晋光', date: '03-23' },
      { key: 'contract', label: '签约确认', status: 'completed', person: '郭晋光', date: '03-23' },
      { key: 'payment-req', label: '客户催款', status: 'completed', person: '郭晋光', date: '03-24' },
      { key: 'subsidy', label: '补贴评估', status: 'skipped', note: '无需补贴' },
      { key: 'ceo', label: 'CEO审批', status: 'completed', person: '张总', date: '03-24' },
      { key: 'finance', label: '财务打款', status: 'current', person: '明虎', note: '待打款确认' },
      { key: 'asset-bind', label: '资产绑定', status: 'pending' },
      { key: 'test-plan', label: '测试期计划', status: 'pending' },
      { key: 'launch', label: '投放启动', status: 'pending' },
    ],
  },
  {
    id: 'IO-2026-011', clientId: 'luxevibe', clientName: 'LuxeVibe', type: '新建投放',
    status: '审批中', amount: 15000, period: '2026-04-10 ~ 2026-04-24', channels: ['Meta', 'TikTok'],
    createdAt: '2026-03-26', createdBy: '王斯琼',
    approvals: [
      { role: '销售', person: '王斯琼', status: 'approved', date: '03-26' },
      { role: '运营', person: '罗依桐', status: 'pending' },
      { role: '财务', person: '明虎', status: 'pending' },
    ],
    fullApprovalChain: [
      { key: 'submit', label: 'IO单提交', status: 'completed', person: '王斯琼', date: '03-26' },
      { key: 'contract', label: '签约确认', status: 'current', person: '王斯琼', note: '等待签约' },
      { key: 'payment-req', label: '客户催款', status: 'pending' },
      { key: 'subsidy', label: '补贴评估', status: 'pending' },
      { key: 'ceo', label: 'CEO审批', status: 'pending' },
      { key: 'finance', label: '财务打款', status: 'pending' },
      { key: 'asset-bind', label: '资产绑定', status: 'pending' },
      { key: 'test-plan', label: '测试期计划', status: 'pending' },
      { key: 'launch', label: '投放启动', status: 'pending' },
    ],
  },
  {
    id: 'IO-2026-012', clientId: 'shopmax', clientName: 'ShopMax', type: '新建投放',
    status: '审批中', amount: 10000, period: '2026-04-08 ~ 2026-04-22', channels: ['Meta'],
    createdAt: '2026-03-26', createdBy: '王斯琼',
    approvals: [
      { role: '销售', person: '王斯琼', status: 'approved', date: '03-26' },
      { role: '运营', person: '陶阳阳', status: 'pending' },
      { role: '财务', person: '明虎', status: 'pending' },
    ],
    fullApprovalChain: [
      { key: 'submit', label: 'IO单提交', status: 'completed', person: '王斯琼', date: '03-26' },
      { key: 'contract', label: '签约确认', status: 'completed', person: '王斯琼', date: '03-26' },
      { key: 'payment-req', label: '客户催款', status: 'current', person: '王斯琼', note: '等待客户付款' },
      { key: 'subsidy', label: '补贴评估', status: 'pending' },
      { key: 'ceo', label: 'CEO审批', status: 'pending' },
      { key: 'finance', label: '财务打款', status: 'pending' },
      { key: 'asset-bind', label: '资产绑定', status: 'pending' },
      { key: 'test-plan', label: '测试期计划', status: 'pending' },
      { key: 'launch', label: '投放启动', status: 'pending' },
    ],
  },
  {
    id: 'IO-2026-013', clientId: 'gameon', clientName: 'GameOn', type: '新建投放',
    status: '投放中', amount: 20000, period: '2026-03-01 ~ 2026-03-28', channels: ['Meta', 'TikTok', 'Google Ads'],
    createdAt: '2026-02-25', createdBy: '郭晋光',
    approvals: [
      { role: '销售', person: '郭晋光', status: 'approved', date: '02-25' },
      { role: '运营', person: '罗依桐', status: 'approved', date: '02-26' },
      { role: '财务', person: '明虎', status: 'approved', date: '02-27' },
    ],
    fullApprovalChain: [
      { key: 'submit', label: 'IO单提交', status: 'completed', person: '郭晋光', date: '02-25' },
      { key: 'contract', label: '签约确认', status: 'completed', person: '郭晋光', date: '02-25' },
      { key: 'payment-req', label: '客户催款', status: 'completed', person: '郭晋光', date: '02-25' },
      { key: 'subsidy', label: '补贴评估', status: 'skipped', note: '无需补贴' },
      { key: 'ceo', label: 'CEO审批', status: 'completed', person: '张总', date: '02-26' },
      { key: 'finance', label: '财务打款', status: 'completed', person: '明虎', date: '02-27' },
      { key: 'asset-bind', label: '资产绑定', status: 'completed', person: '陶阳阳', date: '02-28' },
      { key: 'test-plan', label: '测试期计划', status: 'completed', person: '罗依桐', date: '02-28' },
      { key: 'launch', label: '投放启动', status: 'completed', person: '罗依桐', date: '03-01' },
    ],
  },
  {
    id: 'IO-2026-014', clientId: 'novelking', clientName: 'NovelKing', type: '新建投放',
    status: '待打款', amount: 50000, period: '2026-04-01 ~ 2026-04-30', channels: ['Meta', 'TikTok', 'Google Ads'],
    createdAt: '2026-03-20', createdBy: '王斯琼',
    approvals: [
      { role: '销售', person: '王斯琼', status: 'approved', date: '03-20' },
      { role: '运营', person: '罗依桐', status: 'approved', date: '03-21' },
      { role: '财务', person: '明虎', status: 'pending' },
    ],
    fullApprovalChain: [
      { key: 'submit', label: 'IO单提交', status: 'completed', person: '王斯琼', date: '03-20' },
      { key: 'contract', label: '签约确认', status: 'completed', person: '王斯琼', date: '03-20' },
      { key: 'payment-req', label: '客户催款', status: 'completed', person: '王斯琼', date: '03-21' },
      { key: 'subsidy', label: '补贴评估', status: 'skipped', note: '续约客户免补贴' },
      { key: 'ceo', label: 'CEO审批', status: 'completed', person: '张总', date: '03-21' },
      { key: 'finance', label: '财务打款', status: 'current', person: '明虎', note: '待打款' },
      { key: 'asset-bind', label: '资产绑定', status: 'pending' },
      { key: 'test-plan', label: '测试期计划', status: 'pending' },
      { key: 'launch', label: '投放启动', status: 'pending' },
    ],
  },
]

/* ── Finance Types ── */

export type FinanceItem = {
  id: string
  ioOrderId: string
  clientId: string
  clientName: string
  type: '收款' | '退款'
  amount: number
  status: '待确认' | '已确认' | '已打款' | '已退款'
  requestDate: string
  confirmDate?: string
  operator?: string
  note?: string
  /* refund details */
  totalCharged?: number
  consumed?: number
  serviceFee?: number
}

export const financeItems: FinanceItem[] = [
  {
    id: 'FIN-001', ioOrderId: 'IO-2026-003', clientId: 'payeasy', clientName: 'PayEasy',
    type: '收款', amount: 80000, status: '待确认', requestDate: '2026-03-22',
    note: '金融行业 S 级客户，优先处理',
  },
  {
    id: 'FIN-002', ioOrderId: 'IO-2026-001', clientId: 'wavebone', clientName: 'Wavebone',
    type: '收款', amount: 30000, status: '已确认', requestDate: '2026-03-15', confirmDate: '2026-03-16', operator: '明虎',
  },
  {
    id: 'FIN-003', ioOrderId: 'IO-2026-004', clientId: 'medplus', clientName: 'MedPlus',
    type: '收款', amount: 35000, status: '已确认', requestDate: '2026-03-13', confirmDate: '2026-03-14', operator: '明虎',
  },
  {
    id: 'FIN-004', ioOrderId: 'IO-2026-006', clientId: 'quickbuy', clientName: 'QuickBuy',
    type: '收款', amount: 15000, status: '已确认', requestDate: '2026-03-21', confirmDate: '2026-03-22', operator: '明虎',
  },
  {
    id: 'FIN-005', ioOrderId: 'IO-2026-010', clientId: 'travelgo', clientName: 'TravelGo',
    type: '收款', amount: 10000, status: '待确认', requestDate: '2026-03-25',
    note: '旅游行业新客户首单',
  },
  {
    id: 'FIN-006', ioOrderId: 'IO-2026-013', clientId: 'gameon', clientName: 'GameOn',
    type: '收款', amount: 20000, status: '已确认', requestDate: '2026-02-26', confirmDate: '2026-02-27', operator: '明虎',
  },
  {
    id: 'FIN-007', ioOrderId: 'IO-2026-014', clientId: 'novelking', clientName: 'NovelKing',
    type: '收款', amount: 50000, status: '待确认', requestDate: '2026-03-22',
    note: '续约打款，A 级客户月度 $50K',
  },
  {
    id: 'FIN-008', ioOrderId: 'IO-2026-007', clientId: 'novelking', clientName: 'NovelKing',
    type: '收款', amount: 30000, status: '已确认', requestDate: '2026-02-11', confirmDate: '2026-02-12', operator: '明虎',
  },
]

/* ── Change Log Types ── */

export type ChangeLog = {
  id: string
  clientId: string
  timestamp: string
  operator: string
  category: '基本信息' | 'IO 单' | '投放' | '财务' | '合规' | '终止'
  action: string
  detail: string
  attachment?: string
}

export const changeLogs: ChangeLog[] = [
  /* ── Wavebone (A, Phase 3: 测试期 D8) ── */
  { id: 'log-1', clientId: 'wavebone', timestamp: '2026-03-25 14:30', operator: '罗依桐', category: '投放', action: '调整出价', detail: '将 Meta 广告组 CPA 出价从 $4.50 调整为 $3.80，预计提升 ROI 15%' },
  { id: 'log-2', clientId: 'wavebone', timestamp: '2026-03-22 10:00', operator: '陶阳阳', category: '投放', action: '启动投放', detail: '测试期投放正式启动，预算 $30,000，周期 14 天，目标 CPA ≤ $4.00' },
  { id: 'log-3', clientId: 'wavebone', timestamp: '2026-03-16 09:00', operator: '明虎', category: '财务', action: '打款确认', detail: '确认收到 $30,000 打款，IO 单 IO-2026-001，已通知投手团队准备素材' },
  { id: 'log-4', clientId: 'wavebone', timestamp: '2026-03-15 16:20', operator: '王斯琼', category: 'IO 单', action: '提交 IO 单', detail: '新建投放 IO 单 IO-2026-001，金额 $30,000，渠道 Meta + TikTok' },
  { id: 'log-5', clientId: 'wavebone', timestamp: '2026-03-14 11:00', operator: '王斯琼', category: '基本信息', action: '完成录入', detail: '客户录入完成，评级 A 级（核心客户），月预算 $50K' },

  /* ── FinTech Pro (S, Phase 2: IO审核) ── */
  { id: 'log-6', clientId: 'fintech', timestamp: '2026-03-24 15:00', operator: '王斯琼', category: 'IO 单', action: '提交 IO 单', detail: '新建投放 IO 单 IO-2026-002，金额 $50,000，渠道 Google Ads + Meta' },
  { id: 'log-7', clientId: 'fintech', timestamp: '2026-03-23 10:30', operator: '王斯琼', category: '合规', action: '合规审查通过', detail: '金融牌照验证通过（牌照号 FIN-2024-8832），合规文件已归档' },
  { id: 'log-8', clientId: 'fintech', timestamp: '2026-03-20 14:00', operator: '王斯琼', category: '基本信息', action: '完成评级', detail: '客户评级 S 级（战略客户），年框协议 $1.2M，配备专属投手团队' },
  { id: 'log-9', clientId: 'fintech', timestamp: '2026-03-18 09:30', operator: '王斯琼', category: '基本信息', action: '完成录入', detail: '客户信息录入完毕，联系人李伟，金融科技支付方向' },

  /* ── ShopMax (B, Phase 1: 合规审查) ── */
  { id: 'log-10', clientId: 'shopmax', timestamp: '2026-03-26 10:00', operator: '王斯琼', category: 'IO 单', action: '提交 IO 单', detail: '新建投放 IO 单 IO-2026-012，金额 $10,000，待合规审查通过后启动' },
  { id: 'log-11', clientId: 'shopmax', timestamp: '2026-03-24 16:00', operator: '王斯琼', category: '基本信息', action: '完成评级', detail: '客户评级 B 级（优质客户），电商品类，首次投放测试' },
  { id: 'log-12', clientId: 'shopmax', timestamp: '2026-03-22 11:30', operator: '王斯琼', category: '基本信息', action: '完成录入', detail: '客户信息录入，联系人陈丽，主营 DTC 跨境电商' },

  /* ── GameOn (B, Phase 4: 续约评估) ── */
  { id: 'log-13', clientId: 'gameon', timestamp: '2026-03-25 11:00', operator: '郭晋光', category: 'IO 单', action: '提交变更', detail: '续约评估期追加预算 $5,000，IO 单 IO-2026-005' },
  { id: 'log-14', clientId: 'gameon', timestamp: '2026-03-22 15:30', operator: '罗依桐', category: '投放', action: '投放复盘', detail: '月度复盘：总花费 $18,500，安装量 12,400，CPI $1.49（目标 $1.80），超额完成' },
  { id: 'log-15', clientId: 'gameon', timestamp: '2026-03-15 10:00', operator: '郭晋光', category: '投放', action: '调整素材', detail: '更换 TikTok 视频素材 3 组，A/B 测试新创意方向' },
  { id: 'log-16', clientId: 'gameon', timestamp: '2026-02-27 09:00', operator: '明虎', category: '财务', action: '打款确认', detail: '确认收到 $20,000 打款，IO 单 IO-2026-013' },
  { id: 'log-17', clientId: 'gameon', timestamp: '2026-02-25 14:00', operator: '郭晋光', category: 'IO 单', action: '提交 IO 单', detail: '新建投放 IO 单 IO-2026-013，金额 $20,000，三渠道同步测试' },

  /* ── BrightPath (C, Phase 5: 终止处理中) ── */
  { id: 'log-18', clientId: 'brightpath', timestamp: '2026-03-24 09:00', operator: '王斯琼', category: '终止', action: '发起终止', detail: '提交终止退款申请，IO 单 IO-2026-008，原因：测试期 CPA 持续偏高' },
  { id: 'log-19', clientId: 'brightpath', timestamp: '2026-03-20 16:00', operator: '陶阳阳', category: '投放', action: '暂停投放', detail: '暂停全部 Meta 广告，CPA $12.30 远高于目标 $7.00，待客户沟通' },
  { id: 'log-20', clientId: 'brightpath', timestamp: '2026-03-15 11:00', operator: '陶阳阳', category: '投放', action: '投放预警', detail: '测试第 7 天，CPA $11.80 超目标 68%，素材点击率 0.6%（行业 1.2%），建议与客户沟通' },
  { id: 'log-21', clientId: 'brightpath', timestamp: '2026-02-20 10:00', operator: '王斯琼', category: 'IO 单', action: '提交 IO 单', detail: '新建投放 IO 单，金额 $15,000，教育行业首次合作' },
  { id: 'log-22', clientId: 'brightpath', timestamp: '2026-02-18 14:30', operator: '王斯琼', category: '基本信息', action: '完成录入', detail: '客户录入完成，评级 C 级，教育行业，预算偏低需观察' },

  /* ── LuxeVibe (B, Phase 1: 资质审查) ── */
  { id: 'log-23', clientId: 'luxevibe', timestamp: '2026-03-26 11:30', operator: '王斯琼', category: 'IO 单', action: '提交 IO 单', detail: '新建投放 IO 单 IO-2026-011，金额 $15,000，等待审批' },
  { id: 'log-24', clientId: 'luxevibe', timestamp: '2026-03-25 09:00', operator: '王斯琼', category: '基本信息', action: '完成评级', detail: '客户评级 B 级（优质客户），DTC 美妆品牌，目标人群 18-35 女性' },
  { id: 'log-25', clientId: 'luxevibe', timestamp: '2026-03-23 15:00', operator: '王斯琼', category: '基本信息', action: '完成录入', detail: '客户信息录入，联系人林芳，高端美妆电商品牌' },

  /* ── ReadNow (A, Phase 2: 资产准备) ── */
  { id: 'log-26', clientId: 'readnow', timestamp: '2026-03-25 16:00', operator: '郭晋光', category: 'IO 单', action: '提交 IO 单', detail: '新建投放 IO 单 IO-2026-009，金额 $20,000，Meta + TikTok 双渠道' },
  { id: 'log-27', clientId: 'readnow', timestamp: '2026-03-24 11:00', operator: '陶阳阳', category: '投放', action: '素材准备', detail: '完成 3 套竖版视频素材、5 套图片素材制作，已提交审核' },
  { id: 'log-28', clientId: 'readnow', timestamp: '2026-03-22 09:30', operator: '郭晋光', category: '基本信息', action: '完成评级', detail: '客户评级 A 级（核心客户），阅读 App 类型，与 Wavebone 类似客群' },
  { id: 'log-29', clientId: 'readnow', timestamp: '2026-03-20 14:00', operator: '郭晋光', category: '基本信息', action: '完成录入', detail: '客户录入完成，联系人周华，小说阅读 App，目标东南亚市场' },

  /* ── PayEasy (S, Phase 2: 打款中) ── */
  { id: 'log-30', clientId: 'payeasy', timestamp: '2026-03-22 14:00', operator: '明虎', category: '财务', action: '打款处理中', detail: 'IO 单 IO-2026-003 审批通过，$80,000 打款处理中，预计 T+2 到账' },
  { id: 'log-31', clientId: 'payeasy', timestamp: '2026-03-21 10:00', operator: '罗依桐', category: 'IO 单', action: 'IO 单审批', detail: '运营审批通过 IO-2026-003，S 级客户优先通道' },
  { id: 'log-32', clientId: 'payeasy', timestamp: '2026-03-20 15:00', operator: '王斯琼', category: 'IO 单', action: '提交 IO 单', detail: '新建投放 IO 单 IO-2026-003，金额 $80,000，Google Ads 单渠道' },
  { id: 'log-33', clientId: 'payeasy', timestamp: '2026-03-18 11:00', operator: '王斯琼', category: '合规', action: '合规审查通过', detail: '支付牌照验证通过（PCI-DSS Level 1），风控评估合格' },
  { id: 'log-34', clientId: 'payeasy', timestamp: '2026-03-15 10:00', operator: '王斯琼', category: '基本信息', action: '完成录入', detail: '客户录入完成，评级 S 级（战略客户），年框协议 $960K' },

  /* ── TravelGo (B, Phase 2: 测试计划) ── */
  { id: 'log-35', clientId: 'travelgo', timestamp: '2026-03-25 10:00', operator: '明虎', category: '财务', action: '打款待确认', detail: 'IO 单 IO-2026-010 打款待确认，$10,000' },
  { id: 'log-36', clientId: 'travelgo', timestamp: '2026-03-24 14:00', operator: '陶阳阳', category: '投放', action: '制定测试方案', detail: '制定 14 天测试方案：Meta 信息流 + Reels，目标 CPA ≤ $5.00，日预算 $700' },
  { id: 'log-37', clientId: 'travelgo', timestamp: '2026-03-23 11:00', operator: '郭晋光', category: 'IO 单', action: '提交 IO 单', detail: '新建投放 IO 单 IO-2026-010，金额 $10,000' },
  { id: 'log-38', clientId: 'travelgo', timestamp: '2026-03-21 09:00', operator: '郭晋光', category: '基本信息', action: '完成录入', detail: '客户录入完成，评级 B 级，旅游行业，主推东南亚出境游产品' },

  /* ── QuickBuy (B, Phase 3: 测试期 D3) ── */
  { id: 'log-39', clientId: 'quickbuy', timestamp: '2026-03-25 16:30', operator: '罗依桐', category: '投放', action: '首日数据', detail: '测试期 D1 数据：花费 $850，展示 42K，点击 380，CPA $8.50（目标 $6.00），持续观察' },
  { id: 'log-40', clientId: 'quickbuy', timestamp: '2026-03-23 10:00', operator: '罗依桐', category: '投放', action: '启动投放', detail: '测试期投放启动，预算 $15,000，周期 14 天，Meta + Google Ads 双渠道' },
  { id: 'log-41', clientId: 'quickbuy', timestamp: '2026-03-22 09:00', operator: '明虎', category: '财务', action: '打款确认', detail: '确认收到 $15,000 打款，IO 单 IO-2026-006' },
  { id: 'log-42', clientId: 'quickbuy', timestamp: '2026-03-20 14:00', operator: '郭晋光', category: 'IO 单', action: '提交 IO 单', detail: '新建投放 IO 单 IO-2026-006，金额 $15,000' },
  { id: 'log-43', clientId: 'quickbuy', timestamp: '2026-03-18 11:00', operator: '郭晋光', category: '基本信息', action: '完成录入', detail: '客户录入完成，评级 B 级，电商品类，快消品跨境独立站' },

  /* ── MedPlus (S, Phase 3: 测试期 D11) ── */
  { id: 'log-44', clientId: 'medplus', timestamp: '2026-03-24 09:15', operator: '罗依桐', category: '投放', action: '周复盘', detail: '第二次周复盘：CPA $6.20（目标 $7.00），ROAS 145%，续投建议获批' },
  { id: 'log-45', clientId: 'medplus', timestamp: '2026-03-20 15:00', operator: '罗依桐', category: '投放', action: '优化调整', detail: '关闭 2 个低效广告组，新建 3 个 Lookalike 受众，预算从 $2,000/日提升至 $2,500/日' },
  { id: 'log-46', clientId: 'medplus', timestamp: '2026-03-17 09:00', operator: '罗依桐', category: '投放', action: '周复盘', detail: '首次周复盘：CPA $7.80（目标 $7.00），略高但趋势向好，建议持续优化' },
  { id: 'log-47', clientId: 'medplus', timestamp: '2026-03-15 10:00', operator: '陶阳阳', category: '投放', action: '启动投放', detail: '测试期投放启动，预算 $35,000，Meta + TikTok 双渠道，合规素材已审核' },
  { id: 'log-48', clientId: 'medplus', timestamp: '2026-03-14 09:00', operator: '明虎', category: '财务', action: '打款确认', detail: '确认收到 $35,000 打款，IO 单 IO-2026-004' },
  { id: 'log-49', clientId: 'medplus', timestamp: '2026-03-13 11:00', operator: '王斯琼', category: '合规', action: '合规审查通过', detail: '医疗器械广告资质验证通过，FDA 认证文件已归档，广告内容审核通过' },
  { id: 'log-50', clientId: 'medplus', timestamp: '2026-03-12 14:00', operator: '王斯琼', category: 'IO 单', action: '提交 IO 单', detail: '新建投放 IO 单 IO-2026-004，金额 $35,000' },
  { id: 'log-51', clientId: 'medplus', timestamp: '2026-03-10 10:00', operator: '王斯琼', category: '基本信息', action: '完成录入', detail: '客户录入完成，评级 S 级（战略客户），医疗健康行业，年预算 $720K' },

  /* ── NovelKing (A, Phase 4: 已续约) ── */
  { id: 'log-52', clientId: 'novelking', timestamp: '2026-03-22 14:00', operator: '王斯琼', category: 'IO 单', action: '提交续约 IO', detail: '提交续约 IO 单 IO-2026-014，金额 $50,000，三渠道全面投放' },
  { id: 'log-53', clientId: 'novelking', timestamp: '2026-03-15 14:00', operator: '王斯琼', category: '基本信息', action: '正式续约', detail: '月预算提升至 $50K（原 $30K），全托管模式，签署年框协议' },
  { id: 'log-54', clientId: 'novelking', timestamp: '2026-03-12 10:00', operator: '罗依桐', category: '投放', action: '测试期结案', detail: '测试期 30 天结案：总花费 $28,500，激活用户 18,200，CPA $1.56，超额完成全部目标' },
  { id: 'log-55', clientId: 'novelking', timestamp: '2026-02-10 16:00', operator: '王斯琼', category: 'IO 单', action: '提交 IO 单', detail: '新建投放 IO 单 IO-2026-007，金额 $30,000，测试期启动' },
  { id: 'log-56', clientId: 'novelking', timestamp: '2026-02-08 11:00', operator: '王斯琼', category: '基本信息', action: '完成录入', detail: '客户录入完成，评级 A 级（核心客户），小说阅读 App，同行业第二家' },
]

/* ── Helper: industries requiring compliance ── */
export const complianceRequiredIndustries = ['金融', '医疗健康', '游戏']

/* ── Client Performance Data ── */
export type ClientPerformance = {
  clientId: string
  summary: {
    totalSpend: number
    totalInstalls: number
    cpa: number
    cpaTarget: number
    roas: number
    roasTarget: number
    ctr: number
    impressions: number
    clicks: number
  }
  daily: {
    date: string
    spend: number
    installs: number
    cpa: number
    roas: number
  }[]
  topCreative: { name: string; ctr: number; cpa: number }
  topAudience: { name: string; installs: number; cpa: number }
}

export const clientPerformance: ClientPerformance[] = [
  {
    clientId: 'wavebone',
    summary: { totalSpend: 12450, totalInstalls: 3280, cpa: 3.80, cpaTarget: 4.50, roas: 186, roasTarget: 150, ctr: 2.4, impressions: 524000, clicks: 12576 },
    daily: [
      { date: '03-18', spend: 1500, installs: 320, cpa: 4.69, roas: 145 },
      { date: '03-19', spend: 1650, installs: 380, cpa: 4.34, roas: 155 },
      { date: '03-20', spend: 1580, installs: 360, cpa: 4.39, roas: 158 },
      { date: '03-21', spend: 1720, installs: 420, cpa: 4.10, roas: 168 },
      { date: '03-22', spend: 1450, installs: 390, cpa: 3.72, roas: 172 },
      { date: '03-23', spend: 1680, installs: 450, cpa: 3.73, roas: 180 },
      { date: '03-24', spend: 1520, installs: 410, cpa: 3.71, roas: 182 },
      { date: '03-25', spend: 1580, installs: 480, cpa: 3.80, roas: 186 },
    ],
    topCreative: { name: '视频_阅读场景A', ctr: 3.2, cpa: 3.10 },
    topAudience: { name: 'LAL_高价值用户', installs: 1235, cpa: 3.40 },
  },
  {
    clientId: 'shopmax',
    summary: { totalSpend: 6820, totalInstalls: 658, cpa: 10.36, cpaTarget: 6.00, roas: 118, roasTarget: 150, ctr: 1.8, impressions: 298000, clicks: 5364 },
    daily: [
      { date: '03-18', spend: 780, installs: 62, cpa: 12.58, roas: 92 },
      { date: '03-19', spend: 820, installs: 70, cpa: 11.71, roas: 98 },
      { date: '03-20', spend: 850, installs: 78, cpa: 10.90, roas: 105 },
      { date: '03-21', spend: 880, installs: 82, cpa: 10.73, roas: 108 },
      { date: '03-22', spend: 860, installs: 85, cpa: 10.12, roas: 110 },
      { date: '03-23', spend: 900, installs: 90, cpa: 10.00, roas: 114 },
      { date: '03-24', spend: 880, installs: 93, cpa: 9.46, roas: 116 },
      { date: '03-25', spend: 850, installs: 98, cpa: 8.67, roas: 118 },
    ],
    topCreative: { name: '图片_爆品展示A', ctr: 2.1, cpa: 7.80 },
    topAudience: { name: '兴趣_电商购物', installs: 280, cpa: 9.50 },
  },
  {
    clientId: 'gameon',
    summary: { totalSpend: 22800, totalInstalls: 8520, cpa: 2.68, cpaTarget: 3.50, roas: 225, roasTarget: 180, ctr: 3.1, impressions: 1280000, clicks: 39680 },
    daily: [
      { date: '03-12', spend: 2600, installs: 880, cpa: 2.95, roas: 195 },
      { date: '03-13', spend: 2750, installs: 950, cpa: 2.89, roas: 200 },
      { date: '03-14', spend: 2800, installs: 1020, cpa: 2.75, roas: 208 },
      { date: '03-15', spend: 2900, installs: 1080, cpa: 2.69, roas: 212 },
      { date: '03-16', spend: 2850, installs: 1100, cpa: 2.59, roas: 218 },
      { date: '03-17', spend: 2950, installs: 1150, cpa: 2.57, roas: 222 },
      { date: '03-18', spend: 3000, installs: 1180, cpa: 2.54, roas: 225 },
      { date: '03-19', spend: 2950, installs: 1160, cpa: 2.54, roas: 225 },
    ],
    topCreative: { name: '视频_游戏CG预告', ctr: 4.2, cpa: 2.20 },
    topAudience: { name: 'LAL_付费玩家', installs: 3200, cpa: 2.35 },
  },
  {
    clientId: 'medplus',
    summary: { totalSpend: 18500, totalInstalls: 2960, cpa: 6.25, cpaTarget: 7.00, roas: 165, roasTarget: 140, ctr: 1.9, impressions: 680000, clicks: 12920 },
    daily: [
      { date: '03-15', spend: 2000, installs: 256, cpa: 7.81, roas: 128 },
      { date: '03-16', spend: 2100, installs: 280, cpa: 7.50, roas: 135 },
      { date: '03-17', spend: 2200, installs: 310, cpa: 7.10, roas: 142 },
      { date: '03-18', spend: 2300, installs: 340, cpa: 6.76, roas: 148 },
      { date: '03-19', spend: 2400, installs: 370, cpa: 6.49, roas: 155 },
      { date: '03-20', spend: 2500, installs: 400, cpa: 6.25, roas: 160 },
      { date: '03-21', spend: 2400, installs: 390, cpa: 6.15, roas: 162 },
      { date: '03-22', spend: 2600, installs: 414, cpa: 6.28, roas: 165 },
    ],
    topCreative: { name: '视频_产品功效展示', ctr: 2.3, cpa: 5.80 },
    topAudience: { name: 'LAL_健康关注人群', installs: 1120, cpa: 5.95 },
  },
  {
    clientId: 'novelking',
    summary: { totalSpend: 28500, totalInstalls: 18200, cpa: 1.57, cpaTarget: 2.00, roas: 310, roasTarget: 200, ctr: 3.8, impressions: 2100000, clicks: 79800 },
    daily: [
      { date: '03-05', spend: 3200, installs: 1950, cpa: 1.64, roas: 275 },
      { date: '03-06', spend: 3400, installs: 2100, cpa: 1.62, roas: 280 },
      { date: '03-07', spend: 3500, installs: 2250, cpa: 1.56, roas: 290 },
      { date: '03-08', spend: 3600, installs: 2400, cpa: 1.50, roas: 298 },
      { date: '03-09', spend: 3800, installs: 2500, cpa: 1.52, roas: 305 },
      { date: '03-10', spend: 3700, installs: 2450, cpa: 1.51, roas: 308 },
      { date: '03-11', spend: 3650, installs: 2350, cpa: 1.55, roas: 310 },
      { date: '03-12', spend: 3650, installs: 2200, cpa: 1.66, roas: 310 },
    ],
    topCreative: { name: '视频_沉浸式阅读', ctr: 4.8, cpa: 1.32 },
    topAudience: { name: 'LAL_活跃读者', installs: 7200, cpa: 1.40 },
  },
  {
    clientId: 'quickbuy',
    summary: { totalSpend: 6950, totalInstalls: 762, cpa: 9.12, cpaTarget: 6.00, roas: 138, roasTarget: 160, ctr: 1.6, impressions: 352000, clicks: 5632 },
    daily: [
      { date: '03-18', spend: 800, installs: 78, cpa: 10.26, roas: 118 },
      { date: '03-19', spend: 820, installs: 85, cpa: 9.65, roas: 122 },
      { date: '03-20', spend: 850, installs: 90, cpa: 9.44, roas: 126 },
      { date: '03-21', spend: 880, installs: 95, cpa: 9.26, roas: 128 },
      { date: '03-22', spend: 900, installs: 98, cpa: 9.18, roas: 132 },
      { date: '03-23', spend: 900, installs: 105, cpa: 8.57, roas: 135 },
      { date: '03-24', spend: 920, installs: 110, cpa: 8.36, roas: 137 },
      { date: '03-25', spend: 880, installs: 101, cpa: 8.71, roas: 138 },
    ],
    topCreative: { name: '图片_限时促销A', ctr: 2.0, cpa: 7.90 },
    topAudience: { name: '兴趣_网购达人', installs: 320, cpa: 8.20 },
  },
  {
    clientId: 'brightpath',
    summary: { totalSpend: 8400, totalInstalls: 680, cpa: 12.35, cpaTarget: 7.00, roas: 85, roasTarget: 140, ctr: 0.6, impressions: 320000, clicks: 1920 },
    daily: [
      { date: '03-10', spend: 1200, installs: 92, cpa: 13.04, roas: 78 },
      { date: '03-11', spend: 1200, installs: 95, cpa: 12.63, roas: 80 },
      { date: '03-12', spend: 1200, installs: 98, cpa: 12.24, roas: 82 },
      { date: '03-13', spend: 1200, installs: 100, cpa: 12.00, roas: 84 },
      { date: '03-14', spend: 1200, installs: 100, cpa: 12.00, roas: 85 },
      { date: '03-15', spend: 1200, installs: 98, cpa: 12.24, roas: 85 },
      { date: '03-16', spend: 1200, installs: 97, cpa: 12.37, roas: 85 },
    ],
    topCreative: { name: '图片_课程介绍A', ctr: 0.8, cpa: 11.50 },
    topAudience: { name: '兴趣_在线教育', installs: 320, cpa: 11.80 },
  },
]

/* ── Client Proposal (投放提案) ── */
export type ProposalStatus = '草稿' | '待审核' | '已确认' | '执行中' | '已归档'

export type ClientProposal = {
  id: string
  clientId: string
  title: string
  type: '首次投放' | '测试报告' | '续约提案' | '优化方案'
  status: ProposalStatus
  channels: string[]
  budget: number
  period: string
  kpiTargets: { cpa?: number; roas?: number; installs?: number }
  strategies: string[]
  createdBy: string
  createdAt: string
  updatedAt: string
}

export const clientProposals: ClientProposal[] = [
  {
    id: 'P-2026-001', clientId: 'wavebone', title: 'Wavebone 阅读 APP 首次投放方案',
    type: '首次投放', status: '执行中', channels: ['Meta', 'TikTok'], budget: 30000,
    period: '2026-03-18 ~ 2026-04-01', kpiTargets: { cpa: 4.50, roas: 150, installs: 8000 },
    strategies: ['LAL 高价值获客', '兴趣定向广泛获客', '再营销付费转化'],
    createdBy: '罗依桐', createdAt: '2026-03-14', updatedAt: '2026-03-18',
  },
  {
    id: 'P-2026-002', clientId: 'fintech', title: 'FinTech Pro 金融 APP 获客提案',
    type: '首次投放', status: '待审核', channels: ['Google Ads', 'Meta'], budget: 50000,
    period: '2026-04-01 ~ 2026-04-14', kpiTargets: { cpa: 12.00, roas: 180 },
    strategies: ['搜索广告精准获客', 'Display 品牌认知', 'Meta LAL 拓展'],
    createdBy: '罗依桐', createdAt: '2026-03-22', updatedAt: '2026-03-22',
  },
  {
    id: 'P-2026-003', clientId: 'shopmax', title: 'ShopMax 电商 DTC 测试方案',
    type: '首次投放', status: '执行中', channels: ['Meta'], budget: 10000,
    period: '2026-03-18 ~ 2026-04-01', kpiTargets: { cpa: 6.00, roas: 150 },
    strategies: ['爆品素材定向', '兴趣电商人群', 'DPA 动态商品广告'],
    createdBy: '陶阳阳', createdAt: '2026-03-16', updatedAt: '2026-03-18',
  },
  {
    id: 'P-2026-004', clientId: 'gameon', title: 'GameOn 游戏 续约投放提案',
    type: '续约提案', status: '已确认', channels: ['Meta', 'TikTok', 'Google Ads'], budget: 30000,
    period: '2026-04-01 ~ 2026-04-30', kpiTargets: { cpa: 3.00, roas: 200, installs: 10000 },
    strategies: ['CG 预告视频获客', 'LAL 付费玩家', 'Google UAC 自动化'],
    createdBy: '罗依桐', createdAt: '2026-03-20', updatedAt: '2026-03-24',
  },
  {
    id: 'P-2026-005', clientId: 'medplus', title: 'MedPlus 健康品牌 测试期阶段报告',
    type: '测试报告', status: '执行中', channels: ['Meta', 'TikTok'], budget: 35000,
    period: '2026-03-15 ~ 2026-03-29', kpiTargets: { cpa: 7.00, roas: 140 },
    strategies: ['合规素材信息流', 'LAL 健康关注人群', 'TikTok 达人内容'],
    createdBy: '罗依桐', createdAt: '2026-03-14', updatedAt: '2026-03-22',
  },
  {
    id: 'P-2026-006', clientId: 'novelking', title: 'NovelKing 续约全渠道投放方案',
    type: '续约提案', status: '执行中', channels: ['Meta', 'TikTok', 'Google Ads'], budget: 50000,
    period: '2026-03-15 ~ 2026-04-15', kpiTargets: { cpa: 2.00, roas: 200, installs: 25000 },
    strategies: ['沉浸式阅读视频', 'LAL 活跃读者', 'Google 搜索品牌词', 'TikTok 书单推荐'],
    createdBy: '罗依桐', createdAt: '2026-03-12', updatedAt: '2026-03-15',
  },
  {
    id: 'P-2026-007', clientId: 'quickbuy', title: 'QuickBuy 电商测试期方案',
    type: '首次投放', status: '执行中', channels: ['Meta', 'Google Ads'], budget: 15000,
    period: '2026-03-18 ~ 2026-04-01', kpiTargets: { cpa: 6.00, roas: 160 },
    strategies: ['限时促销素材', '兴趣网购人群', 'Google Shopping 广告'],
    createdBy: '陶阳阳', createdAt: '2026-03-17', updatedAt: '2026-03-18',
  },
  {
    id: 'P-2026-008', clientId: 'readnow', title: 'ReadNow 阅读 APP 投放提案',
    type: '首次投放', status: '待审核', channels: ['Meta', 'TikTok'], budget: 20000,
    period: '2026-04-01 ~ 2026-04-14', kpiTargets: { cpa: 3.00, roas: 180, installs: 6500 },
    strategies: ['LAL 阅读用户', '书单推荐内容', 'Reels 短视频'],
    createdBy: '罗依桐', createdAt: '2026-03-24', updatedAt: '2026-03-24',
  },
  {
    id: 'P-2026-009', clientId: 'luxevibe', title: 'LuxeVibe 电商品牌测试方案',
    type: '首次投放', status: '草稿', channels: ['Meta', 'TikTok'], budget: 15000,
    period: '待定', kpiTargets: { cpa: 8.00, roas: 160 },
    strategies: ['精品展示素材', '兴趣时尚人群', 'KOL 合作内容'],
    createdBy: '陶阳阳', createdAt: '2026-03-25', updatedAt: '2026-03-25',
  },
]

/* ── Client Asset Summary (资产概览) ── */
export type ClientAssetSummary = {
  clientId: string
  adAccounts: { total: number; active: number; platforms: string[] }
  creatives: { total: number; active: number; topFormat: string }
  audiences: { total: number; active: number }
  tracking: { pixelStatus: '正常' | '异常' | '未接入'; sdkStatus: '正常' | '异常' | '未接入' }
  compliance: { status: '已通过' | '审核中' | '未提交' | '即将过期'; expiresAt?: string }
}

export const clientAssets: ClientAssetSummary[] = [
  {
    clientId: 'wavebone',
    adAccounts: { total: 4, active: 3, platforms: ['Meta', 'Google', 'TikTok'] },
    creatives: { total: 48, active: 32, topFormat: '竖版视频' },
    audiences: { total: 8, active: 6 },
    tracking: { pixelStatus: '正常', sdkStatus: '正常' },
    compliance: { status: '已通过' },
  },
  {
    clientId: 'fintech',
    adAccounts: { total: 2, active: 0, platforms: ['Google Ads', 'Meta'] },
    creatives: { total: 12, active: 0, topFormat: '横版图片' },
    audiences: { total: 3, active: 0 },
    tracking: { pixelStatus: '未接入', sdkStatus: '未接入' },
    compliance: { status: '审核中' },
  },
  {
    clientId: 'shopmax',
    adAccounts: { total: 1, active: 1, platforms: ['Meta'] },
    creatives: { total: 15, active: 8, topFormat: '商品图片' },
    audiences: { total: 4, active: 3 },
    tracking: { pixelStatus: '正常', sdkStatus: '未接入' },
    compliance: { status: '已通过' },
  },
  {
    clientId: 'gameon',
    adAccounts: { total: 5, active: 4, platforms: ['Meta', 'TikTok', 'Google Ads'] },
    creatives: { total: 65, active: 42, topFormat: 'CG 视频' },
    audiences: { total: 12, active: 10 },
    tracking: { pixelStatus: '正常', sdkStatus: '正常' },
    compliance: { status: '已通过' },
  },
  {
    clientId: 'medplus',
    adAccounts: { total: 3, active: 2, platforms: ['Meta', 'TikTok'] },
    creatives: { total: 28, active: 18, topFormat: '产品展示视频' },
    audiences: { total: 6, active: 5 },
    tracking: { pixelStatus: '正常', sdkStatus: '正常' },
    compliance: { status: '即将过期', expiresAt: '2026-04-15' },
  },
  {
    clientId: 'novelking',
    adAccounts: { total: 6, active: 5, platforms: ['Meta', 'TikTok', 'Google Ads'] },
    creatives: { total: 82, active: 56, topFormat: '沉浸式视频' },
    audiences: { total: 15, active: 12 },
    tracking: { pixelStatus: '正常', sdkStatus: '正常' },
    compliance: { status: '已通过' },
  },
  {
    clientId: 'quickbuy',
    adAccounts: { total: 2, active: 2, platforms: ['Meta', 'Google Ads'] },
    creatives: { total: 20, active: 12, topFormat: '促销图片' },
    audiences: { total: 5, active: 4 },
    tracking: { pixelStatus: '正常', sdkStatus: '未接入' },
    compliance: { status: '已通过' },
  },
  {
    clientId: 'brightpath',
    adAccounts: { total: 1, active: 0, platforms: ['Meta'] },
    creatives: { total: 10, active: 0, topFormat: '课程图片' },
    audiences: { total: 3, active: 0 },
    tracking: { pixelStatus: '异常', sdkStatus: '未接入' },
    compliance: { status: '已通过' },
  },
  {
    clientId: 'readnow',
    adAccounts: { total: 2, active: 0, platforms: ['Meta', 'TikTok'] },
    creatives: { total: 8, active: 0, topFormat: '书单推荐图' },
    audiences: { total: 2, active: 0 },
    tracking: { pixelStatus: '未接入', sdkStatus: '未接入' },
    compliance: { status: '未提交' },
  },
  {
    clientId: 'luxevibe',
    adAccounts: { total: 2, active: 0, platforms: ['Meta', 'TikTok'] },
    creatives: { total: 6, active: 0, topFormat: '精品展示图' },
    audiences: { total: 0, active: 0 },
    tracking: { pixelStatus: '未接入', sdkStatus: '未接入' },
    compliance: { status: '审核中' },
  },
]

/* ═══════════════════════════════════════════════════════
   Grade Change Requests
   ═══════════════════════════════════════════════════════ */

export type GradeChangeStatus = 'pending_ops' | 'pending_ceo' | 'approved' | 'rejected'

export type GradeChangeStep = {
  role: '销售' | '行运' | '振宇'
  person: string
  status: 'done' | 'current' | 'pending' | 'rejected'
  date?: string
  comment?: string
}

export type GradeChangeRequest = {
  id: string
  clientId: string
  clientName: string
  fromGrade: string
  toGrade: string
  reason: string
  status: GradeChangeStatus
  initiator: string
  createdAt: string
  steps: GradeChangeStep[]
}

export const GRADE_CHANGE_APPROVAL_STEPS: { role: '销售' | '行运' | '振宇'; label: string }[] = [
  { role: '销售', label: '销售发起' },
  { role: '行运', label: '行运审批' },
  { role: '振宇', label: '最终确认' },
]

export const gradeChangeRequests: GradeChangeRequest[] = [
  // Wavebone: completed upgrade B→A (historical)
  {
    id: 'gc-001',
    clientId: 'wavebone',
    clientName: 'Wavebone',
    fromGrade: 'B',
    toGrade: 'A',
    reason: '测试期 CPA 持续低于目标 15%，ROAS 超目标 20%，客户配合度高，素材迭代积极，建议升级为核心客户以获得更多资源支持。',
    status: 'approved',
    initiator: '王斯琼',
    createdAt: '2026-03-10',
    steps: [
      { role: '销售', person: '王斯琼', status: 'done', date: '2026-03-10', comment: '发起评级变更申请' },
      { role: '行运', person: '李行运', status: 'done', date: '2026-03-11', comment: '数据表现确实优秀，同意升级' },
      { role: '振宇', person: '郭振宇', status: 'done', date: '2026-03-12', comment: '同意，安排高级投手跟进' },
    ],
  },
  // ShopMax: pending ops review (in-progress)
  {
    id: 'gc-002',
    clientId: 'shopmax',
    clientName: 'ShopMax',
    fromGrade: 'B',
    toGrade: 'A',
    reason: 'ShopMax 电商 DTC 测试方案执行顺利，CPA $10.36 虽略高于目标但 ROAS 118% 表现稳定，客户已追加预算至 $10,000，建议升级评级以匹配资源投入。',
    status: 'pending_ops',
    initiator: '王斯琼',
    createdAt: '2026-03-24',
    steps: [
      { role: '销售', person: '王斯琼', status: 'done', date: '2026-03-24', comment: '发起评级变更申请' },
      { role: '行运', person: '李行运', status: 'current' },
      { role: '振宇', person: '郭振宇', status: 'pending' },
    ],
  },
  // GameOn: pending CEO (in-progress, ops approved)
  {
    id: 'gc-003',
    clientId: 'gameon',
    clientName: 'GameOn',
    fromGrade: 'A',
    toGrade: 'S',
    reason: 'GameOn 连续两个月投放数据超预期，月消耗稳定 $80,000+，CPA 持续优化至 $2.10，客户计划扩展至 3 个新渠道。建议升为战略客户，享受 VIP 服务通道。',
    status: 'pending_ceo',
    initiator: '王斯琼',
    createdAt: '2026-03-20',
    steps: [
      { role: '销售', person: '王斯琼', status: 'done', date: '2026-03-20', comment: '发起评级变更申请' },
      { role: '行运', person: '李行运', status: 'done', date: '2026-03-22', comment: '数据确实非常优秀，支持升为 S 级' },
      { role: '振宇', person: '郭振宇', status: 'current' },
    ],
  },
  // FinTech Pro: rejected downgrade attempt (historical)
  {
    id: 'gc-004',
    clientId: 'fintech',
    clientName: 'FinTech Pro',
    fromGrade: 'A',
    toGrade: 'S',
    reason: '金融行业合规要求高，客户资质完善，预算充足，建议升为战略级。',
    status: 'rejected',
    initiator: '王斯琼',
    createdAt: '2026-03-05',
    steps: [
      { role: '销售', person: '王斯琼', status: 'done', date: '2026-03-05', comment: '发起评级变更申请' },
      { role: '行运', person: '李行运', status: 'done', date: '2026-03-06', comment: '投放数据尚未达到 S 级标准，建议继续观察一个月' },
      { role: '振宇', person: '郭振宇', status: 'rejected', date: '2026-03-07', comment: '当前阶段数据不够充分，等 Q2 数据出来再评估' },
    ],
  },
]
