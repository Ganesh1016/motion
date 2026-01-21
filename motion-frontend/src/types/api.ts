export type ApiErrorResponse = {
  success: false
  error: {
    message: string
    statusCode: number
    errors?: unknown
  }
}

export type ApiSuccessResponse<T> = {
  success: true
  data: T
  message?: string
}

export type User = {
  id: string
  email: string
  name?: string | null
  createdAt: string
  updatedAt: string
}

export type Project = {
  id: string
  name: string
  description?: string | null
  createdAt: string
  updatedAt: string
  _count?: {
    tasks: number
  }
}

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED'

export type Task = {
  id: string
  title: string
  description?: string | null
  status: TaskStatus
  projectId: string
  createdAt: string
  updatedAt: string
}