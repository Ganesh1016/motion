import { Router } from 'express';
import { tasksController } from './tasks.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

/**
 * All task routes require authentication
 * Tasks are scoped to the authenticated user through project ownership
 */

// Apply authentication middleware to all routes
router.use(authenticate);

// Task CRUD routes
router.post('/', tasksController.createTask.bind(tasksController));
router.get('/:id', tasksController.getTaskById.bind(tasksController));
router.put('/:id', tasksController.updateTask.bind(tasksController));
router.patch('/:id/status', tasksController.updateTaskStatus.bind(tasksController));
router.delete('/:id', tasksController.deleteTask.bind(tasksController));

export default router;
