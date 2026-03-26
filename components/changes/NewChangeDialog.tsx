'use client'

import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'

interface NewChangeDialogProps {
  open: boolean
  onClose: () => void
  changeTypes: string[]
  checkedTypes: Record<string, boolean>
  onToggleType: (type: string) => void
}

export function NewChangeDialog({
  open,
  onClose,
  changeTypes,
  checkedTypes,
  onToggleType,
}: NewChangeDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} title="发起变更">
      <p className="text-12-regular text-grey-06 mb-[var(--space-4)]">
        修改将进入审批流程，全环节确认后生效
      </p>
      <div className="flex flex-col gap-[var(--space-4)]">
        <div>
          <div className="text-12-medium text-grey-08 mb-[var(--space-2)]">变更类型</div>
          <div className="flex flex-wrap gap-[var(--space-2)]">
            {changeTypes.map((ct) => (
              <label
                key={ct}
                className={`flex items-center text-12-regular gap-[var(--space-1-5)] px-[var(--space-3)] py-[var(--space-2)] rounded-lg cursor-pointer text-grey-01 ${
                  checkedTypes[ct]
                    ? 'border border-grey-01 bg-selected'
                    : 'border border-grey-12 bg-white'
                }`}
              >
                <input
                  type="checkbox"
                  checked={!!checkedTypes[ct]}
                  onChange={() => onToggleType(ct)}
                  className="w-[12px] h-[12px] accent-[var(--grey-01)]"
                />
                {ct}
              </label>
            ))}
          </div>
        </div>
        <div>
          <div className="text-12-medium text-grey-08 mb-[var(--space-2)]">变更说明</div>
          <textarea
            rows={3}
            placeholder="描述变更原因和具体内容..."
            className="text-14-regular w-full p-[var(--space-2)] border border-grey-12 rounded-md bg-white text-grey-01 resize-y outline-none font-[inherit]"
          />
        </div>
        <div>
          <div className="text-12-medium text-grey-08 mb-[var(--space-2)]">变更详情</div>
          <div className="text-14-regular p-[var(--space-3)] border border-grey-12 rounded-md text-grey-08">
            请在上方选择变更类型后填写具体变更值
          </div>
        </div>
      </div>
      <div className="flex gap-[var(--space-3)] mt-[var(--space-5)]">
        <Button variant="secondary" onClick={onClose} className="flex-1">
          取消
        </Button>
        <Button variant="primary" onClick={onClose} className="flex-1 justify-center">
          提交变更
        </Button>
      </div>
    </Dialog>
  )
}
