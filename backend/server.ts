// backend/server.ts
import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
// ====================================================

const app = express();
const port = 3001;

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
    console.log(
        `🚀 Server is running on http://localhost:${port} with Prisma Driver Adapter!`,
    );
});
