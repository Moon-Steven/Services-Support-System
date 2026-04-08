import type { ClockEntry, ClockNarrativeBlock, ClientSophistication } from '@/lib/data'

/* ══ Around the Clock — 审核工作台 & 对客叙事（mock） ══ */

export type AtcViewerRole = 'delivery' | 'ops' | 'sales'

export type AtcWorkflowTab = 'todo' | 'inflight' | 'published' | 'blocked'

export type AtcSensitivity = 'P0' | 'P1' | 'P2'

export type AtcEventType = 'bidding' | 'creative' | 'monitor' | 'strategy' | 'experiment'

export type AtcPipelineStage = 'at_delivery' | 'at_ops' | 'at_sales' | 'published' | 'blocked'

export type AtcKpiRef = 'B1' | 'C4' | 'M6'

export type AtcAuditAction =
  | 'hui_triggered'
  | 'delivery_submit_ops'
  | 'delivery_edit'
  | 'delivery_reject'
  | 'ops_submit_sales'
  | 'ops_polish'
  | 'ops_return_delivery'
  | 'sales_publish'
  | 'sales_edit'
  | 'sales_hide'
  | 'sales_recall'
  | 'system_timeout_forward'
  | 'system_timeout_hide'

export type AtcAuditLogEntry = {
  id: string
  at: string
  action: AtcAuditAction
  actor: string
  note?: string
  copySnapshot?: string
}

export type AtcExperimentProgress = {
  label: string
  currentStep: number
  totalSteps: number
}

export type AtcReviewEvent = {
  id: string
  clientId: string
  clientName: string
  accountLabel?: string
  occurredAt: string
  slaDueAt: string
  sensitivity: AtcSensitivity
  eventType: AtcEventType
  huiPayloadSummary: string
  customerCopyDraft: string
  previousCustomerCopy?: string
  currentStage: AtcPipelineStage
  blockedReason?: string
  narrative: {
    signal: string
    strategy: string
    action: string
    outcome: string
  }
  kpiRefs: AtcKpiRef[]
  experimentProgress?: AtcExperimentProgress
  auditLog: AtcAuditLogEntry[]
}

export const CLIENT_SOPHISTICATION_OPTIONS: { value: ClientSophistication; label: string }[] = [
  { value: 'basic', label: '入门（更强模糊化）' },
  { value: 'standard', label: '标准' },
  { value: 'advanced', label: '专业（保留更多细节）' },
]

/** 演示用「当前时间」，便于 SLA 灯稳定可截图 */
export const ATC_REFERENCE_NOW_ISO = '2026-04-07T10:30:00'

export const ATC_SLA_HOURS = 4

export const ATC_FALLBACK_COPY =
  'P2 事件在运营环节超时将沿用系统默认话术进入销售；销售环节超时 12 小时未处理将自动【隐藏拦截】，避免过期信息触达客户。'

export type SlaTrafficLight = 'green' | 'yellow' | 'red'

function parseIsoMs(iso: string): number {
  const [d, t] = iso.split('T')
  const [y, mo, da] = d.split('-').map(Number)
  const [h, mi, s] = (t || '00:00:00').split(':').map(Number)
  return Date.UTC(y, mo - 1, da, h, mi, s || 0)
}

export function getSlaTrafficLight(slaDueAtIso: string, nowIso: string = ATC_REFERENCE_NOW_ISO): SlaTrafficLight {
  const left = parseIsoMs(slaDueAtIso) - parseIsoMs(nowIso)
  const hour = 3600000
  if (left <= 0) return 'red'
  if (left < hour) return 'yellow'
  return 'green'
}

export function formatAtcDateTime(iso: string): string {
  const [datePart, timePart] = iso.split('T')
  const [, month, day] = datePart.split('-')
  const [hour, minute] = (timePart || '00:00').split(':')
  return `${Number(month)}/${Number(day)} ${hour}:${minute}`
}

const audit = (
  id: string,
  at: string,
  action: AtcAuditAction,
  actor: string,
  note?: string,
  copySnapshot?: string
): AtcAuditLogEntry => ({ id, at, action, actor, note, copySnapshot })

