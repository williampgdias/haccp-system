import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { z } from 'zod';
import prisma from '../prisma.js';
import { sendPasswordResetEmail } from '../services/emailService.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// ==========================================
// VALIDATION SCHEMAS
// ==========================================
const registerSchema = z.object({
    restaurantName: z.string().min(2, 'Restaurant name must be at least 2 characters'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

const forgotPasswordSchema = z.object({
    email: z.string().email('Invalid email address'),
});

const resetPasswordSchema = z.object({
    token: z.string().min(1, 'Token is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

const updateProfileSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    currentPassword: z.string().optional(),
    newPassword: z.string().min(8, 'New password must be at least 8 characters').optional(),
});

// ==========================================
// GET /users/by-email/:email
// Used by NextAuth to validate login
// ==========================================
router.get('/users/by-email/:email', async (req, res) => {
    try {
        const { email } = req.params;
        const user = await prisma.user.findUnique({
            where: { email },
            include: { restaurant: true },
        });

        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ==========================================
// POST /register
// Creates Restaurant + Admin User
// ==========================================
router.post('/register', async (req, res) => {
    try {
        const parsed = registerSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: parsed.error.errors[0].message });
        }

        const { restaurantName, name, email, password } = parsed.data;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already in use' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.restaurant.create({
            data: {
                name: restaurantName,
                users: {
                    create: {
                        name,
                        email,
                        password: hashedPassword,
                        role: 'ADMIN',
                    },
                },
            },
        });

        res.status(201).json({ message: 'Success' });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// ==========================================
// POST /forgot-password
// Generates reset token and sends email
// ==========================================
router.post('/forgot-password', async (req, res) => {
    try {
        const parsed = forgotPasswordSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: parsed.error.errors[0].message });
        }

        const { email } = parsed.data;

        const user = await prisma.user.findUnique({ where: { email } });

        // Always return 200 to prevent email enumeration
        if (!user) {
            return res.json({ message: 'If that email exists, a reset link has been sent.' });
        }

        // Invalidate existing tokens
        await prisma.resetToken.updateMany({
            where: { userId: user.id, used: false },
            data: { used: true },
        });

        // Generate new token (1 hour expiry)
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

        await prisma.resetToken.create({
            data: { token, userId: user.id, expiresAt },
        });

        await sendPasswordResetEmail({ to: user.email, name: user.name, token });

        res.json({ message: 'If that email exists, a reset link has been sent.' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ==========================================
// POST /reset-password
// Validates token and sets new password
// ==========================================
router.post('/reset-password', async (req, res) => {
    try {
        const parsed = resetPasswordSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: parsed.error.errors[0].message });
        }

        const { token, password } = parsed.data;

        const resetToken = await prisma.resetToken.findUnique({
            where: { token },
            include: { user: true },
        });

        if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
            return res.status(400).json({ error: 'Invalid or expired reset link.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.update({
            where: { id: resetToken.userId },
            data: { password: hashedPassword },
        });

        await prisma.resetToken.update({
            where: { id: resetToken.id },
            data: { used: true },
        });

        res.json({ message: 'Password updated successfully.' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ==========================================
// PATCH /profile
// Update name and/or password (authenticated)
// ==========================================
router.patch('/profile', authenticate, async (req, res) => {
    try {
        const parsed = updateProfileSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: parsed.error.errors[0].message });
        }

        const { name, currentPassword, newPassword } = parsed.data;
        const userId = req.user!.id;

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const updateData: { name?: string; password?: string } = {};

        if (name) updateData.name = name;

        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ error: 'Current password is required to set a new one.' });
            }
            const valid = await bcrypt.compare(currentPassword, user.password);
            if (!valid) {
                return res.status(400).json({ error: 'Current password is incorrect.' });
            }
            updateData.password = await bcrypt.hash(newPassword, 10);
        }

        const updated = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: { id: true, name: true, email: true, role: true, restaurantId: true },
        });

        res.json(updated);
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
