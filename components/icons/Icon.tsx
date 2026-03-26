'use client'

import { SVGAttributes } from 'react'

export interface IconProps extends SVGAttributes<SVGSVGElement> {
  size?: number
}

const defaultProps: SVGAttributes<SVGSVGElement> = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export function createIcon(path: React.ReactNode, displayName: string) {
  function IconComponent({ size = 16, className, ...props }: IconProps) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 16 16"
        className={className}
        {...defaultProps}
        {...props}
      >
        {path}
      </svg>
    )
  }
  IconComponent.displayName = displayName
  return IconComponent
}
