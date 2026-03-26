'use client'

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

export function Toggle({ checked, onChange, disabled = false }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      className={`relative inline-flex items-center shrink-0 w-10 h-5 rounded-full transition-colors disabled:opacity-50 ${checked ? 'bg-grey-01' : 'bg-grey-12'}`}
      onClick={() => onChange(!checked)}
    >
      <span
        className={`inline-block w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-[22px]' : 'translate-x-[2px]'}`}
      />
    </button>
  )
}
