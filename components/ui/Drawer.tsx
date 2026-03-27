'use client'

import { ReactNode, useEffect, useRef } from 'react'

interface DrawerProps {
  open: boolean
  onClose: () => void
  title?: string
  width?: number
  children: ReactNode
}

export function Drawer({ open, onClose, title, width = 420, children }: DrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    drawerRef.current?.focus()

    return () => {
      document.removeEventListener('keydown', handler)
    }
  }, [open, onClose])

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-overlay transition-opacity duration-300"
        style={{ opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none' }}
        onClick={onClose}
        role="presentation"
      />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="fixed top-0 right-0 bottom-0 z-50 flex flex-col bg-white shadow-lg outline-none transition-transform duration-300 ease-out"
        style={{
          width,
          transform: open ? 'translateX(0)' : `translateX(${width}px)`,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-[var(--space-5)] py-[var(--space-4)] border-b border-stroke shrink-0">
          <div className="flex items-center gap-[var(--space-2)]">
            <button
              onClick={onClose}
              aria-label="关闭"
              className="flex items-center justify-center w-7 h-7 rounded-md text-grey-06 hover:text-grey-01 hover:bg-selected transition-colors border-none bg-transparent cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 4l-4 4 4 4" />
              </svg>
            </button>
            {title && <h2 className="text-14-bold">{title}</h2>}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-[var(--space-5)] py-[var(--space-4)]">
          {children}
        </div>
      </div>
    </>
  )
}