function seedEvents(): AtcReviewEvent[] {
  return [
    // ── 交付待审 ──
    {
      id: 'atc-1',
      clientId: 'wavebone',
      clientName: 'WaveBone 阅读',
      accountLabel: '主投放户',
      occurredAt: '2026-04-07T03:00:00',
      slaDueAt: '2026-04-07T07:00:00',
      sensitivity: 'P1',
      eventType: 'monitor',
      huiPayloadSummary: '{"trigger":"conversion_spike_night","pacingRatio":0.82,"threshold":0.15}',
      customerCopyDraft: '凌晨时段监测到转化波动，AI 已按风控阈值暂停异常素材，预计为您守住夜间预算安全。',
      previousCustomerCopy: '凌晨转化波动，PacingRatio 0.82 触发阈值，已暂停素材 A3。',
      narrative: { signal: '凌晨 3 点监测到转化波动', strategy: '触发夜间风控阈值，优先保护预算', action: '自动暂停异常素材并限流', outcome: '避免无效消耗，保持次日投放节奏' },
      kpiRefs: ['M6'],
      currentStage: 'at_delivery',
      auditLog: [
        audit('l1', '2026-04-07T03:00:00', 'hui_triggered', 'HUI', '原始事件入库'),
        audit('l2', '2026-04-07T03:02:00', 'delivery_edit', '系统', '预处理脱敏文案', '凌晨转化波动，已暂停素材 A3。'),
      ],
    },
    {
      id: 'atc-8',
      clientId: 'gameon',
      clientName: 'GameOn 游戏',
      occurredAt: '2026-04-07T02:30:00',
      slaDueAt: '2026-04-07T06:30:00',
      sensitivity: 'P2',
      eventType: 'bidding',
      huiPayloadSummary: '{"action":"night_bid_reduce","reducePct":0.12}',
      customerCopyDraft: '深夜竞价环境变化，AI 已智能降低出价幅度，有效节省夜间预算消耗。',
      narrative: { signal: '深夜竞价环境波动', strategy: '自动降低非活跃时段出价', action: '出价降低 12%', outcome: '减少低质量夜间消耗' },
      kpiRefs: ['B1'],
      currentStage: 'at_delivery',
      auditLog: [
        audit('l1', '2026-04-07T02:30:00', 'hui_triggered', 'HUI'),
      ],
    },
    {
      id: 'atc-9',
      clientId: 'payeasy',
      clientName: 'PayEasy 支付',
      occurredAt: '2026-04-07T06:00:00',
      slaDueAt: '2026-04-07T10:00:00',
      sensitivity: 'P1',
      eventType: 'monitor',
      huiPayloadSummary: '{"complianceScan":"passed","creativeCount":24}',
      customerCopyDraft: '凌晨合规扫描完成，所有在投素材均通过金融行业审核标准，账户状态健康。',
      narrative: { signal: '定时合规扫描完成', strategy: '金融行业合规优先', action: '全量素材审核无异常', outcome: '保障账户合规状态' },
      kpiRefs: ['M6'],
      currentStage: 'at_delivery',
      auditLog: [
        audit('l1', '2026-04-07T06:00:00', 'hui_triggered', 'HUI'),
      ],
    },

    // ── 运营待审 ──
    {
      id: 'atc-2',
      clientId: 'quickbuy',
      clientName: 'QuickBuy 电商',
      occurredAt: '2026-04-07T08:15:00',
      slaDueAt: '2026-04-07T12:15:00',
      sensitivity: 'P2',
      eventType: 'bidding',
      huiPayloadSummary: '{"type":"budget_smooth","dailyBudgetOld":42000,"dailyBudgetNew":38000}',
      customerCopyDraft: '日预算已由系统平滑调整，消耗节奏更均匀，有助于在大促前保持稳定曝光。',
      narrative: { signal: '午间消耗过快、波动加大', strategy: '启用预算平滑（B1）', action: '将日预算从较高区间调至更稳健区间', outcome: '消耗曲线更平稳，降低断档风险' },
      kpiRefs: ['B1', 'M6'],
      currentStage: 'at_ops',
      auditLog: [
        audit('l1', '2026-04-07T08:15:00', 'hui_triggered', 'HUI'),
        audit('l2', '2026-04-07T08:40:00', 'delivery_submit_ops', '张三', '事实核对通过'),
        audit('l3', '2026-04-07T09:05:00', 'delivery_edit', '张三', '去掉精确金额', '日预算已由系统平滑调整，消耗节奏更均匀。'),
      ],
    },
    {
      id: 'atc-10',
      clientId: 'wavebone',
      clientName: 'WaveBone 阅读',
      occurredAt: '2026-04-07T07:00:00',
      slaDueAt: '2026-04-07T11:00:00',
      sensitivity: 'P2',
      eventType: 'strategy',
      huiPayloadSummary: '{"morningReview":"completed","budgetShift":"long_tail"}',
      customerCopyDraft: '早间数据回顾完成，AI 已按最新趋势调整今日投放权重，优先覆盖高转化时段。',
      narrative: { signal: '早间流量数据汇总', strategy: '按前一日表现动态调权', action: '调整时段与渠道预算分配', outcome: '提前锁定高效时段' },
      kpiRefs: ['B1'],
      currentStage: 'at_ops',
      auditLog: [
        audit('l1', '2026-04-07T07:00:00', 'hui_triggered', 'HUI'),
        audit('l2', '2026-04-07T07:30:00', 'delivery_submit_ops', '李四'),
      ],
    },
    {
      id: 'atc-11',
      clientId: 'shopmax',
      clientName: 'ShopMax 电商',
      occurredAt: '2026-04-07T09:00:00',
      slaDueAt: '2026-04-07T13:00:00',
      sensitivity: 'P1',
      eventType: 'creative',
      huiPayloadSummary: '{"abTest":"carousel_vs_single","winner":"carousel","uplift":0.28}',
      customerCopyDraft: '轮播素材组在 A/B 测试中表现亮眼，转化效率提升明显，AI 已自动切换为主力创意。',
      previousCustomerCopy: '轮播素材 CTR +28%，已切换为 primary creative。',
      narrative: { signal: 'A/B 测试数据达到统计显著', strategy: '素材智能择优', action: '切换胜出素材为主力', outcome: '提升整体转化效率' },
      kpiRefs: ['C4', 'M6'],
      currentStage: 'at_ops',
      auditLog: [
        audit('l1', '2026-04-07T09:00:00', 'hui_triggered', 'HUI'),
        audit('l2', '2026-04-07T09:20:00', 'delivery_edit', '张三', '将精确 CTR 替换为评级', '轮播素材组在测试中表现优异。'),
        audit('l3', '2026-04-07T09:25:00', 'delivery_submit_ops', '张三'),
      ],
    },

    // ── 销售待审 ──
    {
      id: 'atc-3',
      clientId: 'medplus',
      clientName: 'MedPlus 医疗',
      occurredAt: '2026-04-06T14:00:00',
      slaDueAt: '2026-04-06T18:00:00',
      sensitivity: 'P0',
      eventType: 'creative',
      huiPayloadSummary: '{"creativeId":"C-7721","diagnosis":"low_ctr","action":"iterate"}',
      customerCopyDraft: '基于诊断结果，AI 已提出素材迭代建议并排队生成新版素材，后续将自动对比表现。',
      narrative: { signal: '多组素材 CTR 低于行业基准', strategy: '素材智能诊断（C4）', action: '生成迭代建议并创建新素材实验', outcome: '预期提升点击率与客户信任度' },
      kpiRefs: ['C4', 'M6'],
      experimentProgress: { label: 'E3 素材实验', currentStep: 4, totalSteps: 7 },
      currentStage: 'at_sales',
      auditLog: [
        audit('l1', '2026-04-06T14:00:00', 'hui_triggered', 'HUI'),
        audit('l2', '2026-04-06T14:30:00', 'delivery_submit_ops', '李四'),
        audit('l3', '2026-04-06T15:10:00', 'ops_polish', '王五', '强化勤勉度表达'),
        audit('l4', '2026-04-06T15:45:00', 'ops_submit_sales', '王五'),
      ],
    },
    {
      id: 'atc-12',
      clientId: 'novelking',
      clientName: 'NovelKing 阅读',
      occurredAt: '2026-04-06T22:30:00',
      slaDueAt: '2026-04-07T02:30:00',
      sensitivity: 'P2',
      eventType: 'bidding',
      huiPayloadSummary: '{"peakHour":"22-01","bidBoost":0.15}',
      customerCopyDraft: '夜间阅读高峰时段，AI 已自动提升出价强度，精准捕获黄金阅读人群。',
      narrative: { signal: '进入夜间阅读高峰', strategy: '分时段动态出价', action: '提升 22:00-01:00 出价权重', outcome: '最大化夜间转化收益' },
      kpiRefs: ['B1', 'M6'],
      currentStage: 'at_sales',
      auditLog: [
        audit('l1', '2026-04-06T22:30:00', 'hui_triggered', 'HUI'),
        audit('l2', '2026-04-07T07:00:00', 'delivery_submit_ops', '赵六'),
        audit('l3', '2026-04-07T08:00:00', 'ops_submit_sales', '钱七'),
      ],
    },
    {
      id: 'atc-13',
      clientId: 'fintech',
      clientName: 'FinTech Pro',
      occurredAt: '2026-04-07T09:00:00',
      slaDueAt: '2026-04-07T13:00:00',
      sensitivity: 'P1',
      eventType: 'strategy',
      huiPayloadSummary: '{"marketOpen":"09:00","keywordPremium":0.20}',
      customerCopyDraft: '开盘时段 AI 已精准部署金融关键词溢价策略，提前锁定高意向人群。',
      narrative: { signal: '工作日开盘时间窗口', strategy: '金融行业时段敏感策略', action: '核心关键词溢价投放', outcome: '抢占开盘流量先机' },
      kpiRefs: ['B1', 'M6'],
      currentStage: 'at_sales',
      auditLog: [
        audit('l1', '2026-04-07T09:00:00', 'hui_triggered', 'HUI'),
        audit('l2', '2026-04-07T09:15:00', 'delivery_submit_ops', '张三'),
        audit('l3', '2026-04-07T09:40:00', 'ops_polish', '王五', '增加勤勉度表述'),
        audit('l4', '2026-04-07T09:50:00', 'ops_submit_sales', '王五'),
      ],
    },

    // ── 已发布 ──
    {
      id: 'atc-4',
      clientId: 'gameon',
      clientName: 'GameOn 游戏',
      occurredAt: '2026-04-05T22:00:00',
      slaDueAt: '2026-04-05T22:00:00',
      sensitivity: 'P2',
      eventType: 'strategy',
      huiPayloadSummary: '{"experiment":"E7","phase":"validation"}',
      customerCopyDraft: '本周实验已进入验证阶段：数据表明新定向策略在核心人群上表现突出，建议逐步扩量。',
      narrative: { signal: '实验样本量达到统计显著', strategy: 'E7 类实验闭环', action: '汇总对照组与实验组关键指标', outcome: '验证成功后可安全扩量' },
      kpiRefs: ['M6'],
      experimentProgress: { label: 'E7 定向实验', currentStep: 6, totalSteps: 7 },
      currentStage: 'published',
      auditLog: [
        audit('l1', '2026-04-05T22:00:00', 'hui_triggered', 'HUI'),
        audit('l2', '2026-04-06T09:00:00', 'delivery_submit_ops', '赵六'),
        audit('l3', '2026-04-06T10:20:00', 'ops_submit_sales', '钱七'),
        audit('l4', '2026-04-06T11:00:00', 'sales_publish', '孙八', '终审发布'),
      ],
    },
    {
      id: 'atc-7',
      clientId: 'novelking',
      clientName: 'NovelKing 阅读',
      occurredAt: '2026-04-03T10:00:00',
      slaDueAt: '2026-04-03T14:00:00',
      sensitivity: 'P1',
      eventType: 'creative',
      huiPayloadSummary: '{"ctr":"优秀区间","cpa":"良好"}',
      customerCopyDraft: '新素材组点击率表现突出，获客成本保持在健康区间，AI 已将其设为主力创意。',
      narrative: { signal: '新素材上线后指标快速改善', strategy: '评级标签替代精确 CPA/CTR', action: '切换主力创意并持续监测', outcome: '巩固转化效率' },
      kpiRefs: ['C4', 'M6'],
      currentStage: 'published',
      auditLog: [
        audit('l1', '2026-04-03T10:00:00', 'hui_triggered', 'HUI'),
        audit('l2', '2026-04-03T10:30:00', 'delivery_submit_ops', '李四'),
        audit('l3', '2026-04-03T11:00:00', 'ops_submit_sales', '王五'),
        audit('l4', '2026-04-03T11:15:00', 'sales_publish', '孙八', '快速通道发布'),
      ],
    },
    {
      id: 'atc-14',
      clientId: 'quickbuy',
      clientName: 'QuickBuy 电商',
      occurredAt: '2026-04-05T20:30:00',
      slaDueAt: '2026-04-06T00:30:00',
      sensitivity: 'P2',
      eventType: 'bidding',
      huiPayloadSummary: '{"primeHour":"20-22","roasLive":1.68}',
      customerCopyDraft: '黄金购物时段 AI 智能竞价出色发挥，投放回报率大幅超额，为您高效获取优质客流。',
      narrative: { signal: '晚高峰竞价数据表现突出', strategy: '高意向时段激进竞价', action: '自动加价并优化定向', outcome: 'ROAS 大幅超额' },
      kpiRefs: ['B1', 'M6'],
      currentStage: 'published',
      auditLog: [
        audit('l1', '2026-04-05T20:30:00', 'hui_triggered', 'HUI'),
        audit('l2', '2026-04-06T08:00:00', 'delivery_submit_ops', '张三'),
        audit('l3', '2026-04-06T09:00:00', 'ops_submit_sales', '钱七'),
        audit('l4', '2026-04-06T09:30:00', 'sales_publish', '孙八'),
      ],
    },
    {
      id: 'atc-15',
      clientId: 'medplus',
      clientName: 'MedPlus 医疗',
      occurredAt: '2026-04-04T17:30:00',
      slaDueAt: '2026-04-04T21:30:00',
      sensitivity: 'P1',
      eventType: 'strategy',
      huiPayloadSummary: '{"budgetShift":"tiktok_health","pct":0.25}',
      customerCopyDraft: '下班时段健康关注度提升，AI 已灵活调配预算至短视频健康内容渠道，精准触达目标人群。',
      narrative: { signal: '下班后健康搜索量上升', strategy: '渠道动态调权', action: '向 TikTok 健康内容倾斜 25% 预算', outcome: '高效覆盖目标受众' },
      kpiRefs: ['B1', 'M6'],
      currentStage: 'published',
      auditLog: [
        audit('l1', '2026-04-04T17:30:00', 'hui_triggered', 'HUI'),
        audit('l2', '2026-04-04T18:00:00', 'delivery_submit_ops', '李四'),
        audit('l3', '2026-04-04T19:00:00', 'ops_submit_sales', '王五'),
        audit('l4', '2026-04-04T19:20:00', 'sales_publish', '周九'),
      ],
    },

    // ── 已拦截 / 废弃 ──
    {
      id: 'atc-5',
      clientId: 'fintech',
      clientName: 'FinTech Pro',
      occurredAt: '2026-04-07T01:00:00',
      slaDueAt: '2026-04-07T05:00:00',
      sensitivity: 'P2',
      eventType: 'bidding',
      huiPayloadSummary: '{"deltaPct":0.003,"action":"minor_bid"}',
      customerCopyDraft: '（已废弃）',
      narrative: { signal: '微小出价波动', strategy: '低于 1% 影响阈值', action: '不对外展示', outcome: '已拦截' },
      kpiRefs: [],
      currentStage: 'blocked',
      blockedReason: '交付判定为琐碎动作，预算变动小于 1%，终止流转',
      auditLog: [
        audit('l1', '2026-04-07T01:00:00', 'hui_triggered', 'HUI'),
        audit('l2', '2026-04-07T01:20:00', 'delivery_reject', '张三', '琐碎动作拦截'),
      ],
    },
    {
      id: 'atc-6',
      clientId: 'shopmax',
      clientName: 'ShopMax 电商',
      occurredAt: '2026-04-04T18:00:00',
      slaDueAt: '2026-04-04T22:00:00',
      sensitivity: 'P1',
      eventType: 'monitor',
      huiPayloadSummary: '{"visibility":"customer_timeline"}',
      customerCopyDraft: '（销售已隐藏，前台不可见）',
      narrative: { signal: '客情敏感期', strategy: '销售评估不宜推送自动化叙事', action: '隐藏拦截', outcome: '避免负面触达' },
      kpiRefs: ['M6'],
      currentStage: 'blocked',
      blockedReason: '销售判断当前客情不佳，隐藏前台展示',
      auditLog: [
        audit('l1', '2026-04-04T18:00:00', 'hui_triggered', 'HUI'),
        audit('l2', '2026-04-04T19:00:00', 'delivery_submit_ops', '李四'),
        audit('l3', '2026-04-04T20:00:00', 'ops_submit_sales', '王五'),
        audit('l4', '2026-04-04T20:30:00', 'sales_hide', '周九', '客情干预'),
      ],
    },
    {
      id: 'atc-16',
      clientId: 'gameon',
      clientName: 'GameOn 游戏',
      occurredAt: '2026-04-06T04:00:00',
      slaDueAt: '2026-04-06T08:00:00',
      sensitivity: 'P2',
      eventType: 'monitor',
      huiPayloadSummary: '{"cpiBidChange":0.005}',
      customerCopyDraft: '（已废弃）',
      narrative: { signal: '凌晨 CPI 微幅波动', strategy: '低于展示阈值', action: '不对外展示', outcome: '已拦截' },
      kpiRefs: [],
      currentStage: 'blocked',
      blockedReason: '交付判定为噪声事件，自动拦截',
      auditLog: [
        audit('l1', '2026-04-06T04:00:00', 'hui_triggered', 'HUI'),
        audit('l2', '2026-04-06T04:10:00', 'delivery_reject', '赵六', '噪声事件拦截'),
      ],
    },
    {
      id: 'atc-17',
      clientId: 'payeasy',
      clientName: 'PayEasy 支付',
      occurredAt: '2026-04-05T11:00:00',
      slaDueAt: '2026-04-05T15:00:00',
      sensitivity: 'P2',
      eventType: 'bidding',
      huiPayloadSummary: '{"system":"timeout_12h"}',
      customerCopyDraft: '（系统超时拦截）',
      narrative: { signal: '销售 12 小时未处理', strategy: '超时兜底机制', action: '系统自动隐藏拦截', outcome: '避免过期信息触达客户' },
      kpiRefs: [],
      currentStage: 'blocked',
      blockedReason: '销售环节超时 12 小时，系统自动隐藏拦截',
      auditLog: [
        audit('l1', '2026-04-05T11:00:00', 'hui_triggered', 'HUI'),
        audit('l2', '2026-04-05T11:30:00', 'delivery_submit_ops', '张三'),
        audit('l3', '2026-04-05T12:00:00', 'ops_submit_sales', '王五'),
        audit('l4', '2026-04-06T00:00:00', 'system_timeout_hide', '系统', '销售超时 12h，自动拦截'),
      ],
    },
  ]
}

