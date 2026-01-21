import prisma from '../../db/prisma';
import { ErrorFactory } from '../../utils/errors';
import { CreateProjectInput, UpdateProjectInput } from './projects.validation';

/**
 * Projects Service - handles business logic for projects
 * All operations are scoped to the authenticated user
 */
export class ProjectsService {
    /**
     * Create a new project for the authenticated user
     */
    async createProject(userId: string, data: CreateProjectInput) {
        const project = await prisma.project.create({
            data: {
                name: data.name,
                description: data.description,
                userId,
            },
            include: {
                _count: {
                    select: { tasks: { where: { deletedAt: null } } },
                },
            },
        });

        return project;
    }

    /**
     * Get all projects owned by the authenticated user
     */
    async getUserProjects(userId: string) {
        const projects = await prisma.project.findMany({
            where: { userId, deletedAt: null },
            include: {
                _count: {
                    select: { tasks: { where: { deletedAt: null } } },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return projects;
    }

    /**
     * Get a single project by ID
     * Ensures the project belongs to the authenticated user (IDOR prevention)
     */
    async getProjectById(projectId: string, userId: string) {
        const project = await prisma.project.findFirst({
            where: {
                id: projectId,
                userId, // Critical: ensures user owns this project
                deletedAt: null,
            },
            include: {
                _count: {
                    select: { tasks: { where: { deletedAt: null } } },
                },
            },
        });

        if (!project) {
            throw ErrorFactory.notFound('Project');
        }

        return project;
    }

    /**
     * Update a project
     * Ensures the project belongs to the authenticated user
     */
    async updateProject(projectId: string, userId: string, data: UpdateProjectInput) {
        // First check if project exists and belongs to user
        const existingProject = await prisma.project.findFirst({
            where: {
                id: projectId,
                userId, // Critical: ensures user owns this project
                deletedAt: null,
            },
        });

        if (!existingProject) {
            throw ErrorFactory.notFound('Project');
        }

        // Update the project
        const updatedProject = await prisma.project.update({
            where: { id: projectId },
            data: {
                ...(data.name && { name: data.name }),
                ...(data.description !== undefined && { description: data.description }),
            },
            include: {
                _count: {
                    select: { tasks: { where: { deletedAt: null } } },
                },
            },
        });

        return updatedProject;
    }

    /**
     * Delete a project
     * Ensures the project belongs to the authenticated user
     * Cascades to delete all tasks in the project
     */
    async deleteProject(projectId: string, userId: string) {
        // First check if project exists and belongs to user
        const existingProject = await prisma.project.findFirst({
            where: {
                id: projectId,
                userId, // Critical: ensures user owns this project
                deletedAt: null,
            },
        });

        if (!existingProject) {
            throw ErrorFactory.notFound('Project');
        }

        const deletedAt = new Date();

        await prisma.$transaction([
            prisma.project.update({
                where: { id: projectId },
                data: { deletedAt },
            }),
            prisma.task.updateMany({
                where: { projectId, deletedAt: null },
                data: { deletedAt },
            }),
        ]);

        return { message: 'Project deleted successfully' };
    }
}

export const projectsService = new ProjectsService();
