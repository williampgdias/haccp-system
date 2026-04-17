import rateLimit from 'express-rate-limit';

// Strict limiter for auth endpoints (login, forgot password)
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: { error: 'Too many attempts. Please try again in 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// General API limiter
export const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 120,
    message: { error: 'Too many requests. Please slow down.' },
    standardHeaders: true,
    legacyHeaders: false,
});
