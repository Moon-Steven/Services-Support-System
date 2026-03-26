'use client'

import { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive'
type ButtonSize = 'default' | 'large'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  children: ReactNode
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-grey-01 text-white border border-transparent',
  secondary: 'bg-transparent text-grey-01 border border-grey-01',
  ghost: 'bg-transparent text-grey-06 border border-transparent',
  destructive: 'bg-red text-white border border-transparent',
}

const sizeClasses: Record<ButtonSize, string> = {
  default: 'h-[var(--height-button)]',
  large: 'h-[var(--height-input)]',
}

export function Button({
  variant = 'primary',
  size = 'default',
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center text-14-medium rounded-md px-4 transition-opacity hover:opacity-80 disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
