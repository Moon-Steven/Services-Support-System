'use client'

import { ReactNode, useEffect, useRef } from 'react'

interface DialogProps {
  open: boolean
  onClose: () => void
  title?: string
  width?: number
  children: ReactNode
}

export function Dialog({ open, onClose, title, width, children }: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)

    // Lock body scroll
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    // Focus trap: focus the dialog on open
    dialogRef.current?.focus()

    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="rounded-2xl p-[var(--space-6)] bg-white outline-none"
        style={{
          width: width ?? 520,
          maxHeight: '85vh',
          overflowY: 'auto',
        }}
      >
        {title && (
          <div className="flex items-center justify-between mb-[var(--space-4)]">
            <h2 className="text-16-bold">{title}</h2>
            <button
              onClick={onClose}
              aria-label="关闭"
              className="flex items-center justify-center w-7 h-7 rounded-md text-grey-06 transition-opacity hover:opacity-60"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4l8 8M12 4l-8 8" />
              </svg>
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
