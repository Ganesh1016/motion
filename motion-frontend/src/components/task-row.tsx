import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import type { Task, TaskStatus } from '../types/api'
import { taskStatusLabels, taskStatusTones } from '../lib/task'
import { cn } from '../lib/utils'
import { StatusSelect } from './status-select'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'

const FALLBACK_DESCRIPTION = 'No description'

type TaskRowProps = {
  task: Task
  onStatusChange: (taskId: string, status: TaskStatus) => void
  statusUpdating: boolean
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
  deletePending: boolean
}

export function TaskRow({
  task,
  onStatusChange,
  statusUpdating,
  onEdit,
  onDelete,
  deletePending,
}: TaskRowProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 md:flex-row md:items-center md:justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h3
            className={cn(
              "text-sm font-semibold",
              task.status === "DONE" && "line-through text-muted-foreground",
            )}
          >
            {task.title}
          </h3>
          <Badge className={cn(taskStatusTones[task.status])}>
            {taskStatusLabels[task.status]}
          </Badge>
        </div>
        <p
          className={cn(
            "text-sm text-muted-foreground",
            task.status === "DONE" && "line-through",
          )}
        >
          {task.description || FALLBACK_DESCRIPTION}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <StatusSelect
          value={task.status}
          onChange={(status) => onStatusChange(task.id, status)}
          disabled={statusUpdating}
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(task)}
          aria-label="Edit task"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              disabled={deletePending}
              aria-label="Delete task"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete task</DialogTitle>
              <DialogDescription>
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setConfirmOpen(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={deletePending}
                onClick={() => {
                  onDelete(task)
                  setConfirmOpen(false)
                }}
              >
                {deletePending ? 'Deleting...' : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
