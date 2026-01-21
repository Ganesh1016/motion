import { useCallback, useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { projectsApi } from '../api/projects'
import { tasksApi } from '../api/tasks'
import { AppShell } from '../components/app-shell'
import { TaskCreateInline } from '../components/task-create-inline'
import { TaskList } from '../components/task-list'
import { Button } from '../components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../components/ui/sheet'
import { useQueryErrorToast } from '../hooks/use-query-error-toast'
import { getApiErrorMessage } from '../lib/api-error'
import { isValidFilter, mapFilterToStatus, type TaskStatusFilter } from '../lib/task'
import { useAuth } from '../store/auth'

const PAGE_SIZES = [10, 20]

function parsePageSize(value: string | null) {
  const parsed = Number(value)
  return PAGE_SIZES.includes(parsed) ? parsed : PAGE_SIZES[0]
}

function parsePage(value: string | null) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1
}

export function AppPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [createOpen, setCreateOpen] = useState(false)

  const statusParam = searchParams.get('status')
  const statusFilter: TaskStatusFilter = isValidFilter(statusParam)
    ? statusParam
    : 'all'

  const searchQuery = searchParams.get('query') ?? ''
  const page = parsePage(searchParams.get('page'))
  const pageSize = parsePageSize(searchParams.get('pageSize'))
  const projectParam = searchParams.get('project')

  const projectsQuery = useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.list,
  })

  const projects = projectsQuery.data ?? []

  const selectedProjectId = useMemo(() => {
    if (projectParam && projects.some((project) => project.id === projectParam)) {
      return projectParam
    }
    return projects[0]?.id ?? null
  }, [projectParam, projects])

  const statusForApi = mapFilterToStatus(statusFilter)

  const tasksQuery = useQuery({
    queryKey: ['tasks', selectedProjectId, statusFilter],
    queryFn: () => tasksApi.listByProject(selectedProjectId as string, statusForApi),
    enabled: Boolean(selectedProjectId),
  })

  useQueryErrorToast(projectsQuery.error, 'Unable to load projects')
  useQueryErrorToast(tasksQuery.error, 'Unable to load tasks')

  useEffect(() => {
    if (!projects.length || !selectedProjectId) {
      return
    }

    if (projectParam !== selectedProjectId) {
      const nextParams = new URLSearchParams(searchParams)
      nextParams.set('project', selectedProjectId)
      if (!nextParams.get('status')) {
        nextParams.set('status', statusFilter)
      }
      if (!nextParams.get('page')) {
        nextParams.set('page', '1')
      }
      if (!nextParams.get('pageSize')) {
        nextParams.set('pageSize', String(pageSize))
      }
      setSearchParams(nextParams, { replace: true })
    }
  }, [
    projectParam,
    projects.length,
    selectedProjectId,
    searchParams,
    setSearchParams,
    statusFilter,
    pageSize,
  ])

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const nextParams = new URLSearchParams(searchParams)
      Object.entries(updates).forEach(([key, value]) => {
        if (!value) {
          nextParams.delete(key)
        } else {
          nextParams.set(key, value)
        }
      })
      setSearchParams(nextParams)
    },
    [searchParams, setSearchParams]
  )

  const tasks = tasksQuery.data ?? []
  const normalizedQuery = searchQuery.trim().toLowerCase()
  const filteredTasks = normalizedQuery
    ? tasks.filter((task) => task.title.toLowerCase().includes(normalizedQuery))
    : tasks

  const sortedTasks = filteredTasks.slice().sort((a, b) => {
    if (a.status === "DONE" && b.status !== "DONE") {
      return 1
    }
    if (a.status !== "DONE" && b.status === "DONE") {
      return -1
    }
    return 0
  })

  const totalCount = sortedTasks.length
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const currentPage = Math.min(page, totalPages)
  const startIndex = (currentPage - 1) * pageSize
  const pagedTasks = sortedTasks.slice(startIndex, startIndex + pageSize)

  useEffect(() => {
    if (page !== currentPage) {
      updateParams({ page: String(currentPage) })
    }
  }, [page, currentPage, updateParams])

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Logged out')
      navigate('/login')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to log out'))
      navigate('/login')
    }
  }

  return (
    <AppShell
      projects={projects}
      selectedProjectId={selectedProjectId}
      isProjectsLoading={projectsQuery.isLoading}
      onSelectProject={(projectId) =>
        updateParams({ project: projectId, page: '1' })
      }
      onLogout={handleLogout}
      userEmail={user?.email}
      userName={user?.name ?? null}
    >
      <div className="flex h-[calc(100vh-6rem)] min-h-0 flex-col md:h-[calc(100vh-6rem)]">
        <div className="mb-3 flex items-center justify-between lg:hidden">
          <span className="text-sm font-medium">Tasks</span>
          <Sheet open={createOpen} onOpenChange={setCreateOpen}>
            <SheetTrigger asChild>
              <Button size="sm">Create new task</Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>New task</SheetTitle>
              </SheetHeader>
              <div className="mt-4">
                <TaskCreateInline projectId={selectedProjectId} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
        <TaskList
          className="min-h-0 flex-1"
          projectId={selectedProjectId}
          tasks={pagedTasks}
          isLoading={tasksQuery.isLoading}
          statusFilter={statusFilter}
          searchQuery={searchQuery}
          page={currentPage}
          pageSize={pageSize}
          totalPages={totalPages}
          totalCount={totalCount}
          onStatusFilterChange={(value) =>
            updateParams({ status: value, page: '1' })
          }
          onSearchChange={(value) => updateParams({ query: value, page: '1' })}
          onPageChange={(value) => updateParams({ page: String(value) })}
          onPageSizeChange={(value) =>
            updateParams({ pageSize: String(value), page: '1' })
          }
        />
      </div>
      <div className="hidden space-y-6 lg:block">
        <TaskCreateInline projectId={selectedProjectId} />
      </div>
    </AppShell>
  )
}
