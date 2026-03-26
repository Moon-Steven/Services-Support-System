'use client'

import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { FormField } from '@/components/ui/FormField'
import { ChoiceCard } from '@/components/ui/ChoiceCard'
import type { IntakeFormState, FormAction } from './types'

interface Props {
  form: IntakeFormState
  dispatch: React.Dispatch<FormAction>
}

export function StepMarketing({ form, dispatch }: Props) {
  const set = (field: keyof IntakeFormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    dispatch({ type: 'SET_FIELD', field, value: e.target.value })

  return (
    <Card padding="large">
      <div className="text-16-bold">营销诉求 & 目标</div>
      <p className="text-14-regular text-grey-08 mt-[var(--space-1)] mb-[var(--space-6)]">
        明确客户的核心需求和期望
      </p>

      <div className="flex flex-col gap-[var(--space-5)]">
        <FormField label="核心投放目标">
          <div className="flex flex-wrap gap-[var(--space-2)]">
            {['获客/安装', 'ROI/ROAS', '品牌曝光', '留存/活跃', '付费/充值'].map((g) => (
              <ChoiceCard key={g} type="checkbox" label={g} checked={form.goals.includes(g)} onChange={() => dispatch({ type: 'TOGGLE_ARRAY', field: 'goals', value: g })} />
            ))}
          </div>
        </FormField>

        <div className="grid grid-cols-2 gap-[var(--space-4)]">
          <FormField label="目标 CPA / CPI（USD）">
            <Input placeholder="如：$5.00" value={form.cpaTarget} onChange={set('cpaTarget')} />
          </FormField>
          <FormField label="目标 ROAS">
            <Input placeholder="如：150%" value={form.roasTarget} onChange={set('roasTarget')} />
          </FormField>
        </div>

        <FormField label="测试期预算（USD）">
          <Input placeholder="测试期总预算" value={form.testBudget} onChange={set('testBudget')} />
        </FormField>

        <FormField label="期望测试周期">
          <div className="flex flex-wrap gap-[var(--space-2)]">
            {['1 周', '2 周', '1 个月', '自定义'].map((p) => (
              <ChoiceCard key={p} type="radio" label={p} checked={form.testPeriod === p} onChange={() => dispatch({ type: 'SET_FIELD', field: 'testPeriod', value: p })} />
            ))}
          </div>
        </FormField>

        <FormField label="补充说明">
          <Textarea
            rows={3}
            placeholder="其他需要特别说明的营销诉求..."
            value={form.notes}
            onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'notes', value: e.target.value })}
          />
        </FormField>
      </div>
    </Card>
  )
}
