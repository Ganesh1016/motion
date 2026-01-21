import prisma from '../../db/prisma';
import {
    hashUtils,
    jwtUtils
} from '../../utils/auth';
import { ErrorFactory } from '../../utils/errors';
import {
    RegisterInput,
    LoginInput
} from './auth.validation';

/**
 * Auth Service - handles business logic for authentication
 */
export class AuthService {
    /**
     * Register a new user
     */
    async register(data: RegisterInput) {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (existingUser) {
            throw ErrorFactory.conflict('User with this email already exists');
        }

        // Hash password
        const hashedPassword = await hashUtils.hashPassword(data.password);

        // Create user
        const user = await prisma.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                name: data.name,
            },
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        // Generate tokens
        const accessToken = jwtUtils.generateAccessToken(user.id);
        const refreshToken = jwtUtils.generateRefreshToken(user.id);

        // Hash and store refresh token
        const hashedRefreshToken = hashUtils.hashToken(refreshToken);
        const refreshTokenExpiry = new Date();
        refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7); // 7 days

        await prisma.refreshToken.create({
            data: {
                token: hashedRefreshToken,
                userId: user.id,
                expiresAt: refreshTokenExpiry,
            },
        });

        return {
            user,
            accessToken,
            refreshToken,
        };
    }

    /**
     * Login an existing user
     */
    async login(data: LoginInput) {
        // Find user by email
        const user = await prisma.user.findFirst({
            where: { email: data.email, deletedAt: null },
        });

        if (!user) {
            throw ErrorFactory.unauthorized('Invalid credentials');
        }

        // Verify password
        const isPasswordValid = await hashUtils.comparePassword(
            data.password,
            user.password
        );

        if (!isPasswordValid) {
            throw ErrorFactory.unauthorized('Invalid credentials');
        }

        // Generate tokens
        const accessToken = jwtUtils.generateAccessToken(user.id);
        const refreshToken = jwtUtils.generateRefreshToken(user.id);

        // Hash and store refresh token
        const hashedRefreshToken = hashUtils.hashToken(refreshToken);
        const refreshTokenExpiry = new Date();
        refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7); // 7 days

        await prisma.refreshToken.create({
            data: {
                token: hashedRefreshToken,
                userId: user.id,
                expiresAt: refreshTokenExpiry,
            },
        });

        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
            accessToken,
            refreshToken,
        };
    }

    /**
     * Refresh access token using refresh token
     */
    async refreshToken(refreshToken: string) {
        // Verify refresh token
        let payload;
        try {
            payload = jwtUtils.verifyRefreshToken(refreshToken);
        } catch (error) {
            throw ErrorFactory.unauthorized('Invalid refresh token');
        }

        // Hash the refresh token to compare with stored hash
        const hashedRefreshToken = hashUtils.hashToken(refreshToken);

        // Find refresh token in database
        const storedToken = await prisma.refreshToken.findUnique({
            where: { token: hashedRefreshToken },
        });

        if (!storedToken) {
            throw ErrorFactory.unauthorized('Invalid refresh token');
        }

        // Check if token is revoked
        if (storedToken.revoked) {
            throw ErrorFactory.unauthorized('Refresh token has been revoked');
        }

        // Check if token is expired
        if (storedToken.expiresAt < new Date()) {
            throw ErrorFactory.unauthorized('Refresh token has expired');
        }

        // Find user
        const user = await prisma.user.findFirst({
            where: { id: payload.userId, deletedAt: null },
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!user) {
            throw ErrorFactory.unauthorized('User not found');
        }

        // Generate new tokens (token rotation)
        const newAccessToken = jwtUtils.generateAccessToken(user.id);
        const newRefreshToken = jwtUtils.generateRefreshToken(user.id);

        // Revoke old refresh token
        await prisma.refreshToken.update({
            where: { id: storedToken.id },
            data: { revoked: true },
        });

        // Store new refresh token
        const newHashedRefreshToken = hashUtils.hashToken(newRefreshToken);
        const newRefreshTokenExpiry = new Date();
        newRefreshTokenExpiry.setDate(newRefreshTokenExpiry.getDate() + 7);

        await prisma.refreshToken.create({
            data: {
                token: newHashedRefreshToken,
                userId: user.id,
                expiresAt: newRefreshTokenExpiry,
            },
        });

        return {
            user,
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        };
    }

    /**
     * Logout user by revoking refresh token
     */
    async logout(refreshToken: string) {
        const hashedRefreshToken = hashUtils.hashToken(refreshToken);

        // Find and revoke refresh token
        const token = await prisma.refreshToken.findUnique({
            where: { token: hashedRefreshToken },
        });

        if (token) {
            await prisma.refreshToken.update({
                where: { id: token.id },
                data: { revoked: true },
            });
        }

        // Note: For JWT access tokens, client-side logout is required
        // Access tokens cannot be revoked until they expire
        return { message: 'Logged out successfully' };
    }

    /**
     * Get current authenticated user
     */
    async getCurrentUser(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
                updatedAt: true,
                deletedAt: true,
            },
        });

        if (!user || user.deletedAt) {
            throw ErrorFactory.notFound('User');
        }

        const { deletedAt, ...safeUser } = user;
        return safeUser;
    }

}

export const authService = new AuthService();
