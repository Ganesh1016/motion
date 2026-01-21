import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import {
    registerSchema,
    loginSchema,
    refreshTokenSchema
} from './auth.validation';
import { AuthRequest } from '../../middleware/auth';
import { SuccessResponse } from '../../utils/errors';

/**
 * Auth Controller - handles HTTP requests for authentication
 */
export class AuthController {
    /**
     * Register a new user
     * POST /auth/register
     */
    async register(req: Request, res: Response, next: NextFunction) {
        try {
            // Validate request body
            const validatedData = registerSchema.parse(req.body);

            // Call service
            const result = await authService.register(validatedData);

            // Send response
            res.status(201).json({
                success: true,
                data: result,
                message: 'User registered successfully',
            } as SuccessResponse);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Login an existing user
     * POST /auth/login
     */
    async login(req: Request, res: Response, next: NextFunction) {
        try {
            // Validate request body
            const validatedData = loginSchema.parse(req.body);

            // Call service
            const result = await authService.login(validatedData);

            // Send response
            res.status(200).json({
                success: true,
                data: result,
                message: 'Login successful',
            } as SuccessResponse);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Refresh access token
     * POST /auth/refresh
     */
    async refreshToken(req: Request, res: Response, next: NextFunction) {
        try {
            // Validate request body
            const validatedData = refreshTokenSchema.parse(req.body);

            // Call service
            const result = await authService.refreshToken(validatedData.refreshToken);

            // Send response
            res.status(200).json({
                success: true,
                data: result,
                message: 'Token refreshed successfully',
            } as SuccessResponse);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Logout user
     * POST /auth/logout
     */
    async logout(req: Request, res: Response, next: NextFunction) {
        try {
            // Validate request body
            const validatedData = refreshTokenSchema.parse(req.body);

            // Call service
            const result = await authService.logout(validatedData.refreshToken);

            // Send response
            res.status(200).json({
                success: true,
                data: result,
                message: 'Logout successful',
            } as SuccessResponse);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get current authenticated user
     * GET /auth/me
     */
    async getCurrentUser(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                throw new Error('User not authenticated');
            }

            // Call service
            const user = await authService.getCurrentUser(req.user.userId);

            // Send response
            res.status(200).json({
                success: true,
                data: user,
            } as SuccessResponse);
        } catch (error) {
            next(error);
        }
    }

}

export const authController = new AuthController();
