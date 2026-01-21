import { z } from 'zod';

/**
 * Validation schemas for project endpoints
 */

export const createProjectSchema = z.object({
    name: z.string().min(1, 'Project name is required').max(200, 'Project name must be less than 200 characters'),
    description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
});

export const updateProjectSchema = z.object({
    name: z.string().min(1, 'Project name is required').max(200, 'Project name must be less than 200 characters').optional(),
    description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