export function cloneAtcReviewEvents(): AtcReviewEvent[] {
  return JSON.parse(JSON.stringify(seedEvents())) as AtcReviewEvent[]
}

export const ATC_REVIEW_EVENTS_SEED = seedEvents()

/* ══ Persona 能力雷达 — 6 维模型 ══ */

export type PersonaRadarDimensions = {
  retention: number
  exploration: number
  precision: number
  efficiency: number
  riskControl: number
  creativity: number
}

export const DIMENSION_KEYS: (keyof PersonaRadarDimensions)[] = [
  'retention', 'exploration', 'precision', 'efficiency', 'riskControl', 'creativity',
]

export const DIMENSION_LABELS: Record<keyof PersonaRadarDimensions, string> = {
  retention: '留存',
  exploration: '探索',
  precision: '精准',
  efficiency: '效率',
  riskControl: '风控',
  creativity: '创意',
}

export type QuoteLibraryStatus = 'draft' | 'under_review' | 'available' | 'retired'
export type QuoteRetiredReason = 'normal' | 'safety'

export type PersonaQuote = {
  id: string
  text: string
  author: string
  authorLifespan: string
  authorTitle: string
  locale: 'en' | 'zh'
  dimensionAffinity: PersonaRadarDimensions
  tags: string[]
  status: QuoteLibraryStatus
  retiredType?: QuoteRetiredReason
  retiredReason?: string
  reviewedBy?: string
  reviewedAt?: string
}

