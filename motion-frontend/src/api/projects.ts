import { apiRequest } from './client'
import type { Project } from '../types/api'

type CreateProjectInput = {
  name: string
  description?: string
}

export const projectsApi = {
  list: () => apiRequest<Project[]>('/projects'),
  create: (input: CreateProjectInput) =>
    apiRequest<Project>('/projects', {
      method: 'POST',
      body: input,
    }),
}