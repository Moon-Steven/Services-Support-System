'use client'

import { HTMLAttributes, ReactNode } from 'react'

type CardPadding = 'standard' | 'large' | 'none'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: CardPadding
  children: ReactNode
}

const paddingClasses: Record<CardPadding, string> = {
  standard: 'p-[var(--space-5)]',
  large: 'p-[var(--space-6)]',
  none: 'p-0',
}

export function Card({
  padding = 'standard',
  children,
  className = '',
  style,
  ...props
}: CardProps) {
  return (
    <div
      className={`rounded-xl bg-white border border-stroke ${paddingClasses[padding]} ${className}`}
      style={style}
      {...props}
    >
      {children}
    </div>
  )
}
