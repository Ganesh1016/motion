import type { TaskStatus } from '../types/api'

export type TaskStatusFilter = 'all' | 'todo' | 'in-progress' | 'done'

export const taskStatusOptions: Array<{ value: TaskStatus; label: string }> = [
  { value: 'TODO', label: 'To-do' },
  { value: 'IN_PROGRESS', label: 'In-progress' },
  { value: 'DONE', label: 'Done' },
]

export const taskStatusLabels: Record<TaskStatus, string> = {
  TODO: 'To-do',
  IN_PROGRESS: 'In-progress',
  DONE: 'Done',
  BLOCKED: 'Blocked',
}

export const taskStatusTones: Record<TaskStatus, string> = {
  TODO: 'bg-muted text-foreground',
  IN_PROGRESS: 'bg-secondary text-secondary-foreground',
  DONE: 'bg-foreground/10 text-foreground',
  BLOCKED: 'bg-muted text-muted-foreground',
}

export const taskFilterOptions: Array<{ value: TaskStatusFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'todo', label: 'To-do' },
  { value: 'in-progress', label: 'In-progress' },
  { value: 'done', label: 'Done' },
]

export function mapFilterToStatus(filter: TaskStatusFilter): TaskStatus | undefined {
  switch (filter) {
    case 'todo':
      return 'TODO'
    case 'in-progress':
      return 'IN_PROGRESS'
    case 'done':
      return 'DONE'
    default:
      return undefined
  }
}

export function isValidFilter(value: string | null): value is TaskStatusFilter {
  return value === 'all' || value === 'todo' || value === 'in-progress' || value === 'done'
}
