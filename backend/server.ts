import express, { type Request, type Response } from 'express';

const app = express();
app.use(express.json());

// --- TYPES & INTERFACES ---
// Defines the exact structure expected for a temperature record
interface DailyTemperature {
    id: string;
    createdAt: string;
    unitName: string;
    timeChecked: string;
    temperature: number;
}

// --- IN-MEMORY DATABASE (MVP) ---
let dailyTemperatures: DailyTemperature[] = [];

// --- ROUTES ---

/**
 * GET /api/daily-temperatures
 */
app.get('/api/daily-temperatures', (req: Request, res: Response) => {
    res.status(200).json(dailyTemperatures);
});

/**
 * POST /api/daily-temperatures
 */
app.post('/api/daily-temperatures', (req: Request, res: Response) => {
    const newRecord: Partial<DailyTemperature> = req.body;

    if (!newRecord || Object.keys(newRecord).length === 0) {
        res.status(400).json({ error: 'Missing record data' });
        return;
    }

    //Creating the final object strictly following the DailyTemperature interface
    const recordToSave: DailyTemperature = {
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        unitName: newRecord.unitName || 'Unknown Unit',
        timeChecked: newRecord.timeChecked || '00:00',
        temperature: newRecord.temperature || 0,
    };

    dailyTemperatures.push(recordToSave);
    res.status(201).json(recordToSave);
});

// Health check route
app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'API is running properly' });
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
