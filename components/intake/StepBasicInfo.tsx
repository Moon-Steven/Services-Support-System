'use client'

import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { FormField } from '@/components/ui/FormField'
import { ChoiceCard } from '@/components/ui/ChoiceCard'
import type { IntakeFormState, FormAction } from './types'

interface Props {
  form: IntakeFormState
  dispatch: React.Dispatch<FormAction>
}

export function StepBasicInfo({ form, dispatch }: Props) {
  const set = (field: keyof IntakeFormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    dispatch({ type: 'SET_FIELD', field, value: e.target.value })

  return (
    <Card padding="large">
      <div className="text-16-bold">客户基本信息</div>
      <p className="text-14-regular text-grey-08 mt-[var(--space-1)] mb-[var(--space-6)]">
        填写客户的公司及联系人信息
      </p>

      <div className="flex flex-col gap-[var(--space-5)]">
        <div className="grid grid-cols-2 gap-[var(--space-4)]">
          <FormField label="公司名称" required>
            <Input placeholder="如：XX科技有限公司" value={form.company} onChange={set('company')} />
          </FormField>
          <FormField label="所属行业" required>
            <Select
              options={[
                { value: '', label: '请选择行业' },
                { value: '金融', label: '金融' },
                { value: '电商', label: '电商' },
                { value: '小说/阅读', label: '小说/阅读' },
                { value: '游戏', label: '游戏' },
                { value: '教育', label: '教育' },
                { value: '医疗健康', label: '医疗健康' },
                { value: '旅游', label: '旅游' },
                { value: '本地生活', label: '本地生活' },
                { value: '其他', label: '其他' },
              ]}
              value={form.industry}
              onChange={set('industry')}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-[var(--space-4)]">
          <FormField label="联系人姓名" required>
            <Input placeholder="客户方对接人" value={form.contact} onChange={set('contact')} />
          </FormField>
          <FormField label="联系人职位">
            <Input placeholder="如：市场总监、增长负责人" />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-[var(--space-4)]">
          <FormField label="手机号" required>
            <Input type="tel" placeholder="联系电话" value={form.phone} onChange={set('phone')} />
          </FormField>
          <FormField label="邮箱">
            <Input type="email" placeholder="工作邮箱" value={form.email} onChange={set('email')} />
          </FormField>
        </div>

        <FormField label="销售归属" required>
          <Select
            options={[
              { value: '', label: '请选择负责销售' },
              { value: '王斯琼', label: '王斯琼' },
              { value: '陈明辉', label: '陈明辉' },
              { value: '郭晋光', label: '郭晋光' },
            ]}
            value={form.salesOwner}
            onChange={set('salesOwner')}
          />
        </FormField>

        <FormField label="客户来源">
          <div className="flex flex-wrap gap-[var(--space-2)]">
            {['官网', 'BD 拓展', '转介绍', '线上营销', '其他'].map((s) => (
              <ChoiceCard key={s} type="radio" label={s} checked={form.source === s} onChange={() => dispatch({ type: 'SET_FIELD', field: 'source', value: s })} />
            ))}
          </div>
        </FormField>
      </div>
    </Card>
  )
}
