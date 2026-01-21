import { Router } from 'express';
import { projectsController } from './projects.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

/**
 * All project routes require authentication
 * Projects are scoped to the authenticated user
 */

// Apply authentication middleware to all routes
router.use(authenticate);

// Project CRUD routes
router.post('/', projectsController.createProject.bind(projectsController));
router.get('/', projectsController.getUserProjects.bind(projectsController));
router.get('/:id', projectsController.getProjectById.bind(projectsController));
router.put('/:id', projectsController.updateProject.bind(projectsController));
router.delete('/:id', projectsController.deleteProject.bind(projectsController));

export default router;
