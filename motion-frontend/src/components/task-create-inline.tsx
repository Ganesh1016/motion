import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { tasksApi } from '../api/tasks'
import { getApiErrorMessage } from '../lib/api-error'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'

type TaskCreateInlineProps = {
  projectId: string | null
}

export function TaskCreateInline({ projectId }: TaskCreateInlineProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: tasksApi.create,
    onSuccess: () => {
      toast.success('Task created')
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
      }
      setTitle('')
      setDescription('')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to create task'))
    },
  })

  const canSubmit = Boolean(projectId) && title.trim().length > 0 && !mutation.isPending

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-base">New task</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="task-title">Title</Label>
          <Input
            id="task-title"
            placeholder={projectId ? 'Task title' : 'Select a project first'}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            disabled={!projectId || mutation.isPending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="task-description">Description</Label>
            <textarea
              id="task-description"
              placeholder="Optional description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              disabled={!projectId || mutation.isPending}
              className="flex min-h-[96px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
        </div>
        <div className="flex justify-end">
          <Button
            type="button"
            onClick={() =>
              projectId &&
              mutation.mutate({
                title: title.trim(),
                description: description.trim() || undefined,
                projectId,
              })
            }
            disabled={!canSubmit}
          >
            {mutation.isPending ? 'Creating...' : 'Create task'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
