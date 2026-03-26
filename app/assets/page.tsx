'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Table } from '@/components/ui/Table'

/* ─── data ─── */
const tabs = ['账号资产', '策略资产', '素材资产', '人群资产', 'Pixel & SDK 追踪'] as const
type Tab = (typeof tabs)[number]

const stats = [
  { value: '6', label: '广告账户' },
  { value: '12', label: '投放策略' },
  { value: '48', label: '素材创意' },
  { value: '8', label: '人群包' },
  { value: '3', label: 'Pixel / SDK' },
]

type Account = {
  id: string
  name: string
  platform: string
  accountId: string
  active: boolean
  owner: string
  visibility: '只读' | '不可见'
}

const accounts: Account[] = [
  { id: '1', name: 'Wavebone_Meta_主账户', platform: 'Meta', accountId: 'act_123456789', active: true, owner: 'Sandwich Lab', visibility: '只读' },
  { id: '2', name: 'Wavebone_Meta_测试', platform: 'Meta', accountId: 'act_987654321', active: true, owner: 'Sandwich Lab', visibility: '不可见' },
  { id: '3', name: 'Wavebone_Google_主账户', platform: 'Google', accountId: '123-456-7890', active: true, owner: 'Sandwich Lab', visibility: '只读' },
  { id: '4', name: 'Wavebone_TikTok', platform: 'TikTok', accountId: 'tt_adv_001', active: false, owner: 'Sandwich Lab', visibility: '不可见' },
]

const strategies = [
  { id: 'S1', name: 'LAL 高价值获客策略 v3', date: '2026-03-23', rating: '优秀', status: '使用中' as const, secret: true },
  { id: 'S2', name: '兴趣定向_阅读人群 v2', date: '2026-03-20', rating: '达标', status: '使用中' as const, secret: true },
  { id: 'S3', name: '再营销_付费用户 v1', date: '2026-03-22', rating: '观察中', status: '测试中' as const, secret: true },
]

const creatives = [
  { id: '1', name: '阅读场景_A_竖版', type: 'VIDEO', ctr: 'CTR 3.2% · 最优', tags: [{ label: '保密', variant: 'red' as const }, { label: '在投', variant: 'cyan' as const }] },
  { id: '2', name: '功能展示_B_1200x628', type: 'IMAGE', ctr: 'CTR 2.8%', tags: [{ label: '保密', variant: 'red' as const }, { label: '在投', variant: 'cyan' as const }] },
  { id: '3', name: '用户证言_C_横版', type: 'VIDEO', ctr: 'CTR 2.5%', tags: [{ label: '客户可见', variant: 'cyan' as const }, { label: '在投', variant: 'cyan' as const }] },
  { id: '4', name: '节日促销_D_轮播', type: 'IMAGE', ctr: 'CTR 2.1%', tags: [{ label: '保密', variant: 'red' as const }, { label: '已暂停', variant: 'grey' as const }] },
]

const audiences = [
  { id: '1', name: '高价值付费 LAL 1%', status: '活跃' as const, scale: '2.3M', source: 'Meta', date: '2026-03-18', tag: '获客', secret: true },
  { id: '2', name: 'D7 活跃用户', status: '活跃' as const, scale: '156K', source: 'Pixel', date: '2026-03-20', tag: '再营销', secret: true },
  { id: '3', name: '兴趣_阅读_18-35', status: '活跃' as const, scale: '5.8M', source: 'Meta', date: '2026-03-17', tag: '获客', secret: false },
  { id: '4', name: '流失用户_30天未活跃', status: '待更新' as const, scale: '89K', source: 'Pixel', date: '2026-03-19', tag: '再营销', secret: false },
]

const pixels = [
  { id: '1', abbr: 'FB', name: 'Meta Pixel', pixelId: 'px_1234567890', status: '正常', statusColor: 'var(--l-cyan)', lastFired: '最后触发: 2分钟前' },
  { id: '2', abbr: 'GA', name: 'Google Analytics 4', pixelId: 'G-ABCDEF1234', status: '正常', statusColor: 'var(--l-cyan)', lastFired: '最后触发: 5分钟前' },
  { id: '3', abbr: 'TT', name: 'TikTok Pixel', pixelId: 'tt_px_00123', status: '待配置', statusColor: 'var(--orange)', lastFired: '尚未安装' },
]

