import { Request, Response, NextFunction } from 'express';
import { ErrorResponse } from '../utils/errors';
import config from '../config';
import { ApiError } from '../utils/errors';
import { ZodError } from 'zod';

/**
 * Global error handler middleware
 * Catches all errors and formats them consistently
 * Prevents stack trace leakage in production
 */
export function errorHandler(
    err: Error,
    _req: Request,
    res: Response<ErrorResponse>,
    _next: NextFunction
): void {
    // Log error for debugging
    console.error('Error:', err);

    // Handle known ApiError instances
    if (err instanceof ApiError) {
        const errorBody: ErrorResponse = {
            success: false,
            error: {
                message: err.message,
                statusCode: err.statusCode,
            },
        };

        if (err.errors) {
            errorBody.error.errors = err.errors;
        }

        res.status(err.statusCode).json(errorBody);
        return;
    }

    // Handle Zod validation errors
    if (err instanceof ZodError) {
        const validationErrors: Record<string, string[]> = {};
        err.issues.forEach((issue) => {
            const path = issue.path.join('.');
            if (!validationErrors[path]) {
                validationErrors[path] = [];
            }
            validationErrors[path].push(issue.message);
        });

        res.status(422).json({
            success: false,
            error: {
                message: 'Validation failed',
                statusCode: 422,
                errors: validationErrors,
            },
        });
        return;
    }

    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        res.status(401).json({
            success: false,
            error: {
                message: 'Invalid token',
                statusCode: 401,
            },
        });
        return;
    }

    if (err.name === 'TokenExpiredError') {
        res.status(401).json({
            success: false,
            error: {
                message: 'Token expired',
                statusCode: 401,
            },
        });
        return;
    }

    // Handle Prisma errors
    if (err.constructor.name === 'PrismaClientKnownRequestError') {
        const prismaError = err as any;

        // Unique constraint violation
        if (prismaError.code === 'P2002') {
            res.status(409).json({
                success: false,
                error: {
                    message: 'A record with this value already exists',
                    statusCode: 409,
                },
            });
            return;
        }

        // Record not found
        if (prismaError.code === 'P2025') {
            res.status(404).json({
                success: false,
                error: {
                    message: 'Record not found',
                    statusCode: 404,
                },
            });
            return;
        }
    }

    // Default to 500 Internal Server Error
    const statusCode = 500;
    const message = config.server.nodeEnv === 'production'
        ? 'Internal server error'
        : err.message;

    const errorBody: ErrorResponse = {
        success: false,
        error: {
            message,
            statusCode,
        },
    };

    if (config.server.nodeEnv !== 'production') {
        errorBody.error.errors = { stack: err.stack };
    }

    res.status(statusCode).json(errorBody);
}

/**
 * 404 Not Found handler for unmatched routes
 */
export function notFoundHandler(req: Request, res: Response): void {
    res.status(404).json({
        success: false,
        error: {
            message: `Route ${req.method} ${req.path} not found`,
            statusCode: 404,
        },
    });
}