export type PersonaLockStatus = 'auto_selected' | 'in_review' | 'locked' | 'unlocked' | 'pending_manual'
export type ReviewStage = 'at_delivery' | 'at_ops' | 'at_sales'

export type PersonaSnapshot = {
  clientId: string
  evaluationPeriod: { start: string; end: string }
  current: PersonaRadarDimensions
  previous: PersonaRadarDimensions
  selectedQuoteId: string
  quoteMatchScore: number
  lockStatus: PersonaLockStatus
  reviewStage?: ReviewStage
  rejectedFrom?: ReviewStage
  rejectedReason?: string
  copyOverride?: string
  lockedBy?: string
  lockedAt?: string
  unlockReason?: string
  generatedAt: string
  isDemo: boolean
  version: number
}

export type PersonaAuditAction =
  | 'created' | 'review_pass' | 'review_reject'
  | 'quote_change' | 'lock' | 'unlock' | 'force_unlock' | 'copy_override'

export type PersonaAuditEntry = {
  snapshotClientId: string
  snapshotVersion: number
  action: PersonaAuditAction
  actor: string
  stage?: ReviewStage
  detail?: string
  timestamp: string
}

export const PERSONA_LOCK_STATUS_LABEL: Record<PersonaLockStatus, string> = {
  auto_selected: '算法推荐',
  in_review: '审核中',
  locked: '已锁定',
  unlocked: '待重新匹配',
  pending_manual: '待人工选择',
}

