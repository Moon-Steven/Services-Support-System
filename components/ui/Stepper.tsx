'use client'

interface Step {
  key: string
  label: string
}

interface StepperProps {
  steps: Step[]
  currentStep: number
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="flex items-center gap-[var(--space-2)]" role="list" aria-label="步骤进度">
      {steps.map((step, idx) => {
        const isCompleted = idx < currentStep
        const isCurrent = idx === currentStep
        const isPending = idx > currentStep

        return (
          <div key={step.key} className="flex items-center gap-[var(--space-2)]" role="listitem">
            {/* Step indicator */}
            <div
              className={`flex items-center justify-center w-6 h-6 rounded-full text-12-bold shrink-0 ${
                isCompleted
                  ? 'bg-l-cyan text-white'
                  : isCurrent
                    ? 'bg-grey-01 text-white'
                    : 'bg-grey-12 text-grey-08'
              }`}
              aria-current={isCurrent ? 'step' : undefined}
            >
              {isCompleted ? (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 6l3 3 5-5" />
                </svg>
              ) : (
                idx + 1
              )}
            </div>

            {/* Step label */}
            <span
              className={`text-12-medium whitespace-nowrap ${
                isPending ? 'text-grey-08' : 'text-grey-01'
              }`}
            >
              {step.label}
            </span>

            {/* Connector line */}
            {idx < steps.length - 1 && (
              <div
                className={`h-px flex-1 min-w-[var(--space-4)] ${
                  isCompleted ? 'bg-l-cyan' : 'bg-grey-12'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
