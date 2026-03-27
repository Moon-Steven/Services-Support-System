'use client'

import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Dialog } from '@/components/ui/Dialog'
import { Avatar } from '@/components/ui/Avatar'
import { clients } from '@/lib/data'

/* ─── Types ─── */
type AdAccount = {
  id: string
  clientId: string
  name: string
  platform: 'Meta' | 'Google' | 'TikTok'
  accountId: string
  active: boolean
  owner: string
  visibility: '只读' | '不可见'
  pixelIds: string[]
  strategies: number
  creatives: number
  audiences: number
  funded: number
  spent: number
  currency: string
  timezone: string
  createdAt: string
}

type Pixel = {
  id: string
  abbr: string
  name: string
  pixelId: string
  status: '正常' | '待配置'
  lastFired: string
  events: string[]
}

type Transaction = {
  id: string
  clientId: string
  accountName: string
  date: string
  type: '打款' | '退款' | '充值'
  amount: number
  status: '已完成' | '处理中' | '已取消'
  operator: string
  note: string
}

type DialogType = null | 'addAccount' | 'editAccount' | 'recharge' | 'bindPixel' | 'addTransaction'

/* ─── Data ─── */
const adAccounts: AdAccount[] = [
  { id: 'a1', clientId: 'wavebone', name: 'Wavebone_Meta_主账户', platform: 'Meta', accountId: 'act_123456789', active: true, owner: 'Sandwich Lab', visibility: '只读', pixelIds: ['px1'], strategies: 3, creatives: 12, audiences: 4, funded: 25000, spent: 12450, currency: 'USD', timezone: 'America/New_York', createdAt: '2026-03-15' },
  { id: 'a2', clientId: 'wavebone', name: 'Wavebone_Meta_测试', platform: 'Meta', accountId: 'act_987654321', active: true, owner: 'Sandwich Lab', visibility: '不可见', pixelIds: ['px1'], strategies: 1, creatives: 8, audiences: 2, funded: 5000, spent: 2800, currency: 'USD', timezone: 'America/New_York', createdAt: '2026-03-20' },
  { id: 'a3', clientId: 'wavebone', name: 'Wavebone_TikTok', platform: 'TikTok', accountId: 'tt_adv_001', active: false, owner: 'Sandwich Lab', visibility: '不可见', pixelIds: ['px3'], strategies: 0, creatives: 5, audiences: 1, funded: 3000, spent: 0, currency: 'USD', timezone: 'America/New_York', createdAt: '2026-03-22' },
  { id: 'a4', clientId: 'fintech', name: 'FinTech_Google_主账户', platform: 'Google', accountId: '123-456-7890', active: true, owner: 'Sandwich Lab', visibility: '只读', pixelIds: ['px2'], strategies: 2, creatives: 15, audiences: 3, funded: 8000, spent: 5200, currency: 'USD', timezone: 'Asia/Shanghai', createdAt: '2026-03-18' },
  { id: 'a5', clientId: 'fintech', name: 'FinTech_Meta_获客', platform: 'Meta', accountId: 'act_555666777', active: true, owner: 'Sandwich Lab', visibility: '不可见', pixelIds: ['px1'], strategies: 2, creatives: 8, audiences: 2, funded: 6000, spent: 3800, currency: 'USD', timezone: 'Asia/Shanghai', createdAt: '2026-03-21' },
  { id: 'a6', clientId: 'shopmax', name: 'ShopMax_Meta', platform: 'Meta', accountId: 'act_111222333', active: true, owner: 'Sandwich Lab', visibility: '只读', pixelIds: ['px1'], strategies: 1, creatives: 6, audiences: 1, funded: 10000, spent: 7500, currency: 'USD', timezone: 'America/Los_Angeles', createdAt: '2026-03-10' },
  { id: 'a7', clientId: 'gameon', name: 'GameOn_Meta', platform: 'Meta', accountId: 'act_444555666', active: true, owner: 'Sandwich Lab', visibility: '只读', pixelIds: ['px1'], strategies: 2, creatives: 10, audiences: 3, funded: 4000, spent: 2100, currency: 'USD', timezone: 'Asia/Tokyo', createdAt: '2026-03-23' },
  { id: 'a8', clientId: 'gameon', name: 'GameOn_Google', platform: 'Google', accountId: '456-789-0123', active: true, owner: 'Sandwich Lab', visibility: '不可见', pixelIds: ['px2'], strategies: 1, creatives: 4, audiences: 1, funded: 2000, spent: 800, currency: 'USD', timezone: 'Asia/Tokyo', createdAt: '2026-03-25' },
  { id: 'a9', clientId: 'readnow', name: 'ReadNow_Meta', platform: 'Meta', accountId: 'act_777888999', active: true, owner: 'Sandwich Lab', visibility: '只读', pixelIds: ['px1'], strategies: 1, creatives: 9, audiences: 2, funded: 15000, spent: 9200, currency: 'USD', timezone: 'America/New_York', createdAt: '2026-03-12' },
  { id: 'a10', clientId: 'travelgo', name: 'TravelGo_Meta', platform: 'Meta', accountId: 'act_333444555', active: true, owner: 'Sandwich Lab', visibility: '只读', pixelIds: ['px1'], strategies: 1, creatives: 5, audiences: 1, funded: 8000, spent: 4500, currency: 'USD', timezone: 'Europe/London', createdAt: '2026-03-16' },
  { id: 'a11', clientId: 'payeasy', name: 'PayEasy_Google', platform: 'Google', accountId: '789-012-3456', active: true, owner: 'Sandwich Lab', visibility: '只读', pixelIds: ['px2'], strategies: 1, creatives: 3, audiences: 1, funded: 5000, spent: 1200, currency: 'USD', timezone: 'Asia/Shanghai', createdAt: '2026-03-20' },
  { id: 'a12', clientId: 'luxevibe', name: 'LuxeVibe_Meta', platform: 'Meta', accountId: 'act_888999000', active: true, owner: 'Sandwich Lab', visibility: '只读', pixelIds: ['px1'], strategies: 1, creatives: 7, audiences: 2, funded: 6000, spent: 3100, currency: 'USD', timezone: 'America/New_York', createdAt: '2026-03-19' },
]

