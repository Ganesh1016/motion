import { Response, NextFunction } from 'express';
import { projectsService } from './projects.service';
import { createProjectSchema, updateProjectSchema } from './projects.validation';
import { AuthRequest } from '../../middleware/auth';
import { ErrorFactory, SuccessResponse } from '../../utils/errors';

/**
 * Projects Controller - handles HTTP requests for projects
 */
export class ProjectsController {
    /**
     * Create a new project
     * POST /projects
     */
    async createProject(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                throw new Error('User not authenticated');
            }

            // Validate request body
            const validatedData = createProjectSchema.parse(req.body);

            // Call service
            const project = await projectsService.createProject(req.user.userId, validatedData);

            // Send response
            res.status(201).json({
                success: true,
                data: project,
                message: 'Project created successfully',
            } as SuccessResponse);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get all projects for the authenticated user
     * GET /projects
     */
    async getUserProjects(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                throw new Error('User not authenticated');
            }

            // Call service
            const projects = await projectsService.getUserProjects(req.user.userId);

            // Send response
            res.status(200).json({
                success: true,
                data: projects,
            } as SuccessResponse);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get a single project by ID
     * GET /projects/:id
     */
    async getProjectById(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                throw new Error('User not authenticated');
            }

            const idParam = req.params.id;
            const id = Array.isArray(idParam) ? idParam[0] : idParam;

            if (!id) {
                throw ErrorFactory.badRequest('Project ID is required');
            }

            // Call service
            const project = await projectsService.getProjectById(id, req.user.userId);

            // Send response
            res.status(200).json({
                success: true,
                data: project,
            } as SuccessResponse);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update a project
     * PUT /projects/:id
     */
    async updateProject(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                throw new Error('User not authenticated');
            }

            const idParam = req.params.id;
            const id = Array.isArray(idParam) ? idParam[0] : idParam;

            if (!id) {
                throw ErrorFactory.badRequest('Project ID is required');
            }

            // Validate request body
            const validatedData = updateProjectSchema.parse(req.body);

            // Call service
            const project = await projectsService.updateProject(id, req.user.userId, validatedData);

            // Send response
            res.status(200).json({
                success: true,
                data: project,
                message: 'Project updated successfully',
            } as SuccessResponse);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete a project
     * DELETE /projects/:id
     */
    async deleteProject(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                throw new Error('User not authenticated');
            }

            const idParam = req.params.id;
            const id = Array.isArray(idParam) ? idParam[0] : idParam;

            if (!id) {
                throw ErrorFactory.badRequest('Project ID is required');
            }

            // Call service
            const result = await projectsService.deleteProject(id, req.user.userId);

            // Send response (204 No Content is standard for successful DELETE)
            res.status(200).json({
                success: true,
                data: result,
            } as SuccessResponse);
        } catch (error) {
            next(error);
        }
    }
}

export const projectsController = new ProjectsController();
