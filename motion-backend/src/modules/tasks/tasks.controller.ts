import { Response, NextFunction } from 'express';
import { tasksService } from './tasks.service';
import {
    createTaskSchema,
    updateTaskSchema,
    taskQuerySchema,
    taskStatusValues
} from './tasks.validation';
import { AuthRequest } from '../../middleware/auth';
import { SuccessResponse } from '../../utils/errors';
import { z } from 'zod';
import { ErrorFactory } from '../../utils/errors';

/**
 * Tasks Controller - handles HTTP requests for tasks
 */
export class TasksController {
    /**
     * Create a new task
     * POST /tasks
     */
    async createTask(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                throw new Error('User not authenticated');
            }

            // Validate request body
            const validatedData = createTaskSchema.parse(req.body);

            // Call service
            const task = await tasksService.createTask(req.user.userId, validatedData);

            // Send response
            res.status(201).json({
                success: true,
                data: task,
                message: 'Task created successfully',
            } as SuccessResponse);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get all tasks for a project
     * GET /projects/:projectId/tasks?status=TODO
     */
    async getProjectTasks(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                throw new Error('User not authenticated');
            }

            const projectIdParam = req.params.projectId;
            const projectId = Array.isArray(projectIdParam)
                ? projectIdParam[0]
                : projectIdParam;

            if (!projectId) {
                throw ErrorFactory.badRequest('Project ID is required');
            }

            // Validate query parameters
            const filters = taskQuerySchema.parse(req.query);

            // Call service
            const tasks = await tasksService.getProjectTasks(projectId, req.user.userId, filters);

            // Send response
            res.status(200).json({
                success: true,
                data: tasks,
            } as SuccessResponse);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get a single task by ID
     * GET /tasks/:id
     */
    async getTaskById(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                throw new Error('User not authenticated');
            }

            const idParam = req.params.id;
            const id = Array.isArray(idParam) ? idParam[0] : idParam;

            if (!id) {
                throw ErrorFactory.badRequest('Task ID is required');
            }

            // Call service
            const task = await tasksService.getTaskById(id, req.user.userId);

            // Send response
            res.status(200).json({
                success: true,
                data: task,
            } as SuccessResponse);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update a task
     * PUT /tasks/:id
     */
    async updateTask(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                throw new Error('User not authenticated');
            }

            const idParam = req.params.id;
            const id = Array.isArray(idParam) ? idParam[0] : idParam;

            if (!id) {
                throw ErrorFactory.badRequest('Task ID is required');
            }

            // Validate request body
            const validatedData = updateTaskSchema.parse(req.body);

            // Call service
            const task = await tasksService.updateTask(id, req.user.userId, validatedData);

            // Send response
            res.status(200).json({
                success: true,
                data: task,
                message: 'Task updated successfully',
            } as SuccessResponse);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update task status
     * PATCH /tasks/:id/status
     */
    async updateTaskStatus(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                throw new Error('User not authenticated');
            }

            const idParam = req.params.id;
            const id = Array.isArray(idParam) ? idParam[0] : idParam;

            if (!id) {
                throw ErrorFactory.badRequest('Task ID is required');
            }

            // Validate status
            const statusSchema = z.object({
                status: z.enum(taskStatusValues, {
                    errorMap: () => ({
                        message: `Status must be one of: ${taskStatusValues.join(', ')}`
                    }),
                }),
            });

            const { status } = statusSchema.parse(req.body);

            // Call service
            const task = await tasksService.updateTaskStatus(id, req.user.userId, status);

            // Send response
            res.status(200).json({
                success: true,
                data: task,
                message: 'Task status updated successfully',
            } as SuccessResponse);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete a task
     * DELETE /tasks/:id
     */
    async deleteTask(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                throw new Error('User not authenticated');
            }

            const idParam = req.params.id;
            const id = Array.isArray(idParam) ? idParam[0] : idParam;

            if (!id) {
                throw ErrorFactory.badRequest('Task ID is required');
            }

            // Call service
            const result = await tasksService.deleteTask(id, req.user.userId);

            // Send response
            res.status(200).json({
                success: true,
                data: result,
            } as SuccessResponse);
        } catch (error) {
            next(error);
        }
    }
}

export const tasksController = new TasksController();
