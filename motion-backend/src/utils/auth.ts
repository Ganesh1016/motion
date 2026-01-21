import bcrypt from 'bcrypt';
import jwt, { type SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import config from '../config';

const SALT_ROUNDS = 12;

/**
 * Hash utilities for passwords and tokens
 */
export const hashUtils = {
    /**
     * Hash a password using bcrypt with 12 salt rounds
     */
    hashPassword: async (password: string): Promise<string> => {
        return bcrypt.hash(password, SALT_ROUNDS);
    },

    /**
     * Compare a plain password with a hashed password
     */
    comparePassword: async (password: string, hashedPassword: string): Promise<boolean> => {
        return bcrypt.compare(password, hashedPassword);
    },

    /**
     * Hash a token (for refresh tokens and reset tokens) using SHA256
     */
    hashToken: (token: string): string => {
        return crypto.createHash('sha256').update(token).digest('hex');
    },
};

/**
 * JWT token utilities
 */
export const jwtUtils = {
    /**
     * Generate an access token (short-lived)
     */
    generateAccessToken: (userId: string): string => {
        const options: SignOptions = {
            expiresIn: config.jwt.expiresIn as SignOptions['expiresIn'],
        };
        return jwt.sign({ userId }, config.jwt.secret, options);
    },

    /**
     * Generate a refresh token (long-lived)
     */
    generateRefreshToken: (userId: string): string => {
        const options: SignOptions = {
            expiresIn: config.jwt.refreshExpiresIn as SignOptions['expiresIn'],
        };
        return jwt.sign({ userId }, config.jwt.refreshSecret, options);
    },

    /**
     * Verify an access token
     */
    verifyAccessToken: (token: string): { userId: string } => {
        return jwt.verify(token, config.jwt.secret) as { userId: string };
    },

    /**
     * Verify a refresh token
     */
    verifyRefreshToken: (token: string): { userId: string } => {
        return jwt.verify(token, config.jwt.refreshSecret) as { userId: string };
    },
};

/**
 * Generate a secure random token for password reset
 */
export function generateResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
}

/**
 * Calculate expiry date for reset tokens
 */
export function getResetTokenExpiry(): Date {
    const expiryDate = new Date();
    expiryDate.setMinutes(expiryDate.getMinutes() + config.passwordReset.tokenExpiryMinutes);
    return expiryDate;
}
