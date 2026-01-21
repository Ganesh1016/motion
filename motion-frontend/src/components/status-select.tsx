import type { TaskStatus } from '../types/api'
import { taskStatusOptions } from '../lib/task'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

type StatusSelectProps = {
  value: TaskStatus
  onChange: (value: TaskStatus) => void
  disabled?: boolean
}

export function StatusSelect({ value, onChange, disabled }: StatusSelectProps) {
  return (
    <Select
      value={value}
      onValueChange={(nextValue) => onChange(nextValue as TaskStatus)}
      disabled={disabled}
    >
      <SelectTrigger className="h-8 w-[140px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {taskStatusOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
