import express from 'express';
import cors from 'cors';
import { TemperatureService } from './services/TemperatureService.js';

const app = express();
app.use(express.json());
app.use(cors());

const tempService = new TemperatureService();

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', uptime: process.uptime() });
});

// GET all logs
app.get('/logs/temperature', async (req, res) => {
    try {
        const logs = await tempService.getAllLogs();
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch logs' });
    }
});

// POST new log
app.post('/logs/temperature', async (req, res) => {
    try {
        const { equipmentId, value, user } = req.body;

        if (!equipmentId || value === undefined || !user) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const log = await tempService.createLog(equipmentId, value, user);
        res.status(201).json(log);
    } catch (error) {
        res.status(500).json({ error: 'Failed to save log' });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`🚀 HACCP API running on http://localhost:${PORT}`);
});
