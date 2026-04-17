import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from '../prisma.js';
import { sendWelcomeEmail } from '../services/emailService.js';

const router = Router();

// ==========================================
// VALIDATION SCHEMAS
// ==========================================
const createStaffSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    restaurantId: z.string().uuid('Invalid restaurant ID'),
    role: z.enum(['ADMIN', 'STAFF']).optional(),
});

const updateRoleSchema = z.object({
    role: z.enum(['ADMIN', 'STAFF'], { message: 'Role must be ADMIN or STAFF' }),
});

// ==========================================
// POST /
// Creates a new team member and sends welcome email
// ==========================================
router.post('/', async (req, res) => {
    try {
        const parsed = createStaffSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: parsed.error.errors[0].message });
        }

        const { name, email, restaurantId, role } = parsed.data;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'This email is already registered.' });
        }

        const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } });
        if (!restaurant) {
            return res.status(404).json({ error: 'Restaurant not found.' });
        }

        const defaultPassword = 'HaccpPassword123!';
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        const newStaff = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role || 'STAFF',
                restaurantId,
            },
        });

        // Send welcome email (non-blocking — don't fail if email fails)
        sendWelcomeEmail({
            to: email,
            name,
            restaurantName: restaurant.name,
            password: defaultPassword,
        }).catch((err) => console.error('[EMAIL] Failed to send welcome email:', err));

        const { password, ...userWithoutPassword } = newStaff;
        res.status(201).json(userWithoutPassword);
    } catch (error) {
        console.error('Error adding team member:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// ==========================================
// GET /:restaurantId
// Fetches all team members for a restaurant
// ==========================================
router.get('/:restaurantId', async (req, res) => {
    try {
        const logs = await prisma.user.findMany({
            where: { restaurantId: req.params.restaurantId },
            orderBy: { name: 'asc' },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
                restaurantId: true,
            },
        });
        res.json(logs);
    } catch (error) {
        console.error('Error fetching team members:', error);
        res.status(500).json({ error: 'Failed to fetch team members.' });
    }
});

// ==========================================
// DELETE /:id
// Removes a team member
// ==========================================
router.delete('/:id', async (req, res) => {
    try {
        await prisma.user.delete({ where: { id: req.params.id } });
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting team member:', error);
        res.status(500).json({ error: 'Failed to delete team member.' });
    }
});

// ==========================================
// PATCH /:id/role
// Updates a user's role (ADMIN <-> STAFF)
// ==========================================
router.patch('/:id/role', async (req, res) => {
    try {
        const parsed = updateRoleSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: parsed.error.errors[0].message });
        }

        const updatedUser = await prisma.user.update({
            where: { id: req.params.id },
            data: { role: parsed.data.role },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                restaurantId: true,
            },
        });

        res.json(updatedUser);
    } catch (error) {
        console.error('Error updating role:', error);
        res.status(500).json({ error: 'Failed to update role' });
    }
});

export default router;
