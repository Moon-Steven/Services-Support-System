'use client'

import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { FormField } from '@/components/ui/FormField'
import { ChoiceCard } from '@/components/ui/ChoiceCard'
import type { IntakeFormState, FormAction } from './types'

interface Props {
  form: IntakeFormState
  dispatch: React.Dispatch<FormAction>
}

export function StepBusiness({ form, dispatch }: Props) {
  const set = (field: keyof IntakeFormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    dispatch({ type: 'SET_FIELD', field, value: e.target.value })

  return (
    <Card padding="large">
      <div className="text-16-bold">业务情况摸排</div>
      <p className="text-14-regular text-grey-08 mt-[var(--space-1)] mb-[var(--space-6)]">
        了解客户当前的投放和营销状况
      </p>

      <div className="flex flex-col gap-[var(--space-5)]">
        <FormField label="当前投放渠道">
          <div className="flex flex-wrap gap-[var(--space-2)]">
            {['Meta (Facebook/Instagram)', 'Google Ads', 'TikTok', 'Apple Search Ads', '其他'].map((ch) => (
              <ChoiceCard key={ch} type="checkbox" label={ch} checked={form.channels.includes(ch)} onChange={() => dispatch({ type: 'TOGGLE_ARRAY', field: 'channels', value: ch })} />
            ))}
          </div>
        </FormField>

        <div className="grid grid-cols-2 gap-[var(--space-4)]">
          <FormField label="月均投放预算（USD）">
            <Select
              options={[
                { value: '', label: '请选择' },
                { value: '<5000', label: '< $5,000' },
                { value: '5000-20000', label: '$5,000 - $20,000' },
                { value: '20000-50000', label: '$20,000 - $50,000' },
                { value: '50000-100000', label: '$50,000 - $100,000' },
                { value: '>100000', label: '> $100,000' },
              ]}
              value={form.budget}
              onChange={set('budget')}
            />
          </FormField>
          <FormField label="目标市场">
            <Select
              options={[
                { value: '', label: '请选择' },
                { value: '北美', label: '北美' },
                { value: '东南亚', label: '东南亚' },
                { value: '欧洲', label: '欧洲' },
                { value: '中东', label: '中东' },
                { value: '日韩', label: '日韩' },
                { value: '全球', label: '全球' },
                { value: '其他', label: '其他' },
              ]}
              value={form.market}
              onChange={set('market')}
            />
          </FormField>
        </div>

        <FormField label="推广产品/应用类型">
          <Input placeholder="如：电商独立站、金融APP、小说阅读APP" value={form.productType} onChange={set('productType')} />
        </FormField>

        <FormField label="当前投放痛点">
          <Textarea
            rows={3}
            placeholder="如：CPA 过高、素材迭代慢、缺少数据洞察..."
            value={form.painPoints}
            onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'painPoints', value: e.target.value })}
          />
        </FormField>

        <FormField label="是否有自有投手团队">
          <div className="flex flex-wrap gap-[var(--space-2)]">
            {['有', '无，完全托管', '有，但希望协助'].map((t) => (
              <ChoiceCard key={t} type="radio" label={t} checked={form.team === t} onChange={() => dispatch({ type: 'SET_FIELD', field: 'team', value: t })} />
            ))}
          </div>
        </FormField>
      </div>
    </Card>
  )
}
