'use client'

import { SelectHTMLAttributes } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
}

export function Select({ label, error, options, className = '', id, ...props }: SelectProps) {
  const selectId = id || label?.replace(/\s+/g, '-').toLowerCase()

  return (
    <div className="flex flex-col gap-[var(--space-1)]">
      {label && (
        <label htmlFor={selectId} className="text-12-medium text-grey-06">
          <span className="text-l-cyan mr-[var(--space-1)]">&bull;</span>
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={`w-full text-14-regular rounded-md px-3 pr-8 h-[var(--height-input)] border bg-white text-grey-01 outline-none appearance-none transition-colors focus:border-grey-01 ${error ? 'border-red' : 'border-grey-12'} ${className}`}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${selectId}-error` : undefined}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <svg
          className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-grey-06"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 6l4 4 4-4" />
        </svg>
      </div>
      {error && (
        <span id={`${selectId}-error`} className="text-10-regular text-red" role="alert">
          {error}
        </span>
      )}
    </div>
  )
}
