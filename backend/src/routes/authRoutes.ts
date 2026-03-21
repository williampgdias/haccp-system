import { Router } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../prisma.js';

const router = Router();

/**
 * FETCH USER BY EMAIL
 * Used by NextAuth to validate existence and retrieve Restaurant ID/Role.
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
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * SAAS REGISTRATION (REGISTER)
 * Renamed from /setup to /register to match Frontend calls.
 * Creates the Restaurant and the Admin User with a hashed password.
 */
router.post('/register', async (req, res) => {
    try {
        // MUDANÇA AQUI: Trocamos 'userName' por 'name' para bater com o formulário
        const { restaurantName, name, email, password } = req.body;

        if (!restaurantName || !name || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already in use' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newRestaurant = await prisma.restaurant.create({
            data: {
                name: restaurantName,
                users: {
                    create: {
                        name: name,
                        email: email,
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

export default router;
