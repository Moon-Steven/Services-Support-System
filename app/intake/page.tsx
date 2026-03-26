'use client'

import { useReducer, useState, useMemo } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Stepper } from '@/components/ui/Stepper'
import { StepBasicInfo } from '@/components/intake/StepBasicInfo'
import { StepBusiness } from '@/components/intake/StepBusiness'
import { StepMarketing } from '@/components/intake/StepMarketing'
import { StepGrading } from '@/components/intake/StepGrading'
import { StepCompliance } from '@/components/intake/StepCompliance'
import { formReducer, initialFormState } from '@/components/intake/types'
import { complianceRequiredIndustries } from '@/lib/data'

export default function IntakePage() {
  const [step, setStep] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [form, dispatch] = useReducer(formReducer, initialFormState)

  /* Conditional compliance step based on industry */
  const needsCompliance = complianceRequiredIndustries.includes(form.industry)

  const steps = useMemo(() => {
    const base = [
      { key: 'basic', label: '基本信息' },
      { key: 'business', label: '业务情况' },
      { key: 'marketing', label: '营销诉求' },
      { key: 'grading', label: '客户评级' },
    ]
    if (needsCompliance) {
      base.push({ key: 'compliance', label: '合规资质' })
    }
    return base
  }, [needsCompliance])

  const stepComponents = useMemo(() => {
    const base = [
      <StepBasicInfo key="basic" form={form} dispatch={dispatch} />,
      <StepBusiness key="business" form={form} dispatch={dispatch} />,
      <StepMarketing key="marketing" form={form} dispatch={dispatch} />,
      <StepGrading key="grading" form={form} dispatch={dispatch} />,
    ]
    if (needsCompliance) {
      base.push(<StepCompliance key="compliance" form={form} dispatch={dispatch} />)
    }
    return base
  }, [form, dispatch, needsCompliance])

  const lastStep = steps.length - 1

  const goNext = () => {
    if (step === lastStep) {
      setSubmitted(true)
      return
    }
    setStep(step + 1)
  }

  const goPrev = () => {
    if (step > 0) setStep(step - 1)
  }

  return (
    <div className="max-w-[720px] mx-auto">
      {/* Page Header */}
      <div className="mb-[var(--space-6)]">
        <h1 className="text-24-bold text-grey-01">录入客户</h1>
        <p className="text-14-regular text-grey-08 mt-[var(--space-1)]">
          服务支持系统 · 结构化客户信息采集
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-[var(--space-6)]">
        <Stepper steps={steps} currentStep={step} />
        <div className="flex items-center gap-[var(--space-2)] shrink-0 ml-[var(--space-4)]">
          <span className="text-12-regular text-grey-08">
            第 {step + 1} 步 / 共 {steps.length} 步
          </span>
          {form.industry && !needsCompliance && step >= 1 && (
            <Badge variant="grey">合规免审</Badge>
          )}
          {needsCompliance && step >= 1 && (
            <Badge variant="orange">需合规审查</Badge>
          )}
        </div>
      </div>

      {/* Content */}
      {submitted ? (
        <Card padding="large" className="text-center">
          <svg width="48" height="48" className="mx-auto mb-[var(--space-3)] text-l-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-20-bold text-grey-01">客户信息已提交</div>
          <p className="text-14-regular text-grey-08 mt-[var(--space-1)]">
            {needsCompliance
              ? '信息已同步至服务支持系统，合规审查流程已自动触发'
              : '信息已同步至服务支持系统，可直接进入 IO 单提交环节'}
          </p>
          {form.gradeResult && (
            <div className="flex items-center justify-center gap-[var(--space-2)] mt-[var(--space-2)]">
              <span className="text-14-medium text-grey-06">
                客户评级：{form.gradeResult} 级（{form.gradeScore} 分）
              </span>
              {needsCompliance && <Badge variant="orange">需合规</Badge>}
              {!needsCompliance && <Badge variant="cyan">合规免审</Badge>}
            </div>
          )}
          <div className="flex items-center justify-center gap-[var(--space-3)] mt-[var(--space-6)]">
            <Link href="/kanban">
              <Button variant="secondary">前往看板</Button>
            </Link>
            <Link href="/io-orders?new=1">
              <Button>创建 IO 单 →</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <>
          {stepComponents[step]}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-[var(--space-6)]">
            {step > 0 ? (
              <Button variant="secondary" onClick={goPrev}>上一步</Button>
            ) : (
              <div />
            )}
            <Button onClick={goNext}>
              {step === lastStep ? '提交' : '下一步'}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
