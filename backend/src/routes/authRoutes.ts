import { Router } from 'express';
import prisma from '../prisma.js';

const router = Router();

/**
 * FETCH USER BY EMAIL
 * Critical for NextAuth to validate user and retrieve their Restaurant ID.
 */
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
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * SAAS SETUP
 * Creates the Restaurant and the Admin User in a single transaction.
 */
router.post('/setup', async (req, res) => {
    try {
        const { restaurantName, userName, email, password, role } = req.body;

        const newRestaurant = await prisma.restaurant.create({
            data: {
                name: restaurantName,
                users: {
                    create: {
                        name: userName,
                        email: email,
                        password: password,
                        role: role,
                    },
                },
            },
            include: { users: true },
        });

        res.json(newRestaurant);
    } catch (error) {
        console.error('Setup Error:', error);
        res.status(500).json({ error: 'Failed to setup restaurant and user' });
    }
});

export default router;