/* ─── columns ─── */
const accountColumns = [
  { key: 'name', header: '账户名称', render: (r: Account) => <span className="text-14-medium">{r.name}</span> },
  {
    key: 'platform',
    header: '平台',
    render: (r: Account) => (
      <span
        className="text-12-medium"
        style={{ display: 'inline-flex', padding: '2px 8px', backgroundColor: 'var(--selected)', color: 'var(--grey-01)', borderRadius: 'var(--radius-sm)' }}
      >
        {r.platform}
      </span>
    ),
  },
  {
    key: 'accountId',
    header: '账户ID',
    render: (r: Account) => <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--grey-06)' }}>{r.accountId}</span>,
  },
  {
    key: 'status',
    header: '状态',
    render: (r: Account) => (
      <span className="flex items-center" style={{ gap: 8 }}>
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: r.active ? 'var(--l-cyan)' : 'var(--orange)',
            flexShrink: 0,
          }}
        />
        <span className="text-14-regular" style={{ color: r.active ? 'var(--grey-01)' : 'var(--orange)' }}>
          {r.active ? '活跃' : '待激活'}
        </span>
      </span>
    ),
  },
  { key: 'owner', header: '所有权', render: (r: Account) => <span className="text-14-regular" style={{ color: 'var(--grey-06)' }}>{r.owner}</span> },
  {
    key: 'visibility',
    header: '客户可见',
    render: (r: Account) => <Badge variant={r.visibility === '只读' ? 'cyan' : 'grey'}>{r.visibility}</Badge>,
  },
  {
    key: 'action',
    header: '操作',
    render: () => (
      <button className="text-12-medium" style={{ color: 'var(--grey-01)', background: 'none', border: 'none', cursor: 'pointer' }}>
        编辑
      </button>
    ),
  },
]

