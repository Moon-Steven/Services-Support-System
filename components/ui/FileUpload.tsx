'use client'

interface FileUploadProps {
  label: string
  hint?: string
}

export function FileUpload({ label, hint }: FileUploadProps) {
  return (
    <div className="border-2 border-dashed border-grey-12 rounded-md p-[var(--space-8)] text-center cursor-pointer hover:border-grey-08 transition-colors">
      <svg
        width="32"
        height="32"
        className="mx-auto text-grey-08"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
        />
      </svg>
      <div className="text-14-regular text-grey-06 mt-[var(--space-2)]">{label}</div>
      {hint && (
        <div className="text-12-regular text-grey-08 mt-[var(--space-1)]">{hint}</div>
      )}
    </div>
  )
}
