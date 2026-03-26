'use client'

import { ReactNode } from 'react'

interface FormFieldProps {
  label: string
  required?: boolean
  error?: string
  htmlFor?: string
  children: ReactNode
}

export function FormField({ label, required, error, htmlFor, children }: FormFieldProps) {
  const id = htmlFor || label.replace(/\s+/g, '-').toLowerCase()

  return (
    <div className="flex flex-col gap-[var(--space-1-5)]">
      <label htmlFor={id} className="text-12-medium text-grey-06">
        <span className="text-l-cyan mr-[var(--space-1)]">&bull;</span>
        {label}
        {required && <span className="text-red ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <span id={`${id}-error`} className="text-10-regular text-red" role="alert">
          {error}
        </span>
      )}
    </div>
  )
}
