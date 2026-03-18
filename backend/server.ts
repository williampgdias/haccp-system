// backend/server.ts
import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });
// ====================================================

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ==========================================
// 🌡️ TEMPERATURE ROUTES
// ==========================================
app.get('/api/daily-temperatures', async (req, res) => {
    try {
        const records = await prisma.temperature.findMany();
        res.json(records);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch temperatures' });
    }
});

app.post('/api/daily-temperatures', async (req, res) => {
    try {
        const { unitName, timeChecked, temperature, rinseTemperature } =
            req.body;
        const newRecord = await prisma.temperature.create({
            data: { unitName, timeChecked, temperature, rinseTemperature },
        });
        res.status(201).json(newRecord);
    } catch (error) {
        console.error('ERRO AO SALVAR:', error);
        res.status(500).json({ error: 'Failed to save temperature' });
    }
});

// Update an existing temperature record
app.put('/api/daily-temperatures/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { unitName, timeChecked, temperature, rinseTemperature } =
            req.body;

        const updatedRecord = await prisma.temperature.update({
            where: { id: id },
            data: { unitName, timeChecked, temperature, rinseTemperature },
        });

        res.status(200).json(updatedRecord);
    } catch (error) {
        console.error('Error updating temperature:', error);
        res.status(500).json({ error: 'Failed to update temperature record' });
    }
});

// ==========================================
// 📦 DELIVERY ROUTES
// ==========================================

app.get('/api/deliveries', async (req, res) => {
    try {
        const records = await prisma.delivery.findMany();
        res.json(records);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch deliveries' });
    }
});

app.post('/api/deliveries', async (req, res) => {
    try {
        const {
            deliveryDate,
            supplierName,
            foodItem,
            batchCode,
            useByDate,
            temperature,
            isAppearanceAcceptable,
            isVanChecked,
            comments,
            signature,
        } = req.body;

        const newRecord = await prisma.delivery.create({
            data: {
                deliveryDate,
                supplierName,
                foodItem,
                batchCode,
                useByDate,
                temperature,
                isAppearanceAcceptable,
                isVanChecked,
                comments,
                signature,
            },
        });
        res.status(201).json(newRecord);
    } catch (error) {
        res.status(500).json({ error: 'Failed to save delivery' });
    }
});

app.put('/api/deliveries/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            deliveryDate,
            supplierName,
            foodItem,
            batchCode,
            useByDate,
            temperature,
            isAppearanceAcceptable,
            isVanChecked,
            comments,
            signature,
        } = req.body;

        const updatedRecord = await prisma.delivery.update({
            where: { id: id },
            data: {
                deliveryDate,
                supplierName,
                foodItem,
                batchCode,
                useByDate,
                temperature,
                isAppearanceAcceptable,
                isVanChecked,
                comments,
                signature,
            },
        });

        res.status(200).json(updatedRecord);
    } catch (error) {
        console.error('Error updating delivery:', error);
        res.status(500).json({ error: 'Failed to update delivery record' });
    }
});

// ==========================================
// ✨ CLEANING ROUTES
// ==========================================
app.get('/api/cleaning', async (req, res) => {
    try {
        const records = await prisma.cleaning.findMany();
        res.json(records);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch cleaning records' });
    }
});

app.post('/api/cleaning', async (req, res) => {
    try {
        const { weekEndingDate, dateCleaned, equipmentName, cleanedBy } =
            req.body;
        const newRecord = await prisma.cleaning.create({
            data: { weekEndingDate, dateCleaned, equipmentName, cleanedBy },
        });
        res.status(201).json(newRecord);
    } catch (error) {
        res.status(500).json({ error: 'Failed to save cleaning record' });
    }
});

app.put('/api/cleaning/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { weekEndingDate, dateCleaned, equipmentName, cleanedBy } =
            req.body;

        const updatedRecord = await prisma.cleaning.update({
            where: { id: id },
            data: { weekEndingDate, dateCleaned, equipmentName, cleanedBy },
        });
        res.status(200).json(updatedRecord);
    } catch (error) {
        console.error('Error updating cleaning:', error);
        res.status(500).json({ error: 'Failed to update cleaning record' });
    }
});

// ==========================================
// ✨ COOKING LOG ROUTES
// ==========================================
app.get('/api/cooking-logs', async (req, res) => {
    try {
        const logs = await prisma.cookingLog.findMany({
            orderBy: { createdAt: 'desc' },
        });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch logs' });
    }
});

app.post('/api/cooking-logs', async (req, res) => {
    try {
        const log = await prisma.cookingLog.create({
            data: req.body,
        });
        res.json(log);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create log' });
    }
});

app.put('/api/cooking-logs/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const updated = await prisma.cookingLog.update({
            where: { id: id },
            data: req.body,
        });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update log' });
    }
});

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================
app.get('/api/users/by-email/:email', async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { email: req.params.email },
        });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/users', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const user = await prisma.user.create({
            data: { name, email, password, role },
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// ==========================================
// STARTING THE SERVER
// ==========================================
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