export const REVIEW_STAGE_LABEL: Record<ReviewStage, string> = {
  at_delivery: '交付待审',
  at_ops: '行运待审',
  at_sales: '销售待审',
}

/* ── 名言种子数据 ── */

export const PERSONA_QUOTES: PersonaQuote[] = [
  {
    id: 'q-drucker-01',
    text: 'Beware of little expenses; a small leak will sink a great ship.',
    author: 'Peter Drucker', authorLifespan: '1909–2005', authorTitle: '管理学之父',
    locale: 'en', tags: ['ecommerce', 'finance', 'general'],
    dimensionAffinity: { retention: 0.3, exploration: 0.1, precision: 0.5, efficiency: 0.9, riskControl: 0.8, creativity: 0.1 },
    status: 'available', reviewedBy: '品牌团队', reviewedAt: '2026-03-15',
  },
  {
    id: 'q-ogilvy-01',
    text: "If it doesn't sell, it isn't creative.",
    author: 'David Ogilvy', authorLifespan: '1911–1999', authorTitle: '广告教父',
    locale: 'en', tags: ['ecommerce', 'gaming'],
    dimensionAffinity: { retention: 0.2, exploration: 0.4, precision: 0.6, efficiency: 0.7, riskControl: 0.2, creativity: 0.9 },
    status: 'available', reviewedBy: '品牌团队', reviewedAt: '2026-03-15',
  },
  {
    id: 'q-bezos-01',
    text: 'Double the number of experiments you do per year.',
    author: 'Jeff Bezos', authorLifespan: '1964–', authorTitle: 'Amazon 创始人',
    locale: 'en', tags: ['ecommerce', 'gaming'],
    dimensionAffinity: { retention: 0.2, exploration: 0.9, precision: 0.3, efficiency: 0.4, riskControl: 0.2, creativity: 0.7 },
    status: 'available', reviewedBy: '品牌团队', reviewedAt: '2026-03-15',
  },
  {
    id: 'q-deming-01',
    text: 'In God we trust; all others must bring data.',
    author: 'W. Edwards Deming', authorLifespan: '1900–1993', authorTitle: '质量管理之父',
    locale: 'en', tags: ['healthcare', 'finance'],
    dimensionAffinity: { retention: 0.3, exploration: 0.2, precision: 0.9, efficiency: 0.5, riskControl: 0.6, creativity: 0.1 },
    status: 'available', reviewedBy: '品牌团队', reviewedAt: '2026-03-15',
  },
  {
    id: 'q-buffett-01',
    text: 'Risk comes from not knowing what you are doing.',
    author: 'Warren Buffett', authorLifespan: '1930–', authorTitle: '价值投资大师',
    locale: 'en', tags: ['finance', 'general'],
    dimensionAffinity: { retention: 0.5, exploration: 0.1, precision: 0.4, efficiency: 0.3, riskControl: 0.9, creativity: 0.1 },
    status: 'available', reviewedBy: '品牌团队', reviewedAt: '2026-03-15',
  },
  {
    id: 'q-bernbach-01',
    text: 'Nobody counts the number of ads you run; they just remember the impression you make.',
    author: 'Bill Bernbach', authorLifespan: '1911–1982', authorTitle: '创意革命先驱',
    locale: 'en', tags: ['ecommerce', 'entertainment'],
    dimensionAffinity: { retention: 0.4, exploration: 0.3, precision: 0.2, efficiency: 0.2, riskControl: 0.1, creativity: 0.9 },
    status: 'available', reviewedBy: '品牌团队', reviewedAt: '2026-03-15',
  },
  {
    id: 'q-grove-01',
    text: 'Only the paranoid survive.',
    author: 'Andy Grove', authorLifespan: '1936–2016', authorTitle: 'Intel 前 CEO',
    locale: 'en', tags: ['finance', 'gaming'],
    dimensionAffinity: { retention: 0.6, exploration: 0.3, precision: 0.4, efficiency: 0.3, riskControl: 0.9, creativity: 0.2 },
    status: 'available', reviewedBy: '品牌团队', reviewedAt: '2026-03-15',
  },
  {
    id: 'q-sunzi-01',
    text: '知彼知己，百战不殆。',
    author: '孙子', authorLifespan: '约前544–前496', authorTitle: '兵法家',
    locale: 'zh', tags: ['gaming', 'finance'],
    dimensionAffinity: { retention: 0.6, exploration: 0.3, precision: 0.8, efficiency: 0.4, riskControl: 0.7, creativity: 0.2 },
    status: 'under_review',
  },
  {
    id: 'q-zuck-01',
    text: 'Move fast and break things.',
    author: 'Mark Zuckerberg', authorLifespan: '1984–', authorTitle: 'Meta 创始人',
    locale: 'en', tags: ['gaming', 'entertainment'],
    dimensionAffinity: { retention: 0.1, exploration: 0.9, precision: 0.2, efficiency: 0.5, riskControl: 0.1, creativity: 0.7 },
    status: 'retired', retiredType: 'safety', retiredReason: '品牌安全风险：与"破坏"关联过强',
    reviewedBy: '合规团队', reviewedAt: '2026-04-01',
  },
  {
    id: 'q-kelleher-01',
    text: 'The business of business is people.',
    author: 'Herb Kelleher', authorLifespan: '1931–2019', authorTitle: 'Southwest Airlines 创始人',
    locale: 'en', tags: ['general'],
    dimensionAffinity: { retention: 0.8, exploration: 0.3, precision: 0.2, efficiency: 0.4, riskControl: 0.3, creativity: 0.5 },
    status: 'draft',
  },
]

