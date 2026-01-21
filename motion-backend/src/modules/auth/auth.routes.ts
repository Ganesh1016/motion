import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authController } from './auth.controller';
import { authenticate } from '../../middleware/auth';
import config from '../../config';

const router = Router();

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
    windowMs: config.authRateLimit.windowMs,
    max: config.authRateLimit.max,
    message: {
        success: false,
        error: {
            message: 'Too many authentication attempts, please try again later',
            statusCode: 429,
        },
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Auth Routes
 */

// Public routes (with rate limiting)
router.post('/register', authLimiter, authController.register.bind(authController));
router.post('/login', authLimiter, authController.login.bind(authController));
router.post('/refresh', authLimiter, authController.refreshToken.bind(authController));
router.post('/logout', authController.logout.bind(authController));
router.post('/forgot-password', authLimiter, authController.forgotPassword.bind(authController));
router.post('/reset-password', authLimiter, authController.resetPassword.bind(authController));

// Protected routes (requires authentication)
router.get('/me', authenticate, authController.getCurrentUser.bind(authController));

export default router;
