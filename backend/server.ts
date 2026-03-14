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
        const { unitName, timeChecked, temperature } = req.body;
        const newRecord = await prisma.temperature.create({
            data: { unitName, timeChecked, temperature },
        });
        res.status(201).json(newRecord);
    } catch (error) {
        res.status(500).json({ error: 'Failed to save temperature' });
    }
});

// Update an existing temperature record
app.put('/api/daily-temperatures/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { unitName, timeChecked, temperature } = req.body;

        const updatedRecord = await prisma.temperature.update({
            where: { id: id },
            data: { unitName, timeChecked, temperature },
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

// ==========================================
// STARTING THE SERVER
// ==========================================
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
