import { apiRequest } from './client'
import type { Task, TaskStatus } from '../types/api'

type CreateTaskInput = {
  title: string
  description?: string
  projectId: string
  status?: TaskStatus
}

export const tasksApi = {
  listByProject: (projectId: string, status?: TaskStatus) =>
    apiRequest<Task[]>(`/projects/${projectId}/tasks`, {
      query: { status },
    }),
  create: (input: CreateTaskInput) =>
    apiRequest<Task>('/tasks', {
      method: 'POST',
      body: input,
    }),
  update: (taskId: string, input: { title?: string; description?: string }) =>
    apiRequest<Task>(`/tasks/${taskId}`, {
      method: 'PUT',
      body: input,
    }),
  updateStatus: (taskId: string, status: TaskStatus) =>
    apiRequest<Task>(`/tasks/${taskId}/status`, {
      method: 'PATCH',
      body: { status },
    }),
  delete: (taskId: string) =>
    apiRequest<{ message: string }>(`/tasks/${taskId}`, {
      method: 'DELETE',
    }),
}