/* ── 客户 Persona 快照种子数据 ── */

export const clientPersonaSnapshots: PersonaSnapshot[] = [
  {
    clientId: 'wavebone', evaluationPeriod: { start: '2026-03-29', end: '2026-04-06' },
    current: { retention: 72, exploration: 68, precision: 74, efficiency: 78, riskControl: 72, creativity: 85 },
    previous: { retention: 68, exploration: 65, precision: 70, efficiency: 74, riskControl: 70, creativity: 82 },
    selectedQuoteId: 'q-ogilvy-01', quoteMatchScore: 0.91,
    lockStatus: 'in_review', reviewStage: 'at_delivery',
    generatedAt: '2026-04-06T00:00:00', isDemo: true, version: 3,
  },
  {
    clientId: 'quickbuy', evaluationPeriod: { start: '2026-03-29', end: '2026-04-06' },
    current: { retention: 76, exploration: 62, precision: 70, efficiency: 82, riskControl: 68, creativity: 74 },
    previous: { retention: 74, exploration: 60, precision: 68, efficiency: 80, riskControl: 66, creativity: 72 },
    selectedQuoteId: 'q-drucker-01', quoteMatchScore: 0.88,
    lockStatus: 'locked', lockedBy: '孙八', lockedAt: '2026-04-01T10:00:00',
    generatedAt: '2026-03-29T00:00:00', isDemo: true, version: 2,
  },
  {
    clientId: 'medplus', evaluationPeriod: { start: '2026-03-29', end: '2026-04-06' },
    current: { retention: 80, exploration: 56, precision: 86, efficiency: 71, riskControl: 88, creativity: 60 },
    previous: { retention: 78, exploration: 54, precision: 84, efficiency: 70, riskControl: 86, creativity: 58 },
    selectedQuoteId: 'q-deming-01', quoteMatchScore: 0.93,
    lockStatus: 'locked', lockedBy: '周九', lockedAt: '2026-04-03T11:20:00',
    generatedAt: '2026-03-29T00:00:00', isDemo: true, version: 4,
  },
  {
    clientId: 'gameon', evaluationPeriod: { start: '2026-03-29', end: '2026-04-06' },
    current: { retention: 64, exploration: 82, precision: 66, efficiency: 80, riskControl: 70, creativity: 88 },
    previous: { retention: 62, exploration: 80, precision: 64, efficiency: 78, riskControl: 68, creativity: 86 },
    selectedQuoteId: 'q-bezos-01', quoteMatchScore: 0.89,
    lockStatus: 'in_review', reviewStage: 'at_ops',
    generatedAt: '2026-04-06T00:00:00', isDemo: true, version: 2,
  },
  {
    clientId: 'fintech', evaluationPeriod: { start: '2026-03-29', end: '2026-04-06' },
    current: { retention: 78, exploration: 58, precision: 82, efficiency: 75, riskControl: 86, creativity: 60 },
    previous: { retention: 76, exploration: 56, precision: 80, efficiency: 73, riskControl: 84, creativity: 58 },
    selectedQuoteId: 'q-buffett-01', quoteMatchScore: 0.94,
    lockStatus: 'locked', lockedBy: '孙八', lockedAt: '2026-04-02T14:00:00',
    generatedAt: '2026-03-29T00:00:00', isDemo: true, version: 3,
  },
  {
    clientId: 'shopmax', evaluationPeriod: { start: '2026-03-29', end: '2026-04-06' },
    current: { retention: 70, exploration: 72, precision: 68, efficiency: 77, riskControl: 74, creativity: 70 },
    previous: { retention: 68, exploration: 70, precision: 66, efficiency: 75, riskControl: 72, creativity: 68 },
    selectedQuoteId: 'q-drucker-01', quoteMatchScore: 0.43,
    lockStatus: 'pending_manual',
    generatedAt: '2026-04-06T00:00:00', isDemo: true, version: 1,
  },
  {
    clientId: 'novelking', evaluationPeriod: { start: '2026-03-29', end: '2026-04-06' },
    current: { retention: 74, exploration: 76, precision: 72, efficiency: 83, riskControl: 76, creativity: 86 },
    previous: { retention: 72, exploration: 74, precision: 70, efficiency: 81, riskControl: 74, creativity: 84 },
    selectedQuoteId: 'q-bernbach-01', quoteMatchScore: 0.90,
    lockStatus: 'locked', lockedBy: '孙八', lockedAt: '2026-04-04T09:00:00',
    generatedAt: '2026-03-29T00:00:00', isDemo: true, version: 2,
  },
  {
    clientId: 'payeasy', evaluationPeriod: { start: '2026-03-29', end: '2026-04-06' },
    current: { retention: 82, exploration: 54, precision: 78, efficiency: 74, riskControl: 84, creativity: 62 },
    previous: { retention: 80, exploration: 52, precision: 76, efficiency: 72, riskControl: 82, creativity: 60 },
    selectedQuoteId: 'q-grove-01', quoteMatchScore: 0.92,
    lockStatus: 'locked', lockedBy: '周九', lockedAt: '2026-04-03T16:00:00',
    generatedAt: '2026-03-29T00:00:00', isDemo: true, version: 3,
  },
]

