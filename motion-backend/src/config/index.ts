import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Config object with validation
const config = {
    // Database
    database: {
        url: process.env.DATABASE_URL || '',
    },

    // JWT
    jwt: {
        secret: process.env.JWT_SECRET || '',
        refreshSecret: process.env.JWT_REFRESH_SECRET || '',
        expiresIn: process.env.JWT_EXPIRES_IN || '15m',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    },

    // Server
    server: {
        port: parseInt(process.env.PORT || '3000', 10),
        nodeEnv: process.env.NODE_ENV || 'development',
    },

    // CORS
    cors: {
        origin: process.env.CORS_ORIGIN?.split(',') || [
            'http://localhost:3000',
            'https://motion-ten-liart.vercel.app',
        ],
    },

    // Rate Limiting
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
        max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    },

    // Auth Rate Limiting (stricter for auth endpoints)
    authRateLimit: {
        windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
        max: parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS || '5', 10),
    },

    // Password Reset
    passwordReset: {
        tokenExpiryMinutes: parseInt(process.env.RESET_TOKEN_EXPIRY_MINUTES || '30', 10),
    },

    // Keep Alive
    keepAlive: {
        url:
            process.env.KEEP_ALIVE_URL ||
            (process.env.NODE_ENV === 'production'
                ? 'https://motion-vfo5.onrender.com/health'
                : ''),
        intervalMs: parseInt(process.env.KEEP_ALIVE_INTERVAL_MS || '600000', 10), // 10 minutes
    },
} as const;

// Validate required environment variables
function validateConfig() {
    const required = [
        { key: 'DATABASE_URL', value: config.database.url },
        { key: 'JWT_SECRET', value: config.jwt.secret },
        { key: 'JWT_REFRESH_SECRET', value: config.jwt.refreshSecret },
    ];

    const missing = required.filter((item) => !item.value);

    if (missing.length > 0) {
        const missingKeys = missing.map((item) => item.key).join(', ');
        throw new Error(`Missing required environment variables: ${missingKeys}`);
    }

    // Warn about weak secrets in production
    if (config.server.nodeEnv === 'production') {
        if (config.jwt.secret.length < 32 || config.jwt.refreshSecret.length < 32) {
            console.warn('WARNING: JWT secrets should be at least 32 characters in production');
        }
    }
}

validateConfig();

export default config;
