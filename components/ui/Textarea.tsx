'use client'

import { TextareaHTMLAttributes } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export function Textarea({ label, error, className = '', id, ...props }: TextareaProps) {
  const textareaId = id || label?.replace(/\s+/g, '-').toLowerCase()

  return (
    <div className="flex flex-col gap-[var(--space-1)]">
      {label && (
        <label htmlFor={textareaId} className="text-12-medium text-grey-06">
          <span className="text-l-cyan mr-[var(--space-1)]">&bull;</span>
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`w-full text-14-regular rounded-md p-[var(--space-3)] border bg-white text-grey-01 outline-none font-[inherit] resize-y transition-colors focus:border-grey-01 ${error ? 'border-red' : 'border-grey-12'} ${className}`}
        aria-invalid={error ? true : undefined}
        {...props}
      />
      {error && (
        <span className="text-10-regular text-red" role="alert">{error}</span>
      )}
    </div>
  )
}
