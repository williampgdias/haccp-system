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

router.put('/cooking/:id/cooling', async (req, res) => {
    try {
        const { coolingFinishTime, coolingFinishTemp } = req.body;
        const log = await prisma.cookingLog.update({
            where: { id: req.params.id },
            data: {
                coolingFinishTime,
                coolingFinishTemp: parseFloat(coolingFinishTemp),
            },
        });
        res.json(log);
    } catch (error) {
        console.error('Error updating cooling log:', error);
        res.status(500).json({ error: 'Failed to update cooling record' });
    }
});

/**
 * CLEANING AREAS
 */
router.get('/cleaning-areas/:restaurantId', async (req, res) => {
    try {
        const areas = await prisma.cleaningArea.findMany({
            where: { restaurantId: req.params.restaurantId },
            orderBy: { name: 'asc' },
        });
        res.json(areas);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch areas' });
    }
});

router.post('/cleaning-areas', async (req, res) => {
    const { name, restaurantId } = req.body;
    try {
        const area = await prisma.cleaningArea.create({
            data: { name, restaurantId },
        });
        res.status(201).json(area);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create area' });
    }
});

router.delete('/cleaning-areas/:id', async (req, res) => {
    try {
        await prisma.cleaningArea.delete({ where: { id: req.params.id } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete area' });
    }
});

/**
 * CLEANING LOGS
 */
router.get('/cleaning/:restaurantId', async (req, res) => {
    try {
        const logs = await prisma.cleaningLog.findMany({
            where: { restaurantId: req.params.restaurantId },
            orderBy: { createdAt: 'desc' },
        });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch logs' });
    }
});

router.post('/cleaning', async (req, res) => {
    const { restaurantId, area, status, initials, comments, cleaningAreaId } =
        req.body;
    try {
        const log = await prisma.cleaningLog.create({
            data: {
                restaurantId,
                area,
                status,
                initials,
                comments,
                cleaningAreaId,
            },
        });
        res.status(201).json(log);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create log' });
    }
});

/**
 * DELIVERY LOGS
 */
router.post('/delivery', async (req, res) => {
    try {
        const {
            restaurantId,
            category,
            productName,
            supplier,
            invoiceNumber,
            temperature,
            initials,
            comments,
        } = req.body;

        // Validating and parsing temperature to Float
        const parsedTemperature = parseFloat(temperature);

        const log = await prisma.deliveryLog.create({
            data: {
                restaurantId,
                category,
                productName,
                supplier,
                invoiceNumber,
                temperature: parsedTemperature,
                initials,
                comments: comments || '',
            },
        });
        res.status(201).json(log);
    } catch (error) {
        console.error('Error creating delivery log:', error);
        res.status(500).json({ error: 'Failed to create delivery log' });
    }
});

router.get('/delivery/:restaurantId', async (req, res) => {
    try {
        const logs = await prisma.deliveryLog.findMany({
            where: { restaurantId: req.params.restaurantId },
            orderBy: { createdAt: 'desc' },
            take: 10,
        });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch delivery logs' });
    }
});

router.post('/temperatures', async (req, res) => {
    try {
        const {
            restaurantId,
            equipmentId,
            temperature,
            initials,
            timeChecked,
        } = req.body;

        // 1. Get the start of today to filter records
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        // 2. Check if a log already exists for THIS shift TODAY
        const existingLog = await prisma.temperatureLog.findFirst({
            where: {
                restaurantId,
                equipmentId,
                timeChecked, // "Morning" or "Afternoon"
                createdAt: {
                    gte: startOfDay, // Greater than or equal to midnight today
                },
            },
        });

        // 3. Block it if it exists!
        if (existingLog) {
            return res.status(400).json({
                error: `A ${timeChecked} record already exists for this equipment today.`,
            });
        }

        // 4. If clear, save it!
        const log = await prisma.temperatureLog.create({
            data: {
                restaurantId,
                equipmentId,
                temperature: parseFloat(temperature),
                initials,
                timeChecked,
            },
        });
        res.status(201).json(log);
    } catch (error) {
        console.error('Error saving temp:', error);
        res.status(500).json({ error: 'Failed to create temperature log' });
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
    const { name, restaurantId, type } = req.body;
    try {
        const equipment = await prisma.equipment.create({
            data: { name, restaurantId, type },
        });
        res.status(201).json(equipment);
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
