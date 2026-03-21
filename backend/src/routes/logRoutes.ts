import { Router } from 'express';
import prisma from '../prisma.js';

const router = Router();

/**
 * ==========================================
 * COOKING & COOLING LOGS
 * ==========================================
 */

/**
 * POST /cooking
 * Creates a new cooking record linked to a specific restaurant.
 * Represents the initial cooking phase (e.g., reaching 75°C core temp).
 */
router.post('/cooking', async (req, res) => {
    try {
        const { restaurantId, ...data } = req.body;
        const log = await prisma.cookingLog.create({
            data: { ...data, restaurantId },
        });
        res.json(log);
    } catch (error) {
        console.error('Error creating cooking log:', error);
        res.status(500).json({ error: 'Failed to created cooking log' });
    }
});

/**
 * GET /cooking/:restaurantId
 * Retrieves all cooking/cooling logs for a specific restaurant.
 * Results are ordered chronologically by creation date (newest first).
 */
router.get('/cooking/:restaurantId', async (req, res) => {
    try {
        const logs = await prisma.cookingLog.findMany({
            where: { restaurantId: req.params.restaurantId },
            orderBy: { createdAt: 'desc' },
        });
        res.json(logs);
    } catch (error) {
        console.error('Error fetching cooking logs:', error);
        res.status(500).json({ error: 'Failed to fetch cooking logs' });
    }
});

/**
 * PUT /cooking/:id/cooling
 * Updates an existing cooking log to include the cooling phase data.
 * This ensures HACCP compliance by tracking the temperature drop over time.
 */
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
 * ==========================================
 * CLEANING AREAS MANAGEMENT
 * ==========================================
 */

/**
 * GET /cleaning-areas/:restaurantId
 * Fetches all registered cleaning areas (e.g., "Floors", "Sinks") for a restaurant.
 */
router.get('/cleaning-areas/:restaurantId', async (req, res) => {
    try {
        const areas = await prisma.cleaningArea.findMany({
            where: { restaurantId: req.params.restaurantId },
            orderBy: { name: 'asc' },
        });
        res.json(areas);
    } catch (error) {
        console.error('Error fetching cleaning areas:', error);
        res.status(500).json({ error: 'Failed to fetch cleaning areas' });
    }
});

/**
 * POST /cleaning-areas
 * Registers a new physical area to be tracked in the cleaning schedule.
 */
router.post('/cleaning-areas', async (req, res) => {
    const { name, restaurantId } = req.body;
    try {
        const area = await prisma.cleaningArea.create({
            data: { name, restaurantId },
        });
        res.status(201).json(area);
    } catch (error) {
        console.error('Error creating cleaning area:', error);
        res.status(500).json({ error: 'Failed to create cleaning area' });
    }
});

/**
 * DELETE /cleaning-areas/:id
 * Removes a cleaning area from the restaurant's configuration.
 */
router.delete('/cleaning-areas/:id', async (req, res) => {
    try {
        await prisma.cleaningArea.delete({ where: { id: req.params.id } });
        res.status(204).send(); // 204 No Content indicates successful deletion
    } catch (error) {
        console.error('Error deleting cleaning area:', error);
        res.status(500).json({ error: 'Failed to delete cleaning area' });
    }
});

/**
 * ==========================================
 * CLEANING LOGS
 * ==========================================
 */

/**
 * GET /cleaning/:restaurantId
 * Retrieves the historical log of all cleaning tasks performed.
 */
router.get('/cleaning/:restaurantId', async (req, res) => {
    try {
        const logs = await prisma.cleaningLog.findMany({
            where: { restaurantId: req.params.restaurantId },
            orderBy: { createdAt: 'desc' },
        });
        res.json(logs);
    } catch (error) {
        console.error('Error fetching cleaning logs:', error);
        res.status(500).json({ error: 'Failed to fetch cleaning logs' });
    }
});

/**
 * POST /cleaning
 * Submits a new cleaning task record, signed off by a staff member.
 */
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
        console.error('Error creating cleaning log:', error);
        res.status(500).json({ error: 'Failed to create cleaning log' });
    }
});

