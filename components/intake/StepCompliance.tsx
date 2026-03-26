'use client'

import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { FormField } from '@/components/ui/FormField'
import { ChoiceCard } from '@/components/ui/ChoiceCard'
import { FileUpload } from '@/components/ui/FileUpload'
import type { IntakeFormState, FormAction } from './types'

const HIGH_RISK_INDUSTRIES = ['金融', '医疗健康', '游戏']

interface Props {
  form: IntakeFormState
  dispatch: React.Dispatch<FormAction>
}

export function StepCompliance({ form, dispatch }: Props) {
  const set = (field: keyof IntakeFormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    dispatch({ type: 'SET_FIELD', field, value: e.target.value })

  return (
    <Card padding="large">
      <div className="text-16-bold">合规资质 & 资产</div>
      <p className="text-14-regular text-grey-08 mt-[var(--space-1)] mb-[var(--space-6)]">
        收集合规所需资料及投放资产信息
      </p>

      <div className="flex flex-col gap-[var(--space-5)]">
        {HIGH_RISK_INDUSTRIES.includes(form.industry) && (
          <div className="p-[var(--space-4)] bg-red-tint-04 border border-red-tint-15 rounded-md">
            <div className="flex items-center gap-[var(--space-2)] text-red text-14-medium">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              高风险行业提示
            </div>
            <p className="text-12-regular text-red mt-[var(--space-1)]">
              该行业属于高风险行业，需要额外的合规资质审查
            </p>
          </div>
        )}

        <FormField label="营业执照">
          <FileUpload label="点击上传或拖拽文件" hint="支持 PDF、JPG、PNG" />
        </FormField>

        <FormField label="行业特殊资质（如有）">
          <FileUpload label="金融牌照、医疗资质等" hint="高风险行业必填" />
        </FormField>

        <div className="grid grid-cols-2 gap-[var(--space-4)]">
          <FormField label="广告账户（如已有）">
            <Input placeholder="Meta/Google 账户 ID" value={form.adAccount} onChange={set('adAccount')} />
          </FormField>
          <FormField label="Pixel ID（如已有）">
            <Input placeholder="Pixel / SDK 追踪 ID" value={form.pixelId} onChange={set('pixelId')} />
          </FormField>
        </div>

        <FormField label="素材准备情况">
          <div className="flex flex-wrap gap-[var(--space-2)]">
            {['客户提供素材', '需要我方制作', '双方协作'].map((c) => (
              <ChoiceCard key={c} type="radio" label={c} checked={form.creativeReadiness === c} onChange={() => dispatch({ type: 'SET_FIELD', field: 'creativeReadiness', value: c })} />
            ))}
          </div>
        </FormField>
      </div>
    </Card>
  )
}