/* ── Persona 查询/操作接口 ── */

export function getPersonaRadarForClient(clientId: string): PersonaRadarDimensions {
  const snap = clientPersonaSnapshots.find(s => s.clientId === clientId)
  return snap?.current ?? { retention: 70, exploration: 70, precision: 70, efficiency: 70, riskControl: 70, creativity: 70 }
}

export function getPersonaSnapshotForClient(clientId: string): PersonaSnapshot | undefined {
  return clientPersonaSnapshots.find(s => s.clientId === clientId)
}

export function getPersonaQuoteById(quoteId: string): PersonaQuote | undefined {
  return PERSONA_QUOTES.find(q => q.id === quoteId)
}

export function getAvailableQuotes(): PersonaQuote[] {
  return PERSONA_QUOTES.filter(q => q.status === 'available')
}

export function matchQuoteForRadar(
  scores: PersonaRadarDimensions,
  industryTag?: string,
): { quote: PersonaQuote; matchScore: number } | null {
  const available = getAvailableQuotes()
  if (available.length === 0) return null

  const sVals = DIMENSION_KEYS.map(k => scores[k])
  const sMag = Math.sqrt(sVals.reduce((s, v) => s + v * v, 0))

  let best: { quote: PersonaQuote; matchScore: number } | null = null

  for (const q of available) {
    const qVals = DIMENSION_KEYS.map(k => q.dimensionAffinity[k])
    const qMag = Math.sqrt(qVals.reduce((s, v) => s + v * v, 0))
    const dot = sVals.reduce((s, v, i) => s + v * qVals[i], 0)
    let sim = sMag > 0 && qMag > 0 ? dot / (sMag * qMag) : 0
    if (industryTag && q.tags.includes(industryTag)) sim += 0.05
    sim = Math.min(sim, 1)
    if (!best || sim > best.matchScore) best = { quote: q, matchScore: sim }
  }

  return best && best.matchScore >= 0.5 ? best : null
}