/**
 * ==========================================
 * DELIVERY LOGS
 * ==========================================
 */

/**
 * POST /delivery
 * Logs an incoming delivery. Parses the temperature to evaluate safety limits.
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

        // Safely parse temperature string to Float for database storage
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

/**
 * GET /delivery/:restaurantId
 * Retrieves the 10 most recent delivery logs for quick dashboard overview.
 */
router.get('/delivery/:restaurantId', async (req, res) => {
    try {
        const logs = await prisma.deliveryLog.findMany({
            where: { restaurantId: req.params.restaurantId },
            orderBy: { createdAt: 'desc' },
            take: 10, // Limits payload size for performance
        });
        res.json(logs);
    } catch (error) {
        console.error('Error fetching delivery logs:', error);
        res.status(500).json({ error: 'Failed to fetch delivery logs' });
    }
});

/**
 * ==========================================
 * TEMPERATURE LOGS (FRIDGES/FREEZERS)
 * ==========================================
 */

/**
 * POST /temperatures
 * Records daily equipment temperatures. Enforces strict double-entry prevention
 * to ensure equipment isn't logged twice for the same shift (Morning/Afternoon).
 */
router.post('/temperatures', async (req, res) => {
    try {
        const {
            restaurantId,
            equipmentId,
            temperature,
            initials,
            timeChecked,
        } = req.body;

        // 1. Establish the start of the current day for validation
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        // 2. Prevent duplicate entries for the same equipment and shift today
        const existingLog = await prisma.temperatureLog.findFirst({
            where: {
                restaurantId,
                equipmentId,
                timeChecked, // e.g., "Morning" or "Afternoon"
                createdAt: {
                    gte: startOfDay,
                },
            },
        });

        if (existingLog) {
            return res.status(400).json({
                error: `A ${timeChecked} record already exists for this equipment today.`,
            });
        }

        // 3. Create log if validation passes
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
        console.error('Error saving temperature log:', error);
        res.status(500).json({ error: 'Failed to create temperature log' });
    }
});

/**
 * GET /temperatures/:restaurantId
 * Retrieves all temperature logs, including relational data (Equipment details).
 */
router.get('/temperatures/:restaurantId', async (req, res) => {
    try {
        const logs = await prisma.temperatureLog.findMany({
            where: { restaurantId: req.params.restaurantId },
            include: { equipment: true }, // Joins the equipment table to get fridge names
            orderBy: { createdAt: 'desc' },
        });
        res.json(logs);
    } catch (error) {
        console.error('Error fetching temperature logs:', error);
        res.status(500).json({ error: 'Failed to fetch temperatures' });
    }
});

/**
 * ==========================================
 * EQUIPMENT MANAGEMENT
 * ==========================================
 */

/**
 * POST /equipment
 * Registers a new piece of equipment (e.g., Fridge, Freezer) for tracking.
 */
router.post('/equipment', async (req, res) => {
    const { name, restaurantId, type } = req.body;
    try {
        const equipment = await prisma.equipment.create({
            data: { name, restaurantId, type },
        });
        res.status(201).json(equipment);
    } catch (error) {
        console.error('Error creating equipment:', error);
        res.status(500).json({ error: 'Failed to create equipment' });
    }
});

/**
 * GET /equipment/:restaurantId
 * Fetches all equipment linked to a restaurant, primarily used to populate dropdowns.
 */
router.get('/equipment/:restaurantId', async (req, res) => {
    try {
        const { restaurantId } = req.params;
        const items = await prisma.equipment.findMany({
            where: { restaurantId },
        });
        res.json(items);
    } catch (error) {
        console.error('Error fetching equipment list:', error);
        res.status(500).json({ error: 'Failed to fetch equipment list' });
    }
});

/**
 * DELETE /equipment/:id
 * Removes a piece of equipment.
 * NOTE: This will fail if there are existing temperature logs linked to it.
 */
router.delete('/equipment/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.equipment.delete({
            where: { id },
        });
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting equipment:', error);
        res.status(500).json({
            error: 'Failed to delete equipment. It may have logs linked to it.',
        });
    }
});

export default router;
