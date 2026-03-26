'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Toggle } from '@/components/ui/Toggle'
import { Avatar } from '@/components/ui/Avatar'

/* ─── data ─── */
type Role = {
  abbr: string
  name: string
  description: string
}

const roles: Role[] = [
  { abbr: '管', name: '管理员', description: '系统全局权限' },
  { abbr: '销', name: '销售', description: '客户管理 & 合同' },
  { abbr: '投', name: '投手', description: '投放操作 & 数据' },
  { abbr: '运', name: '行业运营', description: '策略 & 合规审核' },
  { abbr: '客', name: '客户（面客）', description: 'Lanbow 系统访问' },
]

type PermModule = {
  name: string
  toggleLabels: [string, string, string]
}

const permModules: PermModule[] = [
  { name: '客户信息', toggleLabels: ['查看', '编辑', '删除'] },
  { name: '投放数据', toggleLabels: ['查看', '编辑', '导出'] },
  { name: '素材资产', toggleLabels: ['查看', '上传', '删除'] },
  { name: '策略库', toggleLabels: ['查看', '编辑', '审批'] },
  { name: '财务数据', toggleLabels: ['查看', '编辑', '导出'] },
  { name: '合同管理', toggleLabels: ['查看', '编辑', '签署'] },
  { name: '系统配置', toggleLabels: ['查看', '编辑', '权限分配'] },
]

// 7 modules x 3 toggles per role
const permData: boolean[][][] = [
  [[true,true,true],[true,true,true],[true,true,true],[true,true,true],[true,true,true],[true,true,true],[true,true,true]],   // 管理员
  [[true,true,false],[true,false,true],[false,false,false],[false,false,false],[true,false,false],[true,true,true],[false,false,false]], // 销售
  [[true,false,false],[true,true,true],[true,true,false],[true,true,false],[false,false,false],[false,false,false],[false,false,false]], // 投手
  [[true,false,false],[true,false,true],[true,false,false],[true,true,true],[true,false,false],[true,false,false],[false,false,false]], // 行业运营
  [[true,false,false],[true,false,false],[false,false,false],[false,false,false],[false,false,false],[true,false,true],[false,false,false]], // 客户
]

const memberData: string[][] = [
  ['振宇', '王斯琼'],
  ['陈明辉', '刘芳', '王斯琼'],
  ['赵雷', '孙洁', '罗依桐'],
  ['郭晋光', '罗依桐'],
  ['客户对接人', '客户负责人'],
]

/* ─── component ─── */
export default function PermissionsPage() {
  const [selectedRole, setSelectedRole] = useState(0)
  const [perms, setPerms] = useState<boolean[][][]>(permData.map(r => r.map(m => [...m])))

  const togglePerm = (moduleIdx: number, toggleIdx: number) => {
    setPerms((prev) => {
      const next = prev.map(r => r.map(m => [...m]))
      next[selectedRole][moduleIdx][toggleIdx] = !next[selectedRole][moduleIdx][toggleIdx]
      return next
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div>
        <h1 className="text-20-bold" style={{ color: 'var(--grey-01)' }}>权限配置</h1>
        <p className="text-12-regular" style={{ color: 'var(--grey-06)', marginTop: 4 }}>
          管理不同角色的系统访问权限
        </p>
      </div>

      {/* 2-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 24 }}>

        {/* Left: Role List */}
        <div>
          <div className="text-12-medium" style={{ color: 'var(--grey-06)', marginBottom: 12 }}>角色列表</div>
          <div className="flex flex-col" style={{ gap: 8 }}>
            {roles.map((role, idx) => {
              const isSelected = idx === selectedRole
              return (
                <div
                  key={role.name}
                  onClick={() => setSelectedRole(idx)}
                  style={{
                    padding: 16,
                    borderRadius: 'var(--radius-xl)',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? 'var(--selected)' : 'var(--selected)',
                    border: isSelected ? '1px solid var(--grey-01)' : '1px solid transparent',
                    transition: 'border-color 0.15s',
                  }}
                >
                  <div className="flex items-center" style={{ gap: 12 }}>
                    <div
                      className="flex items-center justify-center text-12-bold"
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 'var(--radius-lg)',
                        backgroundColor: 'var(--grey-01)',
                        color: 'var(--white)',
                        flexShrink: 0,
                      }}
                    >
                      {role.abbr}
                    </div>
                    <div>
                      <div className="text-14-bold" style={{ color: 'var(--grey-01)' }}>{role.name}</div>
                      <div className="text-12-regular" style={{ color: 'var(--grey-06)' }}>{role.description}</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          {/* Add role button */}
          <button
            style={{
              width: '100%',
              marginTop: 12,
              padding: 10,
              border: '1px dashed var(--grey-12)',
              borderRadius: 'var(--radius-xl)',
              background: 'none',
              color: 'var(--grey-08)',
              fontSize: 13,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'border-color 0.15s, color 0.15s',
            }}
          >
            + 新增角色
          </button>
        </div>

        {/* Right: Permission Matrix */}
        <div>
          <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
            <div className="text-14-bold" style={{ color: 'var(--grey-01)' }}>
              权限矩阵 — <span>{roles[selectedRole].name}</span>
            </div>
            <Button variant="primary" style={{ padding: '8px 20px', fontSize: 13 }}>保存配置</Button>
          </div>

          {/* Permission rows */}
          <Card padding="none" style={{ overflow: 'hidden' }}>
            {permModules.map((mod, mIdx) => (
              <div
                key={mod.name}
                className="flex items-center"
                style={{
                  padding: '14px 20px',
                  borderBottom: mIdx < permModules.length - 1 ? '1px solid var(--stroke)' : 'none',
                }}
              >
                <div className="text-14-medium" style={{ width: 100, color: 'var(--grey-01)', flexShrink: 0 }}>
                  {mod.name}
                </div>
                <div className="flex" style={{ flex: 1, gap: 24 }}>
                  {mod.toggleLabels.map((label, tIdx) => (
                    <div key={label} className="flex items-center" style={{ gap: 8 }}>
                      <Toggle
                        checked={perms[selectedRole][mIdx][tIdx]}
                        onChange={() => togglePerm(mIdx, tIdx)}
                      />
                      <span className="text-12-regular" style={{ color: 'var(--grey-06)' }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </Card>

          {/* Members */}
          <Card style={{ marginTop: 16 }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
              <div className="text-14-bold" style={{ color: 'var(--grey-01)' }}>角色成员</div>
              <button
                className="text-12-medium"
                style={{ color: 'var(--grey-01)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                + 新增成员
              </button>
            </div>
            <div className="flex" style={{ flexWrap: 'wrap', gap: 8 }}>
              {memberData[selectedRole].map((name) => (
                <div
                  key={name}
                  className="flex items-center text-12-medium"
                  style={{
                    gap: 6,
                    padding: '6px 12px',
                    backgroundColor: 'var(--selected)',
                    color: 'var(--grey-01)',
                    borderRadius: 'var(--radius-round)',
                  }}
                >
                  <Avatar name={name} size="sm" />
                  {name}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
