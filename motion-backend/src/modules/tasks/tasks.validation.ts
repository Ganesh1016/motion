import { z } from 'zod';
import { TaskStatus } from '@prisma/client';

/**
 * Validation schemas for task endpoints
 */

// Allowed task status values
export const taskStatusValues = [
    TaskStatus.TODO,
    TaskStatus.IN_PROGRESS,
    TaskStatus.DONE,
    TaskStatus.BLOCKED,
] as const;

export const createTaskSchema = z.object({
    title: z.string().min(1, 'Task title is required').max(200, 'Task title must be less than 200 characters'),
    description: z.string().max(2000, 'Description must be less than 2000 characters').optional(),
    status: z.enum(taskStatusValues).optional(),
    projectId: z.string().uuid('Invalid project ID'),
});

export const updateTaskSchema = z.object({
    title: z.string().min(1, 'Task title is required').max(200, 'Task title must be less than 200 characters').optional(),
    description: z.string().max(2000, 'Description must be less than 2000 characters').optional(),
    status: z.enum(taskStatusValues).optional(),
});

export const taskQuerySchema = z.object({
    status: z.enum(taskStatusValues).optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskQueryInput = z.infer<typeof taskQuerySchema>;
