import { Request, Response, NextFunction } from 'express';
import { jwtUtils } from '../utils/auth';
import { ErrorFactory } from '../utils/errors';

/**
 * Extend Express Request to include authenticated user
 */
export interface AuthRequest extends Request {
    user?: {
        userId: string;
    };
}

/**
 * Authentication middleware
 * Verifies JWT access token and attaches user to request
 */
export function authenticate(
    req: AuthRequest,
    _res: Response,
    next: NextFunction
): void {
    try {
        // Extract token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw ErrorFactory.unauthorized('No token provided');
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        if (!token) {
            throw ErrorFactory.unauthorized('No token provided');
        }

        // Verify token
        const payload = jwtUtils.verifyAccessToken(token);

        // Attach user to request
        req.user = {
            userId: payload.userId,
        };

        next();
    } catch (error) {
        // Pass JWT errors to error handler
        if (error instanceof Error && (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError')) {
            next(error);
            return;
        }
        next(error);
    }
}

/**
 * Optional authentication middleware
 * Similar to authenticate but doesn't throw if no token is provided
 * Useful for endpoints that have different behavior for authenticated users
 */
export function optionalAuth(
    req: AuthRequest,
    _res: Response,
    next: NextFunction
): void {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            // No token provided, continue without user
            next();
            return;
        }

        const token = authHeader.substring(7);

        if (!token) {
            next();
            return;
        }

        // Verify token
        const payload = jwtUtils.verifyAccessToken(token);

        // Attach user to request
        req.user = {
            userId: payload.userId,
        };

        next();
    } catch (error) {
        // If token is invalid, continue without user (rather than throwing)
        next();
    }
}
