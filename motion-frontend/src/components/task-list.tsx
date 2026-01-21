import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { tasksApi } from "../api/tasks";
import { getApiErrorMessage } from "../lib/api-error";
import {
  mapFilterToStatus,
  taskFilterOptions,
  type TaskStatusFilter,
} from "../lib/task";
import { cn } from "../lib/utils";
import type { Task, TaskStatus } from "../types/api";
import { TaskRow } from "./task-row";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Separator } from "./ui/separator";
import { Skeleton } from "./ui/skeleton";

type TaskListProps = {
  projectId: string | null;
  tasks: Task[];
  isLoading: boolean;
  statusFilter: TaskStatusFilter;
  searchQuery: string;
  page: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  onStatusFilterChange: (value: TaskStatusFilter) => void;
  onSearchChange: (value: string) => void;
  onPageChange: (value: number) => void;
  onPageSizeChange: (value: number) => void;
  className?: string;
};

export function TaskList({
  projectId,
  tasks,
  isLoading,
  statusFilter,
  searchQuery,
  page,
  pageSize,
  totalPages,
  totalCount,
  onStatusFilterChange,
  onSearchChange,
  onPageChange,
  onPageSizeChange,
  className,
}: TaskListProps) {
  const queryClient = useQueryClient();
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const statusMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: TaskStatus }) =>
      tasksApi.updateStatus(taskId, status),
    onMutate: async ({ taskId, status }) => {
      if (!projectId) {
        return { previous: [] };
      }

      await queryClient.cancelQueries({
        queryKey: ["tasks", projectId, statusFilter],
      });

      const previous =
        queryClient.getQueryData<Task[]>(["tasks", projectId, statusFilter]) ||
        [];

      queryClient.setQueryData<Task[]>(
        ["tasks", projectId, statusFilter],
        (old) => {
          if (!old) {
            return old;
          }

          const filterStatus = mapFilterToStatus(statusFilter);
          const shouldRemove = filterStatus && filterStatus !== status;

          if (shouldRemove) {
            return old.filter((task) => task.id !== taskId);
          }

          return old.map((task) =>
            task.id === taskId ? { ...task, status } : task,
          );
        },
      );

      return { previous };
    },
    onError: (error, _variables, context) => {
      if (projectId && context?.previous) {
        queryClient.setQueryData(
          ["tasks", projectId, statusFilter],
          context.previous,
        );
      }
      toast.error(getApiErrorMessage(error, "Unable to update status"));
    },
    onSuccess: () => {
      toast.success("Task status updated");
    },
    onSettled: () => {
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (taskId: string) => tasksApi.delete(taskId),
    onSuccess: () => {
      toast.success("Task deleted");
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      }
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Unable to delete task"));
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: { taskId: string; title: string; description: string }) =>
      tasksApi.update(payload.taskId, {
        title: payload.title,
        description: payload.description || undefined,
      }),
    onSuccess: () => {
      toast.success("Task updated");
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      }
      setEditingTask(null);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Unable to update task"));
    },
  });

  const canPaginate = totalPages > 1;
  const pageLabel = useMemo(
    () => `Page ${page} of ${Math.max(totalPages, 1)}`,
    [page, totalPages],
  );

  if (!projectId) {
    return (
      <div className={cn("flex h-full flex-col", className)}>
        <Card className="flex h-full flex-col">
          <CardContent className="p-6 text-sm text-muted-foreground">
            Select a project to view its tasks.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("flex h-full flex-col gap-4", className)}>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="grid grid-cols-[120px_1fr] items-center gap-2 md:flex md:flex-wrap">
          <Select
            value={statusFilter}
            onValueChange={(value) =>
              onStatusFilterChange(value as TaskStatusFilter)
            }
          >
            <SelectTrigger className=" min-w-32 w-fit px-4">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {taskFilterOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="search"
            placeholder="Search tasks"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            className="w-full md:w-55"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Page size</span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger className="w-22.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      <div className="flex-1 overflow-y-auto pr-1">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : tasks.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              No tasks match this filter.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                onStatusChange={(taskId, status) =>
                  statusMutation.mutate({ taskId, status })
                }
                statusUpdating={
                  statusMutation.isPending &&
                  statusMutation.variables?.taskId === task.id
                }
                onEdit={(taskToEdit) => {
                  setEditingTask(taskToEdit);
                  setEditTitle(taskToEdit.title);
                  setEditDescription(taskToEdit.description ?? "");
                }}
                onDelete={(taskToDelete) =>
                  deleteMutation.mutate(taskToDelete.id)
                }
                deletePending={
                  deleteMutation.isPending &&
                  deleteMutation.variables === task.id
                }
              />
            ))}
          </div>
        )}
      </div>

      <Separator />

      <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
        <span>
          Showing {tasks.length} of {totalCount} tasks
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!canPaginate || page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            Prev
          </Button>
          <span>{pageLabel}</span>
          <Button
            variant="outline"
            size="sm"
            disabled={!canPaginate || page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
      <Dialog
        open={Boolean(editingTask)}
        onOpenChange={(open) => {
          if (!open) {
            setEditingTask(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-task-title">Title</Label>
              <Input
                id="edit-task-title"
                value={editTitle}
                onChange={(event) => setEditTitle(event.target.value)}
                disabled={updateMutation.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-task-description">Description</Label>
              <textarea
                id="edit-task-description"
                value={editDescription}
                onChange={(event) => setEditDescription(event.target.value)}
                disabled={updateMutation.isPending}
                className="flex min-h-[96px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setEditingTask(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={
                !editingTask ||
                editTitle.trim().length === 0 ||
                updateMutation.isPending
              }
              onClick={() =>
                editingTask &&
                updateMutation.mutate({
                  taskId: editingTask.id,
                  title: editTitle.trim(),
                  description: editDescription.trim(),
                })
              }
            >
              {updateMutation.isPending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