/* ─── component ─── */
export default function AssetsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('账号资产')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-20-bold" style={{ color: 'var(--grey-01)' }}>资产管理</h1>
          <p className="text-12-regular" style={{ color: 'var(--grey-06)', marginTop: 4 }}>
            客户：Wavebone · 资产所有权归属 Sandwich Lab
          </p>
        </div>
        <div className="flex" style={{ gap: 8 }}>
          <Button variant="secondary" style={{ padding: '8px 20px', fontSize: 13 }}>导出资产报告</Button>
          <Button variant="primary" style={{ padding: '8px 20px', fontSize: 13 }}>+ 新增资产</Button>
        </div>
      </div>

      {/* Tab Bar */}
      <div
        style={{
          backgroundColor: 'var(--white)',
          borderBottom: '1px solid var(--grey-12)',
          padding: '0 24px',
          borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
        }}
      >
        <div className="flex" style={{ gap: 24 }}>
          {tabs.map((tab) => {
            const isActive = tab === activeTab
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="text-14-medium"
                style={{
                  padding: '12px 0',
                  color: isActive ? 'var(--grey-01)' : 'var(--grey-06)',
                  fontWeight: isActive ? 600 : 500,
                  background: 'none',
                  border: 'none',
                  borderBottom: isActive ? '2px solid var(--grey-01)' : '2px solid transparent',
                  cursor: 'pointer',
                  transition: 'color 0.15s',
                }}
              >
                {tab}
              </button>
            )
          })}
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
        {stats.map((s) => (
          <Card key={s.label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--grey-01)' }}>{s.value}</div>
            <div style={{ fontSize: 12, fontWeight: 400, color: 'var(--grey-08)', marginTop: 4 }}>{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === '账号资产' && (
        <Card padding="none" style={{ overflow: 'hidden' }}>
          <Table columns={accountColumns} data={accounts} rowKey={(r) => r.id} />
        </Card>
      )}

      {activeTab === '策略资产' && (
        <Card>
          <div className="text-14-bold" style={{ color: 'var(--grey-01)', marginBottom: 16 }}>投放策略库</div>
          <div className="flex flex-col" style={{ gap: 12 }}>
            {strategies.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between"
                style={{
                  padding: 16,
                  backgroundColor: 'var(--selected)',
                  borderRadius: 'var(--radius-lg)',
                }}
              >
                <div className="flex items-center" style={{ gap: 12 }}>
                  <div
                    className="flex items-center justify-center text-12-bold"
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 'var(--radius-lg)',
                      backgroundColor: 'var(--grey-01)',
                      color: 'var(--white)',
                      flexShrink: 0,
                    }}
                  >
                    {s.id}
                  </div>
                  <div>
                    <div className="text-14-medium" style={{ color: 'var(--grey-01)' }}>{s.name}</div>
                    <div className="text-12-regular" style={{ color: 'var(--grey-06)', marginTop: 2 }}>
                      最近更新: {s.date} · 效果评分: {s.rating}
                    </div>
                  </div>
                </div>
                <div className="flex items-center" style={{ gap: 8 }}>
                  <Badge variant={s.status === '使用中' ? 'cyan' : 'orange'}>{s.status}</Badge>
                  {s.secret && <Badge variant="red">保密</Badge>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === '素材资产' && (
        <Card>
          <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
            <div className="flex items-center" style={{ gap: 12 }}>
              <span className="text-14-bold" style={{ color: 'var(--grey-01)' }}>素材库</span>
              <Badge variant="red">
                <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor" style={{ flexShrink: 0, marginRight: 4 }}>
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                核心资产 · 对客保密
              </Badge>
            </div>
            <div className="flex" style={{ gap: 8 }}>
              {['全部 (48)', '视频 (22)', '图片 (26)'].map((f, i) => (
                <button
                  key={f}
                  className="text-12-medium"
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    border: i === 0 ? '1px solid transparent' : '1px solid var(--stroke)',
                    backgroundColor: i === 0 ? 'var(--selected)' : 'var(--white)',
                    color: i === 0 ? 'var(--grey-01)' : 'var(--grey-06)',
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {creatives.map((c) => (
              <div
                key={c.id}
                style={{
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  backgroundColor: 'var(--selected)',
                }}
              >
                <div
                  className="flex items-center justify-center text-12-bold"
                  style={{
                    height: 128,
                    backgroundColor: 'var(--grey-12)',
                    color: 'var(--grey-08)',
                  }}
                >
                  {c.type}
                </div>
                <div style={{ padding: 12 }}>
                  <div className="text-12-medium" style={{ color: 'var(--grey-01)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.name}
                  </div>
                  <div className="text-12-regular" style={{ color: 'var(--grey-08)', marginTop: 4, fontSize: 11 }}>
                    {c.ctr}
                  </div>
                  <div className="flex" style={{ gap: 4, marginTop: 8 }}>
                    {c.tags.map((t) => (
                      <Badge key={t.label} variant={t.variant} style={{ fontSize: 10, padding: '2px 6px' }}>
                        {t.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === '人群资产' && (
        <Card>
          <div className="text-14-bold" style={{ color: 'var(--grey-01)', marginBottom: 16 }}>人群资产库</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {audiences.map((a) => (
              <div
                key={a.id}
                style={{
                  padding: 16,
                  backgroundColor: 'var(--selected)',
                  borderRadius: 'var(--radius-lg)',
                }}
              >
                <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                  <span className="text-14-medium" style={{ color: 'var(--grey-01)' }}>{a.name}</span>
                  <Badge variant={a.status === '活跃' ? 'cyan' : 'orange'}>{a.status}</Badge>
                </div>
                <div className="text-12-regular" style={{ color: 'var(--grey-06)' }}>
                  规模: {a.scale} · 来源: {a.source} · 创建: {a.date}
                </div>
                <div className="flex" style={{ gap: 4, marginTop: 8 }}>
                  <span
                    className="text-10-regular"
                    style={{
                      display: 'inline-flex',
                      padding: '2px 6px',
                      backgroundColor: 'var(--selected)',
                      color: 'var(--grey-01)',
                      borderRadius: 'var(--radius-xs)',
                      fontWeight: 500,
                    }}
                  >
                    {a.tag}
                  </span>
                  {a.secret && (
                    <Badge variant="red" style={{ fontSize: 10, padding: '2px 6px' }}>保密</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'Pixel & SDK 追踪' && (
        <Card>
          <div className="text-14-bold" style={{ color: 'var(--grey-01)', marginBottom: 16 }}>Pixel & SDK 追踪</div>
          <div className="flex flex-col" style={{ gap: 12 }}>
            {pixels.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between"
                style={{
                  padding: 16,
                  backgroundColor: 'var(--selected)',
                  borderRadius: 'var(--radius-lg)',
                }}
              >
                <div className="flex items-center" style={{ gap: 12 }}>
                  <div
                    className="flex items-center justify-center text-12-bold"
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 'var(--radius-lg)',
                      backgroundColor: 'var(--grey-01)',
                      color: 'var(--white)',
                      flexShrink: 0,
                    }}
                  >
                    {p.abbr}
                  </div>
                  <div>
                    <div className="text-14-medium" style={{ color: 'var(--grey-01)' }}>{p.name}</div>
                    <div className="text-12-regular" style={{ fontFamily: 'monospace', color: 'var(--grey-06)', marginTop: 2 }}>
                      {p.pixelId}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="text-12-medium" style={{ color: p.statusColor }}>{p.status}</div>
                  <div className="text-12-regular" style={{ color: 'var(--grey-06)', marginTop: 2 }}>{p.lastFired}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
