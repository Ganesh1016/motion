import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import config from './config';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Route imports
import authRoutes from './modules/auth/auth.routes';
import projectsRoutes from './modules/projects/projects.routes';
import tasksRoutes from './modules/tasks/tasks.routes';
import { tasksController } from './modules/tasks/tasks.controller';
import { authenticate } from './middleware/auth';

/**
 * Create and configure Express application
 */
export function createApp(): Application {
    const app = express();

    // Security middleware
    app.use(helmet());

    // CORS configuration
    app.use(
        cors({
            origin: config.cors.origin,
            credentials: true,
        })
    );

    // Request logging
    app.use(morgan(config.server.nodeEnv === 'development' ? 'dev' : 'combined'));

    // Body parsing middleware
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Global rate limiting
    const limiter = rateLimit({
        windowMs: config.rateLimit.windowMs,
        max: config.rateLimit.max,
        message: {
            success: false,
            error: {
                message: 'Too many requests, please try again later',
                statusCode: 429,
            },
        },
        standardHeaders: true,
        legacyHeaders: false,
    });
    app.use(limiter);

    // Health check endpoint
    app.get('/health', (_req, res) => {
        res.status(200).json({
            success: true,
            data: {
                status: 'ok',
                timestamp: new Date().toISOString(),
                environment: config.server.nodeEnv,
            },
        });
    });

    // API routes
    app.use('/api/auth', authRoutes);
    app.use('/api/projects', projectsRoutes);
    app.use('/api/tasks', tasksRoutes);

    // Nested route: Get tasks for a specific project
    // GET /api/projects/:projectId/tasks
    app.get(
        '/api/projects/:projectId/tasks',
        authenticate,
        tasksController.getProjectTasks.bind(tasksController)
    );

    // 404 handler for undefined routes
    app.use(notFoundHandler);

    // Global error handler (must be last)
    app.use(errorHandler);

    return app;
}
