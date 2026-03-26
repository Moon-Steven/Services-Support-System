'use client'

import { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className = '', id, ...props }: InputProps) {
  const inputId = id || label?.replace(/\s+/g, '-').toLowerCase()

  return (
    <div className="flex flex-col gap-[var(--space-1)]">
      {label && (
        <label htmlFor={inputId} className="text-12-medium text-grey-06">
          <span className="text-l-cyan mr-[var(--space-1)]">&bull;</span>
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`text-14-regular rounded-md px-3 h-[var(--height-input)] border bg-white text-grey-01 outline-none transition-colors focus:border-grey-01 ${error ? 'border-red' : 'border-grey-12'} ${className}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {error && (
        <span id={`${inputId}-error`} className="text-10-regular text-red" role="alert">
          {error}
        </span>
      )}
    </div>
  )
}
