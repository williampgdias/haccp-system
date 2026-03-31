import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

/**
 * ==========================================
 * AUTH MIDDLEWARE - Protects all API routes
 * ==========================================
 *
 * Validates the JWT token from NextAuth and injects
 * the user's data into req.user for downstream use.
 *
 * SETUP: Add NEXTAUTH_SECRET to your backend .env
 * (must match the same secret used in NextAuth config)
 */
export interface AuthUser {
    id: string;
    email: string;
    restaurantId: string;
    role: 'ADMIN' | 'STAFF';
}

// Extend Express Request to include user
declare global {
    namespace Express {
        interface Request {
            user?: AuthUser;
        }
    }
}

/**
 * Extracts and verifies the JWT token from the Authorization header.
 * Token format: "Bearer <token>"
 */
export function authenticate(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid token' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Missing token' });
    }

    try {
        const secret = process.env.NEXTAUTH_SECRET;
        if (!secret) {
            console.error('[AUTH] NEXTAUTH_SECRET is not set in .env');
            return res.status(500).json({ error: 'Server auth misconfigured' });
        }

        const decoded = jwt.verify(token, secret) as any;

        req.user = {
            id: decoded.sub || decoded.id,
            email: decoded.email,
            restaurantId: decoded.restaurantId,
            role: decoded.role,
        };

        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

/**
 * Ensures the authenticated user belongs to the restaurant
 * they're trying to access. Prevents tenant data leakage.
 *
 * Usage: Place AFTER authenticate middleware.
 * Checks req.params.restaurantId OR req.body.restaurantId
 */
export function authorizeRestaurant(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const paramId = req.params.restaurantId;
    const bodyId = req.body?.restaurantId;
    const targetRestaurantId = paramId || bodyId;

    if (!targetRestaurantId) {
        return next();
    }

    if (req.user?.restaurantId !== targetRestaurantId) {
        return res
            .status(403)
            .json({ error: 'Access denied to this restaurant' });
    }

    next();
}

/**
 * Restricts route access to ADMIN users only.
 * Usage: router.delete('/team/:id', authenticate, requireAdmin, handler)
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
    if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Admin privileges required' });
    }
    next();
}
