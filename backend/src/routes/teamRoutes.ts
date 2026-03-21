import { Router } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../prisma.js';

const router = Router();

/**
 * ==========================================
 * TEAM MANAGEMENT (STAFF)
 * ==========================================
 */

/**
 * POST /
 * Creates a new team member. Accepts name, email, restaurantId, and optional role.
 * Role defaults to 'STAFF' but can be 'ADMIN'.
 */
router.post('/', async (req, res) => {
    try {
        const { name, email, restaurantId, role } = req.body;

        if (!name || !email || !restaurantId) {
            return res.status(400).json({
                error: 'Name, email, and restaurant ID are required.',
            });
        }

        // Validate that the role is either ADMIN or STAFF
        if (role && role !== 'ADMIN' && role !== 'STAFF') {
            return res
                .status(400)
                .json({ error: 'Invalid role. Must be ADMIN or STAFF.' });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });

        if (existingUser) {
            return res
                .status(400)
                .json({ error: 'This email is already registered.' });
        }

        const defaultPassword = 'HaccpPassword123!';
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        const newStaff = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role || 'STAFF', // Uses provided role or defaults to STAFF
                restaurantId,
            },
        });

        // Strip password before returning
        const { password, ...userWithoutPassword } = newStaff;
        res.status(201).json(userWithoutPassword);
    } catch (error) {
        console.error('Error adding team member:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

/**
 * GET /:restaurantId
 * Fetches all team members registered for a specific restaurant.
 * Sorted alphabetically by name.
 */
router.get('/:restaurantId', async (req, res) => {
    try {
        const logs = await prisma.user.findMany({
            where: { restaurantId: req.params.restaurantId },
            orderBy: { name: 'asc' },
        });
        res.json(logs);
    } catch (error) {
        console.error('Error fetching team members:', error);
        res.status(500).json({ error: 'Failed to fetch team members.' });
    }
});

/**
 * DELETE /:id
 * Removes a team member from the system.
 */
router.delete('/:id', async (req, res) => {
    try {
        await prisma.user.delete({ where: { id: req.params.id } });
        res.status(204).send(); // 204 No Content for successful deletion
    } catch (error) {
        console.error('Error deleting team member:', error);
        res.status(500).json({ error: 'Failed to delete team member.' });
    }
});

/**
 * PATCH /:id/role
 * Updates a user's role (ADMIN <-> STAFF).
 */
router.patch('/:id/role', async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (role !== 'ADMIN' && role !== 'STAFF') {
            return res.status(400).json({ error: 'Invalid role' });
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: { role },
        });

        res.json(updatedUser);
    } catch (error) {
        console.error('Error updating role:', error);
        res.status(500).json({ error: 'Failed to update role' });
    }
});

export default router;
