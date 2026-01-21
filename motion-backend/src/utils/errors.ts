import { z } from 'zod';

/**
 * Custom API Error class for consistent error handling
 */
export class ApiError extends Error {
    constructor(
        public statusCode: number,
        public message: string,
        public errors?: unknown
    ) {
        super(message);
        this.name = 'ApiError';
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Predefined error creators for common scenarios
 */
export const ErrorFactory = {
    badRequest: (message: string, errors?: unknown) => new ApiError(400, message, errors),
    unauthorized: (message = 'Unauthorized') => new ApiError(401, message),
    forbidden: (message = 'Forbidden') => new ApiError(403, message),
    notFound: (resource: string) => new ApiError(404, `${resource} not found`),
    conflict: (message: string) => new ApiError(409, message),
    unprocessableEntity: (message: string, errors?: unknown) =>
        new ApiError(422, message, errors),
    internalServer: (message = 'Internal server error') => new ApiError(500, message),
};

/**
 * Type for standardized error response
 */
export interface ErrorResponse {
    success: false;
    error: {
        message: string;
        statusCode: number;
        errors?: unknown;
    };
}

/**
 * Type for standardized success response
 */
export interface SuccessResponse<T = unknown> {
    success: true;
    data: T;
    message?: string;
}

/**
 * Helper to format Zod validation errors
 */
export function formatZodError(error: z.ZodError): Record<string, string[]> {
    const formatted: Record<string, string[]> = {};

    error.issues.forEach((issue) => {
        const path = issue.path.join('.');
        if (!formatted[path]) {
            formatted[path] = [];
        }
        formatted[path].push(issue.message);
    });

    return formatted;
}