export function canAlgorithmReplaceQuote(snapshot: PersonaSnapshot): boolean {
  return snapshot.lockStatus === 'auto_selected' || snapshot.lockStatus === 'unlocked'
}

export function isRejectedTask(snapshot: PersonaSnapshot): boolean {
  return snapshot.rejectedFrom != null && snapshot.rejectedReason != null
}

export function getSnapshotsForReview(filter?: {
  reviewStage?: ReviewStage
  lockStatus?: PersonaLockStatus
}): PersonaSnapshot[] {
  return clientPersonaSnapshots.filter(s => {
    if (filter?.reviewStage && s.reviewStage !== filter.reviewStage) return false
    if (filter?.lockStatus && s.lockStatus !== filter.lockStatus) return false
    return true
  })
}

export function getAllPersonaSnapshots(): PersonaSnapshot[] {
  return clientPersonaSnapshots
}

export function getQuoteLibraryHealth() {
  const quotes = PERSONA_QUOTES
  const available = quotes.filter(q => q.status === 'available')
  const locked = clientPersonaSnapshots.filter(s => s.lockStatus === 'locked')
  const usedQuoteIds = new Set(locked.map(s => s.selectedQuoteId))
  return {
    totalAvailable: available.length,
    totalDraft: quotes.filter(q => q.status === 'draft').length,
    totalUnderReview: quotes.filter(q => q.status === 'under_review').length,
    totalRetired: quotes.filter(q => q.status === 'retired').length,
    utilizationRate: available.length > 0 ? usedQuoteIds.size / available.length : 0,
  }
}

/* ── Clock 条目叙事（可选字段 + 回退） ── */

export function isClockOffHours(timeHHmm: string): boolean {
  const [h] = timeHHmm.split(':').map(Number)
  return h >= 22 || h < 7
}

export function getClockEntryNarrative(entry: ClockEntry): ClockNarrativeBlock {
  if (entry.narrative) return entry.narrative
  const cat = entry.category
  return {
    signal: `${entry.time} 时段系统监测到与「${cat}」相关的投放信号`,
    strategy: '结合行业模板与实时数据推导当日策略权重',
    action: entry.description,
    outcome:
      entry.effect.type === 'saved'
        ? '形成可量化的成本优化结果'
        : entry.effect.type === 'blocked'
          ? '拦截风险并减少浪费消耗'
          : '保持投放状态稳定可控',
  }
}

export function obfuscateForSophistication(
  text: string,
  level: ClientSophistication
): string {
  if (level === 'advanced') return text
  let t = text
  t = t.replace(/PacingRatio|CPA|CTR|CPI|ROAS/gi, '核心指标')
  t = t.replace(/\$[\d,.]+|¥[\d,.]+|[\d.]+%/g, (m) =>
    level === 'basic' ? '（已区间化）' : m
  )
  return t
}

export function kpiRefLabel(ref: AtcKpiRef): string {
  if (ref === 'B1') return '预算平滑 B1'
  if (ref === 'C4') return '素材迭代 C4'
  return '健康分 M6'
}
