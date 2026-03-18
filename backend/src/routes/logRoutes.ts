import { Router } from 'express';
import prisma from '../prisma.js';

const router = Router();

// ----- COOKING LOGS -----
router.post('/cooking', async (req, res) => {
    try {
        const { restaurantId, ...data } = req.body;
        const log = await prisma.cookingLog.create({
            data: { ...data, restaurantId },
        });
        res.json(log);
    } catch (error) {
        res.status(500).json({ error: 'Failed to created cooking log' });
    }
});

// ----- CLEANING LOGS -----
router.post('/cleaning', async (req, res) => {
    try {
        const { restaurantId, ...data } = req.body;
        const log = await prisma.cleaningLog.create({
            data: { ...data, restaurantId },
        });
        res.json(log);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create cleaning log' });
    }
});

// ----- DELIVERY LOGS -----
router.post('/delivery', async (req, res) => {
    try {
        const { restaurantId, ...data } = req.body;
        const log = await prisma.deliveryLog.create({
            data: { ...data, restaurantId },
        });
        res.json(log);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create delivery log' });
    }
});

// ----- EQUIPMENT -----
router.post('/equipment', async (req, res) => {
    try {
        const { name, type, restaurantId } = req.body;
        const equipment = await prisma.equipment.create({
            data: { name, type, restaurantId },
        });
        res.json(equipment);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create equipment' });
    }
});

// Helper to fetch equipment for the dropdowns later
router.get('/equipment/:restaurantId', async (req, res) => {
    const { restaurantId } = req.params;
    const items = await prisma.equipment.findMany({
        where: { restaurantId },
    });
    res.json(items);
});

export default router;
