import { Router } from 'express';
import prisma from '../prisma.js';

const router = Router();

/**
 * COOKING LOGS
 * POST: Create a record linked to a restaurant
 * GET: Fetch all records for a specific restaurant
 */
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

router.get('/cooking/:restaurantId', async (req, res) => {
    try {
        const logs = await prisma.cookingLog.findMany({
            where: { restaurantId: req.params.restaurantId },
            orderBy: { createdAt: 'desc' },
        });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch cooking logs' });
    }
});

/**
 * CLEANING LOGS
 */
router.post('/cleaning', async (req, res) => {
    try {
        const { restaurantId, ...data } = req.body;
        const log = await prisma.cleaningLog.create({
            data: { ...data, restaurantId },
        });
        res.status(201).json(log);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create cleaning log' });
    }
});

router.get('/cleaning/:restaurantId', async (req, res) => {
    try {
        const logs = await prisma.cleaningLog.findMany({
            where: { restaurantId: req.params.restaurantId },
            orderBy: { createdAt: 'desc' },
        });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch cleaning logs.' });
    }
});

/**
 * DELIVERY LOGS
 */
router.post('/delivery', async (req, res) => {
    try {
        const { restaurantId, ...data } = req.body;
        const log = await prisma.deliveryLog.create({
            data: { ...data, restaurantId },
        });
        res.status(201).json(log);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create delivery log' });
    }
});

router.get('/delivery/:restaurantId', async (req, res) => {
    try {
        const logs = await prisma.deliveryLog.findMany({
            where: { restaurantId: req.params.restaurantId },
            orderBy: { createdAt: 'desc' },
        });
        res.status(201).json(logs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch delivery logs' });
    }
});

router.post('/temperatures', async (req, res) => {
    try {
        const { restaurantId, equipmentId, temperature, initials } = req.body;

        const log = await prisma.temperatureLog.create({
            data: {
                restaurantId,
                equipmentId,
                temperature: parseFloat(temperature),
                initials,
            },
        });
        res.status(201).json(log);
    } catch (error) {
        console.error('Temperature POST Error:', error);
        res.status(500).json({ error: 'Failed to save temperature' });
    }
});

// TEMPERATURE LOGS
router.get('/temperatures/:restaurantId', async (req, res) => {
    try {
        const logs = await prisma.temperatureLog.findMany({
            where: { restaurantId: req.params.restaurantId },
            include: { equipment: true }, // Include fridge names
            orderBy: { createdAt: 'desc' },
        });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch temperatures' });
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
