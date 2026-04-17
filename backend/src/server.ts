import 'dotenv/config';
import * as Sentry from '@sentry/node';
import express from 'express';
import cors from 'cors';

import { authenticate, authorizeRestaurant } from './middleware/auth.js';
import { authLimiter, apiLimiter } from './middleware/rateLimiter.js';

import authRoutes from './routes/authRoutes.js';
import logRoutes from './routes/logRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import reportRoutes from './routes/reportRoutes.js';

// ==========================================
// SENTRY INIT (error tracking)
// ==========================================
if (process.env.SENTRY_DSN) {
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV || 'development',
        tracesSampleRate: 0.2,
    });
}

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// General rate limiter on all API routes
app.use('/api', apiLimiter);

// ==========================================
// PUBLIC ROUTES (no auth needed)
// ==========================================
app.use('/api/auth/users/by-email', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);
app.use('/api/auth', authRoutes);

// ==========================================
// PROTECTED ROUTES (auth required)
// ==========================================
app.use('/api/logs', authenticate, authorizeRestaurant, logRoutes);
app.use('/api/team', authenticate, authorizeRestaurant, teamRoutes);
app.use('/api/dashboard', authenticate, authorizeRestaurant, dashboardRoutes);
app.use('/api/reports', authenticate, authorizeRestaurant, reportRoutes);

// ==========================================
// SENTRY ERROR HANDLER (must be last)
// ==========================================
if (process.env.SENTRY_DSN) {
    Sentry.setupExpressErrorHandler(app);
}

// ==========================================
// GLOBAL ERROR HANDLER
// ==========================================
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('[SERVER ERROR]', err);
    res.status(500).json({ error: 'Internal server error' });
});

// ==========================================
// START SERVER
// ==========================================
app.listen(port, () => {
    console.log(`HACCP Pro Server running on port ${port}`);
});