const pixelMap: Record<string, Pixel> = {
  px1: { id: 'px1', abbr: 'FB', name: 'Meta Pixel', pixelId: 'px_1234567890', status: '正常', lastFired: '2 分钟前', events: ['Purchase', 'AddToCart', 'ViewContent', 'Lead'] },
  px2: { id: 'px2', abbr: 'GA', name: 'Google Analytics 4', pixelId: 'G-ABCDEF1234', status: '正常', lastFired: '5 分钟前', events: ['purchase', 'add_to_cart', 'page_view'] },
  px3: { id: 'px3', abbr: 'TT', name: 'TikTok Pixel', pixelId: 'tt_px_00123', status: '待配置', lastFired: '尚未安装', events: [] },
}

const allTransactions: Transaction[] = [
  { id: 't1', clientId: 'wavebone', accountName: 'Meta_主账户', date: '2026-03-20', type: '打款', amount: 15000, status: '已完成', operator: '王斯琼', note: '测试期首笔充值' },
  { id: 't2', clientId: 'wavebone', accountName: 'Meta_主账户', date: '2026-03-25', type: '充值', amount: 10000, status: '已完成', operator: '王斯琼', note: '追加预算' },
  { id: 't3', clientId: 'wavebone', accountName: 'Meta_测试', date: '2026-03-22', type: '打款', amount: 5000, status: '已完成', operator: '王斯琼', note: '测试账户充值' },
  { id: 't4', clientId: 'wavebone', accountName: 'TikTok', date: '2026-03-22', type: '打款', amount: 3000, status: '处理中', operator: '郭晋光', note: 'TikTok 账户启动' },
  { id: 't5', clientId: 'wavebone', accountName: 'Meta_主账户', date: '2026-03-27', type: '退款', amount: 2000, status: '处理中', operator: '明虎', note: '素材审核未通过退回' },
  { id: 't6', clientId: 'fintech', accountName: 'Google_主账户', date: '2026-03-18', type: '打款', amount: 8000, status: '已完成', operator: '郭晋光', note: 'Google 账户启动' },
  { id: 't7', clientId: 'fintech', accountName: 'Meta_获客', date: '2026-03-21', type: '打款', amount: 6000, status: '已完成', operator: '王斯琼', note: '获客账户启动' },
  { id: 't8', clientId: 'gameon', accountName: 'Meta', date: '2026-03-23', type: '打款', amount: 4000, status: '已完成', operator: '郭晋光', note: '账户充值' },
  { id: 't9', clientId: 'gameon', accountName: 'Google', date: '2026-03-25', type: '打款', amount: 2000, status: '已完成', operator: '郭晋光', note: '品牌账户充值' },
  { id: 't10', clientId: 'shopmax', accountName: 'Meta', date: '2026-03-19', type: '打款', amount: 10000, status: '已完成', operator: '王斯琼', note: '首笔充值' },
  { id: 't11', clientId: 'readnow', accountName: 'Meta', date: '2026-03-12', type: '打款', amount: 15000, status: '已完成', operator: '郭晋光', note: '投放启动充值' },
  { id: 't12', clientId: 'travelgo', accountName: 'Meta', date: '2026-03-16', type: '打款', amount: 8000, status: '已完成', operator: '郭晋光', note: '首笔充值' },
  { id: 't13', clientId: 'payeasy', accountName: 'Google', date: '2026-03-20', type: '打款', amount: 5000, status: '已完成', operator: '王斯琼', note: 'Google 账户启动' },
  { id: 't14', clientId: 'luxevibe', accountName: 'Meta', date: '2026-03-19', type: '打款', amount: 6000, status: '已完成', operator: '王斯琼', note: '首笔充值' },
]

