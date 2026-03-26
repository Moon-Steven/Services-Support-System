'use client'

interface ChoiceCardProps {
  type: 'radio' | 'checkbox'
  label: string
  checked: boolean
  onChange: () => void
}

export function ChoiceCard({ type, label, checked, onChange }: ChoiceCardProps) {
  return (
    <label
      className={`inline-flex items-center gap-[var(--space-2)] px-[var(--space-4)] py-[var(--space-2-5)] rounded-md text-14-regular text-grey-01 cursor-pointer transition-all border ${
        checked ? 'border-grey-01 bg-selected' : 'border-grey-12 bg-white'
      }`}
    >
      <input
        type={type}
        checked={checked}
        onChange={onChange}
        className="accent-grey-01"
      />
      <span>{label}</span>
    </label>
  )
}
