import type { Project } from '../types/api'
import { cn } from '../lib/utils'
import { ProjectCreateDialog } from './project-create-dialog'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Skeleton } from './ui/skeleton'

type ProjectListProps = {
  projects: Project[]
  selectedProjectId: string | null
  isLoading: boolean
  onSelectProject: (projectId: string) => void
}

export function ProjectList({
  projects,
  selectedProjectId,
  isLoading,
  onSelectProject,
}: ProjectListProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Projects</CardTitle>
        <ProjectCreateDialog />
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-11/12" />
            <Skeleton className="h-8 w-10/12" />
          </div>
        ) : projects.length === 0 ? (
          <div className="space-y-3 rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
            <p>No projects yet.</p>
            <p>Create one to start tracking tasks.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {projects.map((project) => (
              <Button
                key={project.id}
                variant="ghost"
                className={cn(
                  'w-full justify-between rounded-md border border-transparent px-3 py-2 text-left font-normal hover:border-border',
                  project.id === selectedProjectId && 'border-border bg-muted'
                )}
                onClick={() => onSelectProject(project.id)}
              >
                <span className="truncate">{project.name}</span>
                <Badge variant="outline" className="ml-2">
                  {project._count?.tasks ?? 0}
                </Badge>
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}