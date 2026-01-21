import prisma from '../../db/prisma';
import { ErrorFactory } from '../../utils/errors';
import { CreateTaskInput, UpdateTaskInput, TaskQueryInput } from './tasks.validation';
import { TaskStatus } from '@prisma/client';

/**
 * Tasks Service - handles business logic for tasks
 * All operations are scoped to the authenticated user through project ownership
 */
export class TasksService {
    /**
     * Verify that a project belongs to the user
     * This prevents creating tasks under other users' projects
     */
    private async verifyProjectOwnership(projectId: string, userId: string): Promise<void> {
        const project = await prisma.project.findFirst({
            where: {
                id: projectId,
                userId,
                deletedAt: null,
            },
        });

        if (!project) {
            throw ErrorFactory.notFound('Project');
        }
    }

    /**
     * Create a new task under a project
     * Ensures the project belongs to the authenticated user
     */
    async createTask(userId: string, data: CreateTaskInput) {
        // Verify user owns the project
        await this.verifyProjectOwnership(data.projectId, userId);

        const task = await prisma.task.create({
            data: {
                title: data.title,
                description: data.description,
                status: data.status || TaskStatus.TODO,
                projectId: data.projectId,
            },
            include: {
                project: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        return task;
    }

    /**
     * Get all tasks for a specific project
     * Ensures the project belongs to the authenticated user
     * Supports filtering by status
     */
    async getProjectTasks(projectId: string, userId: string, filters?: TaskQueryInput) {
        // Verify user owns the project
        await this.verifyProjectOwnership(projectId, userId);

        const tasks = await prisma.task.findMany({
            where: {
                projectId,
                deletedAt: null,
                ...(filters?.status && { status: filters.status }),
            },
            include: {
                project: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return tasks;
    }

    /**
     * Get a single task by ID
     * Ensures the task belongs to a project owned by the authenticated user
     */
    async getTaskById(taskId: string, userId: string) {
        const task = await prisma.task.findFirst({
            where: {
                id: taskId,
                deletedAt: null,
                project: {
                    userId, // Critical: ensures task belongs to user's project
                    deletedAt: null,
                },
            },
            include: {
                project: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        if (!task) {
            throw ErrorFactory.notFound('Task');
        }

        return task;
    }

    /**
     * Update a task
     * Ensures the task belongs to a project owned by the authenticated user
     */
    async updateTask(taskId: string, userId: string, data: UpdateTaskInput) {
        // First verify the task exists and belongs to user's project
        const existingTask = await prisma.task.findFirst({
            where: {
                id: taskId,
                deletedAt: null,
                project: {
                    userId, // Critical: ensures task belongs to user's project
                    deletedAt: null,
                },
            },
        });

        if (!existingTask) {
            throw ErrorFactory.notFound('Task');
        }

        // Update the task
        const updatedTask = await prisma.task.update({
            where: { id: taskId },
            data: {
                ...(data.title && { title: data.title }),
                ...(data.description !== undefined && { description: data.description }),
                ...(data.status && { status: data.status }),
            },
            include: {
                project: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        return updatedTask;
    }

    /**
     * Update task status only
     * Ensures the task belongs to a project owned by the authenticated user
     * Validates the status is an allowed value
     */
    async updateTaskStatus(taskId: string, userId: string, status: TaskStatus) {
        // First verify the task exists and belongs to user's project
        const existingTask = await prisma.task.findFirst({
            where: {
                id: taskId,
                deletedAt: null,
                project: {
                    userId, // Critical: ensures task belongs to user's project
                    deletedAt: null,
                },
            },
        });

        if (!existingTask) {
            throw ErrorFactory.notFound('Task');
        }

        // Update task status
        const updatedTask = await prisma.task.update({
            where: { id: taskId },
            data: { status },
            include: {
                project: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        return updatedTask;
    }

    /**
     * Delete a task
     * Ensures the task belongs to a project owned by the authenticated user
     */
    async deleteTask(taskId: string, userId: string) {
        // First verify the task exists and belongs to user's project
        const existingTask = await prisma.task.findFirst({
            where: {
                id: taskId,
                deletedAt: null,
                project: {
                    userId, // Critical: ensures task belongs to user's project
                    deletedAt: null,
                },
            },
        });

        if (!existingTask) {
            throw ErrorFactory.notFound('Task');
        }

        const deletedAt = new Date();

        await prisma.task.update({
            where: { id: taskId },
            data: { deletedAt },
        });

        return { message: 'Task deleted successfully' };
    }
}

export const tasksService = new TasksService();
