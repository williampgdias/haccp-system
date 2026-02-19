import express from 'express';
import cors from 'cors';
import { TemperatureService } from './services/TemperatureService';

const app = express();
app.use(express.json());
app.use(cors());

const tempService = new TemperatureService();

// Simple route for testing
app.post('/logs/temperature', async (req, res) => {
    const { equipmentId, value, user } = req.body;
    const log = await tempService.createLog(equipmentId, value, user);
    return res.status(201).json(log);
});

app.get('/logs/temperature', async (req, res) => {
    const logs = await tempService.getAllLogs();
    return res.json(logs);
});

app.listen(3001, () =>
    console.log('🚀 HACCP API running on http://localhost:3001'),
);
