'use client'

import { HTMLAttributes, ReactNode } from 'react'

type BadgeVariant = 'cyan' | 'grey' | 'red' | 'orange' | 'dark'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  children: ReactNode
}

const variantClasses: Record<BadgeVariant, string> = {
  cyan: 'bg-cyan-tint-12 text-l-cyan',
  grey: 'bg-grey-12 text-grey-06',
  red: 'bg-red-tint-08 text-red',
  orange: 'bg-orange-tint-10 text-orange',
  dark: 'bg-grey-01 text-white',
}

export function Badge({
  variant = 'grey',
  children,
  className = '',
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center text-12-medium rounded-full px-2 py-0.5 ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}
