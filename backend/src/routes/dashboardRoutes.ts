import { Router } from 'express';
import prisma from '../prisma.js';

const router = Router();

router.get('/stats/:restaurantId', async (req, res) => {
    try {
        const { restaurantId } = req.params;

        // Fetching logs AND total counts in one go
        const [temps, cooking, deliveries, cleanings, totalEquip, totalUsers] =
            await Promise.all([
                prisma.temperatureLog.findMany({
                    where: { restaurantId },
                    include: { equipment: true },
                    orderBy: { createdAt: 'desc' },
                    take: 20,
                }),
                prisma.cookingLog.findMany({
                    where: { restaurantId },
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                }),
                prisma.deliveryLog.findMany({
                    where: { restaurantId },
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                }),
                prisma.cleaningLog.findMany({
                    where: { restaurantId },
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                }),
                // New Total Counts:
                prisma.equipment.count({ where: { restaurantId } }),
                prisma.user.count({ where: { restaurantId } }),
            ]);

        res.json({
            temps,
            cooking,
            deliveries,
            cleanings,
            totalEquip,
            totalUsers,
        });
    } catch (error) {
        console.error(' [DASHBOARD ERROR]:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;
