'use client'

import { HTMLAttributes } from 'react'

type AvatarSize = 'sm' | 'md' | 'lg'

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  name: string
  size?: AvatarSize
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: 'w-[var(--size-avatar-sm)] h-[var(--size-avatar-sm)] text-10-regular',
  md: 'w-[var(--size-avatar-md)] h-[var(--size-avatar-md)] text-12-bold',
  lg: 'w-[var(--size-avatar-lg)] h-[var(--size-avatar-lg)] text-14-bold',
}

export function Avatar({ name, size = 'md', className = '', style, ...props }: AvatarProps) {
  const initial = name.charAt(0).toUpperCase()

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full bg-grey-01 text-white ${sizeClasses[size]} ${className}`}
      style={style}
      {...props}
    >
      {initial}
    </div>
  )
}