const platformColors: Record<string, string> = { Meta: '#1877F2', Google: '#34A853', TikTok: '#010101' }

const gradeVariant = (g: string): 'cyan' | 'orange' | 'dark' | 'grey' => {
  if (g === 'S') return 'dark'
  if (g === 'A') return 'cyan'
  if (g === 'B') return 'orange'
  return 'grey'
}

/* ─── AccountRow Sub-Component ─── */
function AccountRow({ acct, expanded, onToggle, onRecharge, onEdit }: {
  acct: AdAccount; expanded: boolean; onToggle: () => void; onRecharge: () => void; onEdit: () => void
}) {
  const balance = acct.funded - acct.spent
  const spentPct = acct.funded > 0 ? Math.round((acct.spent / acct.funded) * 100) : 0
  const accountPixels = acct.pixelIds.map((pid) => pixelMap[pid]).filter(Boolean)

  return (
    <div className="border border-stroke rounded-lg overflow-hidden">
      <div className="flex items-center gap-[var(--space-3)] px-[var(--space-3)] py-[var(--space-2)] cursor-pointer hover:bg-selected transition-colors" onClick={onToggle}>
        <div className="w-[28px] h-[28px] rounded-lg flex items-center justify-center text-[10px] font-bold text-white shrink-0" style={{ backgroundColor: platformColors[acct.platform] }}>
          {acct.platform[0]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-[var(--space-2)]">
            <span className="text-12-bold text-grey-01">{acct.name}</span>
            <Badge variant={acct.active ? 'cyan' : 'orange'}>{acct.active ? '活跃' : '待激活'}</Badge>
          </div>
          <div className="text-10-regular text-grey-08" style={{ fontFamily: 'monospace' }}>{acct.accountId}</div>
        </div>
        <div className="w-[120px] shrink-0">
          <div className="flex justify-between text-10-regular mb-[2px]">
            <span className="text-grey-08">消耗 {spentPct}%</span>
            <span className="text-grey-06">${balance.toLocaleString()}</span>
          </div>
          <div className="h-[4px] bg-grey-12 rounded-full overflow-hidden">
            <div className="h-full bg-l-cyan rounded-full transition-all" style={{ width: `${spentPct}%` }} />
          </div>
        </div>
        <span className="text-10-regular text-grey-08 shrink-0">{acct.strategies + acct.creatives + acct.audiences} 资产</span>
        <div className="flex gap-[var(--space-1)] shrink-0" onClick={(e) => e.stopPropagation()}>
          <button onClick={onRecharge} className="px-[var(--space-2)] py-[3px] rounded text-10-regular bg-grey-01 text-white border-none cursor-pointer font-[inherit]">充值</button>
          <button onClick={onEdit} className="px-[var(--space-2)] py-[3px] rounded text-10-regular bg-transparent text-grey-06 border border-stroke cursor-pointer font-[inherit]">编辑</button>
        </div>
        <svg className={`w-[12px] h-[12px] text-grey-08 shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M3 4.5L6 7.5L9 4.5" />
        </svg>
      </div>

      {expanded && (
        <div className="px-[var(--space-4)] py-[var(--space-3)] bg-bg border-t border-stroke">
          <div className="grid grid-cols-6 gap-[var(--space-3)] mb-[var(--space-3)]">
            {[
              { label: '平台', value: acct.platform },
              { label: '所有权', value: acct.owner },
              { label: '客户可见', value: acct.visibility },
              { label: '币种', value: acct.currency },
              { label: '时区', value: acct.timezone.split('/')[1] },
              { label: '创建日期', value: acct.createdAt },
            ].map((item) => (
              <div key={item.label}>
                <div className="text-10-regular text-grey-08">{item.label}</div>
                <div className="text-12-medium text-grey-01 mt-[1px]">{item.value}</div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-[var(--space-4)] mb-[var(--space-3)] pb-[var(--space-3)] border-b border-stroke">
            <div><div className="text-10-regular text-grey-08">已充值</div><div className="text-14-bold text-grey-01">${acct.funded.toLocaleString()}</div></div>
            <div><div className="text-10-regular text-grey-08">已消耗</div><div className="text-14-bold text-orange">${acct.spent.toLocaleString()}</div></div>
            <div><div className="text-10-regular text-grey-08">余额</div><div className="text-14-bold text-l-cyan">${balance.toLocaleString()}</div></div>
          </div>
          <div className="mb-[var(--space-3)]">
            <div className="text-10-regular text-grey-08 mb-[var(--space-1)]">绑定追踪</div>
            <div className="flex gap-[var(--space-2)]">
              {accountPixels.length === 0 ? (
                <span className="text-10-regular text-grey-08">未绑定</span>
              ) : (
                accountPixels.map((px) => (
                  <div key={px.id} className="flex items-center gap-[var(--space-1)] px-[var(--space-2)] py-[2px] bg-white rounded-full border border-stroke">
                    <div className="w-[14px] h-[14px] rounded bg-grey-01 text-white flex items-center justify-center text-[8px] font-bold">{px.abbr}</div>
                    <span className="text-10-regular text-grey-06">{px.name}</span>
                    <span className={`w-[5px] h-[5px] rounded-full ${px.status === '正常' ? 'bg-l-cyan' : 'bg-orange'}`} />
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="flex gap-[var(--space-4)]">
            <div className="text-10-regular text-grey-08">投放策略 <span className="text-12-bold text-grey-01">{acct.strategies}</span></div>
            <div className="text-10-regular text-grey-08">素材创意 <span className="text-12-bold text-grey-01">{acct.creatives}</span></div>
            <div className="text-10-regular text-grey-08">人群包 <span className="text-12-bold text-grey-01">{acct.audiences}</span></div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Main Component ─── */
export default function AssetsPage() {
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id || '')
  const [search, setSearch] = useState('')
  const [expandedAccountId, setExpandedAccountId] = useState<string | null>(null)
  const [dialogType, setDialogType] = useState<DialogType>(null)
  const [dialogAccountId, setDialogAccountId] = useState<string | null>(null)

  const filteredClients = useMemo(() => clients.filter((c) => !search || c.name.toLowerCase().includes(search.toLowerCase())), [search])

  const selectedClient = clients.find((c) => c.id === selectedClientId) || clients[0]
  const clientAccounts = adAccounts.filter((a) => a.clientId === selectedClientId)
  const clientTransactions = allTransactions.filter((t) => t.clientId === selectedClientId)
  const clientPixelIds = [...new Set(clientAccounts.flatMap((a) => a.pixelIds))]
  const clientPixels = clientPixelIds.map((pid) => pixelMap[pid]).filter(Boolean)
  const totalFunded = clientAccounts.reduce((s, a) => s + a.funded, 0)
  const totalSpent = clientAccounts.reduce((s, a) => s + a.spent, 0)

  const dialogAccount = dialogAccountId ? adAccounts.find((a) => a.id === dialogAccountId) : null
  const closeDialog = () => { setDialogType(null); setDialogAccountId(null) }

  return (
    <div className="flex flex-col gap-[var(--space-3)]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-20-bold text-grey-01">资产管理</h1>
        <Button onClick={() => setDialogType('addAccount')}>+ 新增账户</Button>
      </div>

      {/* Main Layout */}
      <div className="flex gap-[var(--space-4)]" style={{ minHeight: 'calc(100vh - 140px)' }}>
        {/* Left: Client List */}
        <div className="w-[220px] shrink-0 flex flex-col gap-[var(--space-2)]">
          <Input placeholder="搜索客户..." value={search} onChange={(e) => setSearch(e.target.value)} className="!h-[30px] !text-[12px]" />
          <div className="flex flex-col gap-[var(--space-1)] flex-1 overflow-y-auto">
            {filteredClients.map((c) => {
              const acctCount = adAccounts.filter((a) => a.clientId === c.id).length
              return (
                <div key={c.id} onClick={() => { setSelectedClientId(c.id); setExpandedAccountId(null) }}
                  className={`flex items-center gap-[var(--space-2)] px-[var(--space-2)] py-[var(--space-2)] rounded-lg cursor-pointer transition-colors ${c.id === selectedClientId ? 'bg-selected' : 'hover:bg-selected'}`}
                >
                  <Avatar name={c.name[0]} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-[var(--space-1)]">
                      <span className="text-12-medium text-grey-01 truncate">{c.name}</span>
                      <Badge variant={gradeVariant(c.grade)}>{c.grade}</Badge>
                    </div>
                    <div className="text-10-regular text-grey-08">{c.industry}{acctCount > 0 ? ` · ${acctCount} 账户` : ''}</div>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="text-10-regular text-grey-08 text-center py-[var(--space-1)] border-t border-stroke">共 {filteredClients.length} 个客户</div>
        </div>

        {/* Right: Client Detail */}
        <div className="flex-1 flex flex-col gap-[var(--space-3)] min-w-0">
          {/* Client Header */}
          <div className="flex items-center gap-[var(--space-3)] px-[var(--space-4)] py-[var(--space-3)] bg-white rounded-[var(--radius-3)] border border-stroke">
            <Avatar name={selectedClient.name[0]} size="md" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-[var(--space-2)]">
                <span className="text-16-bold text-grey-01">{selectedClient.name}</span>
                <Badge variant={gradeVariant(selectedClient.grade)}>{selectedClient.grade}</Badge>
              </div>
              <div className="text-12-regular text-grey-08 mt-[2px]">{selectedClient.industry} · {selectedClient.channels?.join(' / ')}</div>
            </div>
            {clientAccounts.length > 0 && (
              <div className="flex items-center gap-[var(--space-5)] shrink-0">
                <div className="text-right"><div className="text-10-regular text-grey-08">总充值</div><div className="text-14-bold text-grey-01">${totalFunded.toLocaleString()}</div></div>
                <div className="text-right"><div className="text-10-regular text-grey-08">已消耗</div><div className="text-14-bold text-orange">${totalSpent.toLocaleString()}</div></div>
                <div className="text-right"><div className="text-10-regular text-grey-08">余额</div><div className="text-14-bold text-l-cyan">${(totalFunded - totalSpent).toLocaleString()}</div></div>
              </div>
            )}
          </div>

          {clientAccounts.length === 0 ? (
            <Card className="flex flex-col items-center py-[var(--space-8)]">
              <p className="text-14-regular text-grey-08">该客户暂无广告账户</p>
              <button onClick={() => setDialogType('addAccount')} className="text-12-medium text-l-cyan bg-transparent border-none cursor-pointer font-[inherit] mt-[var(--space-2)]">+ 添加首个账户</button>
            </Card>
          ) : (
            <>
              {/* Accounts */}
              <Card>
                <div className="flex items-center justify-between mb-[var(--space-3)]">
                  <h3 className="text-14-bold text-grey-01">渠道账户 ({clientAccounts.length})</h3>
                  <button onClick={() => setDialogType('addAccount')} className="text-12-medium text-l-cyan bg-transparent border-none cursor-pointer font-[inherit]">+ 添加账户</button>
                </div>
                <div className="flex flex-col gap-[var(--space-2)]">
                  {clientAccounts.map((acct) => (
                    <AccountRow
                      key={acct.id} acct={acct}
                      expanded={expandedAccountId === acct.id}
                      onToggle={() => setExpandedAccountId(expandedAccountId === acct.id ? null : acct.id)}
                      onRecharge={() => { setDialogAccountId(acct.id); setDialogType('recharge') }}
                      onEdit={() => { setDialogAccountId(acct.id); setDialogType('editAccount') }}
                    />
                  ))}
                </div>
              </Card>

              {/* Pixel & SDK */}
              <Card>
                <div className="flex items-center justify-between mb-[var(--space-3)]">
                  <h3 className="text-14-bold text-grey-01">Pixel & SDK 配置 ({clientPixels.length})</h3>
                  <button onClick={() => setDialogType('bindPixel')} className="text-12-medium text-l-cyan bg-transparent border-none cursor-pointer font-[inherit]">+ 绑定追踪</button>
                </div>
                <div className="flex flex-col gap-[var(--space-2)]">
                  {clientPixels.map((px) => {
                    const boundAccounts = clientAccounts.filter((a) => a.pixelIds.includes(px.id))
                    return (
                      <div key={px.id} className="flex items-center gap-[var(--space-3)] px-[var(--space-3)] py-[var(--space-2)] bg-bg rounded-lg">
                        <div className="w-[28px] h-[28px] rounded-lg bg-grey-01 text-white flex items-center justify-center text-10-regular font-bold shrink-0">{px.abbr}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-[var(--space-2)]">
                            <span className="text-12-medium text-grey-01">{px.name}</span>
                            <span className={`text-10-regular ${px.status === '正常' ? 'text-l-cyan' : 'text-orange'}`}>{px.status}</span>
                          </div>
                          <div className="flex items-center gap-[var(--space-2)] mt-[2px]">
                            <span className="text-10-regular text-grey-08" style={{ fontFamily: 'monospace' }}>{px.pixelId}</span>
                            <span className="text-10-regular text-grey-08">· 最后触发: {px.lastFired}</span>
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <div className="text-10-regular text-grey-08">已绑定 {boundAccounts.length} 个账户</div>
                          {px.events.length > 0 && (
                            <div className="flex gap-[2px] mt-[2px] justify-end">
                              {px.events.slice(0, 3).map((e) => (
                                <span key={e} className="text-[9px] px-[4px] py-[1px] rounded bg-cyan-tint-08 text-l-cyan">{e}</span>
                              ))}
                              {px.events.length > 3 && <span className="text-[9px] text-grey-08">+{px.events.length - 3}</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Card>

              {/* Financial Records */}
              <Card>
                <div className="flex items-center justify-between mb-[var(--space-3)]">
                  <h3 className="text-14-bold text-grey-01">财务记录 ({clientTransactions.length})</h3>
                  <button onClick={() => setDialogType('addTransaction')} className="text-12-medium text-l-cyan bg-transparent border-none cursor-pointer font-[inherit]">+ 新增记录</button>
                </div>
                {clientTransactions.length === 0 ? (
                  <div className="text-12-regular text-grey-08 py-[var(--space-3)] text-center">暂无财务记录</div>
                ) : (
                  <div className="flex flex-col divide-y divide-stroke">
                    {clientTransactions.map((tx) => {
                      const isRefund = tx.type === '退款'
                      return (
                        <div key={tx.id} className="flex items-center gap-[var(--space-2)] py-[6px]">
                          {/* Icon */}
                          <div className={`w-[24px] h-[24px] rounded flex items-center justify-center shrink-0 ${
                            isRefund ? 'bg-orange-tint-10' : tx.type === '充值' ? 'bg-cyan-tint-08' : 'bg-grey-12'
                          }`}>
                            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke={isRefund ? 'var(--orange)' : tx.type === '充值' ? 'var(--l-cyan)' : 'var(--grey-01)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              {isRefund ? (
                                <><path d="M1 8h14" /><path d="M5 4L1 8l4 4" /></>
                              ) : (
                                <><path d="M8 2v12" /><path d="M4 6l4-4 4 4" /></>
                              )}
                            </svg>
                          </div>
                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-[var(--space-1)]">
                              <span className="text-12-medium text-grey-01">{tx.type}</span>
                              <span className="text-10-regular text-grey-08">{tx.accountName}</span>
                              <Badge variant={tx.status === '已完成' ? 'cyan' : 'orange'}>{tx.status}</Badge>
                            </div>
                            <div className="text-10-regular text-grey-08 mt-[1px]">{tx.note}</div>
                          </div>
                          {/* Amount + Meta */}
                          <div className="text-right shrink-0">
                            <div className={`text-12-bold ${isRefund ? 'text-orange' : 'text-grey-01'}`}>
                              {isRefund ? '-' : '+'}${tx.amount.toLocaleString()}
                            </div>
                            <div className="text-10-regular text-grey-08">{tx.operator} · {tx.date}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </Card>
            </>
          )}
        </div>
      </div>

      {/* ═══════════ Dialogs ═══════════ */}

      {/* Dialog: 新增账户 */}
      <Dialog open={dialogType === 'addAccount'} onClose={closeDialog} title="新增广告账户" width={520}>
        <div className="flex flex-col gap-[var(--space-4)]">
          <div className="bg-bg rounded-lg px-[var(--space-3)] py-[var(--space-2)] text-12-regular text-grey-06">
            客户：{selectedClient.name}
          </div>
          <Select label="投放平台" options={[{ value: '', label: '请选择平台' }, { value: 'Meta', label: 'Meta (Facebook)' }, { value: 'Google', label: 'Google Ads' }, { value: 'TikTok', label: 'TikTok Ads' }]} />
          <Input label="账户名称" placeholder="例如：ClientName_Meta_主账户" />
          <Input label="账户 ID" placeholder="平台分配的账户 ID" />
          <div className="grid grid-cols-2 gap-[var(--space-3)]">
            <Select label="币种" options={[{ value: 'USD', label: 'USD' }, { value: 'CNY', label: 'CNY' }, { value: 'EUR', label: 'EUR' }]} />
            <Select label="时区" options={[{ value: 'America/New_York', label: 'America/New_York' }, { value: 'Asia/Shanghai', label: 'Asia/Shanghai' }, { value: 'Europe/London', label: 'Europe/London' }, { value: 'Asia/Tokyo', label: 'Asia/Tokyo' }]} />
          </div>
          <Select label="客户可见性" options={[{ value: '只读', label: '只读 — 客户可查看账户数据' }, { value: '不可见', label: '不可见 — 客户无法查看' }]} />
          <div className="flex justify-end gap-[var(--space-2)] pt-[var(--space-2)] border-t border-stroke">
            <Button variant="secondary" onClick={closeDialog}>取消</Button>
            <Button onClick={closeDialog}>创建账户</Button>
          </div>
        </div>
      </Dialog>

      {/* Dialog: 编辑账户 */}
      <Dialog open={dialogType === 'editAccount'} onClose={closeDialog} title={`编辑账户 · ${dialogAccount?.name || ''}`} width={520}>
        <div className="flex flex-col gap-[var(--space-4)]">
          <div className="bg-bg rounded-lg px-[var(--space-3)] py-[var(--space-2)] flex items-center gap-[var(--space-2)]">
            <div className="w-[24px] h-[24px] rounded flex items-center justify-center text-[9px] font-bold text-white" style={{ backgroundColor: platformColors[dialogAccount?.platform || 'Meta'] }}>
              {dialogAccount?.platform?.[0]}
            </div>
            <span className="text-12-medium text-grey-01">{dialogAccount?.platform}</span>
            <span className="text-10-regular text-grey-08" style={{ fontFamily: 'monospace' }}>{dialogAccount?.accountId}</span>
          </div>
          <Input label="账户名称" placeholder="账户名称" defaultValue={dialogAccount?.name} />
          <div className="grid grid-cols-2 gap-[var(--space-3)]">
            <Select label="币种" options={[{ value: 'USD', label: 'USD' }, { value: 'CNY', label: 'CNY' }, { value: 'EUR', label: 'EUR' }]} defaultValue={dialogAccount?.currency} />
            <Select label="时区" options={[{ value: 'America/New_York', label: 'America/New_York' }, { value: 'Asia/Shanghai', label: 'Asia/Shanghai' }, { value: 'Europe/London', label: 'Europe/London' }, { value: 'Asia/Tokyo', label: 'Asia/Tokyo' }]} defaultValue={dialogAccount?.timezone} />
          </div>
          <Select label="客户可见性" options={[{ value: '只读', label: '只读' }, { value: '不可见', label: '不可见' }]} defaultValue={dialogAccount?.visibility} />
          <Select label="账户状态" options={[{ value: 'active', label: '活跃' }, { value: 'paused', label: '暂停' }, { value: 'archived', label: '归档' }]} defaultValue={dialogAccount?.active ? 'active' : 'paused'} />
          <div className="flex justify-end gap-[var(--space-2)] pt-[var(--space-2)] border-t border-stroke">
            <Button variant="secondary" onClick={closeDialog}>取消</Button>
            <Button onClick={closeDialog}>保存修改</Button>
          </div>
        </div>
      </Dialog>

      {/* Dialog: 充值 */}
      <Dialog open={dialogType === 'recharge'} onClose={closeDialog} title="账户充值" width={480}>
        <div className="flex flex-col gap-[var(--space-4)]">
          <div className="bg-bg rounded-lg px-[var(--space-3)] py-[var(--space-3)]">
            <div className="flex items-center gap-[var(--space-2)] mb-[var(--space-2)]">
              <div className="w-[24px] h-[24px] rounded flex items-center justify-center text-[9px] font-bold text-white" style={{ backgroundColor: platformColors[dialogAccount?.platform || 'Meta'] }}>
                {dialogAccount?.platform?.[0]}
              </div>
              <span className="text-12-bold text-grey-01">{dialogAccount?.name}</span>
            </div>
            <div className="flex gap-[var(--space-4)] text-12-regular">
              <span className="text-grey-08">当前余额 <span className="text-14-bold text-l-cyan">${dialogAccount ? (dialogAccount.funded - dialogAccount.spent).toLocaleString() : '0'}</span></span>
              <span className="text-grey-08">已充值 ${dialogAccount?.funded.toLocaleString()}</span>
              <span className="text-grey-08">已消耗 ${dialogAccount?.spent.toLocaleString()}</span>
            </div>
          </div>
          <Input label="充值金额 (USD)" placeholder="请输入金额" type="number" />
          <Input label="备注" placeholder="充值原因说明" />
          <div className="bg-orange-tint-10 rounded-lg px-[var(--space-3)] py-[var(--space-2)] text-12-regular text-orange">
            提交后将进入财务审批流程，审批通过后自动到账
          </div>
          <div className="flex justify-end gap-[var(--space-2)] pt-[var(--space-2)] border-t border-stroke">
            <Button variant="secondary" onClick={closeDialog}>取消</Button>
            <Button onClick={closeDialog}>提交充值申请</Button>
          </div>
        </div>
      </Dialog>

      {/* Dialog: 绑定追踪 */}
      <Dialog open={dialogType === 'bindPixel'} onClose={closeDialog} title="绑定追踪代码" width={520}>
        <div className="flex flex-col gap-[var(--space-4)]">
          <Select label="追踪类型" options={[{ value: '', label: '请选择类型' }, { value: 'meta', label: 'Meta Pixel' }, { value: 'google', label: 'Google Analytics 4' }, { value: 'tiktok', label: 'TikTok Pixel' }, { value: 'sdk', label: '自定义 SDK' }]} />
          <Input label="Pixel / SDK ID" placeholder="例如：px_1234567890" />
          <Select label="绑定到账户" options={[{ value: 'all', label: '全部账户' }, ...clientAccounts.map((a) => ({ value: a.id, label: a.name }))]} />
          <div>
            <div className="text-12-medium text-grey-01 mb-[var(--space-2)]">事件配置</div>
            <div className="flex flex-wrap gap-[var(--space-2)]">
              {['Purchase', 'AddToCart', 'ViewContent', 'Lead', 'CompleteRegistration', 'InitiateCheckout'].map((evt) => (
                <label key={evt} className="flex items-center gap-[var(--space-1)] px-[var(--space-2)] py-[3px] bg-bg rounded border border-stroke cursor-pointer text-12-regular text-grey-06 hover:border-l-cyan hover:text-l-cyan transition-colors">
                  <input type="checkbox" className="w-[12px] h-[12px]" />
                  {evt}
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-[var(--space-2)] pt-[var(--space-2)] border-t border-stroke">
            <Button variant="secondary" onClick={closeDialog}>取消</Button>
            <Button onClick={closeDialog}>确认绑定</Button>
          </div>
        </div>
      </Dialog>

      {/* Dialog: 新增财务记录 */}
      <Dialog open={dialogType === 'addTransaction'} onClose={closeDialog} title="新增财务记录" width={520}>
        <div className="flex flex-col gap-[var(--space-4)]">
          <div className="bg-bg rounded-lg px-[var(--space-3)] py-[var(--space-2)] text-12-regular text-grey-06">
            客户：{selectedClient.name}
          </div>
          <Select label="关联账户" options={[{ value: '', label: '请选择账户' }, ...clientAccounts.map((a) => ({ value: a.id, label: `${a.name} (${a.platform})` }))]} />
          <Select label="交易类型" options={[{ value: '', label: '请选择类型' }, { value: '打款', label: '打款 — 向账户充值' }, { value: '充值', label: '充值 — 追加预算' }, { value: '退款', label: '退款 — 账户退款' }]} />
          <Input label="金额 (USD)" placeholder="请输入金额" type="number" />
          <Input label="备注" placeholder="交易说明" />
          <div className="flex justify-end gap-[var(--space-2)] pt-[var(--space-2)] border-t border-stroke">
            <Button variant="secondary" onClick={closeDialog}>取消</Button>
            <Button onClick={closeDialog}>提交记录</Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
